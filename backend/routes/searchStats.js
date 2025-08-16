const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// Track a book search
router.post('/track-search', async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ 
                error: 'Book title is required',
                code: 'MISSING_TITLE'
            });
        }

        // Clean the title (remove extra spaces, etc.)
        const cleanTitle = title.trim();

        // Check if this search already exists
        const [existing] = await req.db.mysqlPool.execute(
            'SELECT * FROM book_searches WHERE title = ?',
            [cleanTitle]
        );

        if (existing.length > 0) {
            // Update existing search count and timestamp
            await req.db.mysqlPool.execute(
                'UPDATE book_searches SET search_count = search_count + 1, last_searched_at = CURRENT_TIMESTAMP WHERE title = ?',
                [cleanTitle]
            );
        } else {
            // Insert new search record
            await req.db.mysqlPool.execute(
                'INSERT INTO book_searches (title, search_count) VALUES (?, 1)',
                [cleanTitle]
            );
        }

        res.json({ 
            message: 'Search tracked successfully',
            title: cleanTitle
        });

    } catch (error) {
        console.error('Error tracking search:', error);
        res.status(500).json({ 
            error: 'Failed to track search',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get most searched books
router.get('/most-searched', async (req, res) => {
    try {
        // Ensure the table exists
        await req.db.mysqlPool.execute(`
            CREATE TABLE IF NOT EXISTS book_searches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                search_count INT DEFAULT 1,
                last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_title (title)
            )
        `);

        // Get the most searched books
        const [rows] = await req.db.mysqlPool.execute(`
            SELECT title, search_count, last_searched_at, created_at
            FROM book_searches 
            ORDER BY search_count DESC, last_searched_at DESC 
            LIMIT 20
        `);

        // Return plain array to match frontend expectations (snake_case fields)
        res.json(rows);

    } catch (error) {
        console.error('Error fetching search statistics:', error);
        
        // Try to get a connection to check if it's a connection issue
        let connection;
        try {
            connection = await req.db.mysqlPool.getConnection();
            await connection.ping();
            connection.release();
            
            // If connection is fine, it's a different error
            res.status(500).json({ 
                error: 'Failed to fetch search statistics',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } catch (connError) {
            // Connection issue
            res.status(503).json({ 
                error: 'Database connection issue',
                details: process.env.NODE_ENV === 'development' ? connError.message : undefined
            });
        }
    }
});

// Clear search history (for testing/cleanup purposes)
router.delete('/clear-history', auth, authorize(['librarian']), async (req, res) => {
    try {
        // Ensure the table exists
        await req.db.mysqlPool.execute(`
            CREATE TABLE IF NOT EXISTS book_searches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                search_count INT DEFAULT 1,
                last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_title (title)
            )
        `);

        // Clear all search history
        const [result] = await req.db.mysqlPool.execute('DELETE FROM book_searches');
        
        res.json({
            success: true,
            message: 'Search history cleared successfully',
            deletedCount: result.affectedRows
        });

    } catch (error) {
        console.error('Error clearing search history:', error);
        
        // Try to get a connection to check if it's a connection issue
        let connection;
        try {
            connection = await req.db.mysqlPool.getConnection();
            await connection.ping();
            connection.release();
            
            // If connection is fine, it's a different error
            res.status(500).json({ 
                error: 'Failed to clear search history',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } catch (connError) {
            // Connection issue
            res.status(503).json({ 
                error: 'Database connection issue',
                details: process.env.NODE_ENV === 'development' ? connError.message : undefined
            });
        }
    }
});

module.exports = router;
