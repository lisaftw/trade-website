# Complete VPS Deployment Guide

This guide covers deploying your trading website on a VPS with local PostgreSQL storage.

## Prerequisites

- Ubuntu/Debian VPS
- Root or sudo access
- Domain configured (optional)

## Quick Deployment

Run these commands on your VPS via SSH:

### 1. Install System Dependencies

\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install build tools
sudo apt install -y build-essential libpq-dev python3-dev
\`\`\`

### 2. Set Up PostgreSQL

\`\`\`bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE trading_db;
CREATE USER trading_user WITH ENCRYPTED PASSWORD 'SecurePass2025!Trading';
GRANT ALL PRIVILEGES ON DATABASE trading_db TO trading_user;
ALTER DATABASE trading_db OWNER TO trading_user;
GRANT ALL ON SCHEMA public TO trading_user;
\q
EOF
\`\`\`

### 3. Clone and Set Up Project

\`\`\`bash
# Clone repository
cd ~
git clone https://github.com/lisaftw/trade-website.git
cd trade-website

# Create environment file
nano .env.local
\`\`\`

Paste this configuration:

\`\`\`env
DISCORD_BOT_TOKEN=your_token
DISCORD_CLIENT_ID=your_id
DISCORD_CLIENT_SECRET=your_secret
DISCORD_REDIRECT_URI=http://YOUR_VPS_IP/api/auth/discord/callback
DISCORD_GUILD_ID=your_guild_id
DATABASE_URL=postgresql://trading_user:SecurePass2025!Trading@localhost:5432/trading_db
POSTGRES_URL=postgresql://trading_user:SecurePass2025!Trading@localhost:5432/trading_db
NEXT_PUBLIC_SITE_URL=http://YOUR_VPS_IP
SITE_PASSWORD=qsxcvbhjio987654
ADMIN_PASSWORD=your_admin_password
\`\`\`

Save (Ctrl+X, Y, Enter).

### 4. Install Dependencies and Build

\`\`\`bash
# Install packages
npm install --force

# Run database migrations
for file in scripts/sql/*.sql; do
  PGPASSWORD='SecurePass2025!Trading' psql -h localhost -U trading_user -d trading_db -f "$file"
done

# Build application
npm run build
\`\`\`

### 5. Start with PM2

\`\`\`bash
# Start application
pm2 start npm --name "trading-site" -- start

# Save PM2 configuration
pm2 save

# Set up auto-start
pm2 startup
# Copy and run the command PM2 outputs
\`\`\`

### 6. Configure Nginx

\`\`\`bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/trading-site
\`\`\`

Paste:

\`\`\`nginx
server {
    listen 80;
    server_name YOUR_VPS_IP YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

Save and enable:

\`\`\`bash
# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Enable site
sudo ln -s /etc/nginx/sites-available/trading-site /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

### 7. Set Up SSL (Optional - After DNS is configured)

\`\`\`bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
\`\`\`

## Verify Deployment

\`\`\`bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs trading-site

# Check database
PGPASSWORD='SecurePass2025!Trading' psql -h localhost -U trading_user -d trading_db -c "SELECT COUNT(*) FROM items;"
\`\`\`

Visit `http://YOUR_VPS_IP` in browser - you should see your site!

## Maintenance Commands

\`\`\`bash
# View logs
pm2 logs trading-site

# Restart app
pm2 restart trading-site

# Update code
cd ~/trade-website
git pull
npm install --force
npm run build
pm2 restart trading-site

# Backup database
pg_dump -h localhost -U trading_user trading_db > backup.sql

# Restore database
psql -h localhost -U trading_user trading_db < backup.sql
\`\`\`

## Success!

Your trading website is now live on your VPS with local PostgreSQL storage! 🚀
