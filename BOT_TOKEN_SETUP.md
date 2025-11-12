# Discord Bot Token Setup

Your `.env` file is missing the `DISCORD_BOT_TOKEN`. Here's how to get it:

## Get Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on your bot application (ID: 1423954564532539433)
3. Go to the "Bot" section in the left sidebar
4. Under "Token", click "Reset Token" or "Copy" to get your bot token
5. Copy the token (it looks like: `MTQyMzk1NDU2NDUzMjUzOTQzMw.GxxxXX.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Add to .env file

Run this command on your VPS:

\`\`\`bash
nano .env
\`\`\`

Add this line at the top (replace with your actual token):

\`\`\`
DISCORD_BOT_TOKEN=MTQyMzk1NDU2NDUzMjUzOTQzMw.GxxxXX.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

Your complete `.env` file should look like:

\`\`\`
# Discord Bot Token (ADD THIS!)
DISCORD_BOT_TOKEN=your_actual_bot_token_here
DISCORD_CLIENT_ID=1423954564532539433
DISCORD_CLIENT_SECRET=j7CMPqVpEy8ej-m8LongN1aVP8HXqOje
DISCORD_GUILD_ID=1428800309336997890

# Supabase
SUPABASE_URL=https://eqoyszybgxowrgmaotwi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxb3lzenliZ3hvd3JnbWFvdHdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ5MjQ2OCwiZXhwIjoyMDc1MDY4NDY4fQ.BgU-natlFVljlsfIggyYO77yYw-olqG4RwWSF0j1j_4
NEXT_PUBLIC_SUPABASE_URL=https://eqoyszybgxowrgmaotwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxb3lzenliZ3hvd3JnbWFvdHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0OTI0NjgsImV4cCI6MjA3NTA2ODQ2OH0.P_0-wr4TgTtlzCaS8-IToLq0C2_3QDo7506YF2MyXJE
\`\`\`

## Restart the bot

\`\`\`bash
pm2 restart discord-bot --update-env
pm2 logs discord-bot --lines 20
\`\`\`

The bot should now start successfully!
