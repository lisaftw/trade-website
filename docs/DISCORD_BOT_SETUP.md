# Discord Bot Setup Guide

This guide will help you set up the Discord bot for managing game items.

## Prerequisites

1. Node.js installed (v18 or higher)
2. MongoDB connection string (already configured)
3. Discord Developer Account

## Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "Trade Bot")
3. Go to the "Bot" section
4. Click "Add Bot"
5. Under "Privileged Gateway Intents", enable:
   - ✅ Server Members Intent (optional)
   - ✅ Message Content Intent (optional)
6. Click "Reset Token" and copy the bot token

## Step 2: Add Environment Variables

Add these to your `.env.local` file:

\`\`\`env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
\`\`\`

To find your Application ID:
- Go to "General Information" in the Discord Developer Portal
- Copy the "Application ID"

## Step 3: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 4: Deploy Bot Commands

This registers the slash commands with Discord:

\`\`\`bash
npm run bot:deploy
\`\`\`

You should see: `✅ Successfully reloaded 3 application (/) commands.`

## Step 5: Invite Bot to Your Server

1. Go to "OAuth2" → "URL Generator" in the Discord Developer Portal
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Send Messages
   - ✅ Use Slash Commands
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

## Step 6: Start the Bot

\`\`\`bash
npm run bot
\`\`\`

You should see: `✅ Discord bot ready! Logged in as YourBot#1234`

## Available Commands

### `/additem` - Add New Item

Add items with game-specific fields:

**Murder Mystery 2 (MM2):**
- Name, Section, Value, Image, Rarity, Demand

**Adopt Me:**
- Name, Section, Value, Image, Demand, Pot

**Steal a Brain Rot (SAB):**
- Name, Section, Value, Image, Rarity, Demand

**Grow a Garden (GAG):**
- Name, Section, Value, Image, Rarity, Demand

Example:
\`\`\`
/additem game:MM2 name:"Icebreaker" section:"Knives" value:1000 image:"https://..." rarity:"Legendary" demand:"High"
\`\`\`

### `/edititem` - Edit Existing Item

1. Select a game from the dropdown
2. Select an item from the dropdown
3. Fill in the modal with updated values
4. Submit to save changes

### `/removeitem` - Remove Item

1. Select a game from the dropdown
2. Select an item from the dropdown
3. Confirm deletion

## Game-Specific Fields

### Murder Mystery 2 (MM2)
- **Required:** Name, Section, Value, Image, Rarity, Demand
- **Section Examples:** Knives, Guns, Pets
- **Rarity Examples:** Common, Uncommon, Rare, Legendary, Godly

### Adopt Me
- **Required:** Name, Section, Value, Image, Demand, Pot
- **Section Examples:** Pets, Vehicles, Toys
- **Pot Examples:** Normal, Fly, Ride, Fly+Ride, Neon, Mega Neon

### Steal a Brain Rot (SAB)
- **Required:** Name, Section, Value, Image, Rarity, Demand
- **Section Examples:** Weapons, Items, Collectibles

### Grow a Garden (GAG)
- **Required:** Name, Section, Value, Image, Rarity, Demand
- **Section Examples:** Seeds, Tools, Decorations

## Real-Time Website Updates

The website automatically refreshes item data every 30 seconds. When you add, edit, or remove items via the Discord bot, the changes will appear on the website within 30 seconds.

To force an immediate refresh, reload the page.

## Troubleshooting

**Bot not responding:**
- Check that the bot is online (green status in Discord)
- Verify `DISCORD_BOT_TOKEN` is correct
- Make sure you ran `npm run bot:deploy`

**Commands not showing:**
- Wait a few minutes for Discord to sync commands
- Try kicking and re-inviting the bot
- Check bot permissions in server settings

**Database errors:**
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas network access allows your IP
- Ensure the database name is `trading-db`

**Items not appearing on website:**
- Wait 30 seconds for auto-refresh
- Check browser console for errors
- Verify items were added successfully in MongoDB

## Running in Production

For production deployment:

1. Deploy the bot to a server (Heroku, Railway, VPS, etc.)
2. Set environment variables on the hosting platform
3. Keep the bot process running 24/7
4. Monitor logs for errors

Example with PM2:
\`\`\`bash
npm install -g pm2
pm2 start npm --name "trade-bot" -- run bot
pm2 save
pm2 startup
