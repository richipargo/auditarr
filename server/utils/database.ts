import sqlite3 from 'sqlite3';
import { join } from 'path';

// Database file path
const DB_PATH = join(process.cwd(), 'auditarr.db');

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create messages table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        message TEXT NOT NULL,
        event TEXT DEFAULT 'message',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating messages table:', err.message);
      } else {
        console.log('Database tables initialized');
      }
    });
    
    // Create index for faster topic-based queries
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_messages_topic ON messages(topic)
    `, (err) => {
      if (err) {
        console.error('Error creating index:', err.message);
      }
    });
    
    // Create index for faster time-based queries
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)
    `, (err) => {
      if (err) {
        console.error('Error creating index:', err.message);
      }
    });
  });
}

// Function to save a message to the database
export function saveMessage(topic: string, message: string, callback: (err: Error | null, result?: any) => void) {
  const messageId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 8);
  
  db.run(`
    INSERT INTO messages (message_id, topic, message, event)
    VALUES (?, ?, ?, ?)
  `, [messageId, topic, message, 'message'], function(err) {
    if (err) {
      console.error('Error saving message:', err.message);
      callback(err);
    } else {
      console.log(`Message saved to database with ID: ${this.lastID}`);
      callback(null, {
        id: messageId,
        time: new Date().toISOString(),
        topic,
        message,
        event: 'message'
      });
    }
  });
}

// Function to get messages for a specific topic
export function getMessagesByTopic(topic: string, callback: (err: Error | null, messages?: any[]) => void) {
  db.all(`
    SELECT message_id as id, topic, message, event, created_at as time
    FROM messages
    WHERE topic = ?
    ORDER BY created_at DESC
    LIMIT 100
  `, [topic], (err, rows) => {
    if (err) {
      console.error('Error retrieving messages:', err.message);
      callback(err, []);
    } else {
      // Convert time format to match original implementation
      const messages = rows.map(row => ({
        id: row.id,
        time: row.time, // SQLite returns ISO format by default
        topic: row.topic,
        message: row.message,
        event: row.event
      }));
      callback(null, messages);
    }
  });
}

// Function to get all unique topics
export function getAllTopics(callback: (err: Error | null, topics?: string[]) => void) {
  db.all(`
    SELECT DISTINCT topic FROM messages ORDER BY topic ASC
  `, (err, rows) => {
    if (err) {
      console.error('Error retrieving topics:', err.message);
      callback(err, []);
    } else {
      const topics = rows.map(row => row.topic);
      callback(null, topics);
    }
  });
}

// Function to close the database connection
export function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
}
