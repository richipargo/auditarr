# Agent Instructions

## Project Overview

AuditArr is a message audit trail application built with **Nuxt 4** and **@nuxt/ui v4** that implements the ntfy.sh API for receiving notifications. It allows posting messages to topics (compatible with Sonarr, Radarr, and other *arr applications) and viewing them with filtering capabilities. Messages are persisted in a SQLite database with full support for ntfy.sh message metadata (title, priority, tags, actions, etc.).

## Technology Stack

- **Nuxt 4** - Full-stack Vue framework
- **@nuxt/ui v4** - UI component library (125+ components, built on Reka UI & Tailwind CSS v4)
- **Vue 3** - Progressive JavaScript framework with Composition API
- **Drizzle ORM** - Type-safe database toolkit
- **better-sqlite3** - Fast SQLite driver
- **Zod** - Runtime type validation for API responses
- **TypeScript** - Full type safety throughout
- **Tailwind CSS v4** - Utility-first CSS framework

## Development Commands

```bash
# Start development server on http://localhost:3000
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only Nuxt/integration tests
npm run test:nuxt

# Database commands (Drizzle ORM)
npm run db:generate      # Generate migrations from schema
npm run db:migrate       # Run migrations
npm run db:push          # Push schema changes directly (dev only)
npm run db:studio        # Open Drizzle Studio (visual database browser)
npm run db:seed          # Seed database with example Sonarr/Radarr messages
npm run db:seed:random   # Generate random test data using drizzle-seed
```

## Docker Deployment

See [DOCKER.md](./DOCKER.md) for detailed deployment guide.

```bash
# Quick start with Docker Compose
docker-compose up -d

# Build and run manually
docker build -t auditarr .
docker run -d -p 3000:3000 -v $(pwd)/data:/data auditarr
```

**Database Path:**
- Default development: `./data/auditarr.db`
- Docker container: `/data/auditarr.db` (mounted volume)
- Configurable via `DB_PATH` environment variable

## Architecture

### Nuxt 4 Structure

**Important:** Nuxt 4 uses the `app/` directory for application code:
- `app/app.vue` - Root application component with layout
- `app/pages/` - File-based routing (not root-level `pages/`)
- `app/pages/index.vue` - Landing page (/)
- `app/pages/messages.vue` - Audit trail interface (/messages)
- `server/` - Server-side code (API, database, utilities)
- `assets/css/main.css` - Required for Tailwind CSS v4 imports

### Type Validation Layer

**Zod Schemas (server/schemas/message.ts):**
- `actionSchema` - ntfy.sh action button schema
- `messageMetadataSchema` - Incoming message metadata validation
- `messageResponseSchema` - API response validation
- `messagesArraySchema` - Array of messages validation
- `topicsArraySchema` - Array of topics validation
- `messageFiltersSchema` - Query parameter validation
- All schemas export TypeScript types via `z.infer<>`

**Runtime Validation:**
- All API endpoints validate inputs with Zod schemas
- All API responses validated before returning to client
- Database functions return strongly-typed objects
- Catches type errors at runtime, not just compile time

**Frontend Type Safety:**
- `app/utils/api.ts` - Typed API fetch functions with Zod validation
- `app/composables/useMessages.ts` - Typed composables for state management
- All UI components use `MessageResponse` types
- Full type safety from database to UI

### Database

- **Database Dialect**: The database dialect is set in the `nuxt.config.ts` file, within the `hub.db` option or `hub.db.dialect` property.
- **Drizzle Config**: Don't generate the `drizzle.config.ts` file manually, it is generated automatically by NuxtHub.
- **Generate Migrations**: Use `npx nuxt db generate` to automatically generate database migrations from schema changes
- **Never Write Manual Migrations**: Do not manually create SQL migration files in the `server/db/migrations/` directory
- **Workflow**:
  1. Create or modify the database schema in `server/db/schema.ts` or any other schema file in the `server/db/schema/` directory
  2. Run `npx nuxt db generate` to generate the migration
  3. Run `npx nuxt db migrate` to apply the migration to the database, or run `npx nuxt dev` to apply the migration during development
