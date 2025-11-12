# Deploy Discord Bot Commands

Your Discord bot is running, but the commands need to be registered with Discord before they appear in your server.

## Step 1: Update Your .env File

Make sure your `.env` file in `~/trade-website` has these variables:

\`\`\`env
# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_server_id_here

# Supabase (same as website)
SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

## Step 2: Deploy Commands to Discord

Run this command on your VPS to register the bot commands:

\`\`\`bash
cd ~/trade-website
npm run deploy-commands
\`\`\`

This will register the `/additem`, `/edititem`, and `/removeitem` commands with your Discord server.

## Step 3: Restart the Bot

After deploying commands, restart the bot:

\`\`\`bash
pm2 restart discord-bot
pm2 logs discord-bot --lines 20
\`\`\`

## Step 4: Test in Discord

Go to your Discord server and type `/` - you should see:
- `/additem` - Add a new item to the database
- `/edititem` - Edit an existing item
- `/removeitem` - Remove an item from the database

## Troubleshooting

### Commands not showing up?

1. **Check bot permissions**: Make sure your bot has the `applications.commands` scope
2. **Wait a few minutes**: Discord can take up to 5 minutes to register commands
3. **Check GUILD_ID**: Make sure `DISCORD_GUILD_ID` matches your server ID
4. **Try global commands**: Remove `DISCORD_GUILD_ID` from `.env` to deploy commands globally (takes up to 1 hour)

### Bot can't connect to database?

1. **Check logs**: `pm2 logs discord-bot --err --lines 50`
2. **Verify env vars**: Make sure Supabase credentials are correct
3. **Test connection**: The bot tests the database connection on startup

### How to get Discord IDs?

1. **Bot Token**: Go to [Discord Developer Portal](https://discord.com/developers/applications) → Your Application → Bot → Reset Token
2. **Client ID**: Discord Developer Portal → Your Application → OAuth2 → Client ID
3. **Guild ID**: Enable Developer Mode in Discord → Right-click your server → Copy Server ID
