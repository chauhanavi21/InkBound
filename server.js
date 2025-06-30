import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

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

// Set JWT secret (use environment variable or default for development)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  Warning: Using default JWT secret. Set JWT_SECRET in .env for production');
}

console.log('✅ Environment variables loaded successfully');
console.log(`✅ OpenAI API Key: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);

import { 
    initializeDatabase, 
    insertBook, 
    getAllBooks, 
    getBookById,
    updateBook, 
    deleteBook, 
    getFeaturedContent, 
    setFeaturedContent, 
    addFeaturedContent, 
    removeFeaturedContent, 
    removeFeaturedContentItem, 
    getFeaturedBooksByType, 
    getFeaturedAuthor,
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    getAllUsers,
    updateUserRole,
    createDefaultAdmin,
    updateUserProfile,
    changeUserPassword,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    getUserCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
} from './database.js';
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
initializeDatabase().then(async () => {
    // Create default admin user if none exists
    await createDefaultAdmin();
}).catch(console.error);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Authentication Routes

// Register new user
app.post('/api/register', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUserByEmail = await findUserByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const existingUserByUsername = await findUserByUsername(username);
        if (existingUserByUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Hash password
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await createUser({
            username,
            email,
            password_hash,
            role: 'user'
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
app.post('/api/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user info
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Update user role (admin only)
app.put('/api/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        
        await updateUserRole(id, role);
        res.json({ success: true, message: 'User role updated successfully' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// User Profile Management Routes

// Update user profile
app.put('/api/profile', authenticateToken, [
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('first_name').optional().isLength({ min: 1 }).withMessage('First name cannot be empty'),
    body('last_name').optional().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please provide a valid phone number')
], handleValidationErrors, async (req, res) => {
    try {
        const { first_name, last_name, phone, email } = req.body;
        
        // Check if email already exists for another user
        if (email) {
            const existingUser = await findUserByEmail(email);
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(400).json({ error: 'Email already in use by another account' });
            }
        }
        
        await updateUserProfile(req.user.id, { first_name, last_name, phone, email });
        
        // Get updated user info
        const updatedUser = await findUserById(req.user.id);
        res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
app.put('/api/profile/password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], handleValidationErrors, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get current user with password hash
        const user = await findUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        
        await changeUserPassword(req.user.id, newPasswordHash);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Address Management Routes

// Get user addresses
app.get('/api/addresses', authenticateToken, async (req, res) => {
    try {
        const addresses = await getUserAddresses(req.user.id);
        res.json(addresses);
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ error: 'Failed to get addresses' });
    }
});

// Add new address
app.post('/api/addresses', authenticateToken, [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('address_line1').notEmpty().withMessage('Address line 1 is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('postal_code').notEmpty().withMessage('Postal code is required')
], handleValidationErrors, async (req, res) => {
    try {
        const addressId = await addUserAddress(req.user.id, req.body);
        res.status(201).json({ success: true, addressId, message: 'Address added successfully' });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ error: 'Failed to add address' });
    }
});

// Update address
app.put('/api/addresses/:id', authenticateToken, [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('address_line1').notEmpty().withMessage('Address line 1 is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('postal_code').notEmpty().withMessage('Postal code is required')
], handleValidationErrors, async (req, res) => {
    try {
        const { id } = req.params;
        await updateUserAddress(id, req.user.id, req.body);
        res.json({ success: true, message: 'Address updated successfully' });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ error: 'Failed to update address' });
    }
});

// Delete address
app.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await deleteUserAddress(id, req.user.id);
        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Failed to delete address' });
    }
});

// Shopping Cart Routes

// Get user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const cart = await getUserCart(req.user.id);
        res.json(cart);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

// Add item to cart
app.post('/api/cart', authenticateToken, [
    body('bookId').isInt({ min: 1 }).withMessage('Valid book ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], handleValidationErrors, async (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body;
        await addToCart(req.user.id, bookId, quantity);
        res.json({ success: true, message: 'Item added to cart' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Update cart item quantity
app.put('/api/cart/:bookId', authenticateToken, [
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater')
], handleValidationErrors, async (req, res) => {
    try {
        const { bookId } = req.params;
        const { quantity } = req.body;
        await updateCartQuantity(req.user.id, bookId, quantity);
        res.json({ success: true, message: 'Cart updated successfully' });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Remove item from cart
app.delete('/api/cart/:bookId', authenticateToken, async (req, res) => {
    try {
        const { bookId } = req.params;
        await removeFromCart(req.user.id, bookId);
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

// Clear cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
    try {
        await clearCart(req.user.id);
        res.json({ success: true, message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

// Wishlist Routes

// Get user's wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
    try {
        const wishlist = await getUserWishlist(req.user.id);
        res.json(wishlist);
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ error: 'Failed to get wishlist' });
    }
});

// Add item to wishlist
app.post('/api/wishlist', authenticateToken, [
    body('bookId').isInt({ min: 1 }).withMessage('Valid book ID is required')
], handleValidationErrors, async (req, res) => {
    try {
        const { bookId } = req.body;
        const result = await addToWishlist(req.user.id, bookId);
        res.json({ success: true, message: 'Item added to wishlist', result });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ error: 'Failed to add item to wishlist' });
    }
});

// Remove item from wishlist
app.delete('/api/wishlist/:bookId', authenticateToken, async (req, res) => {
    try {
        const { bookId } = req.params;
        await removeFromWishlist(req.user.id, bookId);
        res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ error: 'Failed to remove item from wishlist' });
    }
});

// Check if item is in wishlist
app.get('/api/wishlist/check/:bookId', authenticateToken, async (req, res) => {
    try {
        const { bookId } = req.params;
        const inWishlist = await isInWishlist(req.user.id, bookId);
        res.json({ inWishlist });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({ error: 'Failed to check wishlist' });
    }
});

// Regular Routes (No authentication required for public access)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload and analyze book photo (ADMIN ONLY)
app.post('/api/upload', authenticateToken, requireAdmin, upload.single('bookPhoto'), async (req, res) => {
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

// Upload image only (without AI analysis) for manual entry (ADMIN ONLY)
app.post('/api/upload-image', authenticateToken, requireAdmin, upload.single('bookPhoto'), async (req, res) => {
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

// Get single book by ID
app.get('/api/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await getBookById(bookId);
        
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

// Add book manually (without image upload) (ADMIN ONLY)
app.post('/api/books', authenticateToken, requireAdmin, async (req, res) => {
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

// Update book details (ADMIN ONLY)
app.put('/api/books/:id', authenticateToken, requireAdmin, async (req, res) => {
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

// Bulk update books (ADMIN ONLY)
app.put('/api/books', authenticateToken, requireAdmin, async (req, res) => {
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

// Delete book (ADMIN ONLY)
app.delete('/api/books/:id', authenticateToken, requireAdmin, async (req, res) => {
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

// Add featured content (ADMIN ONLY)
app.post('/api/featured-content', authenticateToken, requireAdmin, async (req, res) => {
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

// Set featured content (ADMIN ONLY)
app.post('/api/featured-content/replace', authenticateToken, requireAdmin, async (req, res) => {
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

// Upload author photo (ADMIN ONLY)
app.post('/api/upload-author-photo', authenticateToken, requireAdmin, upload.single('authorPhoto'), async (req, res) => {
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

// Remove individual featured content item (ADMIN ONLY)
app.delete('/api/featured-content/item/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await removeFeaturedContentItem(id);
        res.json({ success: true, message: `Featured content item removed` });
    } catch (error) {
        console.error('Error removing featured content item:', error);
        res.status(500).json({ error: 'Failed to remove featured content item' });
    }
});

// Remove all featured content of a type (ADMIN ONLY)
app.delete('/api/featured-content/:type', authenticateToken, requireAdmin, async (req, res) => {
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