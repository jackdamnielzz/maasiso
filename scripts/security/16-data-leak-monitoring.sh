#!/bin/bash
#############################################
# Data Leak & Breach Monitoring Script
# Purpose: Monitor for exposed credentials and data leaks
# Run as: sudo bash 16-data-leak-monitoring.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Data Leak & Credential Monitoring${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Install required tools
echo -e "${BLUE}[1/4] Installing monitoring tools...${NC}"
apt-get update -qq
apt-get install -y git python3-pip jq curl
pip3 install requests --quiet 2>/dev/null || true
echo -e "${GREEN}✓ Tools installed${NC}"

# Step 2: Create credential scanning scripts
echo ""
echo -e "${BLUE}[2/4] Creating credential scanning scripts...${NC}"

mkdir -p /opt/security-tools
mkdir -p /var/log/security/leaks

# Script to scan for hardcoded secrets in code
cat > /usr/local/bin/scan-secrets << 'EOF'
#!/bin/bash
#############################################
# Scan for Hardcoded Secrets in Code
# Finds API keys, passwords, tokens in source
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCAN_DIR="${1:-/var/www}"
REPORT_FILE="/var/log/security/leaks/secrets-scan-$(date +%Y%m%d).txt"

echo "Scanning $SCAN_DIR for hardcoded secrets..."
echo "Report: $REPORT_FILE"
echo ""

# Patterns to search for
PATTERNS=(
    # API Keys
    'api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}'
    'apikey["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}'
    
    # AWS
    'AKIA[0-9A-Z]{16}'
    'aws[_-]?secret[_-]?access[_-]?key'
    
    # Private keys
    '-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----'
    '-----BEGIN PRIVATE KEY-----'
    
    # Passwords
    'password["\s]*[:=]["\s]*[^${\n]{8,}'
    'passwd["\s]*[:=]["\s]*[^${\n]{8,}'
    'pwd["\s]*[:=]["\s]*[^${\n]{8,}'
    
    # Database strings
    'mysql://[^"'\''<>\s]+'
    'postgres://[^"'\''<>\s]+'
    'mongodb://[^"'\''<>\s]+'
    'redis://[^"'\''<>\s]+'
    
    # JWT/Tokens
    'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.'
    'bearer["\s]+[a-zA-Z0-9_-]{20,}'
    
    # Stripe
    'sk_live_[a-zA-Z0-9]{24,}'
    'pk_live_[a-zA-Z0-9]{24,}'
    
    # Slack
    'xox[baprs]-[0-9a-zA-Z-]+'
    
    # GitHub
    'ghp_[a-zA-Z0-9]{36}'
    'github_pat_[a-zA-Z0-9_]{22,}'
    
    # Generic secrets
    'secret["\s]*[:=]["\s]*[a-zA-Z0-9]{16,}'
    'token["\s]*[:=]["\s]*[a-zA-Z0-9]{16,}'
)

