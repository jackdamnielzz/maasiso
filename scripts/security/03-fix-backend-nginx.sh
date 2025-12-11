#!/bin/bash
#############################################
# Backend Server Nginx Config Fix Script
# Purpose: Fix the nginx config syntax error on line 11
# Server: 153.92.223.23 (strapicms.maasiso.cloud)
# Error: invalid condition "=" in /etc/nginx/sites-enabled/maasiso.nl:11
# Run on server as: sudo bash 03-fix-backend-nginx.sh
#############################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Backend Server Nginx Config Fix${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root${NC}"
    echo "Please run: sudo bash $0"
    exit 1
fi

NGINX_CONFIG="/etc/nginx/sites-enabled/maasiso.nl"
NGINX_BACKUP="/etc/nginx/sites-enabled/maasiso.nl.backup.$(date +%Y%m%d_%H%M%S)"

# Step 1: Check if config exists
echo -e "${BLUE}[Step 1/5] Checking nginx config file...${NC}"
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}Config file not found: $NGINX_CONFIG${NC}"
    echo "Checking sites-available..."
    if [ -f "/etc/nginx/sites-available/maasiso.nl" ]; then
        NGINX_CONFIG="/etc/nginx/sites-available/maasiso.nl"
        echo -e "${GREEN}Found config at: $NGINX_CONFIG${NC}"
    else
        echo -e "${RED}Cannot find nginx config file for maasiso.nl${NC}"
        echo "Available configs in sites-enabled:"
        ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Directory not found"
        echo ""
        echo "Available configs in sites-available:"
        ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "Directory not found"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Config file found: $NGINX_CONFIG${NC}"

# Step 2: Create backup
echo ""
echo -e "${BLUE}[Step 2/5] Creating backup...${NC}"
cp "$NGINX_CONFIG" "$NGINX_BACKUP"
echo -e "${GREEN}✓ Backup created: $NGINX_BACKUP${NC}"

# Step 3: Show current config around line 11
echo ""
echo -e "${BLUE}[Step 3/5] Current config around line 11:${NC}"
echo -e "${YELLOW}========================================${NC}"
sed -n '1,20p' "$NGINX_CONFIG" | nl
echo -e "${YELLOW}========================================${NC}"

# Step 4: Fix the invalid condition syntax
# The error "invalid condition '='" typically means:
# - Wrong: if ($host = 'example.com')
# - Correct: if ($host = 'example.com') or if ($host ~* '^example\.com$')
# Note: In nginx, the '=' operator in if statements has specific rules

echo ""
echo -e "${BLUE}[Step 4/5] Analyzing and fixing the config...${NC}"

# Common nginx if statement issues and fixes:
# 1. Space issues: if($host = 'x') should be if ($host = 'x')
# 2. Missing quotes: if ($host = example.com) should be if ($host = 'example.com')
# 3. Wrong operator placement

# Let's identify the exact issue on line 11
LINE11=$(sed -n '11p' "$NGINX_CONFIG")
echo "Line 11 content: $LINE11"

# Check if it's an if statement with '=' comparison issue
if echo "$LINE11" | grep -q 'if.*='; then
    echo -e "${YELLOW}Found if statement with '=' comparison${NC}"
    
    # Common fix: The nginx if statement syntax should be:
    # if ($variable = value) { } - for exact match
    # if ($variable ~* "regex") { } - for regex match
    
    # Fix: Ensure proper spacing and syntax
    # Pattern: if($host = value) -> if ($host = value)
    sed -i 's/if(\$/if (\$/g' "$NGINX_CONFIG"
    
    # Pattern: if ( $host='value') -> if ($host = 'value')
    sed -i "s/if *( *\\\$\([a-zA-Z_]*\) *= *'\([^']*\)' *)/if (\$\1 = '\2')/g" "$NGINX_CONFIG"
    
    # Pattern: if ( $host="value") -> if ($host = "value")
    sed -i 's/if *( *\$\([a-zA-Z_]*\) *= *"\([^"]*\)" *)/if ($\1 = "\2")/g' "$NGINX_CONFIG"
    
    # Pattern: if ($host= value) -> if ($host = value)
    sed -i 's/\$\([a-zA-Z_]*\)= /\$\1 = /g' "$NGINX_CONFIG"
    sed -i 's/ =\([^ ]\)/ = \1/g' "$NGINX_CONFIG"
fi

# Additional fix: Sometimes the issue is using '=' without proper context
# In nginx, '=' in if statements must be used correctly
# Fix common mistakes where '==' is used instead of '='
sed -i 's/== /= /g' "$NGINX_CONFIG"
sed -i 's/ ==/ =/g' "$NGINX_CONFIG"

echo ""
echo -e "${BLUE}Updated config around line 11:${NC}"
echo -e "${YELLOW}========================================${NC}"
sed -n '1,20p' "$NGINX_CONFIG" | nl
echo -e "${YELLOW}========================================${NC}"

# Step 5: Test nginx config
echo ""
echo -e "${BLUE}[Step 5/5] Testing nginx configuration...${NC}"
nginx -t 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration test passed!${NC}"
    echo ""
    echo -e "${YELLOW}Restarting nginx...${NC}"
    systemctl restart nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Nginx restarted successfully!${NC}"
        systemctl status nginx --no-pager
    else
        echo -e "${RED}✗ Failed to restart nginx${NC}"
        echo "Restoring backup..."
        cp "$NGINX_BACKUP" "$NGINX_CONFIG"
        echo "Please check the logs: journalctl -xe"
    fi
else
    echo -e "${RED}✗ Nginx configuration test failed!${NC}"
    echo ""
    echo -e "${YELLOW}The automatic fix didn't work. Manual inspection needed.${NC}"
    echo ""
    echo "Common nginx if statement issues:"
    echo "1. Wrong:  if (\$host = value)     -> Correct: if (\$host = 'value')"
    echo "2. Wrong:  if (\$request_uri = /path) -> Correct: if (\$request_uri = '/path')"
    echo "3. Wrong:  if (\$arg = '')          -> Consider using: if (\$arg = '')"
    echo ""
    echo "Restoring backup..."
    cp "$NGINX_BACKUP" "$NGINX_CONFIG"
    echo -e "${GREEN}✓ Backup restored${NC}"
    echo ""
    echo "Please manually inspect the config:"
    echo "  nano $NGINX_CONFIG"
    echo ""
    echo "After fixing, test with:"
    echo "  nginx -t"
    echo "  systemctl restart nginx"
fi

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Nginx Fix Script Complete${NC}"
echo -e "${YELLOW}========================================${NC}"