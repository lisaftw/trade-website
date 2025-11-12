# Discord Bot Environment Setup

The bot needs environment variables to connect to Discord and your database. Follow these steps:

## Step 1: Create .env File on VPS

SSH into your VPS and create a `.env` file in the project root:

\`\`\`bash
cd ~/trade-website
nano .env
\`\`\`

## Step 2: Add Required Variables

Copy and paste these variables into the file, replacing with your actual values:

\`\`\`env
# Discord Bot Token (from Discord Developer Portal)
DISCORD_BOT_TOKEN=your_actual_bot_token

# Supabase Credentials (same as website uses)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
\`\`\`

**Where to find these values:**

### Discord Bot Token
1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to "Bot" section
4. Click "Reset Token" or "Copy" to get your bot token

### Supabase Credentials
1. Go to your Supabase project dashboard
2. Click on "Settings" (gear icon)
3. Go to "API" section
4. Copy:
   - Project URL → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Save and Exit

In nano:
- Press `Ctrl + O` to save
- Press `Enter` to confirm
- Press `Ctrl + X` to exit

## Step 4: Restart the Bot

\`\`\`bash
pm2 restart discord-bot
pm2 logs discord-bot --lines 20
\`\`\`

You should see:
- ✅ Database connected successfully!
- ✅ Discord bot ready! Logged in as YourBot#1234

## Troubleshooting

### Bot keeps restarting
- Check logs: `pm2 logs discord-bot --err`
- Verify all environment variables are set correctly in `.env`
- Make sure there are no extra spaces or quotes around values

### "Missing Supabase environment variables" error
- Double-check your `.env` file has all 4 Supabase variables
- Ensure the file is named exactly `.env` (not `.env.txt`)
- The file should be in `/home/deploy/trade-website/.env`

### "DISCORD_BOT_TOKEN is not set" error
- Verify the Discord bot token is correct
- Make sure you copied the full token without any spaces
- Try regenerating the token in Discord Developer Portal

### Database connection failed
- Verify your Supabase project is active
- Check that the `SUPABASE_SERVICE_ROLE_KEY` is correct (not the anon key)
- Ensure your Supabase project has the required tables (`mm2_items`, `sab_items`, `adoptme_items`)

## Security Notes

- **Never commit `.env` to git** - It's already in `.gitignore`
- The `service_role` key has full database access - keep it secret
- Only share environment variables through secure channels
