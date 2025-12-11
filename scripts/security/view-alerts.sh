#!/bin/bash
# View all Guardian alerts from both servers
# Usage: ./scripts/security/view-alerts.sh [lines]
# Default: shows last 50 lines from each server

SSH_KEY="$HOME/.ssh/id_rsa"
FRONTEND_IP="147.93.62.188"
BACKEND_IP="153.92.223.23"
LINES=${1:-50}

echo "═══════════════════════════════════════════════════════════════════════"
echo "               🛡️  GUARDIAN ALERTS VIEWER                              "
echo "═══════════════════════════════════════════════════════════════════════"
echo "                  $(date '+%Y-%m-%d %H:%M:%S')                          "
echo "                  Showing last $LINES alerts per server                "
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

echo "Fetching alerts from Backend VPS ($BACKEND_IP)..."
echo ""
echo "=== BACKEND VPS ALERTS ===" 
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@$BACKEND_IP "cat /var/log/guardian/guardian.log 2>/dev/null | tail -$LINES || echo 'No guardian.log found'" 2>/dev/null || echo "Could not connect to Backend VPS"

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

echo "Fetching alerts from Frontend VPS ($FRONTEND_IP)..."
echo ""
echo "=== FRONTEND VPS ALERTS ==="
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@$FRONTEND_IP "cat /var/log/guardian/guardian.log 2>/dev/null | tail -$LINES || echo 'No guardian.log found'" 2>/dev/null || echo "Could not connect to Frontend VPS"

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "                           END OF ALERTS                               "
echo "═══════════════════════════════════════════════════════════════════════"