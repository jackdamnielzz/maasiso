#!/bin/bash
#############################################
# Kernel and System Hardening Script
# Purpose: Restrict system capabilities and attack surface
# Run as: sudo bash 13-kernel-hardening.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Kernel & System Hardening${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Backup current sysctl settings
echo -e "${BLUE}[1/5] Backing up current settings...${NC}"
cp /etc/sysctl.conf /etc/sysctl.conf.backup.$(date +%Y%m%d)
echo -e "${GREEN}✓ Backup created${NC}"

# Step 2: Apply kernel hardening
echo ""
echo -e "${BLUE}[2/5] Applying kernel hardening...${NC}"

cat > /etc/sysctl.d/99-security-hardening.conf << 'EOF'
# Kernel Security Hardening for MaasISO Servers
# Applied: See date in filename backup

#############################################
# Network Security
#############################################

# Disable IP forwarding (unless needed for routing)
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Don't send ICMP redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Ignore source-routed packets
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0

# Enable TCP SYN cookies (protection against SYN flood)
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Log suspicious packets (martians)
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Ignore broadcast ICMP requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bogus ICMP error responses
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Enable reverse path filtering (prevent spoofing)
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable IPv6 if not needed (uncomment if you don't use IPv6)
# net.ipv6.conf.all.disable_ipv6 = 1
# net.ipv6.conf.default.disable_ipv6 = 1

#############################################
# Memory Protection
#############################################

# Enable ASLR (Address Space Layout Randomization)
kernel.randomize_va_space = 2

# Restrict access to kernel logs
kernel.dmesg_restrict = 1

# Restrict kernel pointer exposure
kernel.kptr_restrict = 2

# Protect against symlink/hardlink attacks
fs.protected_symlinks = 1
fs.protected_hardlinks = 1

# Protect against FIFO and regular file attacks
fs.protected_fifos = 2
fs.protected_regular = 2

# Restrict ptrace (process tracing)
kernel.yama.ptrace_scope = 1

#############################################
# Core Dumps
#############################################

# Disable core dumps
fs.suid_dumpable = 0

#############################################
# File System Security
#############################################

# Increase file watchers for development
fs.inotify.max_user_watches = 524288

#############################################
# TCP/IP Tuning
#############################################

# Enable TCP window scaling
net.ipv4.tcp_window_scaling = 1

# Enable TCP timestamps
net.ipv4.tcp_timestamps = 1

# Increase TCP max buffer sizes
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Reduce TCP FIN timeout (faster connection cleanup)
net.ipv4.tcp_fin_timeout = 30

# Reduce keepalive time
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 5
EOF

# Apply settings
sysctl -p /etc/sysctl.d/99-security-hardening.conf

echo -e "${GREEN}✓ Kernel hardening applied${NC}"

# Step 3: Disable unnecessary kernel modules
echo ""
echo -e "${BLUE}[3/5] Disabling unnecessary kernel modules...${NC}"

cat > /etc/modprobe.d/security-blacklist.conf << 'EOF'
# Disable unnecessary and potentially dangerous kernel modules

# Uncommon network protocols
install dccp /bin/true
install sctp /bin/true
install rds /bin/true
install tipc /bin/true

# Uncommon filesystems (prevent mounting malicious filesystems)
install cramfs /bin/true
install freevxfs /bin/true
install jffs2 /bin/true
install hfs /bin/true
install hfsplus /bin/true
install squashfs /bin/true
install udf /bin/true

# USB storage (uncomment if USB storage not needed)
# install usb-storage /bin/true

# Bluetooth (uncomment if Bluetooth not needed)
# install bluetooth /bin/true
# install btusb /bin/true

# Firewire (usually not needed on servers)
install firewire-core /bin/true
install firewire-ohci /bin/true
install firewire-sbp2 /bin/true
EOF

echo -e "${GREEN}✓ Unnecessary modules blacklisted${NC}"

# Step 4: Restrict /proc filesystem
echo ""
echo -e "${BLUE}[4/5] Restricting process information access...${NC}"

# Add hidepid option to /proc mount
if ! grep -q "hidepid" /etc/fstab; then
    echo "# Restrict /proc access - users can only see their own processes" >> /etc/fstab
    echo "proc /proc proc defaults,hidepid=2 0 0" >> /etc/fstab
    mount -o remount /proc 2>/dev/null || true
fi

echo -e "${GREEN}✓ /proc restricted${NC}"

# Step 5: Disable core dumps via limits
echo ""
echo -e "${BLUE}[5/5] Configuring security limits...${NC}"

cat > /etc/security/limits.d/security-hardening.conf << 'EOF'
# Security limits hardening

# Disable core dumps for all users
*               hard    core            0

# Limit max processes (prevent fork bombs)
*               soft    nproc           1024
*               hard    nproc           2048

# Limit open files
*               soft    nofile          65535
*               hard    nofile          65535
EOF

echo -e "${GREEN}✓ Security limits configured${NC}"

# Create status checker
cat > /usr/local/bin/security-settings << 'EOF'
#!/bin/bash
#############################################
# Security Settings Viewer
#############################################

echo "=== Kernel Security Settings ==="
echo ""
echo "ASLR (should be 2):"
sysctl kernel.randomize_va_space
echo ""
echo "Dmesg restrict (should be 1):"
sysctl kernel.dmesg_restrict
echo ""
echo "SYN cookies (should be 1):"
sysctl net.ipv4.tcp_syncookies
echo ""
echo "Source routing disabled (should be 0):"
sysctl net.ipv4.conf.all.accept_source_route
echo ""
echo "IP forwarding disabled (should be 0):"
sysctl net.ipv4.ip_forward
echo ""
echo "Reverse path filtering (should be 1):"
sysctl net.ipv4.conf.all.rp_filter
echo ""
echo "Protected symlinks (should be 1):"
sysctl fs.protected_symlinks
echo ""
echo "=== Loaded Security Modules ==="
lsmod | grep -E "^(ip_tables|nf_|xt_)" | head -10
echo ""
echo "=== Core Dump Settings ==="
ulimit -c
echo "(should be 0)"
EOF
chmod +x /usr/local/bin/security-settings

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Kernel Hardening Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Applied settings:${NC}"
echo "  ✓ Network hardening (SYN flood protection, etc.)"
echo "  ✓ Memory protection (ASLR, restricted pointers)"
echo "  ✓ Disabled core dumps"
echo "  ✓ Blacklisted unused kernel modules"
echo "  ✓ Restricted /proc access"
echo "  ✓ Security limits configured"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  security-settings    - View current security settings"
echo ""
echo -e "${YELLOW}Note: Some settings require a reboot to take full effect.${NC}"
echo ""
echo -e "${BLUE}Config files:${NC}"
echo "  /etc/sysctl.d/99-security-hardening.conf"
echo "  /etc/modprobe.d/security-blacklist.conf"
echo "  /etc/security/limits.d/security-hardening.conf"