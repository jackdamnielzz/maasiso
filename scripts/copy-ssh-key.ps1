# PowerShell script to copy SSH key to VPS1
$ErrorActionPreference = "Stop"

# Configuration
$VPS_HOST = "153.92.223.23"
$KEY_FILE = "$env:USERPROFILE\.ssh\maasiso_vps1_key"

Write-Host "Copying SSH key to VPS1..."
Write-Host "----------------------------------------"

# Read the public key
$publicKey = Get-Content "$KEY_FILE.pub"
if (-not $publicKey) {
    Write-Host "Public key not found at $KEY_FILE.pub" -ForegroundColor Red
    exit 1
}

# Create a temporary script with the commands
$tempScript = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$publicKey' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
"@

# Save the script to a temporary file
$tempFile = New-TemporaryFile
$tempScript | Out-File -FilePath $tempFile -Encoding UTF8

# Copy the script to VPS1 and execute it
Write-Host "Copying SSH key to VPS1. You will be prompted for the password..."
try {
    # Copy the script
    scp $tempFile "root@${VPS_HOST}:/tmp/setup-ssh.sh"
    
    # Execute the script
    ssh "root@${VPS_HOST}" "bash /tmp/setup-ssh.sh && rm /tmp/setup-ssh.sh"
    
    Write-Host "SSH key successfully copied to VPS1!" -ForegroundColor Green
} catch {
    Write-Host "Failed to copy SSH key: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clean up temporary file
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

# Test the connection
Write-Host "`nTesting SSH connection..."
try {
    $test = ssh -i $KEY_FILE -o "BatchMode=yes" -o "StrictHostKeyChecking=no" "root@$VPS_HOST" "echo 'SSH connection successful'"
    Write-Host $test -ForegroundColor Green
    
    # If successful, proceed to test Strapi
    Write-Host "`nChecking Strapi status..."
    $strapiStatus = ssh -i $KEY_FILE "root@$VPS_HOST" "pm2 list | grep strapi"
    Write-Host $strapiStatus
} catch {
    Write-Host "SSH connection test failed: $($_.Exception.Message)" -ForegroundColor Red
}