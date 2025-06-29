import pkg from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const { Database } = pkg.verbose();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'books.db');
const db = new Database(dbPath);

// Initialize database and create tables
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create table with all fields including on_sale, images, and discount fields
            db.run(`
                CREATE TABLE IF NOT EXISTS books (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    author TEXT,
                    published_year INTEGER,
                    isbn TEXT,
                    genre TEXT,
                    description TEXT,
                    condition_rating INTEGER DEFAULT 5,
                    price DECIMAL(10,2),
                    on_sale BOOLEAN DEFAULT 1,
                    image_path TEXT,
                    images TEXT,
                    upload_date TEXT,
                    discount_percentage DECIMAL(5,2) DEFAULT 0,
                    discount_end_date TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating books table:', err);
                    reject(err);
                } else {
                    console.log('Books table initialized successfully');
                    
                    // Create users table
                    db.run(`
                        CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT UNIQUE NOT NULL,
                            email TEXT UNIQUE NOT NULL,
                            password_hash TEXT NOT NULL,
                            role TEXT DEFAULT 'user',
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `, (err) => {
                        if (err) {
                            console.error('Error creating users table:', err);
                        } else {
                            console.log('Users table initialized successfully');
                        }
                    });
                    
                    // Create featured content table
                    db.run(`
                        CREATE TABLE IF NOT EXISTS featured_content (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            type TEXT NOT NULL,
                            book_id INTEGER,
                            author_name TEXT,
                            author_photo_path TEXT,
                            is_active BOOLEAN DEFAULT 1,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (book_id) REFERENCES books (id)
                        )
                    `, (err) => {
                        if (err) {
                            console.error('Error creating featured_content table:', err);
                            reject(err);
                        } else {
                            console.log('Featured content table initialized successfully');
                            
                            // Check if author_photo_path column exists in featured_content table
                            db.all("PRAGMA table_info(featured_content)", (err, featuredColumns) => {
                                if (err) {
                                    console.error('Error checking featured_content table info:', err);
                                } else {
                                    const hasAuthorPhotoColumn = featuredColumns.some(col => col.name === 'author_photo_path');
                                    
                                    if (!hasAuthorPhotoColumn) {
                                        console.log('Adding author_photo_path column to featured_content table...');
                                        db.run("ALTER TABLE featured_content ADD COLUMN author_photo_path TEXT", (err) => {
                                            if (err) {
                                                console.error('Error adding author_photo_path column:', err);
                                            } else {
                                                console.log('author_photo_path column added successfully');
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                    
                    // Check if columns exist, if not add them
                    db.all("PRAGMA table_info(books)", (err, columns) => {
                        if (err) {
                            console.error('Error checking table info:', err);
                            reject(err);
                            return;
                        }
                        
                        const hasOnSaleColumn = columns.some(col => col.name === 'on_sale');
                        const hasImagesColumn = columns.some(col => col.name === 'images');
                        const hasDiscountPercentageColumn = columns.some(col => col.name === 'discount_percentage');
                        const hasDiscountEndDateColumn = columns.some(col => col.name === 'discount_end_date');
                        
                        let promises = [];
                        
                        if (!hasOnSaleColumn) {
                            console.log('Adding on_sale column to existing database...');
                            promises.push(new Promise((resolveCol, rejectCol) => {
                                db.run("ALTER TABLE books ADD COLUMN on_sale BOOLEAN DEFAULT 1", (err) => {
                                    if (err) {
                                        console.error('Error adding on_sale column:', err);
                                        rejectCol(err);
                                    } else {
                                        console.log('on_sale column added successfully');
                                        resolveCol();
                                    }
                                });
                            }));
                        }
                        
                        if (!hasImagesColumn) {
                            console.log('Adding images column to existing database...');
                            promises.push(new Promise((resolveCol, rejectCol) => {
                                db.run("ALTER TABLE books ADD COLUMN images TEXT", (err) => {
                                    if (err) {
                                        console.error('Error adding images column:', err);
                                        rejectCol(err);
                                    } else {
                                        console.log('images column added successfully');
                                        resolveCol();
                                    }
                                });
                            }));
                        }
                        
                        if (!hasDiscountPercentageColumn) {
                            console.log('Adding discount_percentage column to existing database...');
                            promises.push(new Promise((resolveCol, rejectCol) => {
                                db.run("ALTER TABLE books ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0", (err) => {
                                    if (err) {
                                        console.error('Error adding discount_percentage column:', err);
                                        rejectCol(err);
                                    } else {
                                        console.log('discount_percentage column added successfully');
                                        resolveCol();
                                    }
                                });
                            }));
                        }
                        
                        if (!hasDiscountEndDateColumn) {
                            console.log('Adding discount_end_date column to existing database...');
                            promises.push(new Promise((resolveCol, rejectCol) => {
                                db.run("ALTER TABLE books ADD COLUMN discount_end_date TEXT", (err) => {
                                    if (err) {
                                        console.error('Error adding discount_end_date column:', err);
                                        rejectCol(err);
                                    } else {
                                        console.log('discount_end_date column added successfully');
                                        resolveCol();
                                    }
                                });
                            }));
                        }
                        
                        if (promises.length > 0) {
                            Promise.all(promises).then(() => resolve()).catch(reject);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

// Insert a new book
function insertBook(bookData) {
    return new Promise((resolve, reject) => {
        const {
            title,
            author,
            published_year,
            isbn,
            genre,
            description,
            condition_rating = 5,
            price,
            on_sale = 1,
            imagePath,
            images,
            uploadDate,
            discount_percentage = 0,
            discount_end_date = null
        } = bookData;

        // Convert images array to JSON string if provided
        const imagesJson = images && Array.isArray(images) ? JSON.stringify(images) : null;

        const query = `
            INSERT INTO books (
                title, author, published_year, isbn, genre, 
                description, condition_rating, price, on_sale, image_path, images, upload_date,
                discount_percentage, discount_end_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [
            title, author, published_year, isbn, genre,
            description, condition_rating, price, on_sale, imagePath, imagesJson, uploadDate,
            discount_percentage, discount_end_date
        ], function(err) {
            if (err) {
                console.error('Error inserting book:', err);
                reject(err);
            } else {
                console.log('Book inserted with ID:', this.lastID);
                resolve(this.lastID);
            }
        });
    });
}

