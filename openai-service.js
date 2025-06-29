import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables with explicit path
dotenv.config({ path: '.env' });

// Validate environment variable
if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    console.error('Please check your .env file');
    throw new Error('Missing OpenAI API key');
}

// Initialize OpenAI client (lazy initialization)
let openai = null;

function getOpenAIClient() {
    if (!openai) {
        try {
            openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY.trim()
            });
            console.log('OpenAI client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OpenAI client:', error);
            throw error;
        }
    }
    return openai;
}

export async function analyzeBookFromImage(imagePath) {
    try {
        console.log('Starting book analysis for image:', imagePath);
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }

        // Get OpenAI client
        const client = getOpenAIClient();

        // Read and encode the image
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';

        console.log('Image loaded, sending to OpenAI for analysis...');

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this book cover image and extract the following information in JSON format:
                            {
                                "title": "book title",
                                "author": "author name", 
                                "genre": "book genre/category",
                                "published_year": year_as_number,
                                "description": "brief description based on cover",
                                "condition_rating": rating_1_to_10,
                                "price": estimated_price_as_number,
                                "isbn": "ISBN if visible or null"
                            }
                            
                            Guidelines:
                            - Extract exact title and author from the cover
                            - Estimate condition rating (1-10) based on image quality and visible wear
                            - Estimate reasonable used book price in USD
                            - Provide genre based on cover design and title
                            - Give a brief description based on what you can see
                            - Only include ISBN if clearly visible, otherwise use null
                            - Return only valid JSON, no additional text`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });

        const content = response.choices[0]?.message?.content;
        console.log('OpenAI response received:', content);

        if (!content) {
            throw new Error('No response content from OpenAI');
        }

        // Parse the JSON response
        let bookData;
        try {
            // Clean the response - remove any markdown formatting
            const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
            bookData = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response as JSON:', content);
            throw new Error('Invalid JSON response from OpenAI');
        }

        // Validate required fields
        if (!bookData.title) {
            throw new Error('No title found in book analysis');
        }

        // Set defaults for missing fields
        const processedData = {
            title: bookData.title || 'Unknown Title',
            author: bookData.author || 'Unknown Author',
            genre: bookData.genre || 'Fiction',
            published_year: bookData.published_year || null,
            description: bookData.description || 'Book analyzed from cover image',
            condition_rating: Math.min(Math.max(bookData.condition_rating || 7, 1), 10),
            price: Math.max(bookData.price || 15, 1),
            isbn: bookData.isbn || null
        };

        console.log('Book analysis completed successfully:', processedData);
        return processedData;

    } catch (error) {
        console.error('Error in analyzeBookFromImage:', error);
        
        // Return default book data if analysis fails
        return {
            title: 'Unknown Book',
            author: 'Unknown Author',
            genre: 'Fiction',
            published_year: null,
            description: 'Book uploaded via image - analysis failed',
            condition_rating: 7,
            price: 15,
            isbn: null
        };
    }
} 