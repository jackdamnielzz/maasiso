#!/bin/bash
# Guardian Security Dashboard
# Run this to see consolidated security status from both servers
# Usage: ./scripts/security/guardian-dashboard.sh

SSH_KEY="$HOME/.ssh/id_rsa"
FRONTEND_IP="147.93.62.188"
BACKEND_IP="153.92.223.23"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════════════════════════"
echo "               🛡️  GUARDIAN SECURITY DASHBOARD                         "
echo "═══════════════════════════════════════════════════════════════════════"
echo "                  $(date '+%Y-%m-%d %H:%M:%S')                          "
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Backend VPS Status
echo "┌─────────────────────────────────────────────────────────────────────┐"
echo "│  📡 BACKEND VPS ($BACKEND_IP) - Strapi CMS                        │"
echo "└─────────────────────────────────────────────────────────────────────┘"
echo ""
echo "🔥 Recent Alerts (last 10):"
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@$BACKEND_IP "tail -10 /var/log/guardian/guardian.log 2>/dev/null || echo '  No alerts found'" 2>/dev/null || echo "  Could not connect to Backend VPS"
echo ""
echo "📊 System Status:"
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@$BACKEND_IP "
  echo \"  CPU: \$(top -bn1 | grep 'Cpu(s)' | awk '{print \$2}')%\"
  echo \"  Memory: \$(free -m | awk 'NR==2{printf \"%.1f%%\", \$3*100/\$2 }')\"
  echo \"  Disk: \$(df -h / | awk 'NR==2{print \$5}')\"
  echo \"  Uptime: \$(uptime -p)\"
" 2>/dev/null || echo "  Could not connect"
echo ""
echo "🔒 Security Status:"
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@$BACKEND_IP "
  echo \"  UFW Firewall: \$(ufw status | head -1)\"
  SUSPICIOUS=\$(ps aux | grep -E '(mine|xmr|c3pool|cX86|cARM)' | grep -v grep | wc -l)
  if [ \$SUSPICIOUS -gt 0 ]; then
    echo \"  ⚠️  Suspicious Processes: \$SUSPICIOUS FOUND!\"
  else
    echo \"  ✅ Suspicious Processes: 0 (Clean)\"
  fi
  MALWARE_DIR=\$(ls /etc/de/ 2>/dev/null && echo 'EXISTS' || echo 'CLEAN')
  if [ \"\$MALWARE_DIR\" = \"EXISTS\" ]; then
    echo \"  ⚠️  /etc/de/ Malware Dir: EXISTS - WARNING!\"
  else
    echo \"  ✅ /etc/de/ Malware Dir: Removed - OK\"
  fi
  FAILED_SSH=\$(grep 'Failed password' /var/log/auth.log 2>/dev/null | wc -l)
  echo \"  Failed SSH Attempts: \$FAILED_SSH\"
" 2>/dev/null || echo "  Could not connect"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Frontend VPS Status
echo "┌─────────────────────────────────────────────────────────────────────┐"
echo "│  🌐 FRONTEND VPS ($FRONTEND_IP) - maasiso.nl                        │"
echo "└─────────────────────────────────────────────────────────────────────┘"
echo ""
echo "🔥 Recent Alerts (last 10):"
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@$FRONTEND_IP "tail -10 /var/log/guardian/guardian.log 2>/dev/null || echo '  No alerts found'" 2>/dev/null || echo "  Could not connect to Frontend VPS"
echo ""
echo "📊 System Status:"
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@$FRONTEND_IP "
  echo \"  CPU: \$(top -bn1 | grep 'Cpu(s)' | awk '{print \$2}')%\"
  echo \"  Memory: \$(free -m | awk 'NR==2{printf \"%.1f%%\", \$3*100/\$2 }')\"
  echo \"  Disk: \$(df -h / | awk 'NR==2{print \$5}')\"
  echo \"  Uptime: \$(uptime -p)\"
" 2>/dev/null || echo "  Could not connect"
echo ""
echo "🔒 Security Status:"
ssh -i "$SSH_KEY" -o ConnectTimeout=10 root@$FRONTEND_IP "
  echo \"  UFW Firewall: \$(ufw status | head -1)\"
  SUSPICIOUS=\$(ps aux | grep -E '(mine|xmr|c3pool|cX86|cARM)' | grep -v grep | wc -l)
  if [ \$SUSPICIOUS -gt 0 ]; then
    echo \"  ⚠️  Suspicious Processes: \$SUSPICIOUS FOUND!\"
  else
    echo \"  ✅ Suspicious Processes: 0 (Clean)\"
  fi
  MALWARE_DIR=\$(ls /etc/de/ 2>/dev/null && echo 'EXISTS' || echo 'CLEAN')
  if [ \"\$MALWARE_DIR\" = \"EXISTS\" ]; then
    echo \"  ⚠️  /etc/de/ Malware Dir: EXISTS - WARNING!\"
  else
    echo \"  ✅ /etc/de/ Malware Dir: Removed - OK\"
  fi
  FAILED_SSH=\$(grep 'Failed password' /var/log/auth.log 2>/dev/null | wc -l)
  echo \"  Failed SSH Attempts: \$FAILED_SSH\"
" 2>/dev/null || echo "  Could not connect"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Actions Available:"
echo "   1. View all alerts: ./scripts/security/view-alerts.sh"
echo "   2. Block IP address: ssh root@SERVER 'iptables -A INPUT -s IP -j DROP'"
echo "   3. Full security scan: ssh root@SERVER '/opt/guardian/guardian-deep-scan.sh'"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"