{
    echo "=========================================="
    echo "Secret Scan Report - $(date)"
    echo "Directory: $SCAN_DIR"
    echo "=========================================="
    echo ""
    
    FOUND=0
    
    for pattern in "${PATTERNS[@]}"; do
        echo "Checking pattern: ${pattern:0:40}..."
        matches=$(grep -rniE "$pattern" "$SCAN_DIR" \
            --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" \
            --include="*.py" --include="*.php" --include="*.rb" \
            --include="*.json" --include="*.yml" --include="*.yaml" \
            --include="*.env*" --include="*.conf" --include="*.config" \
            --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor \
            2>/dev/null || true)
        
        if [ -n "$matches" ]; then
            echo ""
            echo "=== POTENTIAL SECRET FOUND ==="
            echo "Pattern: $pattern"
            echo "$matches" | head -20
            echo ""
            FOUND=$((FOUND + 1))
        fi
    done
    
    echo ""
    echo "=========================================="
    echo "Scan complete. Potential issues: $FOUND"
    echo "=========================================="
    
} | tee "$REPORT_FILE"

if [ $FOUND -gt 0 ]; then
    echo -e "${RED}WARNING: Potential secrets found! Review $REPORT_FILE${NC}"
    exit 1
else
    echo -e "${GREEN}No obvious secrets found.${NC}"
fi
EOF
chmod +x /usr/local/bin/scan-secrets

# Script to check for exposed .env and config files
cat > /usr/local/bin/check-exposed-files << 'EOF'
#!/bin/bash
#############################################
# Check for Publicly Exposed Config Files
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="${1:-localhost}"

echo "Checking for exposed sensitive files on $DOMAIN..."
echo ""

# Files that should never be publicly accessible
SENSITIVE_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    ".git/config"
    ".git/HEAD"
    ".gitignore"
    "wp-config.php"
    "config.php"
    "database.yml"
    ".htaccess"
    ".htpasswd"
    "composer.json"
    "package.json"
    "Gemfile"
    ".DS_Store"
    "server.key"
    "server.crt"
    "id_rsa"
    "id_rsa.pub"
    ".bash_history"
    ".mysql_history"
    "dump.sql"
    "backup.sql"
    "phpinfo.php"
    "info.php"
    "test.php"
    "debug.php"
)

EXPOSED=0

for file in "${SENSITIVE_FILES[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/$file" 2>/dev/null)
    
    if [ "$response" == "200" ]; then
        echo -e "${RED}EXPOSED: $file (HTTP 200)${NC}"
        EXPOSED=$((EXPOSED + 1))
    fi
done

echo ""
if [ $EXPOSED -gt 0 ]; then
    echo -e "${RED}WARNING: $EXPOSED sensitive files are publicly accessible!${NC}"
    echo "Add these to nginx deny rules or remove them from webroot."
    exit 1
else
    echo -e "${GREEN}No sensitive files exposed publicly.${NC}"
fi
EOF
chmod +x /usr/local/bin/check-exposed-files

# Script to check Have I Been Pwned
cat > /usr/local/bin/check-breach << 'EOF'
#!/bin/bash
#############################################
# Check Email in Data Breaches
# Uses Have I Been Pwned API
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo "Usage: check-breach <email>"
    echo ""
    echo "Checks if an email appears in known data breaches."
    exit 1
fi

EMAIL="$1"

echo "Checking $EMAIL in breach databases..."
echo ""

# Check Have I Been Pwned (requires API key for full access)
# Free endpoint for pwned passwords
echo -e "${YELLOW}Note: Full HIBP API requires subscription.${NC}"
echo "Check manually at: https://haveibeenpwned.com/account/$EMAIL"
echo ""

# Check password breach (SHA1 k-anonymity)
echo "To check if a password is breached:"
echo "1. Generate SHA1 of password"
echo "2. Send first 5 chars to API"
echo "3. Check if full hash in response"
echo ""
echo "Tool: https://haveibeenpwned.com/Passwords"
EOF
chmod +x /usr/local/bin/check-breach

echo -e "${GREEN}✓ Credential scanning scripts created${NC}"

# Step 3: Create server info exposure checker
echo ""
echo -e "${BLUE}[3/4] Creating server exposure checker...${NC}"

cat > /usr/local/bin/check-server-exposure << 'EOF'
#!/bin/bash
#############################################
# Check Server Information Exposure
# Identifies leaked server details
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="${1:-localhost}"

echo "Checking server information exposure for $DOMAIN..."
echo ""

# Check HTTP headers
echo -e "${BLUE}=== HTTP Headers ===${NC}"
headers=$(curl -sI "https://$DOMAIN" 2>/dev/null)

# Server header
server=$(echo "$headers" | grep -i "^server:" | cut -d: -f2-)
if [ -n "$server" ]; then
    echo -e "${YELLOW}Server header:$server${NC}"
    echo "  Consider hiding version info"
