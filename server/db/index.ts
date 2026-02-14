import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { join } from 'path'
import * as schema from './schema'

// Database file path
const DB_PATH = join(process.cwd(), 'auditarr.db')

// Create SQLite connection
const sqlite = new Database(DB_PATH)

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL')

// Create Drizzle instance
export const db = drizzle(sqlite, { schema })

console.log('✅ Connected to SQLite database with Drizzle ORM')
