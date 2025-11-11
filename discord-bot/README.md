# Trade Discord Bot

A Discord bot for managing trading items across multiple games (Murder Mystery 2, Adopt Me, Steal a Brain Rot, and Grow a Garden).

## Features

- **Add Items** - Add new items with game-specific fields
- **Edit Items** - Edit existing items with interactive dropdowns
- **Remove Items** - Remove items with confirmation dialogs
- **Real-time Updates** - Changes sync with the website automatically via Supabase database

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
- **Supabase database** (already configured for the main website)
- VPS server with SSH access (recommended for 24/7 uptime)

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

### 4. VPS Setup (Recommended for Production)

#### Connect to Your VPS

\`\`\`bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
\`\`\`

#### Install Node.js (if not already installed)

\`\`\`bash
# Install Node.js 18+ using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
\`\`\`

#### Upload Bot Files to VPS

You can use `scp`, `rsync`, or `git clone`:

**Option 1: Using git (recommended)**
\`\`\`bash
# On your VPS
cd /opt  # or wherever you want to store the bot
git clone https://github.com/your-repo/trade-website.git
cd trade-website/discord-bot
\`\`\`

**Option 2: Using scp**
\`\`\`bash
# From your local machine
scp -r discord-bot/ username@your-vps-ip:/opt/trade-bot
\`\`\`

#### Install Dependencies

\`\`\`bash
cd /opt/trade-website/discord-bot  # adjust path as needed
npm install
\`\`\`

### 5. Configure Environment Variables

Create a `.env` file in the `discord-bot` directory on your VPS:

\`\`\`bash
nano .env
\`\`\`

Add the following (use the same Supabase credentials as your website):

\`\`\`env
# Discord Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here

# Database Configuration (from your Vercel/Supabase setup)
DATABASE_URL=your_postgres_connection_string
POSTGRES_URL=your_postgres_connection_string
\`\`\`

**Important:** Use the same `DATABASE_URL` / `POSTGRES_URL` as your main website to ensure the bot updates the same database.

Save and exit (Ctrl+X, then Y, then Enter).

### 6. Deploy Commands

Deploy the slash commands to your Discord server:

\`\`\`bash
npm run deploy
\`\`\`

You should see: `✅ Successfully reloaded application (/) commands.`

### 7. Build the Bot

\`\`\`bash
npm run build
\`\`\`

### 8. Run the Bot

#### Option A: Using PM2 (Recommended for Production)

PM2 keeps your bot running 24/7 and auto-restarts on crashes or server reboots.

\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Start the bot with PM2
pm2 start dist/index.js --name trade-bot

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server boot
pm2 startup
# Follow the instructions from the command output

# View bot logs
pm2 logs trade-bot

# Other useful PM2 commands
pm2 status          # Check bot status
pm2 restart trade-bot   # Restart bot
pm2 stop trade-bot      # Stop bot
pm2 delete trade-bot    # Remove bot from PM2
\`\`\`

#### Option B: Using Screen (Alternative)

\`\`\`bash
# Install screen if not already installed
sudo apt-get install screen

# Start a new screen session
screen -S trade-bot

# Run the bot
npm start

# Detach from screen: Press Ctrl+A, then D
# Reattach to screen: screen -r trade-bot
\`\`\`

#### Option C: Direct Run (Development/Testing Only)

\`\`\`bash
npm start
\`\`\`

Note: This will stop when you close your SSH session.

### 9. Verify Bot is Running

1. Check in your Discord server - the bot should appear online
2. Try running `/additem` to test functionality
3. On your VPS, check logs:
   \`\`\`bash
   pm2 logs trade-bot  # if using PM2
   # or
   screen -r trade-bot  # if using screen
   \`\`\`

## Updating the Bot

When you push changes to your repository:

\`\`\`bash
# On your VPS
cd /opt/trade-website/discord-bot  # adjust path
git pull origin main
npm install  # if dependencies changed
npm run build
pm2 restart trade-bot  # if using PM2
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

### `/bulkadditem`
Add multiple items from a JSON file attachment.

### `/migrate-images`
Migrate Discord CDN images to local storage (admin only).

## Troubleshooting

### Bot doesn't respond to commands
- Make sure you deployed commands: `npm run deploy`
- Check that the bot has proper permissions in your Discord server
- Verify the bot token is correct in `.env`
- Check logs: `pm2 logs trade-bot`

### Database connection errors
- Verify your `DATABASE_URL` matches your website's database
- Check that your VPS IP is whitelisted in Supabase (if using Supabase)
- Ensure the connection string includes all required parameters

### Commands not showing up
- Make sure you deployed commands to the correct guild
- Wait a few minutes for Discord to sync commands
- Try kicking and re-inviting the bot

### Bot goes offline after closing SSH
- Use PM2 or screen to keep the bot running in the background
- Check `pm2 status` to verify the bot is running

### Out of memory errors on VPS
- Ensure your VPS has at least 512MB RAM
- Check memory usage: `free -m`
- Consider upgrading your VPS plan if needed

## VPS Firewall Configuration

Make sure your VPS allows outbound connections to Discord and Supabase:

\`\`\`bash
# Allow outbound HTTPS (port 443)
sudo ufw allow out 443/tcp

# Check firewall status
sudo ufw status
\`\`\`

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Restrict bot permissions** to only what's needed
3. **Use environment variables** for all sensitive data
4. **Keep Node.js and dependencies updated**
5. **Monitor bot logs regularly** for suspicious activity
6. **Use SSH keys** instead of passwords for VPS access

## Support

For issues or questions:
- Check bot logs: `pm2 logs trade-bot`
- Review the main project documentation
- Create an issue on GitHub

## Architecture Overview

\`\`\`
Discord Bot (VPS)
    ↓
Supabase Database (Cloud)
    ↑
Next.js Website (Vercel)
\`\`\`

The bot, website, and database all share the same Supabase instance, ensuring real-time synchronization of item data across all platforms.
