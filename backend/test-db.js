// Simple script to test database connection
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

async function testMySQL() {
    console.log('Testing MySQL connection...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const [rows] = await connection.query('SELECT 1 as test');
        console.log('✅ MySQL connection successful!', rows[0]);
    } catch (error) {
        console.error('❌ MySQL connection failed:', error);
    } finally {
        await connection.end();
    }
}

async function testMongoDB() {
    console.log('\nTesting MongoDB connection...');
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB connection successful!');
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
    }
}

async function runTests() {
    console.log('Starting database connection tests...\n');
    await testMySQL();
    await testMongoDB();
    console.log('\nTests completed.');
    process.exit(0);
}

runTests();
