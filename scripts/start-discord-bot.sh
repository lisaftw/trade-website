#!/bin/bash

# Change directory to project root
cd /home/deploy/trading-website

# Source .env.local to load all environment variables into current shell
set -a
source .env.local
set +a

# Start the Discord bot with environment variables now available
exec npm run bot
