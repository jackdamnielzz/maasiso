#!/bin/bash
#############################################
# Automatic Security Updates Configuration
# Purpose: Enable unattended security updates
# Run as: sudo bash 09-setup-unattended-upgrades.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Automatic Security Updates Setup${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Install unattended-upgrades
echo -e "${BLUE}[1/4] Installing unattended-upgrades...${NC}"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y unattended-upgrades apt-listchanges
echo -e "${GREEN}✓ unattended-upgrades installed${NC}"

# Step 2: Configure unattended-upgrades
echo ""
echo -e "${BLUE}[2/4] Configuring automatic updates...${NC}"

cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
// Automatic Security Updates Configuration for MaasISO Servers

// Which packages to automatically upgrade
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
    // "${distro_id}:${distro_codename}-updates";  // Uncomment for all updates
};

// Packages to never update automatically (be careful with these)
Unattended-Upgrade::Package-Blacklist {
    // "nginx";     // Uncomment to prevent nginx auto-updates
    // "nodejs";    // Uncomment to prevent nodejs auto-updates
};

// Send email notifications (configure mail first)
// Unattended-Upgrade::Mail "admin@maasiso.nl";
// Unattended-Upgrade::MailReport "on-change";

// Remove unused dependencies
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";

// Automatic reboot if required (at 3 AM)
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";

// Don't reboot if users are logged in
Unattended-Upgrade::Automatic-Reboot-WithUsers "false";

// Split upgrade to avoid heavy load
Unattended-Upgrade::MinimalSteps "true";

// Log to syslog
Unattended-Upgrade::SyslogEnable "true";
Unattended-Upgrade::SyslogFacility "daemon";

// Download upgrades but don't install automatically (safer option)
// Uncomment this and comment the next line for manual control
// Unattended-Upgrade::Download-Only "true";

// Verbose logging for debugging
// Unattended-Upgrade::Debug "true";
EOF

# Configure automatic update schedule
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

echo -e "${GREEN}✓ Automatic updates configured${NC}"

# Step 3: Enable and start the service
echo ""
echo -e "${BLUE}[3/4] Enabling unattended-upgrades service...${NC}"

systemctl enable unattended-upgrades
systemctl start unattended-upgrades

echo -e "${GREEN}✓ Service enabled and started${NC}"

# Step 4: Create helper scripts
echo ""
echo -e "${BLUE}[4/4] Creating helper scripts...${NC}"

# Create manual update check script
cat > /usr/local/bin/check-updates << 'EOF'
#!/bin/bash
#############################################
# Check for Available Updates
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Checking for updates...${NC}"
echo ""

apt-get update -qq

echo -e "${YELLOW}=== Security Updates ===${NC}"
apt-get -s upgrade 2>/dev/null | grep -i security || echo "No security updates available"

echo ""
echo -e "${YELLOW}=== All Available Updates ===${NC}"
apt list --upgradable 2>/dev/null

echo ""
echo -e "${BLUE}To install all updates manually:${NC}"
echo "  sudo apt-get upgrade -y"
echo ""
echo -e "${BLUE}To install security updates only:${NC}"
echo "  sudo unattended-upgrade -d"
EOF
chmod +x /usr/local/bin/check-updates

# Create script to manually trigger unattended upgrade
cat > /usr/local/bin/run-security-updates << 'EOF'
#!/bin/bash
#############################################
# Manually Run Security Updates
#############################################

echo "Running unattended security updates..."
echo ""

# Dry run first
unattended-upgrade --dry-run -v

echo ""
read -p "Proceed with installation? (y/N) " confirm
if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    unattended-upgrade -v
    echo ""
    echo "Updates completed."
else
    echo "Cancelled."
fi
EOF
chmod +x /usr/local/bin/run-security-updates

echo -e "${GREEN}✓ Helper scripts created${NC}"

# Run a dry-run test
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Testing unattended-upgrades...${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

unattended-upgrade --dry-run 2>&1 | head -20

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Automatic Updates Setup Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  ✓ Security updates will install automatically daily"
echo "  ✓ Unused dependencies will be removed"
echo "  ✗ Automatic reboot is disabled (manual required)"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  check-updates          - Check for available updates"
echo "  run-security-updates   - Manually run security updates"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  /var/log/unattended-upgrades/unattended-upgrades.log"
echo "  /var/log/apt/history.log"
echo ""
echo -e "${YELLOW}To enable automatic reboot after kernel updates:${NC}"
echo "  Edit /etc/apt/apt.conf.d/50unattended-upgrades"
echo "  Set: Unattended-Upgrade::Automatic-Reboot \"true\";"