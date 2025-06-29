import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeDatabase, insertBook, getAllBooks, updateBook, deleteBook } from './database.js';
import { analyzeBookFromImage } from './openai-service.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000000);
        cb(null, `book-${timestamp}-${randomNum}${path.extname(file.originalname)}`);
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
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Initialize database
initializeDatabase().catch(console.error);

// Routes
app.get('/api/books', async (req, res) => {
    try {
        const books = await getAllBooks();
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const bookData = {
            ...req.body,
            uploadDate: new Date().toISOString(),
            imagePath: null,
            images: []
        };
        
        const bookId = await insertBook(bookData);
        res.json({ success: true, bookId, message: 'Book added successfully' });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
});

app.post('/api/upload', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images provided' });
        }

        const imagePaths = req.files.map(file => file.path);
        const primaryImagePath = imagePaths[0];

        const bookData = await analyzeBookFromImage(primaryImagePath);
        
        const completeBookData = {
            ...bookData,
            imagePath: primaryImagePath,
            images: imagePaths,
            uploadDate: new Date().toISOString(),
            on_sale: 1
        };

        const bookId = await insertBook(completeBookData);
        
        res.json({
            success: true,
            bookId,
            bookData: completeBookData,
            message: 'Book analyzed and added successfully'
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: 'Failed to process book analysis' });
    }
});

app.put('/api/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const updates = req.body;
        
        const result = await updateBook(bookId, updates);
        res.json({ success: true, message: 'Book updated successfully' });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const result = await deleteBook(bookId);
        res.json({ success: true, message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 