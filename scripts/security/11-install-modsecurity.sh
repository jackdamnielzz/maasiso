#!/bin/bash
#############################################
# ModSecurity Web Application Firewall Installation
# Purpose: Block SQL injection, XSS, and other web attacks
# Run as: sudo bash 11-install-modsecurity.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  ModSecurity WAF Installation${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${BLUE}[1/6] Installing dependencies...${NC}"
apt-get update -qq
apt-get install -y libmodsecurity3 libmodsecurity-dev nginx-plus-module-modsecurity 2>/dev/null || {
    # If nginx-plus module not available, install from source requirements
    apt-get install -y git build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev \
        libssl-dev libgd-dev libgeoip-dev libyajl-dev libcurl4-openssl-dev \
        liblmdb-dev libxml2-dev
}
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 2: Install ModSecurity v3 for Nginx
echo ""
echo -e "${BLUE}[2/6] Installing ModSecurity...${NC}"

# Check if modsecurity-nginx connector exists
if [ ! -d "/opt/ModSecurity-nginx" ]; then
    cd /opt
    git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git 2>/dev/null || {
        echo -e "${YELLOW}ModSecurity-nginx already downloaded or unavailable${NC}"
    }
fi

# Install libmodsecurity if not already installed
apt-get install -y libmodsecurity3 2>/dev/null || {
    echo -e "${YELLOW}Building ModSecurity from source...${NC}"
    cd /opt
    if [ ! -d "ModSecurity" ]; then
        git clone --depth 1 -b v3/master https://github.com/SpiderLabs/ModSecurity
    fi
    cd ModSecurity
    git submodule init
    git submodule update
    ./build.sh
    ./configure
    make -j$(nproc)
    make install
}

echo -e "${GREEN}✓ ModSecurity installed${NC}"

# Step 3: Download OWASP Core Rule Set
echo ""
echo -e "${BLUE}[3/6] Installing OWASP Core Rule Set...${NC}"

CRS_DIR="/etc/nginx/modsec/coreruleset"
mkdir -p /etc/nginx/modsec

if [ ! -d "$CRS_DIR" ]; then
    cd /etc/nginx/modsec
    git clone https://github.com/coreruleset/coreruleset.git
    cd coreruleset
    cp crs-setup.conf.example crs-setup.conf
fi

echo -e "${GREEN}✓ OWASP CRS installed${NC}"

# Step 4: Configure ModSecurity
echo ""
echo -e "${BLUE}[4/6] Configuring ModSecurity...${NC}"

# Create main ModSecurity configuration
cat > /etc/nginx/modsec/modsecurity.conf << 'EOF'
# ModSecurity Configuration for MaasISO
# Based on recommended settings

# Enable ModSecurity
SecRuleEngine On

# Request body handling
SecRequestBodyAccess On
SecRequestBodyLimit 13107200
SecRequestBodyNoFilesLimit 131072
SecRequestBodyLimitAction Reject

# Response body handling (optional, can impact performance)
SecResponseBodyAccess Off

# Temporary files
SecTmpDir /tmp/
SecDataDir /var/cache/modsecurity/

# Audit logging
SecAuditEngine RelevantOnly
SecAuditLogRelevantStatus "^(?:5|4(?!04))"
SecAuditLogParts ABIJDEFHZ
SecAuditLogType Serial
SecAuditLog /var/log/modsecurity/audit.log

# Debug logging (disable in production)
SecDebugLog /var/log/modsecurity/debug.log
SecDebugLogLevel 0

# Default action
SecDefaultAction "phase:1,log,auditlog,pass"
SecDefaultAction "phase:2,log,auditlog,pass"

# Argument handling
SecArgumentSeparator &
SecCookieFormat 0

# Unicode mapping
SecUnicodeMapFile unicode.mapping 20127

# Status code on block
SecRuleEngine On
SecStatusEngine On

