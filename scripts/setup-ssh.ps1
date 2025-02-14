# Setup SSH keys for GitHub Actions deployment
# This script generates ED25519 SSH keys and retrieves known_hosts for VPS2

$ErrorActionPreference = "Stop"

# Configuration
$VPS_HOST = "147.93.62.188"
$VPS_PORT = "22"
$KEY_COMMENT = "github-actions-deploy@maasiso"
$KEY_FILE = "github_actions_deploy_key"

Write-Host "Starting SSH setup for GitHub Actions deployment..." -ForegroundColor Green

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
Write-Host "Retrieving known_hosts entry for VPS2..." -ForegroundColor Yellow
$knownHostsEntry = ssh-keyscan -p $VPS_PORT -t ed25519 $VPS_HOST 2>$null

# Display results
Write-Host "`nSetup complete! Use these values for GitHub repository secrets:" -ForegroundColor Green
Write-Host "`nVPS2_SSH_PRIVATE_KEY:" -ForegroundColor Cyan
Get-Content "$sshDir\$KEY_FILE"

Write-Host "`nVPS2_KNOWN_HOSTS:" -ForegroundColor Cyan
Write-Host $knownHostsEntry

Write-Host "`nPublic key to add to VPS2:" -ForegroundColor Cyan
Get-Content "$sshDir\$KEY_FILE.pub"

Write-Host "`nNext steps:" -ForegroundColor Green
Write-Host "1. Add VPS2_SSH_PRIVATE_KEY to GitHub repository secrets" -ForegroundColor Yellow
Write-Host "2. Add VPS2_KNOWN_HOSTS to GitHub repository secrets" -ForegroundColor Yellow
Write-Host "3. Add the public key to /root/.ssh/authorized_keys on VPS2" -ForegroundColor Yellow