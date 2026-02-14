# AuditArr Setup Guide

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize the database:**
   ```bash
   # Push the schema to create tables
   npm run db:push
   ```

3. **Seed with example data (optional):**
   ```bash
   # Option 1: Realistic Sonarr/Radarr examples (12 messages)
   npm run db:seed

   # Option 2: Random test data using drizzle-seed (100 messages)
   npm run db:seed:random
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Visit the app:**
   Open http://localhost:3000/messages

## Database Management

### View and Edit Data
```bash
npm run db:studio
```
This opens Drizzle Studio in your browser - a visual database browser.

### Schema Changes
```bash
# During development - quick sync (no migrations)
npm run db:push

# For production - generate proper migrations
npm run db:generate
npm run db:migrate
```

## Testing ntfy.sh API

### Send a simple message:
```bash
curl -d "Test message" http://localhost:3000/api/test
```

### Send a message with metadata:
```bash
curl -H "Title: Server Alert" \
     -H "Priority: urgent" \
     -H "Tags: warning,server" \
     -d "Server is running low on disk space" \
     http://localhost:3000/api/alerts
```

### Configure Sonarr/Radarr:
1. Go to Settings → Connect
2. Add ntfy notification
3. Set URL to: `http://your-server:3000/api/sonarr` (or `/api/radarr`)
4. Configure which events to send

## Architecture Overview

- **Frontend:** Nuxt 4 + Vue 3 + @nuxt/ui
- **Backend:** Nuxt server API (H3)
- **Database:** SQLite with Drizzle ORM
- **API:** ntfy.sh-compatible endpoints

## Key Files

- `server/db/schema.ts` - Database schema (Drizzle)
- `server/db/index.ts` - Database connection
- `server/utils/database.ts` - Database queries
- `server/api/` - API endpoints
- `pages/messages.vue` - Main UI
- `drizzle.config.ts` - Drizzle configuration
