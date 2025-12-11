# Setup SSH Key Authentication for MaasISO Servers
# This script helps you add your SSH public key to the servers for passwordless login

$PublicKey = Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"

Write-Host "==========================================="
Write-Host "  SSH Key Authentication Setup"
Write-Host "==========================================="
Write-Host ""
Write-Host "Your public key:"
Write-Host $PublicKey
Write-Host ""
Write-Host "Please run this command on EACH server after logging in with password:"
Write-Host ""
Write-Host "echo '$PublicKey' >> ~/.ssh/authorized_keys"
Write-Host ""
Write-Host "==========================================="
Write-Host "Server Information:"
Write-Host "  Frontend: 147.93.62.188"
Write-Host "  Backend:  153.92.223.23"
Write-Host "==========================================="
Write-Host ""

$choice = Read-Host "Do you want me to open SSH connections now? (y/n)"

if ($choice -eq 'y') {
    Write-Host ""
    Write-Host "Opening connection to FRONTEND (147.93.62.188)..."
    Write-Host "Enter the password when prompted, then paste this command:"
    Write-Host "echo '$PublicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'Key added successfully!'"
    Write-Host ""
    Start-Process ssh -ArgumentList "-o PreferredAuthentications=password -o PubkeyAuthentication=no root@147.93.62.188"
}