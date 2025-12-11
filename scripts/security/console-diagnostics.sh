#!/bin/bash
# Quick SSH Diagnostics Script
# Copy-paste this entire script into Hostinger VPS Console

echo "=========================================="
echo "SSH Diagnostics - $(date)"
echo "=========================================="
echo ""

# Check SSH service status
echo "1. SSH Service Status:"
echo "----------------------"
systemctl status sshd 2>/dev/null || systemctl status ssh 2>/dev/null || echo "SSH service not found"
echo ""

# Check if SSH is running
echo "2. SSH Process:"
echo "---------------"
ps aux | grep sshd | grep -v grep
echo ""

# Check SSH configuration
echo "3. SSH Port Configuration:"
echo "--------------------------"
grep "^Port" /etc/ssh/sshd_config 2>/dev/null || echo "Using default port 22"
echo ""

# Check listening ports
echo "4. SSH Listening Ports:"
echo "-----------------------"
ss -tlnp | grep ssh || netstat -tlnp | grep ssh || echo "No SSH ports found"
echo ""

# Check firewall rules
echo "5. Firewall Rules (iptables):"
echo "------------------------------"
iptables -L INPUT -n -v | grep -E "22|ssh" || echo "No SSH rules found in iptables"
echo ""

# Check UFW if installed
echo "6. UFW Status:"
echo "--------------"
if command -v ufw &> /dev/null; then
    ufw status
else
    echo "UFW not installed"
fi
echo ""

# Check fail2ban
echo "7. Fail2Ban Status:"
echo "-------------------"
if command -v fail2ban-client &> /dev/null; then
    fail2ban-client status sshd 2>/dev/null || echo "Fail2ban not monitoring SSH"
else
    echo "Fail2ban not installed"
fi
echo ""

# Check recent SSH logs
echo "8. Recent SSH Logs:"
echo "-------------------"
tail -20 /var/log/auth.log 2>/dev/null | grep sshd || \
tail -20 /var/log/secure 2>/dev/null | grep sshd || \
echo "No SSH logs found"
echo ""

# Check SELinux
echo "9. SELinux Status:"
echo "------------------"
if command -v getenforce &> /dev/null; then
    getenforce
else
    echo "SELinux not installed"
fi
echo ""

echo "=========================================="
echo "Quick Fix Commands:"
echo "=========================================="
echo ""
echo "If SSH is not running:"
echo "  systemctl start sshd && systemctl enable sshd"
echo ""
echo "If firewall blocks SSH:"
echo "  iptables -I INPUT -p tcp --dport 22 -j ACCEPT"
echo ""
echo "If UFW blocks SSH:"
echo "  ufw allow 22/tcp && ufw reload"
echo ""
echo "Restart SSH service:"
echo "  systemctl restart sshd"
echo ""
echo "=========================================="