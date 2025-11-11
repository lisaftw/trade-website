#!/bin/bash

# Add missing DISCORD_BOT_TOKEN to .env.local if not present
if ! grep -q "DISCORD_BOT_TOKEN" /home/deploy/trading-website/.env.local; then
  echo "" >> /home/deploy/trading-website/.env.local
  echo "# Discord Bot" >> /home/deploy/trading-website/.env.local
  echo "DISCORD_BOT_TOKEN=your_discord_bot_token_here" >> /home/deploy/trading-website/.env.local
  echo "Added DISCORD_BOT_TOKEN placeholder to .env.local"
  echo "Please edit /home/deploy/trading-website/.env.local and add your actual Discord bot token"
fi

# Add DATABASE_URL if not present
if ! grep -q "DATABASE_URL" /home/deploy/trading-website/.env.local; then
  POSTGRES_URL=$(grep "POSTGRES_URL=" /home/deploy/trading-website/.env.local | head -1 | cut -d '=' -f2-)
  if [ -n "$POSTGRES_URL" ]; then
    echo "DATABASE_URL=$POSTGRES_URL" >> /home/deploy/trading-website/.env.local
    echo "Added DATABASE_URL to .env.local"
  fi
fi

echo "Environment variables check complete!"
