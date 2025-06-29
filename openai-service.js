import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

let openai;

// Initialize OpenAI client lazily
function getOpenAIClient() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    return openai;
}

async function analyzeBookImage(imagePath) {
    try {
        // Get OpenAI client (will initialize if needed)
        const client = getOpenAIClient();
        
        // Read the image file
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const imageExtension = path.extname(imagePath).toLowerCase();
        
        // Determine MIME type
        let mimeType = 'image/jpeg';
        if (imageExtension === '.png') mimeType = 'image/png';
        else if (imageExtension === '.webp') mimeType = 'image/webp';
        else if (imageExtension === '.gif') mimeType = 'image/gif';

        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this book image and extract the following information in JSON format:
                            {
                                "title": "Book title",
                                "author": "Author name(s)",
                                "published_year": year as integer (or null if not visible),
                                "isbn": "ISBN if visible (or null)",
                                "genre": "Estimated genre based on cover/title",
                                "description": "Brief description based on what you can see and infer from the book",
                                "condition_rating": estimated condition from 1-10 based on visible wear (default 7 if unclear),
                                "price": null (to be set by user)
                            }
                            
                            IMPORTANT INSTRUCTIONS:
                            1. If you recognize this as a well-known book, please fill in the published_year even if it's not visible on the cover (use your knowledge of when the book was first published)
                            2. For famous books, you can also provide the original ISBN-10 or ISBN-13 if you know it
                            3. Be as accurate as possible with the title and author - these should match the official publication
                            4. For the description, provide a helpful summary that would be useful for someone considering buying this book
                            5. Base the genre on the book content, not just the cover design
                            6. If you can't clearly see certain information AND don't recognize the book, use null for that field
                            
                            Examples of how to handle known books:
                            - If you see "Harry Potter and the Philosopher's Stone" by J.K. Rowling, the published_year should be 1997 (original UK publication)
                            - If you see "To Kill a Mockingbird" by Harper Lee, the published_year should be 1960
                            - If you see "1984" by George Orwell, the published_year should be 1949
                            
                            Please extract information now:`
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
            max_tokens: 1000,
            temperature: 0.1
        });

        const aiResponse = response.choices[0].message.content;
        console.log('OpenAI Response:', aiResponse);

        // Try to parse JSON from the response
        let bookDetails;
        try {
            // Extract JSON from the response (in case there's extra text)
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                bookDetails = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            // Fallback with default values
            bookDetails = {
                title: "Unknown Book",
                author: "Unknown Author",
                published_year: null,
                isbn: null,
                genre: "General",
                description: "Book details could not be automatically extracted. Please update manually.",
                condition_rating: 7,
                price: null
            };
        }

        // Ensure all expected fields exist with proper types
        const processedDetails = {
            title: bookDetails.title || "Unknown Book",
            author: bookDetails.author || "Unknown Author", 
            published_year: bookDetails.published_year ? parseInt(bookDetails.published_year) : null,
            isbn: bookDetails.isbn || null,
            genre: bookDetails.genre || "General",
            description: bookDetails.description || "No description available",
            condition_rating: parseInt(bookDetails.condition_rating) || 7,
            price: bookDetails.price ? parseFloat(bookDetails.price) : null
        };

        return processedDetails;

    } catch (error) {
        console.error('Error analyzing image with OpenAI:', error);
        
        // Return default structure if OpenAI fails
        return {
            title: "Unknown Book",
            author: "Unknown Author",
            published_year: null,
            isbn: null,
            genre: "General",
            description: "Could not extract book details automatically. Please update manually.",
            condition_rating: 7,
            price: null
        };
    }
}

export {
    analyzeBookImage
}; 