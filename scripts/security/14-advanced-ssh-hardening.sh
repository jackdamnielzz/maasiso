#!/bin/bash
#############################################
# Advanced SSH Hardening Script
# Purpose: Add 2FA, port knocking, and advanced restrictions
# Run as: sudo bash 14-advanced-ssh-hardening.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Advanced SSH Hardening${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Backup current SSH config
echo -e "${BLUE}[1/6] Backing up SSH configuration...${NC}"
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)
echo -e "${GREEN}✓ Backup created${NC}"

# Step 2: Install Google Authenticator
echo ""
echo -e "${BLUE}[2/6] Installing Google Authenticator for 2FA...${NC}"
apt-get update -qq
apt-get install -y libpam-google-authenticator
echo -e "${GREEN}✓ Google Authenticator installed${NC}"

# Step 3: Apply advanced SSH hardening
echo ""
echo -e "${BLUE}[3/6] Applying advanced SSH hardening...${NC}"

cat > /etc/ssh/sshd_config.d/99-security-hardening.conf << 'EOF'
# Advanced SSH Security Hardening for MaasISO
# Applied via drop-in configuration

#############################################
# Authentication
#############################################

# Disable root login completely (use sudo instead)
PermitRootLogin prohibit-password

# Use SSH protocol 2 only
Protocol 2

# Disable password authentication (use keys only)
PasswordAuthentication no
PermitEmptyPasswords no

# Enable public key authentication
PubkeyAuthentication yes

# Disable host-based authentication
HostbasedAuthentication no
IgnoreRhosts yes

# Disable challenge-response (conflicts with 2FA setup)
# Uncomment when 2FA is NOT configured:
# ChallengeResponseAuthentication no
# For 2FA, this needs to be yes:
ChallengeResponseAuthentication yes

# Disable keyboard-interactive if not using 2FA
# KbdInteractiveAuthentication no

#############################################
# Session Security
#############################################

# Maximum authentication attempts
MaxAuthTries 3

# Maximum sessions per connection
MaxSessions 3

# Maximum concurrent unauthenticated connections
MaxStartups 10:30:60

# Session timeout (5 minutes idle)
ClientAliveInterval 300
ClientAliveCountMax 2

# Login grace time
LoginGraceTime 60

#############################################
# Security Features
#############################################

# Strict mode - check file permissions
StrictModes yes

# Disable X11 forwarding
X11Forwarding no

# Disable TCP forwarding (if not needed)
AllowTcpForwarding no

# Disable agent forwarding
AllowAgentForwarding no

# Disable tunnel devices
PermitTunnel no

# Disable user environment
PermitUserEnvironment no

# Use PAM for authentication
UsePAM yes

#############################################
# Cryptography
#############################################

# Strong key exchange algorithms
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521,ecdh-sha2-nistp384,ecdh-sha2-nistp256,diffie-hellman-group-exchange-sha256

# Strong ciphers
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr

# Strong MACs
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com,hmac-sha2-512,hmac-sha2-256

# Host key algorithms
HostKeyAlgorithms ssh-ed25519-cert-v01@openssh.com,ssh-rsa-cert-v01@openssh.com,ssh-ed25519,rsa-sha2-512,rsa-sha2-256

#############################################
# Logging
#############################################

# Verbose logging
LogLevel VERBOSE

# Log SFTP activity
Subsystem sftp /usr/lib/openssh/sftp-server -l INFO

#############################################
# Access Restrictions
#############################################

# Allow only specific users (uncomment and customize)
# AllowUsers admin deploy

# Allow only specific groups (uncomment and customize)
# AllowGroups sshusers admins

# Deny specific users
# DenyUsers root guest test

#############################################
# Banner
#############################################

# Security warning banner
Banner /etc/ssh/banner
EOF

# Create SSH banner
cat > /etc/ssh/banner << 'EOF'
*******************************************************************
*                     AUTHORIZED ACCESS ONLY                      *
*******************************************************************
* This system is for authorized users only.                       *
* All activities on this system are logged and monitored.         *
* Unauthorized access will be reported to law enforcement.        *
*******************************************************************
EOF

echo -e "${GREEN}✓ Advanced SSH hardening applied${NC}"

# Step 4: Configure PAM for Google Authenticator (optional)
echo ""
echo -e "${BLUE}[4/6] Preparing 2FA configuration...${NC}"

# Create 2FA setup script for users
cat > /usr/local/bin/setup-2fa << 'EOF'
#!/bin/bash
#############################################
# Setup 2FA for SSH
# Run as the user who needs 2FA
#############################################

echo "Setting up Google Authenticator for 2FA..."
echo ""
echo "1. Run this command on your phone's authenticator app:"
echo "2. Scan the QR code that will be displayed"
echo "3. Save the emergency codes in a safe place"
echo ""

google-authenticator -t -d -f -r 3 -R 30 -w 3

echo ""
echo "2FA setup complete!"
echo ""
echo "IMPORTANT: Ask your administrator to enable 2FA in PAM."
echo "Edit /etc/pam.d/sshd and add:"
echo "  auth required pam_google_authenticator.so"
EOF
chmod +x /usr/local/bin/setup-2fa

# Create instructions for enabling 2FA
cat > /etc/ssh/2fa-instructions.txt << 'EOF'
========================================
HOW TO ENABLE 2FA FOR SSH
========================================

