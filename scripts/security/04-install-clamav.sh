#!/bin/bash
#############################################
# ClamAV Installation and Configuration Script
# Purpose: Install ClamAV antivirus for malware scanning
# Run on each server as: sudo bash 04-install-clamav.sh
#############################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  ClamAV Installation & Configuration${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root${NC}"
    echo "Please run: sudo bash $0"
    exit 1
fi

# Step 1: Update package lists
echo -e "${BLUE}[Step 1/7] Updating package lists...${NC}"
apt-get update -qq
echo -e "${GREEN}✓ Package lists updated${NC}"

# Step 2: Install ClamAV
echo ""
echo -e "${BLUE}[Step 2/7] Installing ClamAV...${NC}"
apt-get install -y clamav clamav-daemon clamav-freshclam
echo -e "${GREEN}✓ ClamAV installed${NC}"

# Step 3: Stop freshclam for initial setup
echo ""
echo -e "${BLUE}[Step 3/7] Configuring ClamAV services...${NC}"
systemctl stop clamav-freshclam 2>/dev/null || true

# Step 4: Update virus definitions
echo ""
echo -e "${BLUE}[Step 4/7] Updating virus definitions...${NC}"
echo "This may take a few minutes..."
freshclam
echo -e "${GREEN}✓ Virus definitions updated${NC}"

# Step 5: Configure ClamAV daemon
echo ""
echo -e "${BLUE}[Step 5/7] Configuring ClamAV daemon...${NC}"

# Create/update clamd config for better performance
CLAMD_CONF="/etc/clamav/clamd.conf"
if [ -f "$CLAMD_CONF" ]; then
    # Ensure local socket is enabled
    sed -i 's/^#LocalSocket /LocalSocket /' "$CLAMD_CONF" 2>/dev/null || true
    
    # Enable scan of large files (up to 100MB)
    if ! grep -q "^MaxFileSize" "$CLAMD_CONF"; then
        echo "MaxFileSize 100M" >> "$CLAMD_CONF"
    fi
    
    # Enable scanning of archives
    if ! grep -q "^ScanArchive" "$CLAMD_CONF"; then
        echo "ScanArchive yes" >> "$CLAMD_CONF"
    fi
fi

# Start services
systemctl start clamav-freshclam
systemctl start clamav-daemon
systemctl enable clamav-freshclam
systemctl enable clamav-daemon

echo -e "${GREEN}✓ ClamAV daemon configured and started${NC}"

# Step 6: Create scanning scripts
echo ""
echo -e "${BLUE}[Step 6/7] Creating scheduled scan scripts...${NC}"

# Create daily quick scan script
cat > /etc/cron.daily/clamav-scan-quick << 'EOF'
#!/bin/bash
#############################################
# Daily Quick ClamAV Scan
# Scans critical directories only
#############################################

LOG_FILE="/var/log/clamav/daily-scan.log"
SCAN_DIRS="/var/www /tmp /home /root"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "========================================" >> "$LOG_FILE"
echo "ClamAV Daily Quick Scan - $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Run scan
clamscan --infected --recursive --exclude-dir="^/sys|^/proc|^/dev" \
    --log="$LOG_FILE" \
    $SCAN_DIRS

# Check if infected files found
INFECTED=$(grep "Infected files:" "$LOG_FILE" | tail -1 | awk '{print $3}')
if [ "$INFECTED" -gt 0 ] 2>/dev/null; then
    echo "WARNING: $INFECTED infected files found!" >> "$LOG_FILE"
    # Send alert (customize as needed)
    echo "ClamAV Alert: $INFECTED infected files found on $(hostname)" | mail -s "ClamAV Alert - $(hostname)" root 2>/dev/null || true
fi

echo "Scan completed at $(date +"%Y-%m-%d %H:%M:%S")" >> "$LOG_FILE"
EOF
chmod +x /etc/cron.daily/clamav-scan-quick

# Create weekly full scan script
cat > /etc/cron.weekly/clamav-scan-full << 'EOF'
#!/bin/bash
#############################################
# Weekly Full ClamAV Scan
# Full system scan (excludes virtual filesystems)
#############################################

LOG_FILE="/var/log/clamav/weekly-scan.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "========================================" >> "$LOG_FILE"
echo "ClamAV Weekly Full Scan - $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Run full system scan
clamscan --infected --recursive \
    --exclude-dir="^/sys" \
    --exclude-dir="^/proc" \
    --exclude-dir="^/dev" \
    --exclude-dir="^/run" \
    --exclude-dir="^/snap" \
    --log="$LOG_FILE" \
    /

