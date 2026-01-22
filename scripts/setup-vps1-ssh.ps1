# Setup SSH keys for VPS1 (Backend)
$ErrorActionPreference = "Stop"

# Configuration
$VPS_HOST = "153.92.223.23"
$VPS_PORT = "22"
$KEY_COMMENT = "maasiso-backend-deploy@vps1"
$KEY_FILE = "maasiso_vps1_key"

Write-Host "Starting SSH setup for VPS1 (Backend)..." -ForegroundColor Green

# Create .ssh directory if it doesn't exist
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir
    Write-Host "Created .ssh directory" -ForegroundColor Yellow
}

# Generate ED25519 key pair
Write-Host "Generating ED25519 SSH key pair..." -ForegroundColor Yellow
ssh-keygen -t ed25519 -C $KEY_COMMENT -f "$sshDir\$KEY_FILE" -N '""'

# Get known_hosts entry
Write-Host "Retrieving known_hosts entry for VPS1..." -ForegroundColor Yellow
$knownHostsEntry = ssh-keyscan -p $VPS_PORT -t ed25519 $VPS_HOST 2>$null

# Display results
Write-Host "`nSetup complete! Here's what you need:" -ForegroundColor Green

Write-Host "`nPrivate key location:" -ForegroundColor Cyan
Write-Host "$sshDir\$KEY_FILE"

Write-Host "`nPublic key to add to VPS1:" -ForegroundColor Cyan
Get-Content "$sshDir\$KEY_FILE.pub"

Write-Host "`nKnown hosts entry:" -ForegroundColor Cyan
Write-Host $knownHostsEntry

Write-Host "`nNext steps:" -ForegroundColor Green
Write-Host "1. Copy the public key to VPS1 using:" -ForegroundColor Yellow
Write-Host "   ssh-copy-id -i $sshDir\$KEY_FILE root@$VPS_HOST"
Write-Host "   (You'll need to enter the password one last time)"
Write-Host "2. Test the connection using:" -ForegroundColor Yellow
Write-Host "   ssh -i $sshDir\$KEY_FILE root@$VPS_HOST"