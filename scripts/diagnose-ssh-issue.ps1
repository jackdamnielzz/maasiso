# Diagnose SSH Issue
# Check why password authentication is failing

Write-Host "=== SSH Connection Diagnosis ===" -ForegroundColor Cyan
Write-Host ""

$server = "maasiso.nl"
$user = "root"

Write-Host "Step 1: Testing basic connectivity..." -ForegroundColor Yellow
Write-Host "Pinging $server..." -ForegroundColor Gray

$ping = Test-Connection -ComputerName $server -Count 2 -Quiet
if ($ping) {
    Write-Host "✓ Server is reachable" -ForegroundColor Green
} else {
    Write-Host "✗ Server is not reachable" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 2: Checking SSH service..." -ForegroundColor Yellow
Write-Host "Testing SSH port 22..." -ForegroundColor Gray

$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient.Connect($server, 22)
    Write-Host "✓ SSH port 22 is open" -ForegroundColor Green
    $tcpClient.Close()
} catch {
    Write-Host "✗ SSH port 22 is not accessible" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 3: Attempting SSH connection with verbose output..." -ForegroundColor Yellow
Write-Host "This will show detailed connection information" -ForegroundColor Gray
Write-Host "Password: Niekties@100" -ForegroundColor Cyan
Write-Host ""

# Try SSH with verbose output to see what authentication methods are available
ssh -v "$user@$server" "echo 'Connected successfully'" 2>&1 | Select-String -Pattern "Authentications that can continue|password|publickey"

Write-Host ""
Write-Host "=== Analysis ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Common reasons for 'Permission denied' with correct password:" -ForegroundColor Yellow
Write-Host "1. PasswordAuthentication is disabled in /etc/ssh/sshd_config" -ForegroundColor White
Write-Host "2. Root login is disabled (PermitRootLogin no)" -ForegroundColor White
Write-Host "3. PAM authentication issues" -ForegroundColor White
Write-Host "4. Account is locked or expired" -ForegroundColor White
Write-Host ""
Write-Host "=== Solution ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "We need to access the server through another method:" -ForegroundColor Yellow
Write-Host "1. Use VPS provider's web console/VNC" -ForegroundColor White
Write-Host "2. Use recovery mode if available" -ForegroundColor White
Write-Host "3. Contact hosting provider for access" -ForegroundColor White
Write-Host ""
Write-Host "Once you have console access, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Edit SSH config" -ForegroundColor Gray
Write-Host "sudo nano /etc/ssh/sshd_config" -ForegroundColor White
Write-Host ""
Write-Host "# Ensure these lines are set:" -ForegroundColor Gray
Write-Host "PasswordAuthentication yes" -ForegroundColor White
Write-Host "PermitRootLogin yes" -ForegroundColor White
Write-Host ""
Write-Host "# Restart SSH service" -ForegroundColor Gray
Write-Host "sudo systemctl restart sshd" -ForegroundColor White
Write-Host ""
Write-Host "Alternative: If you have access to the VPS control panel," -ForegroundColor Yellow
Write-Host "you can add your SSH public key there directly." -ForegroundColor Yellow
Write-Host ""
Write-Host "Your public key location: $env:USERPROFILE\.ssh\id_rsa.pub" -ForegroundColor Cyan
Write-Host ""
Write-Host "Public key content:" -ForegroundColor Cyan
if (Test-Path "$env:USERPROFILE\.ssh\id_rsa.pub") {
    Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub"
} else {
    Write-Host "No public key found" -ForegroundColor Red
}