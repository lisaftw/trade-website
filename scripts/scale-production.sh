#!/bin/bash

echo "Scaling Trading Website for High Traffic..."

# Create log directory
mkdir -p /home/deploy/logs

# Stop all existing PM2 processes
pm2 delete all

# Create cache directory for Nginx
sudo mkdir -p /var/cache/nginx/trading
sudo chown -R www-data:www-data /var/cache/nginx/trading

# Update Nginx configuration
sudo cp ~/trading-website/nginx.conf /etc/nginx/sites-available/trading-website
sudo ln -sf /etc/nginx/sites-available/trading-website /etc/nginx/sites-enabled/trading-website
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"
    sudo systemctl reload nginx
else
    echo "Nginx configuration has errors!"
    exit 1
fi

# Install and configure Redis for session storage and caching
if ! command -v redis-cli &> /dev/null; then
    echo "Installing Redis..."
    sudo apt update
    sudo apt install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
fi

# Optimize Redis configuration for high traffic
sudo tee /etc/redis/redis.conf.d/custom.conf > /dev/null <<EOF
maxmemory 2gb
maxmemory-policy allkeys-lru
save ""
appendonly no
EOF

sudo systemctl restart redis-server

# Start PM2 with new configuration
cd ~/trading-website
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | sudo bash

# Set up log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7

echo ""
echo "Scaling complete!"
echo ""
echo "Status:"
pm2 status
echo ""
echo "Your site is now running with:"
echo "- 5 Next.js instances (ports 3000-3004)"
echo "- Nginx load balancing with caching"
echo "- Redis for session storage"
echo "- Automatic log rotation"
echo ""
echo "Visit http://45.90.99.130 to test"
echo ""
echo "Monitor with: pm2 monit"
