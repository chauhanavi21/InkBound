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
                    console.log('Database initialized successfully');
                    
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

export {
    initializeDatabase,
    insertBook,
    getAllBooks,
    updateBook,
    deleteBook,
    getBookById
}; 