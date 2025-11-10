# MongoDB to PostgreSQL Migration Guide

This guide will help you migrate your trading website data from MongoDB to PostgreSQL on your VPS.

## Overview

Your app currently uses:
- **MongoDB** (cloud): Items and Adopt Me pets data
- **PostgreSQL** (VPS): User profiles, trades, inventories

After migration, everything will be on your VPS PostgreSQL database.

---

## Pre-Migration Checklist

- [ ] VPS is set up with PostgreSQL running
- [ ] Database `trading_db` exists
- [ ] User `trading_user` has access
- [ ] You have your MongoDB connection string
- [ ] You've backed up your MongoDB data (just in case)

---

## Migration Steps

### Step 1: Upload Code to VPS

On your **local machine**, push your latest code:

\`\`\`bash
git add .
git commit -m "Add migration scripts"
git push origin main
\`\`\`

On your **VPS** (as deploy user):

\`\`\`bash
cd ~/trading-website
git pull origin main
npm install
\`\`\`

### Step 2: Set Up Environment Variables

On your **VPS**, edit the `.env.local` file:

\`\`\`bash
nano .env.local
\`\`\`

Make sure you have both connection strings:

\`\`\`env
# Your cloud MongoDB (for migration source)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trading-db

# Your VPS PostgreSQL (migration destination)
DATABASE_URL=postgresql://trading_user:TradingPass2025!Secure@localhost:5432/trading_db

# ... other env vars ...
\`\`\`

Save with `Ctrl+X`, `Y`, `Enter`

### Step 3: Prepare PostgreSQL Database

Run the preparation script:

\`\`\`bash
npm run migrate:prepare-db
\`\`\`

This adds necessary constraints and indexes to the items table.

### Step 4: Run the Migration

\`\`\`bash
npm run migrate:mongo-to-postgres
\`\`\`

The script will:
1. Connect to your MongoDB
2. Export all items and Adopt Me pets
3. Transform the data
4. Import into PostgreSQL
5. Show you a summary

**Expected output:**
\`\`\`
🚀 Starting MongoDB to PostgreSQL migration...

📦 Connecting to MongoDB...
✅ Connected to MongoDB

🐘 Connecting to PostgreSQL...
✅ Connected to PostgreSQL

📋 Step 1: Migrating items collection...
   Found 1234 items in MongoDB
   ✅ Migrated 1234 items to PostgreSQL

📋 Step 2: Migrating adoptme_pets collection...
   Found 150 Adopt Me pets in MongoDB
   ✅ Migrated 450 Adopt Me pet variants to PostgreSQL

📊 Migration Summary:
   Total items in PostgreSQL: 1684

✅ Migration completed successfully!
\`\`\`

### Step 5: Verify the Migration

Check your PostgreSQL data:

\`\`\`bash
# Connect to PostgreSQL
PGPASSWORD="TradingPass2025!Secure" psql -h localhost -U trading_user -d trading_db

# Run these queries to verify:
SELECT COUNT(*) FROM items;
SELECT game, COUNT(*) FROM items GROUP BY game;
SELECT * FROM items LIMIT 5;

# Exit PostgreSQL
\q
\`\`\`

### Step 6: Update Your App Configuration

After verifying the data, you can remove MongoDB from your app:

**Option A: Keep MongoDB as backup (recommended initially)**
- Leave `MONGODB_URI` in `.env.local`
- Your app will use PostgreSQL but MongoDB stays connected

**Option B: Fully switch to PostgreSQL**
- Remove `MONGODB_URI` from `.env.local`
- Update any remaining MongoDB queries to use PostgreSQL

### Step 7: Rebuild and Restart

\`\`\`bash
npm run build
pm2 restart trading-site
pm2 logs trading-site
\`\`\`

---

## Troubleshooting

### Error: "MONGODB_URI not configured"

Make sure your `.env.local` has the MongoDB connection string.

### Error: "Connection refused" (PostgreSQL)

Check if PostgreSQL is running:
\`\`\`bash
sudo systemctl status postgresql
\`\`\`

### Error: "Duplicate key violation"

The migration script handles duplicates automatically. If you see this error, it means some items already exist in PostgreSQL. This is safe to ignore.

### Migration takes too long

For large datasets (10,000+ items), the migration might take 5-10 minutes. This is normal.

---

## Rollback Plan

If something goes wrong:

1. **Your MongoDB data is untouched** - the migration only reads from MongoDB
2. **Clear PostgreSQL items table**:
   \`\`\`sql
   TRUNCATE TABLE public.items CASCADE;
   \`\`\`
3. **Re-run the migration**:
   \`\`\`bash
   npm run migrate:mongo-to-postgres
   \`\`\`

---

## Post-Migration

After successful migration:

1. **Test your website thoroughly**
   - Check if items load correctly
   - Verify trade creation works
   - Test inventory management

2. **Monitor for a few days**
   - Keep MongoDB running as backup
   - Watch for any errors in logs

3. **Eventually remove MongoDB**
   - Once you're confident everything works
   - Cancel your MongoDB subscription
   - Remove MongoDB dependencies from package.json

---

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify your environment variables
3. Check PostgreSQL logs: `sudo journalctl -u postgresql -n 50`
4. Check app logs: `pm2 logs trading-site`
