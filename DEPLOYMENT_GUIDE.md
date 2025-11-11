# Comprehensive VPS Deployment Guide

This guide covers deploying the trading website and Discord bot on VPS (45.90.99.130) to support 5000+ concurrent users with optimal performance, security, and scalability.

---

## Table of Contents

1. [Initial VPS Setup](#initial-vps-setup)
2. [Security Hardening](#security-hardening)
3. [Install Dependencies](#install-dependencies)
4. [Deploy Website](#deploy-website)
5. [Deploy Discord Bot](#deploy-discord-bot)
6. [Database Migration](#database-migration)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Scaling for 5000+ Users](#scaling-for-5000-users)

---

## 1. Initial VPS Setup

### 1.1 Connect to VPS

\`\`\`bash
ssh root@45.90.99.130
\`\`\`

### 1.2 Update System

\`\`\`bash
apt update && apt upgrade -y
apt install -y curl git build-essential
\`\`\`

### 1.3 Create Non-Root User

\`\`\`bash
adduser deploy
usermod -aG sudo deploy
su - deploy
\`\`\`

### 1.4 Setup SSH Key Authentication

On your local machine:
\`\`\`bash
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id deploy@45.90.99.130
\`\`\`

---

## 2. Security Hardening

### 2.1 Configure Firewall

\`\`\`bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
\`\`\`

### 2.2 Install Fail2Ban (Prevent Brute Force)

\`\`\`bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
\`\`\`

### 2.3 Disable Root SSH Login

\`\`\`bash
sudo nano /etc/ssh/sshd_config
\`\`\`

Set:
\`\`\`
PermitRootLogin no
PasswordAuthentication no
\`\`\`

Restart SSH:
\`\`\`bash
sudo systemctl restart ssh
\`\`\`

### 2.4 Setup Automatic Security Updates

\`\`\`bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
\`\`\`

---

## 3. Install Dependencies

### 3.1 Install Node.js 22.x (LTS)

\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
\`\`\`

### 3.2 Install PM2 (Process Manager)

\`\`\`bash
sudo npm install -g pm2
pm2 startup systemd -u deploy --hp /home/deploy
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
\`\`\`

### 3.3 Install Nginx (Reverse Proxy)

\`\`\`bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
\`\`\`

### 3.4 Install Redis (Caching)

\`\`\`bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
redis-cli ping
\`\`\`

### 3.5 Install Certbot (SSL Certificates)

\`\`\`bash
sudo apt install -y certbot python3-certbot-nginx
\`\`\`

---

## 4. Deploy Website

### 4.1 Clone Repository

\`\`\`bash
cd /home/deploy
git clone https://github.com/lisaftw/trade-website.git trading-website
cd trading-website
\`\`\`

### 4.2 Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4.3 Setup Environment Variables

\`\`\`bash
nano .env.local
\`\`\`

Add:
\`\`\`env
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback

# Admin
ADMIN_PASSWORD=your_secure_admin_password

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Next.js
NODE_ENV=production
PORT=3000
\`\`\`

### 4.4 Build Application

\`\`\`bash
npm run build
\`\`\`

### 4.5 Start with PM2

\`\`\`bash
pm2 start npm --name "trading-website" -- start
pm2 save
\`\`\`

### 4.6 Configure Nginx

\`\`\`bash
sudo nano /etc/nginx/sites-available/trading-website
\`\`\`

Add:
\`\`\`nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=50r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

# Cache configuration
proxy_cache_path /var/cache/nginx/trading levels=1:2 keys_zone=trading_cache:100m max_size=1g inactive=60m use_temp_path=off;

upstream nextjs_backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Connection limits
    limit_conn conn_limit 10;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Static files with aggressive caching
    location /_next/static/ {
        proxy_pass http://nextjs_backend;
        proxy_cache trading_cache;
        proxy_cache_valid 200 365d;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Images with caching
    location /images/ {
        proxy_pass http://nextjs_backend;
        proxy_cache trading_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        add_header Cache-Control "public, max-age=2592000";
        add_header X-Cache-Status $upstream_cache_status;
    }

    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Main application with rate limiting
    location / {
        limit_req zone=general burst=20 nodelay;
        
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache trading_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        proxy_cache_bypass $http_upgrade $cookie_session;
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
}
\`\`\`

Enable site:
\`\`\`bash
sudo ln -s /etc/nginx/sites-available/trading-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### 4.7 Setup SSL Certificate

\`\`\`bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
\`\`\`

---

## 5. Deploy Discord Bot

### 5.1 Setup Bot Environment

\`\`\`bash
cd /home/deploy/trading-website
\`\`\`

Ensure `.env.local` has:
\`\`\`env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
\`\`\`

### 5.2 Deploy Commands

\`\`\`bash
npm run bot:deploy
\`\`\`

### 5.3 Start Bot with PM2

\`\`\`bash
pm2 start npm --name "discord-bot" -- run bot
pm2 save
\`\`\`

---

## 6. Database Migration

### 6.1 Verify Supabase Connection

Test connection:
\`\`\`bash
npm run migrate:prepare-db
\`\`\`

### 6.2 Migrate Data from MongoDB

If you have MongoDB data:
\`\`\`bash
npm run migrate:mongo-to-postgres
\`\`\`

### 6.3 Import Item Data

Import Adopt Me items:
\`\`\`bash
npm run import:adoptme
\`\`\`

Import MM2 values:
\`\`\`bash
npm run import:mm2
\`\`\`

---

## 7. Performance Optimization

### 7.1 Optimize Nginx

\`\`\`bash
sudo nano /etc/nginx/nginx.conf
\`\`\`

Update worker processes and connections:
\`\`\`nginx
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;
pid /run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 100;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Buffer sizes
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;
    
    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    
    # File descriptors
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    
    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
\`\`\`

Restart Nginx:
\`\`\`bash
sudo systemctl restart nginx
\`\`\`

### 7.2 Optimize System Limits

\`\`\`bash
sudo nano /etc/security/limits.conf
\`\`\`

Add:
\`\`\`
deploy soft nofile 65535
deploy hard nofile 65535
* soft nofile 65535
* hard nofile 65535
\`\`\`

\`\`\`bash
sudo nano /etc/sysctl.conf
\`\`\`

Add:
\`\`\`
# Network performance tuning
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.core.netdev_max_backlog = 65535

# Connection tracking
net.netfilter.nf_conntrack_max = 262144

# Memory settings
vm.swappiness = 10
\`\`\`

Apply changes:
\`\`\`bash
sudo sysctl -p
\`\`\`

### 7.3 Configure Node.js for Production

Create PM2 ecosystem file:
\`\`\`bash
nano /home/deploy/trading-website/ecosystem.config.js
\`\`\`

\`\`\`javascript
module.exports = {
  apps: [
    {
      name: 'trading-website',
      script: 'npm',
      args: 'start',
      cwd: '/home/deploy/trading-website',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '1G',
      error_file: '/home/deploy/logs/website-error.log',
      out_file: '/home/deploy/logs/website-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'discord-bot',
      script: 'npm',
      args: 'run bot',
      cwd: '/home/deploy/trading-website',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '500M',
      error_file: '/home/deploy/logs/bot-error.log',
      out_file: '/home/deploy/logs/bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
}
\`\`\`

Create logs directory:
\`\`\`bash
mkdir -p /home/deploy/logs
\`\`\`

Restart PM2 with ecosystem file:
\`\`\`bash
cd /home/deploy/trading-website
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
\`\`\`

### 7.4 Setup Redis Caching

Install Redis client for Next.js:
\`\`\`bash
npm install ioredis
\`\`\`

The caching implementation will be added in the code optimization section.

---

## 8. Monitoring & Maintenance

### 8.1 Setup PM2 Monitoring

\`\`\`bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
\`\`\`

Monitor processes:
\`\`\`bash
pm2 monit
pm2 status
pm2 logs
\`\`\`

### 8.2 Setup Nginx Access Log Monitoring

Install GoAccess (Real-time log analyzer):
\`\`\`bash
sudo apt install -y goaccess
\`\`\`

View real-time stats:
\`\`\`bash
sudo goaccess /var/log/nginx/access.log -c
\`\`\`

### 8.3 Setup System Monitoring

Install htop and netdata:
\`\`\`bash
sudo apt install -y htop
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
\`\`\`

Access Netdata dashboard at: `http://45.90.99.130:19999`

### 8.4 Automated Backups

Create backup script:
\`\`\`bash
nano /home/deploy/backup.sh
\`\`\`

\`\`\`bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
mkdir -p $BACKUP_DIR

echo "Starting backup at $DATE"

cd /home/deploy/trading-website
tar -czf $BACKUP_DIR/website_$DATE.tar.gz .

find $BACKUP_DIR -name "website_*.tar.gz" -mtime +7 -delete

echo "Backup completed: website_$DATE.tar.gz"
\`\`\`

Make executable:
\`\`\`bash
chmod +x /home/deploy/backup.sh
\`\`\`

Schedule daily backups:
\`\`\`bash
crontab -e
\`\`\`

Add:
\`\`\`
0 2 * * * /home/deploy/backup.sh >> /home/deploy/logs/backup.log 2>&1
\`\`\`

### 8.5 Setup Health Checks

Create health check script:
\`\`\`bash
nano /home/deploy/health-check.sh
\`\`\`

\`\`\`bash
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
\`\`\`

Make executable and schedule:
\`\`\`bash
chmod +x /home/deploy/health-check.sh
crontab -e
\`\`\`

Add:
\`\`\`
*/5 * * * * /home/deploy/health-check.sh
\`\`\`

---

## 9. Scaling for 5000+ Users

### 9.1 Horizontal Scaling with PM2 Cluster Mode

The ecosystem.config.js already configures cluster mode with `instances: 'max'`, which creates one process per CPU core.

### 9.2 Database Connection Pooling

Supabase handles connection pooling automatically, but ensure proper configuration in your code.

### 9.3 CDN Setup (Optional)

For static assets, consider using Cloudflare:
1. Point your domain to Cloudflare
2. Enable caching rules for static assets
3. Enable Brotli compression
4. Setup page rules for aggressive caching

### 9.4 Load Balancing (Future Scaling)

When single VPS reaches limits, add more VPS instances behind a load balancer:

\`\`\`nginx
upstream backend_cluster {
    least_conn;
    server 45.90.99.130:3000 max_fails=3 fail_timeout=30s;
    server 45.90.99.131:3000 max_fails=3 fail_timeout=30s;
    server 45.90.99.132:3000 max_fails=3 fail_timeout=30s;
}
\`\`\`

### 9.5 Performance Benchmarking

Install Apache Bench:
\`\`\`bash
sudo apt install -y apache2-utils
\`\`\`

Test concurrent users:
\`\`\`bash
ab -n 10000 -c 100 http://localhost:3000/
\`\`\`

### 9.6 Expected Resource Usage

For 5000+ concurrent users on a VPS:

**Minimum Requirements:**
- CPU: 8+ cores
- RAM: 16GB+
- Storage: 100GB+ SSD
- Network: 1Gbps

**Recommended Specifications:**
- CPU: 16+ cores
- RAM: 32GB+
- Storage: 500GB SSD
- Network: 10Gbps

---

## 10. Deployment Checklist

Before going live:

- [ ] DNS records point to VPS IP (45.90.99.130)
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] Environment variables configured in `.env.local`
- [ ] Database migration completed
- [ ] PM2 processes running (website + bot)
- [ ] Nginx configured with rate limiting and caching
- [ ] Firewall rules active (UFW)
- [ ] Fail2Ban configured
- [ ] Log rotation enabled
- [ ] Health checks scheduled
- [ ] Backups automated
- [ ] Monitoring tools installed (PM2, Netdata)
- [ ] System limits optimized
- [ ] Redis caching enabled
- [ ] Test load with 100+ concurrent users

---

## 11. Common Commands Reference

### PM2 Commands
\`\`\`bash
pm2 status                # Check status
pm2 logs                  # View logs
pm2 logs trading-website  # View specific app logs
pm2 restart all           # Restart all apps
pm2 restart trading-website  # Restart specific app
pm2 monit                 # Real-time monitoring
pm2 save                  # Save current process list
pm2 delete all            # Delete all processes
\`\`\`

### Nginx Commands
\`\`\`bash
sudo nginx -t             # Test configuration
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl status nginx   # Check status
sudo tail -f /var/log/nginx/error.log  # View error logs
sudo tail -f /var/log/nginx/access.log # View access logs
\`\`\`

### Git Deployment
\`\`\`bash
cd /home/deploy/trading-website
git pull origin main
npm install
npm run build
pm2 restart trading-website
\`\`\`

### Clear Nginx Cache
\`\`\`bash
sudo rm -rf /var/cache/nginx/trading/*
sudo systemctl restart nginx
\`\`\`

---

## 12. Troubleshooting

### Website Not Loading

\`\`\`bash
pm2 status
pm2 logs trading-website
sudo tail -f /var/log/nginx/error.log
\`\`\`

### High Memory Usage

\`\`\`bash
pm2 monit
htop
sudo systemctl restart trading-website
\`\`\`

### Slow Response Times

Check Nginx cache:
\`\`\`bash
sudo tail -f /var/log/nginx/access.log | grep "X-Cache-Status"
\`\`\`

Check database queries (Supabase dashboard)

### Bot Disconnecting

\`\`\`bash
pm2 logs discord-bot
pm2 restart discord-bot
\`\`\`

---

## 13. Security Best Practices

1. **Keep system updated**: `sudo apt update && sudo apt upgrade`
2. **Monitor logs regularly**: Check for suspicious activity
3. **Use environment variables**: Never commit secrets to Git
4. **Enable 2FA**: On GitHub, Supabase, Discord accounts
5. **Regular backups**: Test restore process monthly
6. **Rate limiting**: Protect against DDoS and abuse
7. **HTTPS only**: Redirect all HTTP to HTTPS
8. **Security headers**: Already configured in Nginx
9. **Monitor failed login attempts**: Check Fail2Ban logs
10. **Principle of least privilege**: Don't run services as root

---

## Support

For issues or questions:
- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Monitor system: `pm2 monit` or `htop`
- Database issues: Check Supabase dashboard

---

**Deployment completed successfully! Your trading website is now ready to handle 5000+ concurrent users with optimal performance and security.**
