// backend/routes/student.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// This route can be expanded later for student-specific functionalities.
router.get('/', auth, authorize(['student']), (req, res) => {
    res.send('Student API route is working!');
});

// Add other student-specific routes here later...

module.exports = router;