- **Access the database**: Use the `db` instance from `@nuxthub/db` (or `hub:db` for backwards compatibility) to query the database, it is a Drizzle ORM instance.

### API Endpoints (server/api/)

Implements ntfy.sh-compatible API for receiving notifications from Sonarr, Radarr, and other services.

- **POST /api/[topic]** - Publishes a message to a topic (ntfy.sh compatible)
  - Body: Message text (raw)
  - Headers (all optional, follows ntfy.sh format):
    - `X-Title` / `Title` / `t` / `ti` - Message title
    - `X-Priority` / `Priority` / `p` / `prio` - Priority 1-5 or named (min/low/default/high/urgent)
    - `X-Tags` / `Tags` / `tag` / `ta` - Comma-separated tags
    - `X-Click` / `Click` - Click-through URL
    - `X-Icon` / `Icon` - Icon image URL
    - `X-Actions` / `Actions` - JSON array of action buttons
  - Returns: "OK" on success

- **GET /api/[topic]** - Returns messages for a specific topic (limit 100, ordered by newest first)
  - Returns full message objects with all ntfy.sh metadata

- **GET /api/topics** - Returns array of all unique topic names

- **GET /api/messages** - Returns filtered messages with query params:
  - `topic` - Filter by topic (use 'all' for no filter)
  - `search` - Search in message content, topic name, or title
  - `startDate` - Filter by creation date (>=)
  - `endDate` - Filter by creation date (<=)
  - Returns messages with all metadata fields

All endpoints use async/await with Drizzle ORM queries.

### Frontend Structure (Nuxt UI v4)

**app/app.vue** - Root layout
- Uses `UHeader` with logo and navigation
- `UColorModeButton` for dark mode toggle
- `UMain` wrapper for content

**app/pages/index.vue** - Landing page
- Feature highlights
- Quick start guide
- Documentation links

**app/pages/messages.vue** - Audit trail interface
- **Table View** - Compact list using `UTable` component
  - Priority indicator (colored dot + label)
  - Topic badges
  - Title/preview
  - Relative timestamps
  - Tag preview (first 2 + counter)
  - Click any row to view details

- **Detail Modal** - Full message view using `UModal`
  - Opens on row click
  - Displays all metadata
  - **Image extraction** - Automatically detects and displays images from:
    - Icon URLs (`message.icon`)
    - Image URLs in message content (.jpg, .jpeg, .png, .gif, .webp, .svg)
  - All tags, actions, and links
  - Grid layout for multiple images

- **Filters Card**
  - Topic dropdown (`USelect`)
  - Full-text search (`UInput`)
  - Date range filters
  - Clear all button

- **Stats Dashboard**
  - Total messages
  - Topic count
  - High priority count
  - Last 24h activity

### Nuxt UI v4 Components Used

**Important:** Nuxt UI v4 has different APIs than v3:

- **UTable** - Data table (built on TanStack Table)
  - Prop: `:data` (not `:rows`)
  - Columns: `accessorKey` and `header` (not `key` and `label`)
  - Slots: `#columnName-cell` (not `#columnName-data`)
  - Row data: Access via `row.original.fieldName`
  - Events: `@select="(e, row) => handler(row)"`

- **UModal** - Modal dialog
  - Requires `#content` template slot wrapper
  - Structure: `<UModal><template #content>...</template></UModal>`
  - Use `v-model` for open/closed state

- **USelect** - Dropdown selection
  - Prop: `:items` (not `:options`)
  - **Cannot use empty string values** - use 'all' or similar for "All" option
  - Items format: `[{ label: 'Text', value: 'val' }]`

- **UFormField** - Form field wrapper (was `UFormGroup` in v3)
  - Wraps inputs with labels
  - Props: `label`, `name`

- **Other Components:**
  - `UContainer` - Responsive container
  - `UCard` - Card with header/body slots
  - `UButton` - Buttons with variants
  - `UBadge` - Status indicators
  - `UInput` - Text inputs
  - `UIcon` - Heroicons integration
  - `UAvatar` - Profile images
  - `UHeader`, `UMain` - Layout components
  - `UColorModeButton` - Dark mode toggle

### Testing Strategy (vitest.config.ts)

Three separate test projects:

