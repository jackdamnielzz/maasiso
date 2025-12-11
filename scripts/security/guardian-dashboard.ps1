# Guardian Security Dashboard - PowerShell Version
# Run this to see consolidated security status from both servers
# Usage: .\scripts\security\guardian-dashboard.ps1

$SSH_KEY = "$env:USERPROFILE\.ssh\id_rsa"
$FRONTEND_IP = "147.93.62.188"
$BACKEND_IP = "153.92.223.23"

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "               GUARDIAN SECURITY DASHBOARD                            " -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "                  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')           " -ForegroundColor White
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Backend VPS Status
Write-Host "+---------------------------------------------------------------------+" -ForegroundColor Yellow
Write-Host "|  BACKEND VPS ($BACKEND_IP) - Strapi CMS                            |" -ForegroundColor Yellow
Write-Host "+---------------------------------------------------------------------+" -ForegroundColor Yellow
Write-Host ""
Write-Host "Recent Alerts (last 10):" -ForegroundColor Red

try {
    $backendAlerts = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "tail -10 /var/log/guardian/guardian.log 2>/dev/null" 2>$null
    if ($backendAlerts) {
        $backendAlerts | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "  No alerts found" -ForegroundColor Green
    }
} catch {
    Write-Host "  Could not connect to Backend VPS" -ForegroundColor Red
}

Write-Host ""
Write-Host "System Status:" -ForegroundColor Blue

try {
    $backendCPU = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "top -bn1 | grep 'Cpu(s)' | awk '{print `$2}'" 2>$null
    $backendMem = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "free -m | awk 'NR==2{printf `"%.1f%%`", `$3*100/`$2 }'" 2>$null
    $backendDisk = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "df -h / | awk 'NR==2{print `$5}'" 2>$null
    $backendUptime = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "uptime -p" 2>$null
    Write-Host "  CPU: $backendCPU%" -ForegroundColor White
    Write-Host "  Memory: $backendMem" -ForegroundColor White
    Write-Host "  Disk: $backendDisk" -ForegroundColor White
    Write-Host "  Uptime: $backendUptime" -ForegroundColor White
} catch {
    Write-Host "  Could not connect" -ForegroundColor Red
}

Write-Host ""
Write-Host "Security Status:" -ForegroundColor Green

try {
    $backendUFW = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "ufw status | head -1" 2>$null
    $backendSuspicious = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "ps aux | grep -E '(mine|xmr|c3pool|cX86|cARM)' | grep -v grep | wc -l" 2>$null
    $backendMalware = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "ls /etc/de/ 2>/dev/null && echo EXISTS || echo CLEAN" 2>$null
    $backendFailedSSH = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$BACKEND_IP "grep 'Failed password' /var/log/auth.log 2>/dev/null | wc -l" 2>$null
    
    Write-Host "  UFW Firewall: $backendUFW" -ForegroundColor White
    if ([int]$backendSuspicious -gt 0) {
        Write-Host "  WARNING: Suspicious Processes: $backendSuspicious FOUND!" -ForegroundColor Red
    } else {
        Write-Host "  Suspicious Processes: 0 (Clean)" -ForegroundColor Green
    }
    if ($backendMalware -eq "EXISTS") {
        Write-Host "  WARNING: /etc/de/ Malware Dir: EXISTS!" -ForegroundColor Red
    } else {
        Write-Host "  /etc/de/ Malware Dir: Removed - OK" -ForegroundColor Green
    }
    Write-Host "  Failed SSH Attempts: $backendFailedSSH" -ForegroundColor White
} catch {
    Write-Host "  Could not connect" -ForegroundColor Red
}

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Frontend VPS Status
Write-Host "+---------------------------------------------------------------------+" -ForegroundColor Yellow
Write-Host "|  FRONTEND VPS ($FRONTEND_IP) - maasiso.nl                           |" -ForegroundColor Yellow
Write-Host "+---------------------------------------------------------------------+" -ForegroundColor Yellow
Write-Host ""
Write-Host "Recent Alerts (last 10):" -ForegroundColor Red

try {
    $frontendAlerts = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "tail -10 /var/log/guardian/guardian.log 2>/dev/null" 2>$null
    if ($frontendAlerts) {
        $frontendAlerts | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "  No alerts found" -ForegroundColor Green
    }
} catch {
    Write-Host "  Could not connect to Frontend VPS" -ForegroundColor Red
}

Write-Host ""
Write-Host "System Status:" -ForegroundColor Blue

try {
    $frontendCPU = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "top -bn1 | grep 'Cpu(s)' | awk '{print `$2}'" 2>$null
    $frontendMem = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "free -m | awk 'NR==2{printf `"%.1f%%`", `$3*100/`$2 }'" 2>$null
    $frontendDisk = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "df -h / | awk 'NR==2{print `$5}'" 2>$null
    $frontendUptime = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "uptime -p" 2>$null
    Write-Host "  CPU: $frontendCPU%" -ForegroundColor White
    Write-Host "  Memory: $frontendMem" -ForegroundColor White
    Write-Host "  Disk: $frontendDisk" -ForegroundColor White
    Write-Host "  Uptime: $frontendUptime" -ForegroundColor White
} catch {
    Write-Host "  Could not connect" -ForegroundColor Red
}

Write-Host ""
Write-Host "Security Status:" -ForegroundColor Green

try {
    $frontendUFW = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "ufw status | head -1" 2>$null
    $frontendSuspicious = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "ps aux | grep -E '(mine|xmr|c3pool|cX86|cARM)' | grep -v grep | wc -l" 2>$null
    $frontendMalware = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "ls /etc/de/ 2>/dev/null && echo EXISTS || echo CLEAN" 2>$null
    $frontendFailedSSH = ssh -i $SSH_KEY -o ConnectTimeout=10 root@$FRONTEND_IP "grep 'Failed password' /var/log/auth.log 2>/dev/null | wc -l" 2>$null
    
    Write-Host "  UFW Firewall: $frontendUFW" -ForegroundColor White
    if ([int]$frontendSuspicious -gt 0) {
        Write-Host "  WARNING: Suspicious Processes: $frontendSuspicious FOUND!" -ForegroundColor Red
    } else {
        Write-Host "  Suspicious Processes: 0 (Clean)" -ForegroundColor Green
    }
    if ($frontendMalware -eq "EXISTS") {
        Write-Host "  WARNING: /etc/de/ Malware Dir: EXISTS!" -ForegroundColor Red
    } else {
        Write-Host "  /etc/de/ Malware Dir: Removed - OK" -ForegroundColor Green
    }
    Write-Host "  Failed SSH Attempts: $frontendFailedSSH" -ForegroundColor White
} catch {
    Write-Host "  Could not connect" -ForegroundColor Red
}

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Actions Available:" -ForegroundColor Magenta
Write-Host "   1. View all alerts: .\scripts\security\view-alerts.ps1" -ForegroundColor White
Write-Host "   2. Block IP: ssh root@SERVER 'iptables -A INPUT -s IP -j DROP'" -ForegroundColor White
Write-Host "   3. Full scan: ssh root@SERVER '/opt/guardian/guardian-deep-scan.sh'" -ForegroundColor White
Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan