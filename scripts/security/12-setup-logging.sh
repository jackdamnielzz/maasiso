#!/bin/bash
#############################################
# Centralized Logging and Monitoring Setup
# Purpose: Better visibility into server activity
# Run as: sudo bash 12-setup-logging.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Logging & Monitoring Setup${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Install logwatch
echo -e "${BLUE}[1/5] Installing Logwatch for daily summaries...${NC}"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y logwatch
echo -e "${GREEN}✓ Logwatch installed${NC}"

# Step 2: Configure logwatch
echo ""
echo -e "${BLUE}[2/5] Configuring Logwatch...${NC}"

mkdir -p /etc/logwatch/conf

cat > /etc/logwatch/conf/logwatch.conf << 'EOF'
# Logwatch Configuration for MaasISO Servers

# Output format: stdout, mail, or file
Output = file
Filename = /var/log/logwatch/daily-report.txt

# Detail level: Low, Med, High
Detail = Med

# Services to monitor
Service = All
# Or specific: Service = sshd, nginx, pam_unix, sudo

# Date range
Range = yesterday

# Mail settings (configure if you want email reports)
# MailTo = admin@maasiso.nl
# MailFrom = logwatch@maasiso.nl

# Format
Format = text
EOF

mkdir -p /var/log/logwatch

echo -e "${GREEN}✓ Logwatch configured${NC}"

# Step 3: Install GoAccess for real-time nginx monitoring
echo ""
echo -e "${BLUE}[3/5] Installing GoAccess for nginx analytics...${NC}"
apt-get install -y goaccess
echo -e "${GREEN}✓ GoAccess installed${NC}"

# Step 4: Configure log rotation
echo ""
echo -e "${BLUE}[4/5] Configuring log rotation...${NC}"

# Create custom log rotation for security logs
cat > /etc/logrotate.d/security-logs << 'EOF'
# Security logs rotation

