# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

# Install gosu for privilege dropping
RUN apk add --no-cache gosu

WORKDIR /app

# Create node user and group if they don't exist
RUN if ! id -u node >/dev/null 2>&1; then \
    addgroup -S node && \
    adduser -S -G node node; \
    fi

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/.output ./.output

# Create data directory for database
RUN mkdir -p /data && chown node:node /data

# Expose port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production
ENV DB_PATH=/data/auditarr.db

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Copy entrypoint script and database init script
COPY entrypoint.sh /entrypoint.sh
COPY server/scripts/init-db.js /app/server/scripts/init-db.js
RUN chmod +x /entrypoint.sh

# Entrypoint handles permissions, database initialization, and starts the app as non-root
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
