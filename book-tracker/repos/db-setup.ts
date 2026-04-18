import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'booktracker.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDbConnection = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbInstance;
};


export const initializeDatabase = async () => {
  const db = await getDbConnection();

  const query = `
    -- 1. Enable Foreign Keys (Crucial for the cascading deletes to work)
    PRAGMA foreign_keys = ON;
    
    -- 2. The Books Table
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        publish_year INTEGER,
        description TEXT,
        cover_image_uri TEXT,
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER NOT NULL, 
        status TEXT CHECK(status IN ('READING', 'READ', 'WANT_TO_READ', 'DROPPED')) DEFAULT 'WANT_TO_READ',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- 3. The Tags Table
    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    
    -- 4. The Junction Table (Many-to-Many)
    CREATE TABLE IF NOT EXISTS book_tags (
        book_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (book_id, tag_id),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `;

  try {
    await db.execAsync(query);
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw Error("Could not initialize database");
  }
};