// Get all books
function getAllBooks() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM books 
            ORDER BY created_at DESC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching books:', err);
                reject(err);
            } else {
                // Parse images JSON and calculate discounted price for each book
                const booksWithImages = rows.map(book => {
                    const processedBook = {
                        ...book,
                        images: book.images ? JSON.parse(book.images) : []
                    };
                    
                    // Calculate discounted price if discount is active
                    if (book.discount_percentage > 0) {
                        if (book.discount_end_date) {
                            const endDate = new Date(book.discount_end_date);
                            const now = new Date();
                            
                            if (now <= endDate) {
                                processedBook.discounted_price = book.price * (1 - book.discount_percentage / 100);
                                processedBook.is_discount_active = true;
                            } else {
                                processedBook.is_discount_active = false;
                            }
                        } else {
                            // Permanent discount (no end date)
                            processedBook.discounted_price = book.price * (1 - book.discount_percentage / 100);
                            processedBook.is_discount_active = true;
                        }
                    } else {
                        processedBook.is_discount_active = false;
                    }
                    
                    return processedBook;
                });
                resolve(booksWithImages);
            }
        });
    });
}

// Update book details
function updateBook(id, updates) {
    return new Promise((resolve, reject) => {
        const fields = [];
        const values = [];

        // Build dynamic update query
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) {
            return resolve();
        }

        // Add updated_at timestamp
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const query = `UPDATE books SET ${fields.join(', ')} WHERE id = ?`;

        db.run(query, values, function(err) {
            if (err) {
                console.error('Error updating book:', err);
                reject(err);
            } else {
                console.log('Book updated, changes:', this.changes);
                resolve(this.changes);
            }
        });
    });
}

// Delete a book
function deleteBook(id) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM books WHERE id = ?`;

        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error deleting book:', err);
                reject(err);
            } else {
                console.log('Book deleted, changes:', this.changes);
                resolve(this.changes);
            }
        });
    });
}

// Get book by ID
function getBookById(id) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM books WHERE id = ?`;

        db.get(query, [id], (err, row) => {
            if (err) {
                console.error('Error fetching book:', err);
                reject(err);
            } else {
                if (row) {
                    // Parse images JSON
                    row.images = row.images ? JSON.parse(row.images) : [];
                }
                resolve(row);
            }
        });
    });
}

// Featured Content Management Functions

