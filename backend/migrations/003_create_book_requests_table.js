const { db } = require('../config/database');

const createBookRequestsTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS book_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255),
            isbn VARCHAR(20),
            reason TEXT,
            additional_notes TEXT,
            status ENUM('pending', 'approved', 'rejected', 'ordered', 'received') DEFAULT 'pending',
            requested_by INT,
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    try {
        const [rows] = await db.mysqlPool.execute(createTableQuery);
        console.log('✅ Created book_requests table');
    } catch (error) {
        console.error('❌ Error creating book_requests table:', error);
        throw error;
    }
};

// Run the migration
createBookRequestsTable()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
