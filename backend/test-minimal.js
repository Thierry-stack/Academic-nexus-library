// Minimal test server to isolate the path-to-regexp error
const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Test basic route
app.get('/test', (req, res) => {
    res.json({ message: 'Basic route works' });
});

// Test route with parameter
app.get('/test/:id', (req, res) => {
    res.json({ message: 'Parameter route works', id: req.params.id });
});

// Test route with multiple parameters
app.get('/test/:id/:action', (req, res) => {
    res.json({ 
        message: 'Multiple parameter route works', 
        id: req.params.id, 
        action: req.params.action 
    });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`✅ Minimal test server running on port ${PORT}`);
    console.log('Test these endpoints:');
    console.log(`- GET http://localhost:${PORT}/test`);
    console.log(`- GET http://localhost:${PORT}/test/123`);
    console.log(`- GET http://localhost:${PORT}/test/123/edit`);
}); 