// Get all featured content
function getFeaturedContent() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT fc.*, b.title, b.author, b.image_path, b.price, b.condition_rating, 
                   b.discount_percentage, b.discount_end_date, b.genre
            FROM featured_content fc
            LEFT JOIN books b ON fc.book_id = b.id
            WHERE fc.is_active = 1
            ORDER BY fc.type, fc.created_at DESC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching featured content:', err);
                reject(err);
            } else {
                // Calculate discount fields for each book
                const processedRows = rows.map(row => {
                    if (row.book_id) {
                        // Calculate discounted price if discount is active
                        if (row.discount_percentage > 0) {
                            if (row.discount_end_date) {
                                const endDate = new Date(row.discount_end_date);
                                const now = new Date();
                                
                                if (now <= endDate) {
                                    row.discounted_price = row.price * (1 - row.discount_percentage / 100);
                                    row.is_discount_active = true;
                                } else {
                                    row.is_discount_active = false;
                                }
                            } else {
                                // Permanent discount (no end date)
                                row.discounted_price = row.price * (1 - row.discount_percentage / 100);
                                row.is_discount_active = true;
                            }
                        } else {
                            row.is_discount_active = false;
                        }
                    }
                    return row;
                });
                resolve(processedRows);
            }
        });
    });
}

// Set featured content
function setFeaturedContent(type, bookId = null, authorName = null, authorPhotoPath = null) {
    return new Promise((resolve, reject) => {
        // First, deactivate all existing featured content of this type
        const deactivateQuery = `UPDATE featured_content SET is_active = 0 WHERE type = ?`;
        
        db.run(deactivateQuery, [type], (err) => {
            if (err) {
                console.error('Error deactivating featured content:', err);
                reject(err);
                return;
            }
            
            // Then insert new featured content
            const insertQuery = `
                INSERT INTO featured_content (type, book_id, author_name, author_photo_path, is_active)
                VALUES (?, ?, ?, ?, 1)
            `;
            
            db.run(insertQuery, [type, bookId, authorName, authorPhotoPath], function(err) {
                if (err) {
                    console.error('Error setting featured content:', err);
                    reject(err);
                } else {
                    console.log(`Featured content set for type ${type}, ID:`, this.lastID);
                    resolve(this.lastID);
                }
            });
        });
    });
}

// Remove featured content
function removeFeaturedContent(type) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE featured_content SET is_active = 0 WHERE type = ?`;
        
        db.run(query, [type], function(err) {
            if (err) {
                console.error('Error removing featured content:', err);
                reject(err);
            } else {
                console.log(`Featured content removed for type ${type}, changes:`, this.changes);
                resolve(this.changes);
            }
        });
    });
}

// Get featured books by type
function getFeaturedBooksByType(type) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT b.*, fc.type as featured_type
            FROM books b
            JOIN featured_content fc ON b.id = fc.book_id
            WHERE fc.type = ? AND fc.is_active = 1
            ORDER BY fc.created_at DESC
        `;

        db.all(query, [type], (err, rows) => {
            if (err) {
                console.error('Error fetching featured books:', err);
                reject(err);
            } else {
                // Parse images JSON and calculate discounted price for each book
                const booksWithImages = rows.map(book => {
                    const processedBook = {
                        ...book,
                        images: book.images ? JSON.parse(book.images) : []
                    };
                    
                    // Calculate discounted price if discount is active
                    if (book.discount_percentage > 0) {
                        if (book.discount_end_date) {
                            const endDate = new Date(book.discount_end_date);
                            const now = new Date();
                            
                            if (now <= endDate) {
                                processedBook.discounted_price = book.price * (1 - book.discount_percentage / 100);
                                processedBook.is_discount_active = true;
                            } else {
                                processedBook.is_discount_active = false;
                            }
                        } else {
                            // Permanent discount (no end date)
                            processedBook.discounted_price = book.price * (1 - book.discount_percentage / 100);
                            processedBook.is_discount_active = true;
                        }
                    } else {
                        processedBook.is_discount_active = false;
                    }
                    
                    return processedBook;
                });
                resolve(booksWithImages);
            }
        });
    });
}

// Add featured content (without replacing existing)
function addFeaturedContent(type, bookId = null, authorName = null, authorPhotoPath = null) {
    return new Promise((resolve, reject) => {
        // For featured_author, we still want to replace (only one featured author at a time)
        if (type === 'featured_author') {
            return setFeaturedContent(type, bookId, authorName, authorPhotoPath)
                .then(resolve)
                .catch(reject);
        }
        
        // For books, check if already exists to avoid duplicates
        const checkQuery = `
            SELECT id FROM featured_content 
            WHERE type = ? AND book_id = ? AND is_active = 1
        `;
        
        db.get(checkQuery, [type, bookId], (err, existing) => {
            if (err) {
                console.error('Error checking existing featured content:', err);
                reject(err);
                return;
            }
            
            if (existing) {
                // Book is already featured in this section
                resolve(existing.id);
                return;
            }
            
            // Insert new featured content without deactivating existing ones
            const insertQuery = `
                INSERT INTO featured_content (type, book_id, author_name, author_photo_path, is_active)
                VALUES (?, ?, ?, ?, 1)
            `;
            
            db.run(insertQuery, [type, bookId, authorName, authorPhotoPath], function(err) {
                if (err) {
                    console.error('Error adding featured content:', err);
                    reject(err);
                } else {
                    console.log(`Featured content added for type ${type}, ID:`, this.lastID);
                    resolve(this.lastID);
                }
            });
        });
    });
}

