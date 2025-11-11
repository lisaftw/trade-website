# Discord Bot Setup Guide for VPS

This guide will help you set up and run the Discord bot on your VPS to manage items for your trading website.

## Prerequisites

- VPS with Node.js installed (v18 or higher)
- PM2 installed globally: `npm install -g pm2`
- Discord Bot Token and Client ID
- Access to your `.env` file with database credentials

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

\`\`\`env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here

# Database Configuration (use the same as your website)
POSTGRES_URL=your_postgres_connection_string_here
\`\`\`

## Installation Steps

1. **Clone your repository** (if not already done):
   \`\`\`bash
   cd ~/trade-website
   git pull origin main
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Deploy bot commands to Discord**:
   \`\`\`bash
   npm run bot:deploy
   \`\`\`
   This registers the slash commands with Discord. You only need to run this once or when you add new commands.

4. **Start the bot with PM2**:
   \`\`\`bash
   pm2 start npm --name "discord-bot" -- run bot
   pm2 save
   \`\`\`

5. **Check bot status**:
   \`\`\`bash
   pm2 status
   pm2 logs discord-bot
   \`\`\`

## Bot Commands

Once running, your bot will have these slash commands available in Discord:

### `/additem`
Add a new item to the database.
- **game**: Select MM2, SAB, or Adopt Me
- **name**: Item name
- **section**: Item category
- **value**: Item value (number)
- **image**: Image URL
- **rarity**: Item rarity (for MM2/SAB)
- **demand**: Item demand level
- **pot**: Potion type (for Adopt Me only)

### `/edititem`
Edit an existing item in the database.
1. Select a game
2. Select an item to edit
3. Fill in the modal with updated values

### `/removeitem`
Remove an item from the database.
1. Select a game
2. Select an item to remove
3. Confirm deletion

## Updating the Bot

When you push changes to GitHub:

\`\`\`bash
cd ~/trade-website
git pull origin main
npm install
pm2 restart discord-bot
\`\`\`

If you add new commands or modify existing command structures:

\`\`\`bash
npm run bot:deploy
pm2 restart discord-bot
\`\`\`

## Troubleshooting

### Bot won't start - "DISCORD_BOT_TOKEN is not set"
- Check that your `.env` file exists in the project root
- Verify the `.env` file contains `DISCORD_BOT_TOKEN`
- Restart PM2: `pm2 restart discord-bot`

### Bot crashes when adding items - Database errors
- Verify `POSTGRES_URL` is set correctly in `.env`
- Test database connection: `npm run db:check`
- Check that tables exist: `mm2_items`, `sab_items`, `adoptme_items`

### Commands don't show up in Discord
- Run `npm run bot:deploy` to register commands
- Wait a few minutes for Discord to propagate the commands
- Try restarting Discord client

### View bot logs
\`\`\`bash
pm2 logs discord-bot --lines 100
\`\`\`

### Restart the bot
\`\`\`bash
pm2 restart discord-bot
\`\`\`

### Stop the bot
\`\`\`bash
pm2 stop discord-bot
pm2 delete discord-bot
\`\`\`

## Security Notes

- Never commit your `.env` file to GitHub
- Keep your bot token secret
- Only give bot permissions to trusted users
- The bot has database write access - use Discord role permissions to restrict who can use the commands
