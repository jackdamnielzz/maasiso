#!/bin/bash

# Script to run security verification on VPS servers
# This script will help you connect and run the verification

set -e

FRONTEND_IP="185.212.47.168"
BACKEND_IP="185.212.47.169"
SSH_USER="root"
SSH_PORT="22"

echo "=========================================="
echo "VPS Security Verification Helper"
echo "=========================================="
echo ""
echo "This script will help you verify security tasks on your VPS servers."
echo ""
echo "Server Information:"
echo "  Frontend: $SSH_USER@$FRONTEND_IP"
echo "  Backend:  $SSH_USER@$BACKEND_IP"
echo ""
echo "What to verify:"
echo "  1. Rootkit detection (rkhunter + chkrootkit)"
echo "  2. Unattended upgrades (automatic security updates)"
echo "  3. Encrypted backups"
echo "  4. Nginx hardening (mainly for frontend)"
echo ""
echo "=========================================="
echo ""

# Function to run verification on a server
run_verification() {
    local server_name=$1
    local server_ip=$2
    
    echo ""
    echo "=========================================="
    echo "Verifying: $server_name ($server_ip)"
    echo "=========================================="
    echo ""
    
    # Copy verification script to server
    echo "Copying verification script to $server_name..."
    scp -P $SSH_PORT scripts/security/verify-security-tasks.sh $SSH_USER@$server_ip:/tmp/
    
    # Run verification script
    echo "Running verification on $server_name..."
    ssh -p $SSH_PORT $SSH_USER@$server_ip "chmod +x /tmp/verify-security-tasks.sh && sudo /tmp/verify-security-tasks.sh"
    
    # Download report
    echo "Downloading report from $server_name..."
    scp -P $SSH_PORT "$SSH_USER@$server_ip:/tmp/security-verification-*.log" "./logs/${server_name}-security-verification-$(date +%Y%m%d_%H%M%S).log" 2>/dev/null || echo "No report file found"
    
    echo ""
    echo "Verification completed for $server_name"
    echo ""
}

# Menu
echo "Select server to verify:"
echo "1) Frontend server ($FRONTEND_IP)"
echo "2) Backend server ($BACKEND_IP)"
echo "3) Both servers"
echo "4) Manual SSH commands (for copy-paste)"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        run_verification "frontend" "$FRONTEND_IP"
        ;;
    2)
        run_verification "backend" "$BACKEND_IP"
        ;;
    3)
        run_verification "frontend" "$FRONTEND_IP"
        run_verification "backend" "$BACKEND_IP"
        ;;
    4)
        echo ""
        echo "=========================================="
        echo "Manual SSH Commands"
        echo "=========================================="
        echo ""
        echo "For FRONTEND server:"
        echo "-------------------"
        echo "# Connect to frontend"
        echo "ssh -p $SSH_PORT $SSH_USER@$FRONTEND_IP"
        echo ""
        echo "# Then run on the server:"
        echo "wget https://raw.githubusercontent.com/yourusername/yourrepo/main/scripts/security/verify-security-tasks.sh -O /tmp/verify-security-tasks.sh"
        echo "chmod +x /tmp/verify-security-tasks.sh"
        echo "sudo /tmp/verify-security-tasks.sh"
        echo ""
        echo "For BACKEND server:"
        echo "-------------------"
        echo "# Connect to backend"
        echo "ssh -p $SSH_PORT $SSH_USER@$BACKEND_IP"
        echo ""
        echo "# Then run on the server:"
        echo "wget https://raw.githubusercontent.com/yourusername/yourrepo/main/scripts/security/verify-security-tasks.sh -O /tmp/verify-security-tasks.sh"
        echo "chmod +x /tmp/verify-security-tasks.sh"
        echo "sudo /tmp/verify-security-tasks.sh"
        echo ""
        echo "=========================================="
        echo ""
        echo "OR copy the script manually:"
        echo ""
        echo "# On your local machine:"
        echo "scp -P $SSH_PORT scripts/security/verify-security-tasks.sh $SSH_USER@$FRONTEND_IP:/tmp/"
        echo "ssh -p $SSH_PORT $SSH_USER@$FRONTEND_IP 'chmod +x /tmp/verify-security-tasks.sh && sudo /tmp/verify-security-tasks.sh'"
        echo ""
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "Reports saved in: ./logs/"
echo ""
echo "Next steps based on results:"
echo "1. If rootkit detection is missing:"
echo "   Run: scripts/security/06-install-rootkit-detection.sh"
echo ""
echo "2. If unattended upgrades is missing:"
echo "   Run: scripts/security/09-setup-unattended-upgrades.sh"
echo ""
echo "3. If encrypted backups is missing:"
echo "   Run: scripts/security/15-encrypted-backups.sh"
echo ""
echo "4. If nginx hardening is missing (frontend only):"
echo "   Run: scripts/security/07-harden-nginx.sh"
echo ""