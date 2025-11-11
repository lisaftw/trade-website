#!/bin/bash

set -e

echo "Starting deployment..."

cd /home/deploy/trading-website

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Restarting services..."
pm2 restart trading-website

echo "Clearing Nginx cache..."
sudo rm -rf /var/cache/nginx/trading/*
sudo systemctl reload nginx

echo "Deployment completed successfully!"

pm2 status
