#!/bin/bash
#############################################
# AIDE File Integrity Monitoring Installation
# Purpose: Detect unauthorized file changes
# Run as: sudo bash 08-install-aide.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  AIDE File Integrity Monitoring${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Install AIDE
echo -e "${BLUE}[1/5] Installing AIDE...${NC}"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y aide
echo -e "${GREEN}✓ AIDE installed${NC}"

# Step 2: Configure AIDE
echo ""
echo -e "${BLUE}[2/5] Configuring AIDE...${NC}"

# Create custom AIDE configuration
cat > /etc/aide/aide.conf.d/99_maasiso_rules << 'EOF'
# MaasISO Custom AIDE Rules
# Monitor critical directories for unauthorized changes

# Web application files (detect tampering)
/var/www CONTENT_EX

# Nginx configuration (detect config changes like xss.pro redirect)
/etc/nginx CONTENT_EX

# System binaries
/usr/bin CONTENT_EX
/usr/sbin CONTENT_EX
/bin CONTENT_EX
/sbin CONTENT_EX

# Critical system files
/etc/passwd CONTENT_EX
/etc/shadow CONTENT_EX
/etc/group CONTENT_EX
/etc/sudoers CONTENT_EX
/etc/ssh/sshd_config CONTENT_EX

# Systemd services (detect malicious services like system-update-service)
/etc/systemd/system CONTENT_EX
/lib/systemd/system CONTENT_EX

# Cron directories (detect persistence mechanisms)
/etc/cron.d CONTENT_EX
/etc/cron.daily CONTENT_EX
/etc/cron.hourly CONTENT_EX
/etc/cron.weekly CONTENT_EX
/etc/cron.monthly CONTENT_EX
/var/spool/cron CONTENT_EX

# SSH authorized keys (detect backdoor keys)
/root/.ssh CONTENT_EX
/home CONTENT_EX

# Exclude frequently changing files
!/var/www/.*/\.next/cache
!/var/log
!/var/tmp
!/tmp
!/proc
!/sys
!/run
!/dev
EOF

# Update AIDE configuration
update-aide.conf
echo -e "${GREEN}✓ AIDE configured${NC}"

# Step 3: Initialize AIDE database
echo ""
echo -e "${BLUE}[3/5] Initializing AIDE database (this takes several minutes)...${NC}"
echo "Creating baseline of all monitored files..."

# Initialize the database
aideinit

# Move the new database to be the active database
if [ -f /var/lib/aide/aide.db.new ]; then
    mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
fi

echo -e "${GREEN}✓ AIDE database initialized${NC}"

# Step 4: Create scheduled checks
echo ""
echo -e "${BLUE}[4/5] Setting up scheduled integrity checks...${NC}"

# Create daily AIDE check script
cat > /etc/cron.daily/aide-check << 'EOF'
#!/bin/bash
#############################################
# Daily AIDE Integrity Check
#############################################

LOG_FILE="/var/log/aide/aide-check.log"
REPORT_FILE="/var/log/aide/aide-report-$(date +%Y%m%d).txt"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Create log directory if needed
mkdir -p /var/log/aide

echo "========================================" >> "$LOG_FILE"
echo "AIDE Integrity Check - $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Run AIDE check
aide --check > "$REPORT_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "No changes detected" >> "$LOG_FILE"
elif [ $EXIT_CODE -eq 4 ]; then
    echo "WARNING: File changes detected!" >> "$LOG_FILE"
    echo "See report: $REPORT_FILE" >> "$LOG_FILE"
    
    # Log to syslog for external monitoring
    logger -t aide -p security.warning "AIDE detected file changes - see $REPORT_FILE"
    
    # Count changes
    ADDED=$(grep -c "^Added:" "$REPORT_FILE" 2>/dev/null || echo "0")
    REMOVED=$(grep -c "^Removed:" "$REPORT_FILE" 2>/dev/null || echo "0")
    CHANGED=$(grep -c "^Changed:" "$REPORT_FILE" 2>/dev/null || echo "0")
    
    echo "Summary: Added=$ADDED, Removed=$REMOVED, Changed=$CHANGED" >> "$LOG_FILE"
else
    echo "AIDE check failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

echo "Check completed at $(date +"%Y-%m-%d %H:%M:%S")" >> "$LOG_FILE"

# Keep only last 30 days of reports
find /var/log/aide -name "aide-report-*.txt" -mtime +30 -delete 2>/dev/null || true
EOF
chmod +x /etc/cron.daily/aide-check

# Create manual check helper script
cat > /usr/local/bin/aide-check << 'EOF'
#!/bin/bash
#############################################
# AIDE Manual Check Helper
# Usage: aide-check [check|update|init]
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

case "$1" in
    check)
        echo -e "${YELLOW}Running AIDE integrity check...${NC}"
        aide --check
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}No unauthorized changes detected${NC}"
        elif [ $? -eq 4 ]; then
            echo -e "${RED}WARNING: File changes detected!${NC}"
            echo "Review the output above for details."
        fi
        ;;
    update)
        echo -e "${YELLOW}Updating AIDE database with current state...${NC}"
        echo "This will record current file states as the new baseline."
        read -p "Are you sure? (y/N) " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            aide --update
            if [ -f /var/lib/aide/aide.db.new ]; then
                mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
            fi
            echo -e "${GREEN}Database updated${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    init)
        echo -e "${YELLOW}Reinitializing AIDE database...${NC}"
        echo "This will create a fresh baseline."
        read -p "Are you sure? (y/N) " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            aideinit
            if [ -f /var/lib/aide/aide.db.new ]; then
                mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
            fi
            echo -e "${GREEN}Database reinitialized${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    *)
        echo "AIDE File Integrity Checker"
        echo ""
        echo "Usage: aide-check [option]"
        echo ""
        echo "Options:"
        echo "  check   - Check files against database"
        echo "  update  - Update database with current state"
        echo "  init    - Reinitialize database (fresh baseline)"
        echo ""
        ;;
esac
EOF
chmod +x /usr/local/bin/aide-check

# Create log directory
mkdir -p /var/log/aide

echo -e "${GREEN}✓ Scheduled checks configured${NC}"

# Step 5: Run initial check
echo ""
echo -e "${BLUE}[5/5] Running initial integrity check...${NC}"
aide --check || true

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  AIDE Setup Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  aide-check check   - Check for unauthorized changes"
echo "  aide-check update  - Update baseline after legitimate changes"
echo "  aide-check init    - Reinitialize database"
echo ""
echo -e "${BLUE}Scheduled:${NC}"
echo "  Daily: Integrity check with logging"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  /var/log/aide/aide-check.log"
echo "  /var/log/aide/aide-report-*.txt"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC}"
echo "After making legitimate changes (nginx config, deployments),"
echo "run 'aide-check update' to update the baseline."