#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /data

# Fix permissions for volume-mounted data directory
# When using volume mounts, the host directory may have different ownership
if [ -d "/data" ]; then
  chown -R node:node /data 2>/dev/null || true
  chmod -R 755 /data 2>/dev/null || true
fi

# Initialize database schema if it doesn't exist
# This runs as root before dropping privileges
DB_FILE="/data/auditarr.db"
if [ ! -f "$DB_FILE" ]; then
  echo "Database not found at $DB_FILE, initializing schema..."
  node /app/server/scripts/init-db.js
else
  # Check if tables exist
  if ! node -e "require('better-sqlite3')('/data/auditarr.db').prepare('SELECT 1 FROM messages LIMIT 1').get()" 2>/dev/null; then
    echo "Database exists but tables missing, initializing schema..."
    node /app/server/scripts/init-db.js
  fi
fi

# Drop privileges to node user and execute the application
exec gosu node node .output/server/index.mjs
