// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function auth(req, res, next) {
    // Get token from header or query parameter (for testing)
    let token = '';
    
    // Check Authorization header first
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        console.error('No token provided in request');
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No authentication token provided.' 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.user) {
            console.error('Invalid token payload:', decoded);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token format' 
            });
        }

        // Attach user payload to the request object
        req.user = decoded.user;
        console.log(`Authenticated user: ${req.user.id} (${req.user.role})`);
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        
        let errorMessage = 'Invalid or expired token';
        if (err.name === 'TokenExpiredError') {
            errorMessage = 'Session expired. Please log in again.';
        } else if (err.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid token';
        }
        
        res.status(401).json({ 
            success: false, 
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

// Middleware to authorize based on role
function authorize(roles = []) {
    // roles can be a single role or an array of roles
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: 'Forbidden: You do not have permission to access this resource' 
            });
        }
        
        next();
    };
}

module.exports = { auth, authorize };