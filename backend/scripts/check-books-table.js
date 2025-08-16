require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkBooksTable() {
    let connection;
    try {
        // Create a connection to the database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Successfully connected to MySQL database');
        
        // Check if books table exists
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'books'"
        );
        
        if (tables.length === 0) {
            console.log('❌ books table does not exist');
        } else {
            console.log('✅ books table exists');
            
            // Get table structure
            const [columns] = await connection.execute('DESCRIBE books');
            console.log('\n📋 Books table structure:');
            console.table(columns);
            
            // Get row count
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM books');
            console.log(`\n📊 Total books: ${rows[0].count}`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.error('The specified table does not exist');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('The specified database does not exist');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Please check your database credentials');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused. Is the database server running?');
        }
    } finally {
        if (connection) await connection.end();
    }
}

checkBooksTable();
