import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to load from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
    console.error('Please check your .env file and ensure it contains:');
    console.error('OPENAI_API_KEY=your_actual_api_key_here');
    process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log(`✅ OpenAI API Key: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);

import { initializeDatabase, insertBook, getAllBooks, updateBook, deleteBook, getFeaturedContent, setFeaturedContent, addFeaturedContent, removeFeaturedContent, removeFeaturedContentItem, getFeaturedBooksByType, getFeaturedAuthor } from './database.js';
import { analyzeBookImage } from './openai-service.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Initialize database
initializeDatabase();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload and analyze book photo
app.post('/api/upload', upload.single('bookPhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imagePath = req.file.path;
        
        // Analyze image with OpenAI
        console.log('Analyzing book image...');
        const bookDetails = await analyzeBookImage(imagePath);
        
        // Save to database
        const bookId = await insertBook({
            ...bookDetails,
            imagePath: imagePath,
            uploadDate: new Date().toISOString()
        });

        res.json({
            success: true,
            bookId: bookId,
            bookDetails: bookDetails,
            imagePath: imagePath
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ 
            error: 'Failed to process image', 
            message: error.message 
        });
    }
});

// Upload image only (without AI analysis) for manual entry
app.post('/api/upload-image', upload.single('bookPhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imagePath = req.file.path;
        
        res.json({
            success: true,
            imagePath: imagePath,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ 
            error: 'Failed to upload image', 
            message: error.message 
        });
    }
});

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await getAllBooks();
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Add book manually (without image upload)
app.post('/api/books', async (req, res) => {
    try {
        const bookData = req.body;
        
        const bookId = await insertBook({
            ...bookData,
            imagePath: bookData.imagePath || null,
            uploadDate: bookData.uploadDate || new Date().toISOString()
        });

        res.json({
            success: true,
            bookId: bookId,
            message: 'Book added successfully'
        });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ 
            error: 'Failed to add book', 
            message: error.message 
        });
    }
});

// Update book details
app.put('/api/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const updates = req.body;
        
        await updateBook(bookId, updates);
        res.json({ success: true, message: 'Book updated successfully' });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// Bulk update books
app.put('/api/books', async (req, res) => {
    try {
        const { books } = req.body; // Array of book objects with id and updates
        
        for (const book of books) {
            await updateBook(book.id, book);
        }
        
        res.json({ success: true, message: 'Books updated successfully' });
    } catch (error) {
        console.error('Error bulk updating books:', error);
        res.status(500).json({ error: 'Failed to update books' });
    }
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        await deleteBook(bookId);
        res.json({ success: true, message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Featured Content Management API Endpoints

// Get all featured content
app.get('/api/featured-content', async (req, res) => {
    try {
        const featuredContent = await getFeaturedContent();
        res.json(featuredContent);
    } catch (error) {
        console.error('Error fetching featured content:', error);
        res.status(500).json({ error: 'Failed to fetch featured content' });
    }
});

// Get featured books by type
app.get('/api/featured-content/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const books = await getFeaturedBooksByType(type);
        res.json(books);
    } catch (error) {
        console.error('Error fetching featured books:', error);
        res.status(500).json({ error: 'Failed to fetch featured books' });
    }
});

// Get featured author
app.get('/api/featured-author', async (req, res) => {
    try {
        const author = await getFeaturedAuthor();
        res.json(author);
    } catch (error) {
        console.error('Error fetching featured author:', error);
        res.status(500).json({ error: 'Failed to fetch featured author' });
    }
});

// Add featured content (without replacing existing)
app.post('/api/featured-content', async (req, res) => {
    try {
        const { type, bookId, authorName, authorPhotoPath } = req.body;
        
        if (!type) {
            return res.status(400).json({ error: 'Type is required' });
        }
        
        const id = await addFeaturedContent(type, bookId, authorName, authorPhotoPath);
        res.json({ success: true, id, message: `Featured content added for ${type}` });
    } catch (error) {
        console.error('Error adding featured content:', error);
        res.status(500).json({ error: 'Failed to add featured content' });
    }
});

// Set featured content (replace existing - for featured author)
app.post('/api/featured-content/replace', async (req, res) => {
    try {
        const { type, bookId, authorName, authorPhotoPath } = req.body;
        
        if (!type) {
            return res.status(400).json({ error: 'Type is required' });
        }
        
        const id = await setFeaturedContent(type, bookId, authorName, authorPhotoPath);
        res.json({ success: true, id, message: `Featured content set for ${type}` });
    } catch (error) {
        console.error('Error setting featured content:', error);
        res.status(500).json({ error: 'Failed to set featured content' });
    }
});

// Upload author photo
app.post('/api/upload-author-photo', upload.single('authorPhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imagePath = req.file.path;
        
        res.json({
            success: true,
            imagePath: imagePath,
            message: 'Author photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading author photo:', error);
        res.status(500).json({ 
            error: 'Failed to upload author photo', 
            message: error.message 
        });
    }
});

// Remove individual featured content item
app.delete('/api/featured-content/item/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await removeFeaturedContentItem(id);
        res.json({ success: true, message: `Featured content item removed` });
    } catch (error) {
        console.error('Error removing featured content item:', error);
        res.status(500).json({ error: 'Failed to remove featured content item' });
    }
});

// Remove all featured content of a type
app.delete('/api/featured-content/:type', async (req, res) => {
    try {
        const { type } = req.params;
        await removeFeaturedContent(type);
        res.json({ success: true, message: `Featured content removed for ${type}` });
    } catch (error) {
        console.error('Error removing featured content:', error);
        res.status(500).json({ error: 'Failed to remove featured content' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 