// Remove specific featured content item
function removeFeaturedContentItem(itemId) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE featured_content SET is_active = 0 WHERE id = ?`;
        
        db.run(query, [itemId], function(err) {
            if (err) {
                console.error('Error removing featured content item:', err);
                reject(err);
            } else {
                console.log(`Featured content item removed, ID: ${itemId}, changes:`, this.changes);
                resolve(this.changes);
            }
        });
    });
}

// Get featured author
function getFeaturedAuthor() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT fc.author_name, fc.author_photo_path, COUNT(b.id) as book_count
            FROM featured_content fc
            LEFT JOIN books b ON b.author = fc.author_name
            WHERE fc.type = 'featured_author' AND fc.is_active = 1
            GROUP BY fc.author_name, fc.author_photo_path
            LIMIT 1
        `;

        db.get(query, [], (err, row) => {
            if (err) {
                console.error('Error fetching featured author:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// User Authentication Functions

// Create a new user
function createUser(userData) {
    return new Promise((resolve, reject) => {
        const { username, email, password_hash, role = 'user' } = userData;
        
        const query = `
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        `;
        
        db.run(query, [username, email, password_hash, role], function(err) {
            if (err) {
                console.error('Error creating user:', err);
                reject(err);
            } else {
                console.log('User created successfully, ID:', this.lastID);
                resolve({
                    id: this.lastID,
                    username,
                    email,
                    role
                });
            }
        });
    });
}

// Find user by email
function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        
        db.get(query, [email], (err, row) => {
            if (err) {
                console.error('Error finding user by email:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Find user by username
function findUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE username = ?`;
        
        db.get(query, [username], (err, row) => {
            if (err) {
                console.error('Error finding user by username:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Find user by ID
function findUserById(id) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, username, email, role, created_at FROM users WHERE id = ?`;
        
        db.get(query, [id], (err, row) => {
            if (err) {
                console.error('Error finding user by ID:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Get all users (admin only)
function getAllUsers() {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC`;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching users:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Update user role (admin only)
function updateUserRole(userId, role) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        db.run(query, [role, userId], function(err) {
            if (err) {
                console.error('Error updating user role:', err);
                reject(err);
            } else {
                console.log('User role updated, changes:', this.changes);
                resolve(this.changes);
            }
        });
    });
}

// Create default admin user if none exists
async function createDefaultAdmin() {
    try {
        // Check if any admin users exist
        const adminQuery = `SELECT * FROM users WHERE role = 'admin' LIMIT 1`;
        
        return new Promise((resolve, reject) => {
            db.get(adminQuery, [], async (err, adminUser) => {
                if (err) {
                    console.error('Error checking for admin users:', err);
                    reject(err);
                    return;
                }
                
                if (adminUser) {
                    console.log('✅ Admin user already exists:', adminUser.username);
                    resolve();
                    return;
                }
                
                // No admin exists, create default admin
                console.log('🔧 Creating default admin user...');
                
                // Import bcrypt inside the function to avoid circular dependencies
                const bcrypt = await import('bcryptjs');
                const saltRounds = 12;
                const defaultPassword = 'admin123';
                const password_hash = await bcrypt.default.hash(defaultPassword, saltRounds);
                
                const insertQuery = `
                    INSERT INTO users (username, email, password_hash, role)
                    VALUES (?, ?, ?, ?)
                `;
                
                db.run(insertQuery, ['admin', 'admin@inkbound.com', password_hash, 'admin'], function(err) {
                    if (err) {
                        console.error('Error creating default admin:', err);
                        reject(err);
                    } else {
                        console.log('✅ Default admin user created successfully!');
                        console.log('📧 Email: admin@inkbound.com');
                        console.log('🔑 Password: admin123');
                        console.log('⚠️  Please change the default password after first login');
                        resolve();
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error in createDefaultAdmin:', error);
        throw error;
    }
}

export {
    initializeDatabase,
    insertBook,
    getAllBooks,
    updateBook,
    deleteBook,
    getBookById,
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
    createDefaultAdmin
}; 