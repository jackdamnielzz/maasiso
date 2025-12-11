#!/bin/bash
#############################################
# Backend Server SSH Key Setup Script
# Purpose: Set up SSH key authentication for backend server
# Server: 153.92.223.23 (strapicms.maasiso.cloud)
# Run as: bash 02-setup-backend-ssh.sh
#############################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_SERVER="153.92.223.23"
BACKEND_HOST="strapicms.maasiso.cloud"
SSH_KEY_PATH="$HOME/.ssh/id_ed25519_maasiso_backend"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Backend Server SSH Key Setup${NC}"
echo -e "${YELLOW}  Server: $BACKEND_SERVER${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Step 1: Check if SSH key already exists
echo -e "${BLUE}[Step 1/5] Checking for existing SSH key...${NC}"
if [ -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}SSH key already exists at: $SSH_KEY_PATH${NC}"
    read -p "Do you want to use the existing key? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        echo -e "${YELLOW}Generating new SSH key...${NC}"
        rm -f "$SSH_KEY_PATH" "$SSH_KEY_PATH.pub"
        ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "maasiso-backend-access"
    fi
else
    echo -e "${YELLOW}Generating new SSH key...${NC}"
    ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" -C "maasiso-backend-access"
fi
echo -e "${GREEN}✓ SSH key ready${NC}"

# Step 2: Display public key
echo ""
echo -e "${BLUE}[Step 2/5] Your public key:${NC}"
echo -e "${YELLOW}========================================${NC}"
cat "$SSH_KEY_PATH.pub"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Step 3: Instructions for copying key to server
echo -e "${BLUE}[Step 3/5] Copying public key to backend server...${NC}"
echo -e "${YELLOW}You will need to enter the password for root@$BACKEND_SERVER${NC}"
echo ""

# Try to copy the key using ssh-copy-id
if command -v ssh-copy-id &> /dev/null; then
    ssh-copy-id -i "$SSH_KEY_PATH.pub" "root@$BACKEND_SERVER"
else
    # Manual method if ssh-copy-id is not available
    echo "ssh-copy-id not available, using manual method..."
    cat "$SSH_KEY_PATH.pub" | ssh "root@$BACKEND_SERVER" 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Public key copied to server${NC}"
else
    echo -e "${RED}Failed to copy key automatically.${NC}"
    echo ""
    echo -e "${YELLOW}Manual steps:${NC}"
    echo "1. SSH into the server: ssh root@$BACKEND_SERVER"
    echo "2. Create .ssh directory: mkdir -p ~/.ssh && chmod 700 ~/.ssh"
    echo "3. Add this public key to ~/.ssh/authorized_keys:"
    cat "$SSH_KEY_PATH.pub"
    echo ""
    echo "4. Set permissions: chmod 600 ~/.ssh/authorized_keys"
    echo ""
    read -p "Press Enter once you've added the key manually..."
fi

# Step 4: Test SSH key authentication
echo ""
echo -e "${BLUE}[Step 4/5] Testing SSH key authentication...${NC}"
ssh -i "$SSH_KEY_PATH" -o BatchMode=yes -o ConnectTimeout=10 "root@$BACKEND_SERVER" "echo 'SSH key authentication successful!'" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSH key authentication working!${NC}"
else
    echo -e "${RED}✗ SSH key authentication test failed${NC}"
    echo -e "${YELLOW}Please verify the key was added correctly${NC}"
    exit 1
fi

# Step 5: Create SSH config entry
echo ""
echo -e "${BLUE}[Step 5/5] Creating SSH config entry...${NC}"

SSH_CONFIG="$HOME/.ssh/config"
CONFIG_ENTRY="
# MaasISO Backend Server
Host maasiso-backend
    HostName $BACKEND_SERVER
    User root
    IdentityFile $SSH_KEY_PATH
    IdentitiesOnly yes
"

# Check if entry already exists
if grep -q "Host maasiso-backend" "$SSH_CONFIG" 2>/dev/null; then
    echo -e "${YELLOW}SSH config entry already exists${NC}"
else
    echo "$CONFIG_ENTRY" >> "$SSH_CONFIG"
    chmod 600 "$SSH_CONFIG"
    echo -e "${GREEN}✓ SSH config entry added${NC}"
fi

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  SSH Key Setup Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "You can now connect using:"
echo "  ssh maasiso-backend"
echo "  OR"
echo "  ssh -i $SSH_KEY_PATH root@$BACKEND_SERVER"
echo ""
echo -e "${YELLOW}Next: Run 03-fix-backend-nginx.sh to fix the Nginx config${NC}"