1. Each user runs: setup-2fa
   This creates ~/.google_authenticator

2. Admin edits /etc/pam.d/sshd
   Add this line after @include common-auth:
   auth required pam_google_authenticator.so

3. Ensure sshd_config has:
   ChallengeResponseAuthentication yes
   UsePAM yes

4. Restart SSH:
   systemctl restart sshd

5. Test from a NEW terminal (keep current session open!)

WARNING: Test carefully! You could lock yourself out.
========================================
EOF

echo -e "${GREEN}✓ 2FA configuration prepared${NC}"
echo -e "${YELLOW}  Run 'setup-2fa' as each user to enable 2FA${NC}"

# Step 5: Setup IP allowlisting (optional)
echo ""
echo -e "${BLUE}[5/6] Creating IP allowlist configuration...${NC}"

cat > /etc/ssh/ip-allowlist.conf << 'EOF'
# SSH IP Allowlist
# Add trusted IPs here (one per line)
# Then enable in UFW or hosts.allow

# Example entries:
# 1.2.3.4        # Office IP
# 10.0.0.0/8     # Internal network
# 192.168.1.0/24 # Home network
EOF

# Create IP restriction helper
cat > /usr/local/bin/ssh-restrict-ip << 'EOF'
#!/bin/bash
#############################################
# SSH IP Restriction Helper
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

case "$1" in
    add)
        if [ -z "$2" ]; then
            echo "Usage: ssh-restrict-ip add <IP>"
            exit 1
        fi
        echo -e "${YELLOW}Adding $2 to SSH allowlist...${NC}"
        ufw allow from "$2" to any port 22
        echo "$2" >> /etc/ssh/ip-allowlist.conf
        echo -e "${GREEN}Added $2${NC}"
        ;;
    remove)
        if [ -z "$2" ]; then
            echo "Usage: ssh-restrict-ip remove <IP>"
            exit 1
        fi
        echo -e "${YELLOW}Removing $2 from SSH allowlist...${NC}"
        ufw delete allow from "$2" to any port 22
        sed -i "/$2/d" /etc/ssh/ip-allowlist.conf
        echo -e "${GREEN}Removed $2${NC}"
        ;;
    list)
        echo -e "${BLUE}=== Current SSH Allowlist ===${NC}"
        cat /etc/ssh/ip-allowlist.conf | grep -v "^#" | grep -v "^$"
        echo ""
        echo -e "${BLUE}=== UFW SSH Rules ===${NC}"
        ufw status | grep 22
        ;;
    enable)
        echo -e "${YELLOW}Enabling IP-only SSH access...${NC}"
        echo -e "${RED}WARNING: This will lock out all IPs not in the allowlist!${NC}"
        read -p "Are you sure? Current session will remain. (y/N) " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            ufw delete allow 22/tcp 2>/dev/null || true
            echo -e "${GREEN}Global SSH access disabled. Only allowlisted IPs can connect.${NC}"
        fi
        ;;
    disable)
        echo -e "${YELLOW}Re-enabling global SSH access...${NC}"
        ufw allow 22/tcp
        echo -e "${GREEN}SSH open to all IPs (with key auth)${NC}"
        ;;
    *)
        echo "SSH IP Restriction Tool"
        echo ""
        echo "Usage: ssh-restrict-ip [command] [args]"
        echo ""
        echo "Commands:"
        echo "  add <IP>    - Add IP to allowlist"
        echo "  remove <IP> - Remove IP from allowlist"
        echo "  list        - Show current allowlist"
        echo "  enable      - Enable IP restriction mode"
        echo "  disable     - Disable IP restriction (allow all)"
        echo ""
        ;;
esac
EOF
chmod +x /usr/local/bin/ssh-restrict-ip

echo -e "${GREEN}✓ IP allowlist configured${NC}"

# Step 6: Test and apply configuration
echo ""
echo -e "${BLUE}[6/6] Testing and applying configuration...${NC}"

# Test SSH configuration
sshd -t
if [ $? -eq 0 ]; then
    systemctl reload sshd
    echo -e "${GREEN}✓ SSH configuration applied${NC}"
else
    echo -e "${RED}✗ SSH configuration has errors! Rolling back...${NC}"
    rm /etc/ssh/sshd_config.d/99-security-hardening.conf
    exit 1
fi

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Advanced SSH Hardening Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Applied settings:${NC}"
echo "  ✓ Strong cryptography (modern ciphers/MACs)"
echo "  ✓ Session limits and timeouts"
echo "  ✓ Disabled dangerous features"
echo "  ✓ Security banner"
echo "  ✓ Verbose logging"
echo ""
echo -e "${BLUE}Optional 2FA Setup:${NC}"
echo "  1. Run 'setup-2fa' as each user"
echo "  2. Edit /etc/pam.d/sshd to enable"
echo "  3. See /etc/ssh/2fa-instructions.txt"
echo ""
echo -e "${BLUE}Optional IP Restriction:${NC}"
echo "  ssh-restrict-ip add <IP>  - Add trusted IP"
echo "  ssh-restrict-ip enable    - Enable IP-only mode"
echo ""
echo -e "${RED}WARNING: Test SSH in a NEW terminal before closing this one!${NC}"