#!/bin/bash

# Exit on error
set -e

echo "Setting up VPS2 for frontend deployment..."

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js and npm..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Create application directory if it doesn't exist
mkdir -p /var/www/jouw-frontend-website

# Set up systemd service
echo "Setting up systemd service..."
cat > /etc/systemd/system/frontend.service << 'EOL'
[Unit]
Description=Maasiso Frontend Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/jouw-frontend-website
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable frontend.service

# Install PM2 globally for process management
npm install -g pm2

# Set up Nginx
echo "Setting up Nginx..."
apt-get install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/frontend << 'EOL'
server {
    listen 80;
    server_name 147.93.62.188;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/proxy {
        rewrite ^/api/proxy/(.*) /$1 break;
        proxy_pass http://147.93.62.187:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Additional security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http://147.93.62.187:1337; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://147.93.62.187:1337; font-src 'self' data:;" always;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";
}
EOL

# Enable the site
ln -sf /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Create production environment file
cat > /var/www/jouw-frontend-website/.env.production << 'EOL'
NEXT_PUBLIC_API_URL=http://147.93.62.188:3000/api/proxy
NEXT_PUBLIC_SITE_URL=http://147.93.62.188
NEXTAUTH_URL=http://147.93.62.188
NEXTAUTH_SECRET=test-secret-do-not-use-in-production
NEXT_PUBLIC_GRAPHQL_URL=http://147.93.62.188:3000/api/proxy/graphql
NEXT_PUBLIC_STRAPI_TOKEN=c8b3c0dd4c368c08943789fbc379a3bbf4c07289fca8e2f4ee4367b62f52e586e0dff81d42cd5a51b5b9de2cf7919da0e70f40faaf66de6e5ca4125932df36fb92e509fac8535a1926b5fbd72893b9c61648683fc2c4f8b4608c4be6f8fa0942e38fd2202c49d02d7aa9d3c75fa06f62c9eda179466d88f551ae8b244b1b75c2f3
STRAPI_URL=http://147.93.62.187:1337
EOL

echo "VPS2 setup complete!"
echo "You can now deploy the frontend application using the deploy-to-vps2.ps1 script"