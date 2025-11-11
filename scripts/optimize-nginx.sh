#!/bin/bash

echo "Optimizing Nginx configuration..."

sudo tee /etc/nginx/sites-available/trading-website > /dev/null <<'EOF'
upstream nextjs_backend {
    server localhost:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name 45.90.99.130;

    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    client_max_body_size 10M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    location /_next/static/ {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_cache_bypass $http_upgrade;
        
        add_header Cache-Control "public, max-age=31536000, immutable";
        expires 1y;
        access_log off;
    }

    location /images/ {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        add_header Cache-Control "public, max-age=604800, immutable";
        expires 7d;
        access_log off;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        add_header Cache-Control "public, max-age=604800";
        expires 7d;
        access_log off;
    }

    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
}
EOF

echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Restarting Nginx..."
    sudo systemctl restart nginx
    echo "Nginx optimized successfully!"
else
    echo "Nginx configuration test failed. Please check the configuration."
fi
