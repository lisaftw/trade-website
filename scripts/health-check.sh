#!/bin/bash

WEBSITE_URL="http://localhost:3000"
ALERT_EMAIL="your-email@example.com"

if ! curl -sf "$WEBSITE_URL" > /dev/null; then
    echo "Website is down! Restarting..."
    pm2 restart trading-website
    echo "Website down at $(date)" | mail -s "Trading Website Alert" $ALERT_EMAIL
fi

if ! pm2 status discord-bot | grep -q "online"; then
    echo "Discord bot is down! Restarting..."
    pm2 restart discord-bot
fi
