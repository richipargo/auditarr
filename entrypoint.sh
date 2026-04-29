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

# Initialize database schema (idempotent - safe to run always)
# This runs as root before dropping privileges
echo "Checking database schema..."
node /app/server/scripts/init-db.js

# Drop privileges to node user and execute the application
exec gosu node node .output/server/index.mjs
