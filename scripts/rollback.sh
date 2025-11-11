#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Rolling back to previous version...${NC}"

# Navigate to project directory
cd /home/deploy/trading-website || exit 1

# Show last 10 commits
echo -e "${YELLOW}Recent commits:${NC}"
git log --oneline -10

# Ask for commit hash or rollback count
echo -e "${YELLOW}Enter commit hash to rollback to, or press Enter to rollback 1 commit:${NC}"
read -r commit_hash

if [ -z "$commit_hash" ]; then
    # Rollback one commit
    echo -e "${YELLOW}Rolling back one commit...${NC}"
    git reset --hard HEAD~1
else
    # Rollback to specific commit
    echo -e "${YELLOW}Rolling back to commit: $commit_hash${NC}"
    git reset --hard "$commit_hash"
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to rollback${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi

# Restart PM2 processes
echo -e "${YELLOW}Restarting services...${NC}"
pm2 restart all

echo -e "${GREEN}Rollback completed successfully!${NC}"
echo -e "${GREEN}Timestamp: $(date)${NC}"

# Log the rollback
echo "Rolled back at $(date) to commit: ${commit_hash:-HEAD~1}" >> /home/deploy/logs/rollback.log
