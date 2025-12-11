# Test SSH Connections to Both Servers
# This script attempts to connect to both VPS servers

Write-Host "=== Testing SSH Connections ===" -ForegroundColor Cyan
Write-Host ""

# Server details
$frontend_server = "maasiso.nl"
$backend_server = "backend.maasiso.nl"
$ssh_user = "root"

# Test Frontend Server
Write-Host "Testing connection to Frontend Server ($frontend_server)..." -ForegroundColor Yellow
Write-Host "Command: ssh $ssh_user@$frontend_server 'hostname && uptime && df -h / && free -h'" -ForegroundColor Gray
Write-Host ""

try {
    ssh "$ssh_user@$frontend_server" 'hostname && uptime && df -h / && free -h'
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Frontend server connection successful!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Frontend server connection failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "`n✗ Frontend server connection error: $_" -ForegroundColor Red
}

Write-Host "`n" + ("="*60) + "`n"

# Test Backend Server
Write-Host "Testing connection to Backend Server ($backend_server)..." -ForegroundColor Yellow
Write-Host "Command: ssh $ssh_user@$backend_server 'hostname && uptime && df -h / && free -h'" -ForegroundColor Gray
Write-Host ""

try {
    ssh "$ssh_user@$backend_server" 'hostname && uptime && df -h / && free -h'
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Backend server connection successful!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Backend server connection failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "`n✗ Backend server connection error: $_" -ForegroundColor Red
}

Write-Host "`n" + ("="*60) + "`n"

# Summary
Write-Host "=== Connection Test Summary ===" -ForegroundColor Cyan
Write-Host "Frontend: ssh $ssh_user@$frontend_server" -ForegroundColor White
Write-Host "Backend:  ssh $ssh_user@$backend_server" -ForegroundColor White
Write-Host ""
Write-Host "If connections failed, check:" -ForegroundColor Yellow
Write-Host "1. SSH keys are properly configured (~/.ssh/id_rsa)" -ForegroundColor Gray
Write-Host "2. Servers are accessible (ping test)" -ForegroundColor Gray
Write-Host "3. SSH service is running on servers" -ForegroundColor Gray
Write-Host "4. Firewall allows SSH connections (port 22)" -ForegroundColor Gray