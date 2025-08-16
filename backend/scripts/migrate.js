const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function getMigrations() {
    const files = await fs.readdir(MIGRATIONS_DIR);
    return files
        .filter(file => file.endsWith('.sql'))
        .sort()
        .map(file => ({
            name: file,
            path: path.join(MIGRATIONS_DIR, file)
        }));
}

async function getAppliedMigrations(connection) {
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const [rows] = await connection.execute('SELECT name FROM migrations ORDER BY name');
    return rows.map(row => row.name);
}

async function applyMigration(connection, migration) {
    const sql = await fs.readFile(migration.path, 'utf8');
    await connection.beginTransaction();
    
    try {
        // Split SQL file into individual statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Execute each statement
        for (const statement of statements) {
            await connection.execute(statement);
        }

        // Record the migration
        await connection.execute(
            'INSERT INTO migrations (name) VALUES (?)',
            [migration.name]
        );

        await connection.commit();
        console.log(`✅ Applied migration: ${migration.name}`);
        return true;
    } catch (error) {
        await connection.rollback();
        console.error(`❌ Failed to apply migration ${migration.name}:`, error.message);
        return false;
    }
}

async function runMigrations() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('🔍 Checking for pending migrations...');
        const migrations = await getMigrations();
        const appliedMigrations = await getAppliedMigrations(connection);
        
        let pendingMigrations = migrations.filter(
            m => !appliedMigrations.includes(m.name)
        );

        if (pendingMigrations.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }

        console.log(`🔄 Found ${pendingMigrations.length} pending migration(s)`);
        
        for (const migration of pendingMigrations) {
            const success = await applyMigration(connection, migration);
            if (!success) {
                console.error('❌ Migration failed. Stopping...');
                process.exit(1);
            }
        }

        console.log('✨ All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

// Run migrations
runMigrations();
