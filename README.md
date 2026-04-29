# AuditArr

> Persistent notification audit trail for your *arr applications. Inspired by ntfy.sh but with SQLite persistence.

---

[![Docker Build & Publish](https://github.com/YOUR_USERNAME/auditarr/actions/workflows/docker.yml/badge.svg)](https://github.com/YOUR_USERNAME/auditarr/actions/workflows/docker.yml)
[![GitHub Container Registry](https://img.shields.io/badge/ghcr-available-blue)](https://github.com/YOUR_USERNAME/auditarr/pkgs/container/auditarr)

---

## Features

- ✅ **ntfy.sh compatible API** - Drop-in replacement for existing ntfy.sh integrations
- ✅ **Persistent SQLite storage** - All messages stored in SQLite database, never lose history
- ✅ **Multi-platform Docker** - amd64 & arm64 images automatically built and published
- ✅ **Search & Filter** - Full-text search, filter by topic, priority, tags, or date range
- ✅ **Type-safe** - Full TypeScript support with Zod runtime validation
- ✅ **Sonarr/Radarr ready** - Pre-configured for media server notifications

---

## Quick Start

### Using Docker (Recommended)

```bash
# Clone and start
docker-compose up -d

# Access at http://localhost:3000
```

### Using npm

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm run start
```

---

## Docker Deployment

The project automatically builds and publishes Docker images to GitHub Container Registry (GHCR).

### Image Tags

- `ghcr.io/YOUR_USERNAME/auditarr:latest` - Latest main branch
- `ghcr.io/YOUR_USERNAME/auditarr:v1.0.0` - Version tag
- `ghcr.io/YOUR_USERNAME/auditarr:main` - Branch name

### Example: Deploy with Docker

```bash
# Pull the latest image
docker run -d \
  --name auditarr \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  ghcr.io/YOUR_USERNAME/auditarr:latest
```

### Example: Deploy with Docker Compose

```yaml
version: '3.8'
services:
  auditarr:
    image: ghcr.io/YOUR_USERNAME/auditarr:latest
    container_name: auditarr
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=3000
      - DB_PATH=/data/auditarr.db
```

---

## Usage

### Publish a Message

```bash
# Basic message
curl -d "Server backup completed" http://localhost:3000/api/backup

# With metadata
curl -X POST http://localhost:3000/api/sonarr \
  -H "X-Title: Episode Downloaded" \
  -H "X-Priority: 5" \
  -H "X-Tags: sonarr,download,tv" \
  -d "Young Sheldon S06E05 has been downloaded"
```

### Configure Sonarr/Radarr

1. Go to **Settings → Connect**
2. Add **ntfy** notification
3. Set URL to: `http://your-auditarr-server:3000/api/sonarr` (or `radarr`)
4. Test and save

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/{topic}` | Publish message to topic |
| GET | `/api/{topic}` | Get messages for topic |
| GET | `/api/topics` | List all topics |
| GET | `/api/messages` | Get all messages (with filters) |

### Supported Headers (ntfy.sh compatible)

- `X-Title` / `Title` - Message title
- `X-Priority` / `Priority` - Priority (1-5 or: min, low, default, high, urgent/max)
- `X-Tags` / `Tags` - Comma-separated tags
- `X-Click` / `Click` - URL to open when message is clicked
- `X-Icon` / `Icon` - Icon URL
- `X-Actions` / `Actions` - JSON array of action buttons

### Query Parameters for `/api/messages`

- `topic` - Filter by topic name
- `search` - Full-text search
- `startDate` - ISO date string (inclusive)
- `endDate` - ISO date string (inclusive)

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host binding |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `production` | Node.js environment |
| `DB_PATH` | `/data/auditarr.db` | SQLite database path |

### Database Management

```bash
# Seed with example data (Sonarr/Radarr examples)
npm run db:seed

# Seed with random data
npm run db:seed:random

# Run migrations
npm run db:migrate

# Open Drizzle Studio (dev only)
npm run db:studio
```

---

## Project Structure

```
auditarr/
├── app/
│   ├── components/       # Vue components (MessageTable, MessageModal)
│   ├── composables/       # State management (useMessages)
│   ├── pages/             # Pages (index, messages)
│   └── utils/             # API utilities
├── server/
│   ├── api/              # API endpoints
│   ├── db/               # Database (schema, migrations)
│   ├── schemas/          # Zod validation schemas
│   └── utils/            # Database utilities
├── .github/workflows/
│   └── docker.yml        # Docker build & publish
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Local development
└── entrypoint.sh         # Permission handling
```

---

## Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com)
- **UI**: [Nuxt UI](https://ui.nuxt.com) + [Tailwind CSS](https://tailwindcss.com)
- **Database**: [SQLite](https://sqlite.org) + [Drizzle ORM](https://orm.drizzle.team)
- **Validation**: [Zod](https://zod.dev)
- **Testing**: [Vitest](https://vitest.dev)
- **Deployment**: Docker + GitHub Container Registry

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## License

MIT
