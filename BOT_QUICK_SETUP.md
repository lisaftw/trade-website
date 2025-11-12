# Discord Bot Quick Setup Guide

## Problem: Environment Variables Not Loading

Your bot is running but can't access Supabase because PM2 isn't loading the environment variables from `.env`.

## Solution: Add Environment Variables to PM2 Ecosystem Config

The `ecosystem.config.js` file needs to have the Supabase credentials explicitly set.

### Step 1: Edit ecosystem.config.js

Open the file:
\`\`\`bash
cd ~/trade-website
nano ecosystem.config.js
\`\`\`

Add the `env` section to the discord-bot app:
\`\`\`javascript
{
  name: 'discord-bot',
  script: 'npm',
  args: 'run bot',
  env: {
    DISCORD_BOT_TOKEN: 'your_discord_bot_token_here',
    DISCORD_CLIENT_ID: 'your_discord_client_id',
    DISCORD_GUILD_ID: 'your_discord_guild_id',
    SUPABASE_URL: 'your_supabase_url',
    SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key',
    NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
  },
  time: true,
}
\`\`\`

Replace all `your_*` placeholders with your actual credentials.

### Step 2: Reload PM2 with New Config

\`\`\`bash
pm2 delete discord-bot
pm2 start ecosystem.config.js
pm2 save
\`\`\`

### Step 3: Deploy Commands to Discord

\`\`\`bash
npm run deploy-commands
\`\`\`

### Step 4: Verify It's Working

\`\`\`bash
pm2 logs discord-bot --lines 30
\`\`\`

You should see:
- ✅ Database connected successfully!
- ✅ Discord bot ready! Logged in as trader auth#4570
- 📊 Serving 3 commands

### Step 5: Test in Discord

Go to your Discord server and type `/` - you should see:
- `/additem` - Add a new item to the database
- `/edititem` - Edit an existing item
- `/removeitem` - Remove an item

## Alternative: Use .env File with PM2

If you prefer using `.env` file:

\`\`\`bash
pm2 delete discord-bot
pm2 start npm --name discord-bot -- run bot --env-file .env
pm2 save
\`\`\`

## Troubleshooting

**Commands not showing in Discord?**
- Make sure you ran `npm run deploy-commands`
- Check that `DISCORD_CLIENT_ID` and `DISCORD_GUILD_ID` are correct

**Database errors?**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check logs: `pm2 logs discord-bot --err --lines 50`

**Bot keeps restarting?**
- Check for errors: `pm2 logs discord-bot --err --lines 50`
- Verify Discord bot token is valid