# Include OWASP CRS
Include /etc/nginx/modsec/coreruleset/crs-setup.conf
Include /etc/nginx/modsec/coreruleset/rules/*.conf
EOF

# Create unicode mapping file
cat > /etc/nginx/modsec/unicode.mapping << 'EOF'
# Minimal unicode mapping
EOF

# Create directories
mkdir -p /var/cache/modsecurity
mkdir -p /var/log/modsecurity
chown www-data:www-data /var/cache/modsecurity
chown www-data:www-data /var/log/modsecurity

echo -e "${GREEN}✓ ModSecurity configured${NC}"

# Step 5: Create Nginx include file
echo ""
echo -e "${BLUE}[5/6] Creating Nginx integration...${NC}"

cat > /etc/nginx/snippets/modsecurity.conf << 'EOF'
# ModSecurity Integration
# Include in location blocks: include snippets/modsecurity.conf;

modsecurity on;
modsecurity_rules_file /etc/nginx/modsec/modsecurity.conf;
EOF

# Create a sample site configuration with ModSecurity
cat > /etc/nginx/sites-available/maasiso.nl.modsec << 'EOF'
# MaasISO Frontend with ModSecurity WAF
# Copy relevant parts to your existing config

server {
    listen 443 ssl http2;
    server_name maasiso.nl www.maasiso.nl;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/maasiso.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maasiso.nl/privkey.pem;
    
    # Enable ModSecurity (uncomment after testing)
    # modsecurity on;
    # modsecurity_rules_file /etc/nginx/modsec/modsecurity.conf;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo -e "${GREEN}✓ Nginx integration created${NC}"

# Step 6: Create management script
echo ""
echo -e "${BLUE}[6/6] Creating management tools...${NC}"

cat > /usr/local/bin/modsec-status << 'EOF'
#!/bin/bash
#############################################
# ModSecurity Management Tool
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

case "$1" in
    logs)
        echo -e "${BLUE}=== Recent ModSecurity Blocks ===${NC}"
        tail -50 /var/log/modsecurity/audit.log 2>/dev/null || echo "No audit logs yet"
        ;;
    alerts)
        echo -e "${BLUE}=== ModSecurity Alerts Today ===${NC}"
        grep "$(date +%Y-%m-%d)" /var/log/modsecurity/audit.log 2>/dev/null | \
            grep -oP 'id "\K[^"]+' | sort | uniq -c | sort -rn | head -20
        ;;
    rules)
        echo -e "${BLUE}=== Active Rule Files ===${NC}"
        ls -la /etc/nginx/modsec/coreruleset/rules/*.conf | wc -l
        echo "rule files loaded"
        ;;
    test)
        echo -e "${YELLOW}Testing ModSecurity with SQLi probe...${NC}"
        curl -s "http://localhost/?id=1'%20OR%20'1'='1" -o /dev/null -w "%{http_code}\n"
        echo "200 = not blocked, 403 = blocked (WAF working)"
        ;;
    disable)
        echo -e "${YELLOW}Disabling ModSecurity...${NC}"
        sed -i 's/SecRuleEngine On/SecRuleEngine Off/' /etc/nginx/modsec/modsecurity.conf
        nginx -t && systemctl reload nginx
        echo -e "${GREEN}ModSecurity disabled${NC}"
        ;;
    enable)
        echo -e "${YELLOW}Enabling ModSecurity...${NC}"
        sed -i 's/SecRuleEngine Off/SecRuleEngine On/' /etc/nginx/modsec/modsecurity.conf
        nginx -t && systemctl reload nginx
        echo -e "${GREEN}ModSecurity enabled${NC}"
        ;;
    *)
        echo "ModSecurity Management Tool"
        echo ""
        echo "Usage: modsec-status [command]"
        echo ""
        echo "Commands:"
        echo "  logs    - View recent audit logs"
        echo "  alerts  - Show today's blocked attacks"
        echo "  rules   - Show loaded rules count"
        echo "  test    - Test WAF with SQLi probe"
        echo "  enable  - Enable ModSecurity"
        echo "  disable - Disable ModSecurity"
        echo ""
        ;;
esac
EOF
chmod +x /usr/local/bin/modsec-status

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  ModSecurity Installation Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${RED}IMPORTANT: ModSecurity is installed but NOT enabled yet${NC}"
echo ""
echo -e "${BLUE}To enable ModSecurity:${NC}"
echo "  1. Add to your nginx server block:"
echo "     modsecurity on;"
echo "     modsecurity_rules_file /etc/nginx/modsec/modsecurity.conf;"
echo ""
echo "  2. Test configuration: nginx -t"
echo "  3. Reload nginx: systemctl reload nginx"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  modsec-status logs    - View audit logs"
echo "  modsec-status alerts  - View blocked attacks"
echo "  modsec-status test    - Test WAF"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  /var/log/modsecurity/audit.log"
echo "  /var/log/modsecurity/debug.log"
echo ""
echo -e "${YELLOW}Note: Test thoroughly in DetectionOnly mode first!${NC}"
echo "Set 'SecRuleEngine DetectionOnly' to log without blocking"