else
    echo -e "${GREEN}✓ Server header hidden${NC}"
fi

# X-Powered-By
powered=$(echo "$headers" | grep -i "^x-powered-by:" | cut -d: -f2-)
if [ -n "$powered" ]; then
    echo -e "${YELLOW}X-Powered-By:$powered${NC}"
    echo "  Consider removing this header"
else
    echo -e "${GREEN}✓ X-Powered-By hidden${NC}"
fi

# PHP version exposure
phpver=$(echo "$headers" | grep -i "^x-php-version:" | cut -d: -f2-)
if [ -n "$phpver" ]; then
    echo -e "${RED}PHP Version exposed:$phpver${NC}"
fi

echo ""
echo -e "${BLUE}=== Security Headers ===${NC}"

# Check security headers
check_header() {
    local header="$1"
    local value=$(echo "$headers" | grep -i "^$header:" | cut -d: -f2-)
    if [ -n "$value" ]; then
        echo -e "${GREEN}✓ $header: present${NC}"
    else
        echo -e "${RED}✗ $header: MISSING${NC}"
    fi
}

check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "X-XSS-Protection"
check_header "Strict-Transport-Security"
check_header "Content-Security-Policy"
check_header "Referrer-Policy"
check_header "Permissions-Policy"

echo ""
echo -e "${BLUE}=== DNS Records ===${NC}"
echo "A records:"
dig +short A "$DOMAIN" 2>/dev/null || echo "Could not resolve"
echo ""
echo "MX records:"
dig +short MX "$DOMAIN" 2>/dev/null || echo "No MX records"
echo ""
echo "TXT records (may expose SPF/DKIM):"
dig +short TXT "$DOMAIN" 2>/dev/null | head -5 || echo "No TXT records"

echo ""
echo -e "${BLUE}=== SSL Certificate ===${NC}"
cert_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN":443 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null)
if [ -n "$cert_info" ]; then
    echo "$cert_info"
else
    echo "Could not retrieve certificate info"
fi
EOF
chmod +x /usr/local/bin/check-server-exposure

echo -e "${GREEN}✓ Server exposure checker created${NC}"

# Step 4: Set up scheduled scanning
echo ""
echo -e "${BLUE}[4/4] Setting up scheduled scans...${NC}"

# Weekly secret scan
cat > /etc/cron.weekly/security-leak-scan << 'EOF'
#!/bin/bash
# Weekly security scan for leaked secrets

LOG_FILE="/var/log/security/leaks/weekly-scan-$(date +%Y%m%d).log"

{
    echo "=========================================="
    echo "Weekly Security Leak Scan - $(date)"
    echo "=========================================="
    
    echo ""
    echo "=== Scanning for hardcoded secrets ==="
    /usr/local/bin/scan-secrets /var/www
    
    echo ""
    echo "=== Checking exposed files ==="
    # Add your domain here
    # /usr/local/bin/check-exposed-files maasiso.nl
    
    echo ""
    echo "=== Scan complete ==="
    
} >> "$LOG_FILE" 2>&1
EOF
chmod +x /etc/cron.weekly/security-leak-scan

echo -e "${GREEN}✓ Scheduled scanning configured${NC}"

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Data Leak Monitoring Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Tools available:${NC}"
echo "  scan-secrets <dir>        - Scan code for hardcoded secrets"
echo "  check-exposed-files <domain> - Check for exposed config files"
echo "  check-breach <email>      - Check email in breach databases"
echo "  check-server-exposure <domain> - Check server info leakage"
echo ""
echo -e "${BLUE}Scheduled:${NC}"
echo "  Weekly: Secret scan of /var/www"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  /var/log/security/leaks/"
echo ""
echo -e "${YELLOW}Recommendation:${NC}"
echo "  1. Run scan-secrets on your codebase"
echo "  2. Check if your email is in breaches"
echo "  3. Review server exposure with check-server-exposure"