// routes/backend/horizon-library/bookRequests.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all book purchase requests (for admin/librarian)
router.get('/', auth, authorize(['librarian']), async (req, res) => {
    try {
        const [requests] = await req.db.mysqlPool.execute(`
            SELECT r.*, u.username as requested_by_username
            FROM book_requests r
            JOIN users u ON r.requested_by = u.id
            ORDER BY r.requested_at DESC
        `);
        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Error fetching book requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch book requests',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Submit a new book purchase request (for students)
router.post('/', auth, authorize(['student']), [
    body('title').trim().isLength({ min: 1 }).withMessage('Book title is required'),
    body('author').optional().trim(),
    body('isbn').optional().trim(),
    body('reason').optional().trim(),
    body('additionalNotes').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { title, author, isbn, reason, additionalNotes } = req.body;
        const userId = req.user?.id; // set by auth middleware

        const [result] = await req.db.mysqlPool.execute(
            `INSERT INTO book_requests
             (title, author, isbn, reason, additional_notes, requested_by, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [title, author || null, isbn || null, reason || null, additionalNotes || null, userId || null]
        );

        const [request] = await req.db.mysqlPool.execute(
            'SELECT * FROM book_requests WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Book purchase request submitted successfully',
            data: request[0]
        });

    } catch (error) {
        console.error('Error submitting book purchase request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit book purchase request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update request status (for admin/librarian)
router.patch('/:id/status', auth, authorize(['librarian']), [
    body('status').isIn(['pending', 'approved', 'rejected', 'ordered', 'received']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { status } = req.body;
        const requestId = req.params.id;

        await req.db.mysqlPool.execute(
            'UPDATE book_requests SET status = ? WHERE id = ?',
            [status, requestId]
        );

        res.json({
            success: true,
            message: 'Request status updated successfully'
        });

    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update request status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;