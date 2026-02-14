#!/bin/bash
set -e

echo "🚀 Setting up AuditArr development environment..."

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate migrations (if needed)
if [ ! -d "server/db/migrations" ]; then
  echo "🔄 Generating database migrations..."
  npm run db:generate
fi

# Run migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# Seed database (optional)
read -p "Would you like to seed the database with example data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🌱 Seeding database..."
  npm run db:seed
fi

echo "✅ Setup complete! Run 'npm run dev' to start the development server."
