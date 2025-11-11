#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
mkdir -p $BACKUP_DIR

echo "Starting backup at $DATE"

cd /home/deploy/trading-website
tar -czf $BACKUP_DIR/website_$DATE.tar.gz .

find $BACKUP_DIR -name "website_*.tar.gz" -mtime +7 -delete

echo "Backup completed: website_$DATE.tar.gz"
