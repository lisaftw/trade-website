#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting website update...${NC}"

# Navigate to project directory
cd /home/deploy/trading-website || exit 1

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes from GitHub...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to pull changes from GitHub${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi

# Restart PM2 processes
echo -e "${YELLOW}Restarting services...${NC}"
pm2 restart trading-website

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to restart website${NC}"
    exit 1
fi

# Wait a moment for the service to start
sleep 2

# Check status
echo -e "${YELLOW}Checking service status...${NC}"
pm2 status

echo -e "${GREEN}Update completed successfully!${NC}"
echo -e "${GREEN}Timestamp: $(date)${NC}"

# Log the update
echo "Website updated at $(date)" >> /home/deploy/logs/update.log
