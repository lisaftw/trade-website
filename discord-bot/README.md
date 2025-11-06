# Trade Discord Bot

A Discord bot for managing trading items across multiple games (Murder Mystery 2, Adopt Me, Steal a Brain Rot, and Grow a Garden).

## Features

- **Add Items** - Add new items with game-specific fields
- **Edit Items** - Edit existing items with interactive dropdowns
- **Remove Items** - Remove items with confirmation dialogs
- **Real-time Updates** - Changes sync with the website automatically

## Game-Specific Fields

### Murder Mystery 2 (MM2)
- Name, Section, Value, Rarity, Demand, Image

### Adopt Me
- Name, Section, Value, Demand, Pot, Image

### Steal a Brain Rot (SAB)
- Name, Section, Value, Rarity, Demand, Image

### Grow a Garden (GAG)
- Name, Section, Value, Rarity, Demand, Image

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Discord bot token
- MongoDB database URL

### 2. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Copy the bot token (you'll need this for `.env`)
5. Enable "Message Content Intent" under Privileged Gateway Intents
6. Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Use Slash Commands`
   - Copy the generated URL and invite the bot to your server

### 3. Get Required IDs

- **Client ID**: Found in "General Information" section of your Discord app
- **Guild ID**: Right-click your Discord server → "Copy Server ID" (enable Developer Mode in Discord settings first)

### 4. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 5. Configure Environment Variables

Create a `.env` file in the `discord-bot` directory:

\`\`\`env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here
MONGODB_URI=your_mongodb_connection_string
\`\`\`

### 6. Deploy Commands

Deploy the slash commands to your Discord server:

\`\`\`bash
npm run deploy
\`\`\`

You should see: `✅ Successfully reloaded 3 application (/) commands.`

### 7. Start the Bot

**Development mode** (with auto-reload):
\`\`\`bash
npm run dev
\`\`\`

**Production mode**:
\`\`\`bash
npm run build
npm start
\`\`\`

## Commands

### `/additem`
Add a new item to the database.

**Options:**
- `game` - Select the game (MM2, Adopt Me, SAB, GAG)
- `name` - Item name
- `section` - Item section/category
- `value` - Item value (number)
- `image` - Image URL
- `rarity` - Item rarity (required for MM2, SAB, GAG)
- `demand` - Item demand (required for all games)
- `pot` - Potion type (required for Adopt Me only)

### `/edititem`
Edit an existing item.

1. Select the game
2. Select the item to edit
3. Fill in the modal with new values

### `/removeitem`
Remove an item from the database.

1. Select the game
2. Select the item to remove
3. Confirm deletion

## Deployment

### Option 1: VPS/Dedicated Server

1. Upload the `discord-bot` folder to your server
2. Install dependencies: `npm install`
3. Create `.env` file with your credentials
4. Deploy commands: `npm run deploy`
5. Start the bot: `npm start`
6. Use a process manager like PM2 to keep it running:
   \`\`\`bash
   npm install -g pm2
   pm2 start dist/index.js --name trade-bot
   pm2 save
   pm2 startup
   \`\`\`

### Option 2: Cloud Platforms

**Railway:**
1. Create a new project
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically

**Heroku:**
1. Create a new app
2. Connect your GitHub repository
3. Add environment variables in Heroku dashboard
4. Deploy from GitHub

**DigitalOcean App Platform:**
1. Create a new app
2. Connect your GitHub repository
3. Add environment variables
4. Deploy automatically

## Troubleshooting

### Bot doesn't respond to commands
- Make sure you deployed commands: `npm run deploy`
- Check that the bot has proper permissions in your Discord server
- Verify the bot token is correct in `.env`

### Database connection errors
- Verify your MongoDB URI is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the database name is `trading-db`

### Commands not showing up
- Make sure you deployed commands to the correct guild
- Wait a few minutes for Discord to sync commands
- Try kicking and re-inviting the bot

## Support

For issues or questions, check the main project documentation or create an issue on GitHub.
