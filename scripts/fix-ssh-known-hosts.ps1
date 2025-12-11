# Fix SSH Known Hosts
# This script removes old host keys and accepts new ones after server reinstallation

Write-Host "=== Fixing SSH Known Hosts ===" -ForegroundColor Cyan
Write-Host ""

$known_hosts = "$env:USERPROFILE\.ssh\known_hosts"
$frontend_server = "maasiso.nl"
$backend_server = "backend.maasiso.nl"

# Check if known_hosts exists
if (Test-Path $known_hosts) {
    Write-Host "Found known_hosts file: $known_hosts" -ForegroundColor Yellow
    
    # Backup the current known_hosts
    $backup = "$known_hosts.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $known_hosts $backup
    Write-Host "Created backup: $backup" -ForegroundColor Green
    Write-Host ""
    
    # Remove old entries for both servers
    Write-Host "Removing old host keys..." -ForegroundColor Yellow
    ssh-keygen -R $frontend_server 2>&1 | Out-Null
    ssh-keygen -R $backend_server 2>&1 | Out-Null
    Write-Host "Old host keys removed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "No known_hosts file found - will be created on first connection" -ForegroundColor Yellow
    Write-Host ""
}

# Connect to frontend server
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host "FRONTEND SERVER: $frontend_server" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host "Connecting to accept new host key..." -ForegroundColor Yellow
Write-Host ""

ssh -o StrictHostKeyChecking=accept-new root@$frontend_server 'echo Connection successful && hostname && uptime'
$frontend_ok = ($LASTEXITCODE -eq 0)

if ($frontend_ok) {
    Write-Host "`nSuccessfully connected to $frontend_server" -ForegroundColor Green
} else {
    Write-Host "`nFailed to connect to $frontend_server" -ForegroundColor Red
}
Write-Host ""

# Connect to backend server
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host "BACKEND SERVER: $backend_server" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host "Connecting to accept new host key..." -ForegroundColor Yellow
Write-Host ""

ssh -o StrictHostKeyChecking=accept-new root@$backend_server 'echo Connection successful && hostname && uptime'
$backend_ok = ($LASTEXITCODE -eq 0)

if ($backend_ok) {
    Write-Host "`nSuccessfully connected to $backend_server" -ForegroundColor Green
} else {
    Write-Host "`nFailed to connect to $backend_server" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host ("="*60) -ForegroundColor Cyan
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

if ($frontend_ok) {
    Write-Host "Frontend ($frontend_server): Connected" -ForegroundColor Green
} else {
    Write-Host "Frontend ($frontend_server): Failed" -ForegroundColor Red
}

if ($backend_ok) {
    Write-Host "Backend ($backend_server): Connected" -ForegroundColor Green
} else {
    Write-Host "Backend ($backend_server): Failed" -ForegroundColor Red
}
Write-Host ""

if ($frontend_ok -and $backend_ok) {
    Write-Host "All servers are now accessible via SSH!" -ForegroundColor Green
} else {
    Write-Host "Some servers could not be reached. Check:" -ForegroundColor Yellow
    Write-Host "1. Server is online and accessible" -ForegroundColor Gray
    Write-Host "2. SSH service is running" -ForegroundColor Gray
    Write-Host "3. Your SSH key is authorized on the server" -ForegroundColor Gray
    Write-Host "4. Firewall allows SSH connections" -ForegroundColor Gray
}