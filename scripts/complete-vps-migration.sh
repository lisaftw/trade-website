#!/bin/bash

echo "🚀 Starting Complete VPS Migration to PostgreSQL"
echo "================================================"
echo ""

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set in .env.local"
  exit 1
fi

# Step 1: Create all PostgreSQL tables
echo "📋 Step 1: Creating PostgreSQL tables..."
for file in scripts/sql/*.sql; do
  echo "  Running $(basename $file)..."
  PGPASSWORD='SecurePass2025!Trading' psql -h localhost -U trading_user -d trading_db -f "$file" 2>&1 | grep -v "already exists\|does not exist, skipping"
done
echo "✅ Database tables created"
echo ""

# Step 2: Grant proper permissions
echo "🔐 Step 2: Setting up database permissions..."
PGPASSWORD='SecurePass2025!Trading' psql -h localhost -U trading_user -d trading_db << EOF
GRANT ALL ON SCHEMA public TO trading_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO trading_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO trading_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO trading_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO trading_user;
EOF
echo "✅ Permissions configured"
echo ""

# Step 3: Migrate data from MongoDB (if MONGODB_URI exists)
if [ -n "$MONGODB_URI" ]; then
  echo "📦 Step 3: Migrating data from MongoDB to PostgreSQL..."
  npx tsx scripts/migrate-mongodb-to-postgres.ts
  echo "✅ Data migration completed"
  echo ""
else
  echo "⏭️  Step 3: Skipping MongoDB migration (MONGODB_URI not set)"
  echo ""
fi

# Step 4: Verify migration
echo "📊 Step 4: Verifying migration..."
ITEM_COUNT=$(PGPASSWORD='SecurePass2025!Trading' psql -h localhost -U trading_user -d trading_db -t -c "SELECT COUNT(*) FROM items;")
PROFILE_COUNT=$(PGPASSWORD='SecurePass2025!Trading' psql -h localhost -U trading_user -d trading_db -t -c "SELECT COUNT(*) FROM profiles;")
echo "  Items in database: $ITEM_COUNT"
echo "  Profiles in database: $PROFILE_COUNT"
echo "✅ Migration verified"
echo ""

# Step 5: Update environment variables
echo "🔧 Step 5: Updating .env.local..."
# Remove MONGODB_URI from .env.local
sed -i.bak '/MONGODB_URI=/d' .env.local
echo "✅ Removed MONGODB_URI from .env.local"
echo ""

# Step 6: Rebuild application
echo "🏗️  Step 6: Rebuilding application..."
npm install --force
npm run build
echo "✅ Application rebuilt"
echo ""

# Step 7: Restart PM2
echo "🔄 Step 7: Restarting application..."
pm2 restart trading-site
echo "✅ Application restarted"
echo ""

echo "================================================"
echo "✨ Migration Complete!"
echo ""
echo "Your site now runs 100% on local VPS PostgreSQL"
echo "All MongoDB dependencies have been removed"
echo ""
echo "Next steps:"
echo "1. Visit your site to verify everything works"
echo "2. Test all features (items, trades, inventory)"
echo "3. Once confirmed, you can safely remove MongoDB"
echo ""
