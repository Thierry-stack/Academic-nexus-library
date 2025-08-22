// backend/server.js
const express = require('express');
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Set up dynamic CORS for production and development
const isProduction = process.env.NODE_ENV === 'production';
const origin = isProduction
    ? 'https://academic-nexus-library-frontend.onrender.com'
    : 'http://localhost:3000';

const corsOptions = {
    origin: origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Access-Token'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

let mysqlPool;
let mongoDbConnection;

// Simple test routes
app.get('/', (req, res) => {
    res.send('Horizon Library Backend is running!');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function initializeDatabases() {
    try {
        console.log('Initializing database connections...');

        console.log('Connecting to MySQL...');
        mysqlPool = await mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: {
                ca: process.env.MYSQL_CA_CERT,
                rejectUnauthorized: true
            },
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 10000
        });

        const connection = await mysqlPool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Successfully connected to MySQL database!');

        if (process.env.MONGO_URI) {
            console.log('Connecting to MongoDB...');
            try {
                await mongoose.connect(process.env.MONGO_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 5000
                });

                mongoDbConnection = mongoose.connection;
                if (mongoDbConnection.readyState === 1) {
                    console.log('✅ Successfully connected to MongoDB database!');
                } else {
                    console.warn('⚠️ Unexpected MongoDB readyState:', mongoDbConnection.readyState);
                }
            } catch (mongoErr) {
                console.warn('⚠️ MongoDB connection skipped or failed:', mongoErr.message);
                mongoDbConnection = null;
            }
        } else {
            console.log('ℹ️ MONGO_URI not set. Skipping MongoDB connection.');
            mongoDbConnection = null;
        }

        return true;

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

function initializeRoutes() {
    try {
        console.log('Initializing routes...');

        const bookRequestsRoutes = require('./routes/bookRequests');
        const librarianRoutes = require('./routes/librarian');
        const studentRoutes = require('./routes/student');
        const publicRoutes = require('./routes/public');
        const searchStatsRoutes = require('./routes/searchStats');

        app.use('/api/book-requests', (req, res, next) => {
            req.db = { mysqlPool, mongoDbConnection };
            next();
        }, bookRequestsRoutes);

        app.use('/api/librarian', (req, res, next) => {
            req.db = { mysqlPool, mongoDbConnection };
            next();
        }, librarianRoutes);

        app.use('/api/student', (req, res, next) => {
            req.db = { mysqlPool, mongoDbConnection };
            next();
        }, studentRoutes);

        app.use('/api/books', (req, res, next) => {
            req.db = { mysqlPool, mongoDbConnection };
            next();
        }, publicRoutes);

        app.use('/api/search-stats', (req, res, next) => {
            req.db = { mysqlPool, mongoDbConnection };
            next();
        }, searchStatsRoutes);

        console.log('✅ Routes initialized successfully');
        return true;

    } catch (error) {
        console.error('❌ Route initialization failed:', error);
        throw error;
    }
}

async function startServer() {
    try {
        await initializeDatabases();
        initializeRoutes();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            const baseUrl = isProduction ? 'https://your-backend-service-name.onrender.com' : `http://localhost:${PORT}`;

            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`🌐 Access it at: ${baseUrl}`);
            console.log('\nAvailable endpoints:');
            console.log(`- GET    /                   - Server status`);
            console.log(`- GET    /health             - Health check`);
            console.log(`- GET    /api/books          - Public book search`);
            console.log(`- POST /api/search-stats/track-search - Track a search`);
            console.log(`- GET    /api/search-stats/most-searched - Get search statistics\n`);
        });

    } catch (error) {
        console.error('\n❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
