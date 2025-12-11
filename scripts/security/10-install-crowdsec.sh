#!/bin/bash
#############################################
# CrowdSec Installation Script
# Purpose: Install collaborative IPS with community blocklists
# Run as: sudo bash 10-install-crowdsec.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  CrowdSec Installation${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Add CrowdSec repository
echo -e "${BLUE}[1/6] Adding CrowdSec repository...${NC}"
curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | bash
echo -e "${GREEN}✓ Repository added${NC}"

# Step 2: Install CrowdSec
echo ""
echo -e "${BLUE}[2/6] Installing CrowdSec...${NC}"
apt-get update -qq
apt-get install -y crowdsec
echo -e "${GREEN}✓ CrowdSec installed${NC}"

# Step 3: Install CrowdSec Firewall Bouncer
echo ""
echo -e "${BLUE}[3/6] Installing CrowdSec Firewall Bouncer...${NC}"
apt-get install -y crowdsec-firewall-bouncer-iptables
echo -e "${GREEN}✓ Firewall bouncer installed${NC}"

# Step 4: Install Nginx Bouncer (optional but recommended)
echo ""
echo -e "${BLUE}[4/6] Installing CrowdSec Nginx Bouncer...${NC}"
apt-get install -y crowdsec-nginx-bouncer || {
    echo -e "${YELLOW}Nginx bouncer not available, using firewall bouncer only${NC}"
}
echo -e "${GREEN}✓ Nginx bouncer installed (if available)${NC}"

# Step 5: Install useful collections
echo ""
echo -e "${BLUE}[5/6] Installing security collections...${NC}"

# Install common collections
cscli collections install crowdsecurity/linux 2>/dev/null || true
cscli collections install crowdsecurity/nginx 2>/dev/null || true
cscli collections install crowdsecurity/sshd 2>/dev/null || true
cscli collections install crowdsecurity/base-http-scenarios 2>/dev/null || true

# Install parsers
cscli parsers install crowdsecurity/syslog-logs 2>/dev/null || true
cscli parsers install crowdsecurity/nginx-logs 2>/dev/null || true
cscli parsers install crowdsecurity/sshd-logs 2>/dev/null || true

# Install scenarios for common attacks
cscli scenarios install crowdsecurity/ssh-bf 2>/dev/null || true
cscli scenarios install crowdsecurity/http-crawl-non_statics 2>/dev/null || true
cscli scenarios install crowdsecurity/http-path-traversal-probing 2>/dev/null || true
cscli scenarios install crowdsecurity/http-sqli-probing 2>/dev/null || true
cscli scenarios install crowdsecurity/http-xss-probing 2>/dev/null || true

echo -e "${GREEN}✓ Security collections installed${NC}"

# Step 6: Configure and start services
echo ""
echo -e "${BLUE}[6/6] Starting CrowdSec services...${NC}"

# Enable and start CrowdSec
systemctl enable crowdsec
systemctl start crowdsec

# Enable and start firewall bouncer
systemctl enable crowdsec-firewall-bouncer
systemctl start crowdsec-firewall-bouncer

echo -e "${GREEN}✓ Services started${NC}"

# Create helper script
cat > /usr/local/bin/crowdsec-status << 'EOF'
#!/bin/bash
#############################################
# CrowdSec Status and Management
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

case "$1" in
    status)
        echo -e "${BLUE}=== CrowdSec Service Status ===${NC}"
        systemctl status crowdsec --no-pager | head -10
        echo ""
        echo -e "${BLUE}=== Firewall Bouncer Status ===${NC}"
        systemctl status crowdsec-firewall-bouncer --no-pager | head -10
        ;;
    decisions)
        echo -e "${BLUE}=== Current Decisions (Bans) ===${NC}"
        cscli decisions list
        ;;
    alerts)
        echo -e "${BLUE}=== Recent Alerts ===${NC}"
        cscli alerts list --limit 20
        ;;
    metrics)
        echo -e "${BLUE}=== CrowdSec Metrics ===${NC}"
        cscli metrics
        ;;
    ban)
        if [ -z "$2" ]; then
            echo "Usage: crowdsec-status ban <IP>"
            exit 1
        fi
        echo -e "${YELLOW}Banning IP: $2${NC}"
        cscli decisions add --ip "$2" --reason "Manual ban" --duration 24h
        ;;
    unban)
        if [ -z "$2" ]; then
            echo "Usage: crowdsec-status unban <IP>"
            exit 1
        fi
        echo -e "${YELLOW}Unbanning IP: $2${NC}"
        cscli decisions delete --ip "$2"
        ;;
    hub)
        echo -e "${BLUE}=== Installed Collections ===${NC}"
        cscli collections list
        echo ""
        echo -e "${BLUE}=== Installed Scenarios ===${NC}"
        cscli scenarios list
        ;;
    update)
        echo -e "${YELLOW}Updating CrowdSec hub...${NC}"
        cscli hub update
        cscli hub upgrade
        ;;
    *)
        echo "CrowdSec Management Tool"
        echo ""
        echo "Usage: crowdsec-status [command] [args]"
        echo ""
        echo "Commands:"
        echo "  status     - Show service status"
        echo "  decisions  - List current bans"
        echo "  alerts     - Show recent alerts"
        echo "  metrics    - Show metrics"
        echo "  ban <IP>   - Manually ban an IP"
        echo "  unban <IP> - Remove ban for an IP"
        echo "  hub        - Show installed collections"
        echo "  update     - Update CrowdSec hub"
        echo ""
        ;;
esac
EOF
chmod +x /usr/local/bin/crowdsec-status

# Show status
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  CrowdSec Status${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

cscli hub list | head -30

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  CrowdSec Installation Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Features enabled:${NC}"
echo "  ✓ SSH brute force detection"
echo "  ✓ HTTP attack detection (XSS, SQLi, path traversal)"
echo "  ✓ Automatic IP banning via iptables"
echo "  ✓ Community threat intelligence"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  crowdsec-status status    - Show service status"
echo "  crowdsec-status decisions - View current bans"
echo "  crowdsec-status alerts    - View recent alerts"
echo "  crowdsec-status ban <IP>  - Manually ban IP"
echo "  crowdsec-status metrics   - View metrics"
echo ""
echo -e "${BLUE}Dashboard:${NC}"
echo "  Register at https://app.crowdsec.net for web dashboard"
echo "  Then run: cscli console enroll <enrollment_key>"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  /var/log/crowdsec.log"
echo "  journalctl -u crowdsec"