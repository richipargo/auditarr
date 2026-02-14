# Docker Deployment Guide

This guide explains how to deploy AuditArr using Docker.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000`

### Using Docker CLI

```bash
# Build the image
docker build -t auditarr .

# Run the container
docker run -d \
  --name auditarr \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -e DB_PATH=/data/auditarr.db \
  auditarr

# View logs
docker logs -f auditarr

# Stop the container
docker stop auditarr
docker rm auditarr
```

## Database Persistence

The SQLite database is stored in the `/data` directory inside the container. To persist data across container restarts:

1. **Local Development**: Mount `./data` directory
   ```yaml
   volumes:
     - ./data:/data
   ```

2. **Production**: Use a named volume
   ```yaml
   volumes:
     auditarr-data:/data

   volumes:
     auditarr-data:
       driver: local
   ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host binding |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `production` | Node environment |
| `DB_PATH` | `/data/auditarr.db` | SQLite database file path |

## Configuration Examples

### Custom Port

```bash
docker run -d \
  --name auditarr \
  -p 8080:3000 \
  -v $(pwd)/data:/data \
  auditarr
```

Access at `http://localhost:8080`

### Custom Database Path

```bash
docker run -d \
  --name auditarr \
  -p 3000:3000 \
  -v /path/to/db:/database \
  -e DB_PATH=/database/custom.db \
  auditarr
```

### Behind Reverse Proxy (Nginx, Traefik, Caddy)

Example with Traefik:

```yaml
version: '3.8'

services:
  auditarr:
    build: .
    restart: unless-stopped
    volumes:
      - ./data:/data
    environment:
      - DB_PATH=/data/auditarr.db
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.auditarr.rule=Host(`auditarr.example.com`)"
      - "traefik.http.routers.auditarr.entrypoints=websecure"
      - "traefik.http.routers.auditarr.tls.certresolver=myresolver"
      - "traefik.http.services.auditarr.loadbalancer.server.port=3000"
    networks:
      - traefik

networks:
  traefik:
    external: true
```

## Health Checks

The container includes a built-in health check that runs every 30 seconds:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' auditarr
```

Status values:
- `starting`: Container is initializing
- `healthy`: Application is running correctly
- `unhealthy`: Application is not responding

## Database Management

### Running Migrations

Migrations are automatically run when the database is first created. To manually run migrations:

```bash
# Using docker-compose
docker-compose exec auditarr npm run db:migrate

# Using docker CLI
docker exec auditarr npm run db:migrate
```

### Database Backup

```bash
# Stop the container
docker-compose stop

# Copy database file
cp ./data/auditarr.db ./data/auditarr.db.backup

# Restart the container
docker-compose start
```

### Seeding Test Data

```bash
# Seed with example data
docker-compose exec auditarr npm run db:seed

# Seed with random data
docker-compose exec auditarr npm run db:seed:random
```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker-compose logs auditarr
```

Common issues:
- Port 3000 already in use → Change port mapping
- Permission denied on `/data` → Check volume permissions
- Database locked → Ensure only one instance is running

### Database permission errors

Ensure the data directory is writable:
```bash
chmod -R 755 ./data
```

### Reset database

```bash
# Stop container
docker-compose down

# Remove database
rm -rf ./data/auditarr.db*

# Start container (will create fresh database)
docker-compose up -d
```

## Multi-Architecture Builds

To build for multiple architectures (amd64, arm64):

```bash
# Setup buildx
docker buildx create --name multiarch --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t auditarr:latest \
  --push \
  .
```

## Production Recommendations

1. **Use named volumes** instead of bind mounts for better performance
2. **Set resource limits**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```
3. **Enable automatic restarts**: `restart: unless-stopped`
4. **Use a reverse proxy** with HTTPS (Caddy, Nginx, Traefik)
5. **Regular backups** of the `/data` directory
6. **Monitor health checks** and set up alerts
7. **Use Docker secrets** for sensitive environment variables

## Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Or without docker-compose
docker build -t auditarr .
docker stop auditarr
docker rm auditarr
docker run -d --name auditarr -p 3000:3000 -v $(pwd)/data:/data auditarr
```

## Security Notes

- The container runs as non-root user (`node`)
- Database files are stored in a dedicated volume
- Health checks ensure the application is responsive
- No sensitive data is baked into the image
- Use environment variables for configuration
