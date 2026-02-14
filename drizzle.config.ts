import { defineConfig } from 'drizzle-kit'
import { join } from 'path'

// Use same DB path logic as server/db/index.ts
const DB_PATH = process.env.DB_PATH || join(process.cwd(), 'data', 'auditarr.db')

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: DB_PATH
  },
  verbose: true,
  strict: true
})