/var/log/aide/*.log {
    weekly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 640 root adm
}

/var/log/rkhunter.log {
    weekly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 640 root adm
}

/var/log/chkrootkit.log {
    weekly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 640 root adm
}

/var/log/clamav/*.log {
    weekly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 640 clamav clamav
}

/var/log/modsecurity/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 640 www-data www-data
}

/var/log/logwatch/*.txt {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 640 root root
}
EOF

echo -e "${GREEN}✓ Log rotation configured${NC}"

# Step 5: Create monitoring scripts
echo ""
echo -e "${BLUE}[5/5] Creating monitoring tools...${NC}"

# Daily logwatch report script
cat > /etc/cron.daily/logwatch-report << 'EOF'
#!/bin/bash
# Generate daily logwatch report
/usr/sbin/logwatch --output file --filename /var/log/logwatch/daily-report-$(date +%Y%m%d).txt
EOF
chmod +x /etc/cron.daily/logwatch-report

# Real-time nginx report generator
cat > /usr/local/bin/nginx-report << 'EOF'
#!/bin/bash
#############################################
# Nginx Access Report Generator
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

NGINX_LOG="/var/log/nginx/access.log"
OUTPUT_DIR="/var/www/html/reports"

case "$1" in
    live)
        echo -e "${BLUE}Opening real-time nginx log viewer...${NC}"
        goaccess "$NGINX_LOG" -c
        ;;
    html)
        mkdir -p "$OUTPUT_DIR"
        echo -e "${BLUE}Generating HTML report...${NC}"
        goaccess "$NGINX_LOG" -a -o "$OUTPUT_DIR/nginx-report.html" --log-format=COMBINED
        echo -e "${GREEN}Report saved to: $OUTPUT_DIR/nginx-report.html${NC}"
        ;;
    today)
        echo -e "${BLUE}=== Today's Nginx Statistics ===${NC}"
        echo ""
        echo "Total requests:"
        grep "$(date +%d/%b/%Y)" "$NGINX_LOG" 2>/dev/null | wc -l
        echo ""
        echo "Top 10 IPs:"
        grep "$(date +%d/%b/%Y)" "$NGINX_LOG" 2>/dev/null | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
        echo ""
        echo "Top 10 URLs:"
        grep "$(date +%d/%b/%Y)" "$NGINX_LOG" 2>/dev/null | awk '{print $7}' | sort | uniq -c | sort -rn | head -10
        echo ""
        echo "Response codes:"
        grep "$(date +%d/%b/%Y)" "$NGINX_LOG" 2>/dev/null | awk '{print $9}' | sort | uniq -c | sort -rn
        ;;
    errors)
        echo -e "${RED}=== Recent Nginx Errors ===${NC}"
        tail -50 /var/log/nginx/error.log
        ;;
    *)
        echo "Nginx Report Generator"
        echo ""
        echo "Usage: nginx-report [command]"
        echo ""
        echo "Commands:"
        echo "  live   - Open real-time terminal viewer"
        echo "  html   - Generate HTML report"
        echo "  today  - Show today's statistics"
        echo "  errors - Show recent errors"
        echo ""
        ;;
esac
EOF
chmod +x /usr/local/bin/nginx-report

# Security log viewer
cat > /usr/local/bin/security-logs << 'EOF'
#!/bin/bash
#############################################
# Security Log Viewer
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

case "$1" in
    auth)
        echo -e "${BLUE}=== Recent Authentication Events ===${NC}"
        tail -100 /var/log/auth.log
        ;;
    failed)
        echo -e "${RED}=== Failed Login Attempts ===${NC}"
        grep "Failed password" /var/log/auth.log | tail -50
        ;;
    success)
        echo -e "${GREEN}=== Successful Logins ===${NC}"
        grep "Accepted" /var/log/auth.log | tail -50
        ;;
    sudo)
        echo -e "${YELLOW}=== Sudo Usage ===${NC}"
        grep "sudo" /var/log/auth.log | tail -50
        ;;
    attacks)
        echo -e "${RED}=== Potential Attack Indicators ===${NC}"
        echo ""
        echo "Failed SSH attempts by IP:"
        grep "Failed password" /var/log/auth.log | grep -oP '\d+\.\d+\.\d+\.\d+' | sort | uniq -c | sort -rn | head -20
        echo ""
        echo "Invalid users attempted:"
        grep "Invalid user" /var/log/auth.log | awk '{print $8}' | sort | uniq -c | sort -rn | head -20
        ;;
    all)
        echo -e "${BLUE}=== All Security Logs ===${NC}"
        echo ""
        echo "Recent auth events:"
        tail -20 /var/log/auth.log
        echo ""
        echo "Recent fail2ban events:"
        tail -20 /var/log/fail2ban.log 2>/dev/null || echo "No fail2ban log"
        echo ""
        echo "Recent CrowdSec decisions:"
        cscli decisions list 2>/dev/null || echo "CrowdSec not installed"
        ;;
    live)
        echo -e "${BLUE}Watching auth.log in real-time (Ctrl+C to exit)...${NC}"
        tail -f /var/log/auth.log
        ;;
    *)
        echo "Security Log Viewer"
        echo ""
        echo "Usage: security-logs [command]"
        echo ""
        echo "Commands:"
        echo "  auth    - View recent auth events"
        echo "  failed  - View failed login attempts"
        echo "  success - View successful logins"
        echo "  sudo    - View sudo usage"
        echo "  attacks - Summarize potential attacks"
        echo "  all     - View all security info"
        echo "  live    - Watch auth.log in real-time"
        echo ""
        ;;
esac
EOF
chmod +x /usr/local/bin/security-logs

# Daily security summary script
cat > /etc/cron.daily/security-summary << 'EOF'
#!/bin/bash
#############################################
# Daily Security Summary
#############################################

LOG_FILE="/var/log/security-summary/$(date +%Y%m%d).txt"
mkdir -p /var/log/security-summary

{
    echo "========================================"
    echo "Daily Security Summary - $(date)"
    echo "========================================"
    echo ""
    
    echo "=== Failed SSH Attempts ==="
    grep "$(date +%b\ %d)" /var/log/auth.log 2>/dev/null | grep "Failed password" | wc -l
    echo "attempts"
    echo ""
    
    echo "=== Top Attack IPs ==="
    grep "$(date +%b\ %d)" /var/log/auth.log 2>/dev/null | grep "Failed password" | \
        grep -oP '\d+\.\d+\.\d+\.\d+' | sort | uniq -c | sort -rn | head -10
    echo ""
    
    echo "=== Successful SSH Logins ==="
    grep "$(date +%b\ %d)" /var/log/auth.log 2>/dev/null | grep "Accepted" | \
        awk '{print $1, $2, $3, $9, $11}'
    echo ""
    
    echo "=== Sudo Commands ==="
    grep "$(date +%b\ %d)" /var/log/auth.log 2>/dev/null | grep "sudo" | wc -l
    echo "sudo commands executed"
    echo ""
    
    echo "=== Fail2ban Status ==="
    fail2ban-client status 2>/dev/null || echo "Fail2ban not running"
    echo ""
    
    echo "=== CrowdSec Decisions ==="
    cscli decisions list 2>/dev/null | head -20 || echo "CrowdSec not installed"
    echo ""
    
    echo "=== Disk Usage ==="
    df -h | grep -E '^/dev'
    echo ""
    
    echo "=== Memory Usage ==="
    free -h
    echo ""
    
    echo "=== Top CPU Processes ==="
    ps aux --sort=-%cpu | head -6
    
} > "$LOG_FILE"

# Keep only last 30 days
find /var/log/security-summary -name "*.txt" -mtime +30 -delete 2>/dev/null || true
EOF
chmod +x /etc/cron.daily/security-summary

mkdir -p /var/log/security-summary

echo -e "${GREEN}✓ Monitoring tools created${NC}"

# Run initial report
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Logging Setup Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Tools available:${NC}"
echo "  security-logs auth    - View auth events"
echo "  security-logs attacks - Summarize attacks"
echo "  security-logs live    - Watch logs real-time"
echo "  nginx-report today    - Today's nginx stats"
echo "  nginx-report live     - Real-time nginx viewer"
echo "  nginx-report html     - Generate HTML report"
echo ""
echo -e "${BLUE}Automated reports:${NC}"
echo "  Daily: /var/log/logwatch/daily-report-*.txt"
echo "  Daily: /var/log/security-summary/*.txt"
echo ""
echo -e "${BLUE}Log locations:${NC}"
echo "  /var/log/auth.log      - Authentication"
echo "  /var/log/nginx/        - Nginx access/error"
echo "  /var/log/fail2ban.log  - Fail2ban"
echo "  /var/log/aide/         - File integrity"
echo "  /var/log/clamav/       - Antivirus"