    // backend/routes/librarian.js
    const express = require('express');
    const multer = require('multer');
    const router = express.Router();
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const { auth, authorize } = require('../middleware/auth');
    const path = require('path');
    const fs = require('fs');

    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Multer storage configuration
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'book-cover-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    const upload = multer({ 
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);
            
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
            }
        }
    });

    // @route   GET /api/librarian/books
    // @desc    Get all books (Protected - Librarian only)
    // @access  Private (Librarian)
    router.get('/books', auth, authorize(['librarian']), async (req, res) => {
        try {
            const [books] = await req.db.mysqlPool.query('SELECT * FROM books');
            res.json(books);
        } catch (err) {
            console.error('Error fetching books:', err);
            res.status(500).json({ 
                error: 'Server Error',
                message: 'Failed to fetch books',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    });

    // @route   POST /api/librarian/login
    // @desc    Authenticate librarian & get token
    // @access  Public (for login process itself)
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        try {
            // Check if librarian exists
            const [rows] = await req.db.mysqlPool.execute(
                'SELECT id, username, password FROM librarians WHERE username = ?', 
                [username]
            );
            
            const librarian = rows[0];
            if (!librarian) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            // Compare provided password with hashed password in DB
            const isMatch = await bcrypt.compare(password, librarian.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            // Create JWT Payload
            const payload = {
                user: {
                    id: librarian.id,
                    role: 'librarian'
                }
            };

            // Sign the token
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) {
                        console.error('JWT Sign Error:', err);
                        return res.status(500).json({ message: 'Error generating token' });
                    }
                    res.json({ 
                        token, 
                        role: 'librarian',
                        user: {
                            id: librarian.id,
                            username: librarian.username
                        }
                    });
                }
            );

        } catch (err) {
            console.error('Login Error:', err);
            res.status(500).json({ 
                error: 'Server Error',
                message: 'Login failed',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    });

    // @route   POST /api/librarian/books
    // @desc    Add a new book (Protected - Librarian only)
    // @access  Private (Librarian)
    router.post('/books', auth, authorize(['librarian']), upload.single('coverImage'), async (req, res) => {
        console.log('Received book data:', req.body);
        console.log('Uploaded file:', req.file);
        
        const { 
            title, 
            author, 
            isbn, 
            published_date, 
            description, 
            shelf_number, 
            row_position 
        } = req.body;

        // Basic validation
        if (!title || !author || !isbn) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'Title, author, and ISBN are required fields' 
            });
        }

        try {
            // Check if book with same ISBN already exists
            const [existingBooks] = await req.db.mysqlPool.execute(
                'SELECT id FROM books WHERE isbn = ?', 
                [isbn]
            );
            
            if (existingBooks.length > 0) {
                return res.status(409).json({ 
                    error: 'Duplicate Entry',
                    message: 'A book with this ISBN already exists' 
                });
            }

            // Prepare book data
            const cover_image_url = req.file ? `/uploads/${req.file.filename}` : null;
            
            const query = `
                INSERT INTO books 
                (title, author, isbn, published_date, description, cover_image_url, shelf_number, row_position) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                title, 
                author, 
                isbn, 
                published_date || null, 
                description || null, 
                cover_image_url, 
                shelf_number || null, 
                row_position || null
            ];

            console.log('Executing query:', query);
            console.log('With values:', values);

            const [result] = await req.db.mysqlPool.execute(query, values);
            
            // Fetch the newly created book to return complete data
            const [newBook] = await req.db.mysqlPool.execute(
                'SELECT * FROM books WHERE id = ?', 
                [result.insertId]
            );

            res.status(201).json({ 
                success: true,
                message: 'Book added successfully', 
                book: newBook[0]
            });

        } catch (err) {
            console.error('Error adding book:', {
                message: err.message,
                code: err.code,
                sql: err.sql,
                sqlMessage: err.sqlMessage,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
            
            // If there was a file uploaded but an error occurred, delete it
            if (req.file && req.file.path) {
                try {
                    await fs.promises.unlink(req.file.path);
                } catch (unlinkErr) {
                    console.error('Error deleting uploaded file:', unlinkErr);
                }
            }
            
            res.status(500).json({ 
                error: 'Database Error',
                message: 'Failed to add book',
                details: process.env.NODE_ENV === 'development' ? {
                    message: err.message,
                    code: err.code,
                    sql: err.sql,
                    sqlMessage: err.sqlMessage
                } : undefined
            });
        }
    });
    // @desc    Update book details (Protected - Librarian only)
    // @access  Private (Librarian)
    router.put('/books/:id', auth, authorize(['librarian']), upload.single('coverImage'), async (req, res) => {
        const { title, author, isbn, published_date, description, shelf_number, row_position } = req.body;
        const { id } = req.params;

        let finalCoverImageUrl = null;

        try {
            if (req.file) {
                finalCoverImageUrl = `/uploads/${req.file.filename}`;
            } else {
                const [bookRows] = await req.db.mysqlPool.execute('SELECT cover_image_url FROM books WHERE id = ?', [id]);
                if (bookRows.length > 0) {
                    finalCoverImageUrl = bookRows[0].cover_image_url;
                }
                // If the frontend explicitly sends a blank string for cover_image_url
                // and no file was uploaded, it means the user wants to clear the image.
                if (req.body.cover_image_url === '') {
                    finalCoverImageUrl = null;
                }
            }

            const query = `
                UPDATE books 
                SET 
                    title = ?, 
                    author = ?, 
                    isbn = ?, 
                    published_date = ?, 
                    description = ?, 
                    cover_image_url = ?, 
                    shelf_number = ?, 
                    row_position = ? 
                WHERE id = ?
            `;
            const values = [
                title, 
                author, 
                isbn, 
                published_date, 
                description, 
                finalCoverImageUrl, 
                shelf_number || null, 
                row_position || null, 
                id
            ];

            const [result] = await req.db.mysqlPool.execute(query, values); 
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json({ message: 'Book updated successfully' });
        } catch (err) {
            console.error(err.message);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'A book with this ISBN already exists.' });
            }
            res.status(500).send('Server Error');
        }
    });

    // @route   DELETE /api/librarian/books/:id
    // @desc    Delete a book (Protected - Librarian only)
    // @access  Private (Librarian)
    router.delete('/books/:id', auth, authorize(['librarian']), async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await req.db.mysqlPool.execute('DELETE FROM books WHERE id = ?', [id]); 
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json({ message: 'Book deleted successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    module.exports = router;
    