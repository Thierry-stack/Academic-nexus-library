# Database Management

This document outlines the database management system for the Horizon Library application.

## Database Connection

The application uses MySQL for storing search statistics. The connection details are configured using environment variables in the `.env` file:

```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

## Migration System

We've implemented a migration system to manage database schema changes. The migrations are stored in the `backend/migrations` directory.

### Available Commands

1. **Run pending migrations**:
   ```bash
   node scripts/migrate.js
   ```

2. **Verify database connection**:
   ```bash
   node scripts/db-verify.js
   ```

3. **Test search statistics**:
   ```bash
   node scripts/test-search-stats.js
   ```

## Search Statistics

The search statistics feature tracks book searches in the `book_searches` table with the following schema:

```sql
CREATE TABLE book_searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    search_count INT DEFAULT 1,
    last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_title (title)
);
```

## Error Handling

The application includes robust error handling for database operations, including:

- Automatic table creation if it doesn't exist
- Detailed error messages in development mode
- Graceful degradation when search statistics are unavailable

## Testing

To test the search statistics functionality:

1. Make sure your database is running and accessible
2. Run the test script:
   ```bash
   node scripts/test-search-stats.js
   ```

This will verify:
- Database connection
- Table creation (if needed)
- Search tracking
- Statistics retrieval
