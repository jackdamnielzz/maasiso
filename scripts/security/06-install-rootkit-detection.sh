#!/bin/bash
#############################################
# Rootkit Detection Installation Script
# Purpose: Install rkhunter and chkrootkit for rootkit scanning
# Run as: sudo bash 06-install-rootkit-detection.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Rootkit Detection Installation${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Update packages
echo -e "${BLUE}[1/5] Updating package lists...${NC}"
apt-get update -qq
echo -e "${GREEN}✓ Package lists updated${NC}"

# Step 2: Install rkhunter
echo ""
echo -e "${BLUE}[2/5] Installing rkhunter...${NC}"
DEBIAN_FRONTEND=noninteractive apt-get install -y rkhunter
echo -e "${GREEN}✓ rkhunter installed${NC}"

# Step 3: Install chkrootkit
echo ""
echo -e "${BLUE}[3/5] Installing chkrootkit...${NC}"
DEBIAN_FRONTEND=noninteractive apt-get install -y chkrootkit
echo -e "${GREEN}✓ chkrootkit installed${NC}"

# Step 4: Configure rkhunter
echo ""
echo -e "${BLUE}[4/5] Configuring rkhunter...${NC}"

# Update rkhunter database
rkhunter --update || true

# Set up rkhunter configuration
RKHUNTER_CONF="/etc/rkhunter.conf"
if [ -f "$RKHUNTER_CONF" ]; then
    # Allow script whitelisting for false positives
    sed -i 's/^#SCRIPTWHITELIST=.*/SCRIPTWHITELIST=\/usr\/bin\/egrep/' "$RKHUNTER_CONF" 2>/dev/null || true
    sed -i 's/^#SCRIPTWHITELIST=.*/SCRIPTWHITELIST=\/usr\/bin\/fgrep/' "$RKHUNTER_CONF" 2>/dev/null || true
    sed -i 's/^#SCRIPTWHITELIST=.*/SCRIPTWHITELIST=\/usr\/bin\/which/' "$RKHUNTER_CONF" 2>/dev/null || true
    
    # Enable auto updates
    sed -i 's/^UPDATE_MIRRORS=0/UPDATE_MIRRORS=1/' "$RKHUNTER_CONF" 2>/dev/null || true
    sed -i 's/^MIRRORS_MODE=1/MIRRORS_MODE=0/' "$RKHUNTER_CONF" 2>/dev/null || true
    
    # Disable mail-on-warning (we'll use our own alerting)
    sed -i 's/^MAIL-ON-WARNING=.*/MAIL-ON-WARNING=""/' "$RKHUNTER_CONF" 2>/dev/null || true
fi

# Set baseline for rkhunter
rkhunter --propupd

echo -e "${GREEN}✓ rkhunter configured${NC}"

# Step 5: Create scheduled scanning
echo ""
echo -e "${BLUE}[5/5] Setting up scheduled scans...${NC}"

# Create daily rkhunter scan
cat > /etc/cron.daily/rkhunter-scan << 'EOF'
#!/bin/bash
#############################################
# Daily rkhunter Scan
#############################################

LOG_FILE="/var/log/rkhunter.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "========================================" >> "$LOG_FILE"
echo "rkhunter Scan - $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Run rkhunter scan
/usr/bin/rkhunter --check --skip-keypress --report-warnings-only >> "$LOG_FILE" 2>&1

# Check exit status
if [ $? -ne 0 ]; then
    echo "WARNING: rkhunter found issues - check $LOG_FILE" | logger -t rkhunter
fi

echo "Scan completed at $(date +"%Y-%m-%d %H:%M:%S")" >> "$LOG_FILE"
EOF
chmod +x /etc/cron.daily/rkhunter-scan

# Create weekly chkrootkit scan
cat > /etc/cron.weekly/chkrootkit-scan << 'EOF'
#!/bin/bash
#############################################
# Weekly chkrootkit Scan
#############################################

LOG_FILE="/var/log/chkrootkit.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "========================================" >> "$LOG_FILE"
echo "chkrootkit Scan - $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Run chkrootkit
/usr/sbin/chkrootkit >> "$LOG_FILE" 2>&1

echo "Scan completed at $(date +"%Y-%m-%d %H:%M:%S")" >> "$LOG_FILE"
EOF
chmod +x /etc/cron.weekly/chkrootkit-scan

# Create manual scan helper
cat > /usr/local/bin/rootkit-scan << 'EOF'
#!/bin/bash
#############################################
# Manual Rootkit Scanner
# Usage: rootkit-scan [rkhunter|chkrootkit|both]
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

case "$1" in
    rkhunter)
        echo -e "${YELLOW}Running rkhunter scan...${NC}"
        rkhunter --check --skip-keypress
        ;;
    chkrootkit)
        echo -e "${YELLOW}Running chkrootkit scan...${NC}"
        chkrootkit
        ;;
    both|"")
        echo -e "${YELLOW}Running both scanners...${NC}"
        echo ""
        echo "=== rkhunter ==="
        rkhunter --check --skip-keypress
        echo ""
        echo "=== chkrootkit ==="
        chkrootkit
        ;;
    *)
        echo "Usage: rootkit-scan [rkhunter|chkrootkit|both]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Scan complete!${NC}"
EOF
chmod +x /usr/local/bin/rootkit-scan

echo -e "${GREEN}✓ Scheduled scans configured${NC}"

# Run initial scan
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Running initial rootkit scan...${NC}"
echo -e "${YELLOW}========================================${NC}"

# Quick rkhunter scan
rkhunter --check --skip-keypress --report-warnings-only

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Rootkit Detection Setup Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  rootkit-scan          - Run both scanners"
echo "  rootkit-scan rkhunter - Run rkhunter only"
echo "  rootkit-scan chkrootkit - Run chkrootkit only"
echo ""
echo -e "${BLUE}Scheduled:${NC}"
echo "  Daily: rkhunter scan"
echo "  Weekly: chkrootkit scan"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  /var/log/rkhunter.log"
echo "  /var/log/chkrootkit.log"