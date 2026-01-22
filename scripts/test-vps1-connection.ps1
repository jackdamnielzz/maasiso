# PowerShell script to test VPS1 connection and check Strapi status
$ErrorActionPreference = "Stop"

Write-Host "Testing VPS1 Connection and Strapi Status..."
Write-Host "----------------------------------------"

# Configuration
$VPS_HOST = "153.92.223.23"
$KEY_FILE = "$env:USERPROFILE\.ssh\maasiso_vps1_key"

# Test SSH connection
Write-Host "`n1. Testing SSH connection..."
try {
    $sshTest = ssh -i $KEY_FILE -o "BatchMode=yes" -o "StrictHostKeyChecking=no" "root@$VPS_HOST" "echo 'SSH connection successful'"
    Write-Host $sshTest -ForegroundColor Green
} catch {
    Write-Host "SSH connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease run the following command to add your key to VPS1:"
    Write-Host "ssh-copy-id -i $KEY_FILE root@$VPS_HOST" -ForegroundColor Yellow
    exit 1
}

# Check Strapi process
Write-Host "`n2. Checking Strapi process status..."
try {
    $strapiStatus = ssh -i $KEY_FILE "root@$VPS_HOST" "pm2 list | grep strapi"
    Write-Host "Strapi process status:" -ForegroundColor Cyan
    Write-Host $strapiStatus

    # Check if Strapi is running
    if ($strapiStatus -match "online") {
        Write-Host "Strapi is running" -ForegroundColor Green
    } else {
        Write-Host "Strapi is not running. Attempting to start..." -ForegroundColor Yellow
        $startStrapi = ssh -i $KEY_FILE "root@$VPS_HOST" "cd /var/www/strapi && NODE_ENV=production pm2 start strapi"
        Write-Host $startStrapi
    }
} catch {
    Write-Host "Failed to check Strapi status: $($_.Exception.Message)" -ForegroundColor Red
}

# Check port 1337
Write-Host "`n3. Checking if port 1337 is listening..."
try {
    $portStatus = ssh -i $KEY_FILE "root@$VPS_HOST" "netstat -tulpn | grep :1337"
    if ($portStatus) {
        Write-Host "Port 1337 is listening:" -ForegroundColor Green
        Write-Host $portStatus
    } else {
        Write-Host "Port 1337 is not listening" -ForegroundColor Red
    }
} catch {
    Write-Host "Failed to check port status: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Strapi HTTP connection
Write-Host "`n4. Testing HTTP connection to Strapi..."
try {
    $response = Invoke-WebRequest -Uri "http://$VPS_HOST:1337/admin" -TimeoutSec 5 -Method Head
    Write-Host "HTTP connection successful! Status code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "HTTP connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDiagnostics complete!"