# Check if infected files found
INFECTED=$(grep "Infected files:" "$LOG_FILE" | tail -1 | awk '{print $3}')
if [ "$INFECTED" -gt 0 ] 2>/dev/null; then
    echo "WARNING: $INFECTED infected files found!" >> "$LOG_FILE"
    # Send alert (customize as needed)
    echo "ClamAV Alert: $INFECTED infected files found on $(hostname) during weekly scan" | mail -s "ClamAV Weekly Alert - $(hostname)" root 2>/dev/null || true
fi

echo "Scan completed at $(date +"%Y-%m-%d %H:%M:%S")" >> "$LOG_FILE"
EOF
chmod +x /etc/cron.weekly/clamav-scan-full

# Create manual scan helper script
cat > /usr/local/bin/clamscan-maasiso << 'EOF'
#!/bin/bash
#############################################
# MaasISO ClamAV Manual Scan Helper
# Usage: clamscan-maasiso [quick|full|path]
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

show_help() {
    echo "MaasISO ClamAV Scanner"
    echo ""
    echo "Usage: clamscan-maasiso [option]"
    echo ""
    echo "Options:"
    echo "  quick    - Quick scan of /var/www, /tmp, /home, /root"
    echo "  full     - Full system scan (takes longer)"
    echo "  web      - Scan only web directories (/var/www)"
    echo "  <path>   - Scan specific directory or file"
    echo "  help     - Show this help"
    echo ""
}

case "$1" in
    quick)
        echo -e "${YELLOW}Starting quick scan...${NC}"
        clamscan --infected --recursive /var/www /tmp /home /root
        ;;
    full)
        echo -e "${YELLOW}Starting full system scan (this may take a while)...${NC}"
        clamscan --infected --recursive --exclude-dir="^/sys|^/proc|^/dev|^/run|^/snap" /
        ;;
    web)
        echo -e "${YELLOW}Scanning web directories...${NC}"
        clamscan --infected --recursive /var/www
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        if [ -e "$1" ]; then
            echo -e "${YELLOW}Scanning: $1${NC}"
            clamscan --infected --recursive "$1"
        else
            echo -e "${RED}Path not found: $1${NC}"
            show_help
            exit 1
        fi
        ;;
esac

echo ""
echo -e "${GREEN}Scan complete!${NC}"
EOF
chmod +x /usr/local/bin/clamscan-maasiso

# Create log directory
mkdir -p /var/log/clamav
chown clamav:clamav /var/log/clamav

echo -e "${GREEN}✓ Scheduled scan scripts created${NC}"
echo "  - Daily quick scan: /etc/cron.daily/clamav-scan-quick"
echo "  - Weekly full scan: /etc/cron.weekly/clamav-scan-full"
echo "  - Manual scan tool: clamscan-maasiso"

# Step 7: Run initial scan
echo ""
echo -e "${BLUE}[Step 7/7] Running initial quick scan...${NC}"
echo "Scanning /var/www and /tmp..."

# Quick initial scan
clamscan --infected --recursive /var/www /tmp 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Initial scan complete - No threats found${NC}"
elif [ $? -eq 1 ]; then
    echo -e "${RED}⚠ Infected files found! Review output above.${NC}"
else
    echo -e "${YELLOW}⚠ Scan completed with warnings${NC}"
fi

# Show status
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  ClamAV Installation Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Services status:"
systemctl status clamav-freshclam --no-pager -l | head -5
echo ""
systemctl status clamav-daemon --no-pager -l | head -5
echo ""
echo -e "${BLUE}Quick Commands:${NC}"
echo "  clamscan-maasiso quick  - Run quick scan"
echo "  clamscan-maasiso full   - Run full system scan"
echo "  clamscan-maasiso web    - Scan web directories only"
echo "  clamscan /path/to/scan  - Scan specific path"
echo ""
echo -e "${BLUE}Scheduled Scans:${NC}"
echo "  Daily: Quick scan of /var/www, /tmp, /home, /root"
echo "  Weekly: Full system scan"
echo ""
echo -e "${BLUE}Log Files:${NC}"
echo "  /var/log/clamav/daily-scan.log"
echo "  /var/log/clamav/weekly-scan.log"
echo "  /var/log/clamav/freshclam.log"