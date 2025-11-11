#!/bin/bash

echo "Stopping all PM2 processes..."
pm2 delete all

echo "Loading environment variables..."
export $(cat /home/deploy/trading-website/.env.local | grep -v '^#' | xargs)

echo "Starting web instances on ports 3000-3004..."
cd /home/deploy/trading-website
PORT=3000 pm2 start npm --name "web-3000" -- start
PORT=3001 pm2 start npm --name "web-3001" -- start
PORT=3002 pm2 start npm --name "web-3002" -- start
PORT=3003 pm2 start npm --name "web-3003" -- start
PORT=3004 pm2 start npm --name "web-3004" -- start

echo "Starting Discord bot..."
pm2 start ./scripts/start-with-env.sh --name "discord-bot" --interpreter bash

echo "Saving PM2 configuration..."
pm2 save

echo "Checking status..."
pm2 status

echo "Done! All services started successfully."