1. **unit** - Node environment for pure unit tests (test/unit/)
2. **api** - Nuxt environment for API endpoint tests (test/api/)
3. **nuxt** - Nuxt environment for component/integration tests (test/nuxt/)

Tests directly import and test database functions rather than making HTTP calls.

## Key Modules

- **@nuxt/ui v4.4.0** - UI component library with 125+ components
- **nuxt v4.3.1** - Full-stack Vue framework
- **vue v3.5.28** - Progressive JavaScript framework
- **@nuxt/a11y** - Accessibility features
- **@nuxt/eslint** - Linting configuration
- **drizzle-orm v0.45.1** - Type-safe ORM with full TypeScript support
- **better-sqlite3 v11.8.1** - Fast synchronous SQLite3 driver
- **drizzle-kit v0.31.9** - Migration and schema management tools
- **drizzle-seed v0.3.1** - Database seeding utility for generating test data
- **tailwindcss v4.1.18** - Utility-first CSS framework
- **vitest** - Test framework with Nuxt integration
- **tsx** - TypeScript execution for seed scripts

## Development Notes

### Nuxt 4 Conventions
- All app code goes in `app/` directory (pages, components, layouts)
- Pages in `app/pages/` not root-level `pages/`
- Auto-imports for composables (ref, computed, watch, onMounted, etc.)
- Auto-imports for Nuxt UI components (no need to import)
- `$fetch` for API calls
- `useSeoMeta` for SEO

### Nuxt UI v4 Breaking Changes
- `UFormGroup` → `UFormField`
- `USelectMenu` → `USelect` (with `:items` prop)
- UTable uses `data`, `accessorKey`, and TanStack Table API
- UModal requires `#content` template slot
- **Empty string values not allowed in USelect** - use meaningful defaults like 'all'

### Database
- **Drizzle ORM** provides type-safe queries and automatic TypeScript inference
- All database operations are async/Promise-based (no callbacks)
- Message IDs are generated as: `${Date.now()}-${randomString}`
- Tags and actions are stored as JSON strings and parsed when retrieved
- Priority levels: 1 (min), 2 (low), 3 (default), 4 (high), 5 (urgent/max)
- WAL mode enabled for better concurrency

### API
- API handlers use `defineEventHandler` from Nuxt's H3 server
- Route parameters: `getRouterParam(event, 'topic')`
- Query parameters: `getQuery(event)`
- Request headers: `getHeaders(event)`

### Styling
- **Required:** `assets/css/main.css` with `@import "tailwindcss";`
- Tailwind CSS v4 syntax
- Dark mode support built-in
- All components are dark mode compatible

### Development Workflow
- Use `npm run db:studio` to visually browse database
- Use `npm run db:push` in development to sync schema changes
- Generate migrations with `npm run db:generate` before production
- Seed data available in `server/db/seed.ts` (realistic examples)
- Alternative: `npm run db:seed:random` for bulk test data

## ntfy.sh Compatibility

The API is designed to be compatible with ntfy.sh, allowing services like Sonarr and Radarr to send notifications directly. Configure them to POST to `http://your-server/api/{topic}` with optional headers for enhanced notifications.

Example curl commands:
```bash
# Simple message
curl -d "Test message" http://localhost:3000/api/test

# Message with metadata (ntfy.sh style)
curl -H "Title: Server Alert" \
     -H "Priority: urgent" \
     -H "Tags: warning,server" \
     -d "Server is running low on disk space" \
     http://localhost:3000/api/alerts
```

## UI Features

### Message List (Table View)
- Sortable columns
- Priority color indicators
- Topic-specific colors and icons
- Relative timestamps (2h ago, Just now)
- Tag previews
- Responsive design

### Message Details (Modal View)
- Full message text
- Automatic image detection and display
- Complete metadata (ID, topic, priority, timestamp)
- All tags displayed
- Action buttons (click-through links)
- Dark mode support

### Filtering
- Topic selection dropdown
- Full-text search
- Date range filtering
- Clear all filters button
- Real-time filtering (no page reload)

### Statistics
- Total message count
- Unique topics count
- High priority messages (4-5)
- Messages in last 24 hours
