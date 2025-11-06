#!/bin/bash

# Database setup script for PostgreSQL
# This script runs all SQL files in order to set up the database schema

set -e  # Exit on error

echo "Setting up PostgreSQL database..."

# Database connection details
DB_USER="trading_user"
DB_NAME="trading_db"
DB_HOST="localhost"
DB_PORT="5432"

# SQL files to run in order
SQL_FILES=(
  "scripts/sql/001_create_profiles.sql"
  "scripts/sql/002_create_sessions.sql"
  "scripts/sql/003_create_items.sql"
  "scripts/sql/004_profile_activity.sql"
  "scripts/sql/007_create_trades.sql"
  "scripts/sql/008_create_trade_interactions.sql"
  "scripts/sql/009_create_conversations_v2.sql"
  "scripts/sql/010_create_messages_v2.sql"
  "scripts/sql/011_add_message_features.sql"
  "scripts/sql/011_create_trade_requests.sql"
  "scripts/sql/012_create_adoptme_pets.sql"
  "scripts/sql/013_add_adoptme_value_fields.sql"
  "scripts/sql/014_create_user_inventories.sql"
  "scripts/sql/015_fix_inventory_rls.sql"
  "scripts/sql/016_fix_inventory_foreign_key.sql"
)

# Run each SQL file
for sql_file in "${SQL_FILES[@]}"; do
  if [ -f "$sql_file" ]; then
    echo "Running $sql_file..."
    PGPASSWORD="TradingPass2025!Secure" psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -f "$sql_file"
    echo "✓ Completed $sql_file"
  else
    echo "⚠ Warning: $sql_file not found, skipping..."
  fi
done

echo ""
echo "✓ Database setup complete!"
echo ""
echo "Checking tables..."
PGPASSWORD="TradingPass2025!Secure" psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -c "\dt"
