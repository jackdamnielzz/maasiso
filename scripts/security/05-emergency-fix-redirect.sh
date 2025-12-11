#!/bin/bash
#############################################
# EMERGENCY: Fix Malicious Nginx Redirect
# Frontend Server: 147.93.62.188
# Issue: Nginx redirecting to https://xss.pro/
# 
# Run this ON THE FRONTEND SERVER:
#   sudo bash 05-emergency-fix-redirect.sh
#############################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}============================================${NC}"
echo -e "${RED}  EMERGENCY: FIX MALICIOUS REDIRECT${NC}"
echo -e "${RED}============================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root${NC}"
    echo "Please run: sudo bash $0"
    exit 1
fi

# Step 1: Show current nginx status and find malicious config
echo -e "${BLUE}[Step 1/7] Identifying malicious redirect...${NC}"
echo ""

# Find all nginx configs that mention xss.pro
echo "Searching for xss.pro in nginx configs..."
grep -r "xss.pro" /etc/nginx/ 2>/dev/null && echo -e "${RED}FOUND malicious redirect!${NC}" || echo "Not found in /etc/nginx/"

# Check sites-enabled
echo ""
echo "Checking /etc/nginx/sites-enabled/:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Directory not found"

# Check sites-available
echo ""
echo "Checking /etc/nginx/sites-available/:"
ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "Directory not found"

# Step 2: Show all nginx configs to find the malicious redirect
echo ""
echo -e "${BLUE}[Step 2/7] Showing current nginx configs...${NC}"
echo ""

for config in /etc/nginx/sites-enabled/*; do
    if [ -f "$config" ]; then
        echo -e "${YELLOW}=== $config ===${NC}"
        cat "$config"
        echo ""
        echo -e "${YELLOW}=== END $config ===${NC}"
        echo ""
    fi
done

# Step 3: Backup all configs
echo -e "${BLUE}[Step 3/7] Creating backup of all nginx configs...${NC}"
BACKUP_DIR="/etc/nginx/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /etc/nginx/sites-enabled/ "$BACKUP_DIR/"
cp -r /etc/nginx/sites-available/ "$BACKUP_DIR/"
cp /etc/nginx/nginx.conf "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"

# Step 4: Remove malicious redirects
echo ""
echo -e "${BLUE}[Step 4/7] Removing malicious redirects...${NC}"

# Remove any lines containing xss.pro from all configs
for config in /etc/nginx/sites-enabled/* /etc/nginx/sites-available/* /etc/nginx/nginx.conf; do
    if [ -f "$config" ]; then
        if grep -q "xss.pro" "$config" 2>/dev/null; then
            echo -e "${RED}Removing xss.pro redirect from: $config${NC}"
            sed -i '/xss\.pro/d' "$config"
        fi
    fi
done

# Step 5: Create a clean default config for maasiso.nl
echo ""
echo -e "${BLUE}[Step 5/7] Creating clean nginx config for maasiso.nl...${NC}"

# First, let's check if Next.js is running on port 3000
if netstat -tlpn 2>/dev/null | grep -q ":3000"; then
    echo "Next.js detected on port 3000"
    NEXT_PORT=3000
else
    NEXT_PORT=3000
    echo "Will configure for Next.js on port 3000"
fi

# Create clean config
cat > /etc/nginx/sites-available/maasiso.nl << 'NGINX_CONFIG'
# MaasISO Frontend - Clean Configuration
# Created by emergency security fix script
# Date: TIMESTAMP_PLACEHOLDER

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name maasiso.nl www.maasiso.nl;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name maasiso.nl www.maasiso.nl;

    # SSL Configuration - Update these paths if different
    ssl_certificate /etc/letsencrypt/live/maasiso.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maasiso.nl/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Proxy to Next.js application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files (Next.js)
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Health check endpoint
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINX_CONFIG

# Replace timestamp
sed -i "s/TIMESTAMP_PLACEHOLDER/$(date)/" /etc/nginx/sites-available/maasiso.nl

echo -e "${GREEN}✓ Clean config created${NC}"

# Step 6: Enable the clean config
echo ""
echo -e "${BLUE}[Step 6/7] Enabling clean config...${NC}"

# Remove old symlink if exists
rm -f /etc/nginx/sites-enabled/maasiso.nl 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Create new symlink
ln -sf /etc/nginx/sites-available/maasiso.nl /etc/nginx/sites-enabled/maasiso.nl
echo -e "${GREEN}✓ Config enabled${NC}"

# Step 7: Test and reload nginx
echo ""
echo -e "${BLUE}[Step 7/7] Testing and reloading nginx...${NC}"

# Test config
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx config test passed!${NC}"
    
    # Reload nginx
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Nginx reloaded successfully!${NC}"
    else
        echo -e "${YELLOW}Reload failed, trying restart...${NC}"
        systemctl restart nginx
    fi
    
    # Verify
    echo ""
    echo "Verifying the fix..."
    sleep 2
    
    # Check if still redirecting to xss.pro
    RESPONSE=$(curl -I -s --connect-timeout 5 http://127.0.0.1 2>/dev/null | grep -i "location:" || echo "")
    
    if echo "$RESPONSE" | grep -qi "xss.pro"; then
        echo -e "${RED}ERROR: Still redirecting to xss.pro!${NC}"
        echo "Response: $RESPONSE"
        echo ""
        echo "Please check nginx configs manually:"
        echo "  grep -r 'xss.pro' /etc/nginx/"
    else
        echo -e "${GREEN}✓ Malicious redirect removed!${NC}"
    fi
else
    echo -e "${RED}✗ Nginx config test failed!${NC}"
    echo ""
    echo "This might be due to missing SSL certificates."
    echo "Trying HTTP-only config..."
    
    # Create HTTP-only fallback config
    cat > /etc/nginx/sites-available/maasiso.nl << 'NGINX_HTTP_ONLY'
# MaasISO Frontend - HTTP Only (Emergency)
server {
    listen 80;
    listen [::]:80;
    server_name maasiso.nl www.maasiso.nl _;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINX_HTTP_ONLY

    nginx -t && systemctl reload nginx
fi

echo ""
echo -e "${YELLOW}============================================${NC}"
echo -e "${GREEN}  Emergency Fix Script Complete${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test the website: curl -I http://maasiso.nl"
echo "2. Check in browser: http://maasiso.nl"
echo "3. If SSL is needed, run: certbot --nginx -d maasiso.nl"
echo ""
echo -e "${RED}IMPORTANT: Investigate how the attacker modified the config!${NC}"
echo "Check these:"
echo "  - Auth logs: /var/log/auth.log"
echo "  - Nginx logs: /var/log/nginx/access.log"
echo "  - Who modified: stat /etc/nginx/sites-enabled/"