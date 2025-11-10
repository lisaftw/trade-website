# MongoDB Setup Guide

This project uses MongoDB Atlas for storing trade items data.

## Setup Steps

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free tier is sufficient)

### 2. Configure Database Access
1. In Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Create a username and password (save these!)
4. Set privileges to "Read and write to any database"

### 3. Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. This is required for Vercel deployments

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" as the driver
4. Copy the connection string

### 5. Add to Environment Variables
1. Copy `.env.example` to `.env.local`
2. Replace the `MONGODB_URI` value with your connection string
3. Replace `<username>` and `<password>` with your database credentials
4. Replace `<cluster>` with your cluster name
5. The database name is `trade` (already in the connection string)

Example:
\`\`\`
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/trade?retryWrites=true&w=majority
\`\`\`

### 6. Seed the Database
1. Install MongoDB Compass (optional but recommended)
2. Connect using your connection string
3. Create a database named `trade`
4. Create a collection named `items`
5. Copy the seed data from `scripts/sql/006_mongodb_seed.sql`
6. Run it in MongoDB Compass or mongosh

Alternatively, you can use the MongoDB shell:
\`\`\`bash
mongosh "your-connection-string"
use trade
# Then paste the insertMany commands from the seed file
\`\`\`

## Database Schema

### Items Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  value: Number,
  game: String,
  imageUrl: String (optional),
  rarity: String (optional),
  category: String (optional),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Deployment

When deploying to Vercel:
1. Add `MONGODB_URI` to your Vercel project environment variables
2. Make sure your MongoDB Atlas network access allows connections from anywhere
3. The connection will work automatically in production

## Troubleshooting

**Connection timeout**: Check that your IP is whitelisted (0.0.0.0/0)
**Authentication failed**: Verify username and password in connection string
**Database not found**: Make sure you've created the `trade` database
**No items returned**: Run the seed script to populate data
