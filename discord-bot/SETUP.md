# Discord Bot Setup Guide

This guide will help you set up and deploy the Discord Trading Bot with analytics features.

## Prerequisites

- Node.js 18+ installed
- A Discord account and server
- PostgreSQL database (Supabase recommended)
- Discord Bot Token and Application ID

## Step 1: Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
5. Copy your Bot Token (keep this secret!)
6. Go to "OAuth2" > "General" and copy your Client ID

## Step 2: Invite Bot to Server

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Embed Links
   - Attach Files
   - Use Slash Commands
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

## Step 3: Environment Variables

Create a `.env` file in the `discord-bot` directory:

\`\`\`env
# Discord Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_server_id_here

# Database Configuration (from Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database
# OR
POSTGRES_URL=postgresql://user:password@host:5432/database

# Supabase Configuration (optional, for direct Supabase features)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
\`\`\`

### How to get your Guild ID (Server ID):
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click your server icon and click "Copy ID"

## Step 4: Install Dependencies

\`\`\`bash
cd discord-bot
npm install
\`\`\`

## Step 5: Database Setup

Run the SQL migration to enable page view tracking:

\`\`\`bash
# Copy the contents of scripts/sql/add_page_views_tracking.sql
# and run it in your Supabase SQL Editor
\`\`\`

## Step 6: Deploy Commands

Deploy the slash commands to your Discord server:

\`\`\`bash
npm run deploy
\`\`\`

You should see: `✅ Successfully reloaded 6 application (/) commands.`

## Step 7: Start the Bot

### Development Mode (with hot reload):
\`\`\`bash
npm run dev
\`\`\`

### Production Mode:
\`\`\`bash
npm run build
npm start
\`\`\`

## Step 8: Test the Bot

In your Discord server, try these commands:

- `/analytics` - View overall analytics overview
- `/analytics timeframe:Last 24 Hours` - View 24h stats
- `/analytics type:Users` - View detailed user analytics
- `/analytics type:Page Views` - View page view statistics
- `/analytics charts:True` - Include visual charts

## Available Commands

### Analytics Commands
- `/analytics` - Comprehensive website analytics
  - Options:
    - `timeframe`: Last 24 Hours, Last 7 Days, Last 30 Days, All Time
    - `type`: Overview, Users, Trades, Page Views, Activity
    - `charts`: Include visual charts (true/false)

### Item Management Commands
- `/additem` - Add a new item to the database
- `/edititem` - Edit an existing item
- `/removeitem` - Remove an item from the database
- `/bulkadditem` - Add multiple items at once
- `/migrate-images` - Migrate images to new URLs

## Deploying to VPS

### Using PM2 (Recommended)

1. Install PM2 globally:
\`\`\`bash
npm install -g pm2
\`\`\`

2. Start the bot with PM2:
\`\`\`bash
cd discord-bot
npm run build
pm2 start dist/index.js --name "trade-bot"
\`\`\`

3. Save PM2 configuration:
\`\`\`bash
pm2 save
pm2 startup
\`\`\`

4. Monitor the bot:
\`\`\`bash
pm2 logs trade-bot
pm2 status
\`\`\`

### Using systemd

Create a service file `/etc/systemd/system/trade-bot.service`:

\`\`\`ini
[Unit]
Description=Trading Discord Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/discord-bot
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
\`\`\`

Enable and start the service:
\`\`\`bash
sudo systemctl enable trade-bot
sudo systemctl start trade-bot
sudo systemctl status trade-bot
\`\`\`

## Troubleshooting

### Bot not responding to commands
- Make sure you ran `npm run deploy` to register commands
- Check if the bot has proper permissions in your server
- Verify the bot is online in Discord

### Database connection errors
- Verify your DATABASE_URL is correct
- Check if your database is accessible from your server
- Ensure the database has the required tables (run migrations)

### Analytics showing no data
- Make sure page view tracking is enabled in your website
- Verify activities are being recorded in the database
- Check if the activities table has the correct indexes

## Page View Tracking Integration

To track page views in your Next.js app, add this to your main layout or a custom hook:

\`\`\`typescript
// app/layout.tsx or hooks/usePageTracking.ts
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function usePageTracking() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'page_view',
        meta: {
          page: pathname,
          referrer: document.referrer,
        },
      }),
    }).catch(console.error)
  }, [pathname])
}
\`\`\`

## Support

If you encounter issues:
1. Check the bot logs: `pm2 logs trade-bot` or `npm run dev`
2. Verify all environment variables are set correctly
3. Ensure database migrations are applied
4. Check Discord bot permissions

## Security Notes

- Never commit your `.env` file
- Keep your bot token secret
- Use environment variables for all sensitive data
- Restrict bot permissions to only what's needed
- Use service role key only on the server side
