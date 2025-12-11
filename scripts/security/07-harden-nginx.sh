#!/bin/bash
#############################################
# Nginx Security Hardening Script
# Purpose: Add rate limiting, security headers, and hardening
# Run as: sudo bash 07-harden-nginx.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Nginx Security Hardening${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Backup current nginx config
echo -e "${BLUE}[1/5] Backing up current nginx configuration...${NC}"
BACKUP_DIR="/etc/nginx/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /etc/nginx/sites-available "$BACKUP_DIR/"
cp -r /etc/nginx/sites-enabled "$BACKUP_DIR/"
cp /etc/nginx/nginx.conf "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup saved to $BACKUP_DIR${NC}"

# Step 2: Create security configuration snippets
echo ""
echo -e "${BLUE}[2/5] Creating security configuration snippets...${NC}"

# Create security headers snippet
cat > /etc/nginx/snippets/security-headers.conf << 'EOF'
# Security Headers Configuration
# Include this file in your server blocks: include snippets/security-headers.conf;

# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS filter
add_header X-XSS-Protection "1; mode=block" always;

# Referrer policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy - Adjust as needed for your application
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.maasiso.nl https://www.google-analytics.com; frame-ancestors 'self';" always;

# Permissions Policy (formerly Feature-Policy)
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;

# HSTS - Force HTTPS (uncomment after confirming HTTPS works)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Don't show nginx version
# server_tokens off; # Already in main config
EOF

# Create rate limiting snippet
cat > /etc/nginx/snippets/rate-limiting.conf << 'EOF'
# Rate Limiting Configuration
# Include rate limit zones in http block, use in server/location blocks

# Limit request rate - 10 requests per second per IP with burst of 20
limit_req zone=general burst=20 nodelay;

# Limit connections per IP
limit_conn addr 50;
EOF

# Create SSL hardening snippet
cat > /etc/nginx/snippets/ssl-hardening.conf << 'EOF'
# SSL Hardening Configuration
# Include this in server blocks with SSL

# Only use TLS 1.2 and 1.3
ssl_protocols TLSv1.2 TLSv1.3;

# Prefer server ciphers
ssl_prefer_server_ciphers on;

# Strong cipher suite
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';

# Enable session resumption for performance
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Diffie-Hellman parameter (generate with: openssl dhparam -out /etc/nginx/dhparam.pem 2048)
# ssl_dhparam /etc/nginx/dhparam.pem;
EOF

echo -e "${GREEN}✓ Security snippets created${NC}"

# Step 3: Update main nginx.conf
echo ""
echo -e "${BLUE}[3/5] Updating nginx.conf with security settings...${NC}"

# Check if rate limiting zones already exist
if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
    # Add rate limiting zones to http block
    sed -i '/http {/a \
    # Rate limiting zones\
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;\
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;\
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;\
    \
    # Connection limiting\
    limit_conn_zone $binary_remote_addr zone=addr:10m;\
    \
    # Rate limit logging\
    limit_req_log_level warn;\
    limit_conn_log_level warn;\
    limit_req_status 429;\
    limit_conn_status 429;' /etc/nginx/nginx.conf
fi

# Disable server tokens if not already
if ! grep -q "server_tokens off" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    server_tokens off;' /etc/nginx/nginx.conf
fi

# Add client body size limit if not exists
if ! grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    client_max_body_size 10m;' /etc/nginx/nginx.conf
fi

# Add client body and header timeouts
if ! grep -q "client_body_timeout" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    client_body_timeout 60s;\
    client_header_timeout 60s;\
    send_timeout 60s;' /etc/nginx/nginx.conf
fi

echo -e "${GREEN}✓ nginx.conf updated${NC}"

# Step 4: Create hardened site configuration
echo ""
echo -e "${BLUE}[4/5] Creating hardened site configuration...${NC}"

cat > /etc/nginx/sites-available/maasiso.nl.hardened << 'EOF'
# MaasISO Frontend - Hardened Configuration
# Security features: Rate limiting, headers, SSL hardening

