/**
 * Database initialization script
 * Creates tables if they don't exist
 */

import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'auditarr.db')

console.log('Initializing database schema...')

const sqlite = new Database(DB_PATH)

try {
  // Try to select from the table to see if it exists
  sqlite.prepare('SELECT 1 FROM messages LIMIT 1').get()
  console.log('Database tables already exist')
} catch {
  // Table doesn't exist, create it
  console.log('Creating messages table...')
  
  // Build CREATE TABLE statement from schema
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,
      topic TEXT NOT NULL,
      message TEXT NOT NULL,
      title TEXT,
      priority INTEGER NOT NULL DEFAULT 3,
      tags TEXT,
      click TEXT,
      icon TEXT,
      actions TEXT,
      metadata TEXT,
      event TEXT NOT NULL DEFAULT 'message',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
    
    CREATE INDEX IF NOT EXISTS idx_messages_topic ON messages(topic);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  `)
  
  console.log('Database initialized successfully')
}

sqlite.close()
