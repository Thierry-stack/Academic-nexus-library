// backend/routes/public.js
const express = require('express');
const router = express.Router();

// @route   GET /api/books/search
// @desc    Search books by title (Publicly accessible)
// @access  Public
router.get('/search', async (req, res) => {
    console.log('Search request received:', req.query);
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        console.log('Empty search query');
        return res.status(400).json({ 
            error: 'Search query is required',
            code: 'MISSING_QUERY'
        });
    }

    try {
        console.log(`Searching for books with query: "${q}"`);
        
        // Note: Search tracking has been moved to the dedicated /api/search-stats/track-search endpoint
        // to prevent tracking of partial searches and suggestions

        // Perform the search
        const [rows] = await req.db.mysqlPool.execute(
            'SELECT id, title, author, isbn, cover_image_url, published_date, description, shelf_number, row_position FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? LIMIT 10', 
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );
        
        console.log(`Found ${rows.length} results for query: "${q}"`);
        res.json(rows);
        
    } catch (err) {
        console.error('Search error:', {
            message: err.message,
            code: err.code,
            sql: err.sql,
            sqlMessage: err.sqlMessage,
            stack: err.stack
        });
        
        res.status(500).json({ 
            error: 'Error performing search',
            details: process.env.NODE_ENV === 'development' ? {
                message: err.message,
                code: err.code
            } : undefined,
            code: 'SEARCH_ERROR'
        });
    }
});

// @route   GET /api/books
// @desc    Get all books (Publicly accessible)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.mysqlPool.execute('SELECT * FROM books');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/books/:id
// @desc    Get a single book by ID (Publicly accessible)
// @access  Public
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await req.db.mysqlPool.execute('SELECT * FROM books WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
    