# Rate limiting for sensitive endpoints
map $request_uri $rate_limit_zone {
    default         general;
    ~^/api/         api;
    ~^/auth/        login;
    ~^/login        login;
    ~^/admin        login;
}

# Block known bad user agents
map $http_user_agent $bad_bot {
    default 0;
    ~*nikto 1;
    ~*sqlmap 1;
    ~*nmap 1;
    ~*masscan 1;
    ~*openvas 1;
    ~*nessus 1;
    ~*wget 1;
    ~*curl 1;
    ~*python-requests 1;
    ~*libwww-perl 1;
    ~*scrapy 1;
    ~*java 1;
    ~*^$ 1;
}

# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name maasiso.nl www.maasiso.nl;
    
    # Allow Let's Encrypt challenges
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect everything else to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Main Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name maasiso.nl www.maasiso.nl;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/maasiso.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maasiso.nl/privkey.pem;
    
    # SSL Hardening
    include snippets/ssl-hardening.conf;
    
    # Security Headers
    include snippets/security-headers.conf;
    
    # Block bad bots
    if ($bad_bot) {
        return 403;
    }
    
    # Block access to hidden files (except .well-known)
    location ~ /\.(?!well-known) {
        deny all;
        return 404;
    }
    
    # Block access to sensitive files
    location ~* \.(git|env|htaccess|htpasswd|ini|log|sh|sql|conf|bak|backup|swp)$ {
        deny all;
        return 404;
    }
    
    # Root location - proxy to Next.js
    location / {
        # Rate limiting
        limit_req zone=general burst=20 nodelay;
        limit_conn addr 50;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        
        # Buffer settings
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # API endpoints - higher rate limit
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        limit_conn addr 100;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static assets - longer cache
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        # Cache static assets
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint (no rate limit)
    location /api/health {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Error pages
    error_page 429 /429.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /429.html {
        internal;
        default_type text/html;
        return 429 '<!DOCTYPE html><html><head><title>Too Many Requests</title></head><body><h1>429 - Too Many Requests</h1><p>Please slow down.</p></body></html>';
    }
    
    location = /50x.html {
        root /var/www/html;
    }
    
    # Logging
    access_log /var/log/nginx/maasiso.access.log;
    error_log /var/log/nginx/maasiso.error.log warn;
}
EOF

echo -e "${GREEN}✓ Hardened configuration created${NC}"

# Step 5: Activate configuration
echo ""
echo -e "${BLUE}[5/5] Activating hardened configuration...${NC}"

# Test configuration first
nginx -t

if [ $? -eq 0 ]; then
    # Enable hardened config
    ln -sf /etc/nginx/sites-available/maasiso.nl.hardened /etc/nginx/sites-enabled/maasiso.nl
    
    # Reload nginx
    systemctl reload nginx
    
    echo -e "${GREEN}✓ Hardened configuration activated${NC}"
else
    echo -e "${RED}✗ Configuration test failed, keeping current config${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Nginx Hardening Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Features enabled:${NC}"
echo "  ✓ Rate limiting (10 req/s general, 30 req/s API)"
echo "  ✓ Connection limiting (50/IP)"
echo "  ✓ Security headers (XSS, CSRF, HSTS, CSP)"
echo "  ✓ SSL hardening (TLS 1.2+)"
echo "  ✓ Bad bot blocking"
echo "  ✓ Sensitive file blocking"
echo "  ✓ Hidden file blocking"
echo "  ✓ Server version hidden"
echo ""
echo -e "${BLUE}Configuration files:${NC}"
echo "  /etc/nginx/snippets/security-headers.conf"
echo "  /etc/nginx/snippets/rate-limiting.conf"
echo "  /etc/nginx/snippets/ssl-hardening.conf"
echo "  /etc/nginx/sites-available/maasiso.nl.hardened"
echo ""
echo -e "${BLUE}Backup location:${NC}"
echo "  $BACKUP_DIR"
echo ""
echo -e "${YELLOW}Test the site to ensure everything works correctly!${NC}"