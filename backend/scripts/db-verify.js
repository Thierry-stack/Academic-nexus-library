require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyDatabaseConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Successfully connected to MySQL database');
        
        // Check if book_searches table exists
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'book_searches'"
        );
        
        if (tables.length === 0) {
            console.log('❌ book_searches table does not exist');
        } else {
            console.log('✅ book_searches table exists');
            
            // Get row count
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM book_searches');
            console.log(`📊 Total search records: ${rows[0].count}`);
        }
        
        await connection.end();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('The specified database does not exist');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Please check your database credentials');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused. Is the database server running?');
        }
    }
}

verifyDatabaseConnection();
