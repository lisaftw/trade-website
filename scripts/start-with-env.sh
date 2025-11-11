#!/bin/bash

# Load environment variables from .env.local
export $(cat /home/deploy/trading-website/.env.local | grep -v '^#' | xargs)

# Start the Discord bot with all environment variables
cd /home/deploy/trading-website
npm run bot
