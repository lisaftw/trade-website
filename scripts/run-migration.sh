#!/bin/bash

echo "🚀 MongoDB to PostgreSQL Migration"
echo "=================================="
echo ""
echo "This script will:"
echo "1. Export data from MongoDB"
echo "2. Import data into PostgreSQL on your VPS"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Migration cancelled."
  exit 0
fi

echo ""
echo "📦 Installing dependencies..."
npm install --save-dev tsx @types/pg pg

echo ""
echo "🔧 Preparing PostgreSQL database..."
# Run the SQL script to add unique constraint
PGPASSWORD="TradingPass2025!Secure" psql -h localhost -U trading_user -d trading_db -f scripts/sql/017_add_items_unique_constraint.sql

echo ""
echo "🚀 Starting migration..."
npx tsx scripts/migrate-mongodb-to-postgres.ts

echo ""
echo "✅ Migration script completed!"
echo ""
echo "Next steps:"
echo "1. Check the output above for any errors"
echo "2. Verify your data in PostgreSQL"
echo "3. Update your app configuration"
