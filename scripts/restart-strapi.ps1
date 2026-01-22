# PowerShell script to check and restart Strapi service on VPS1

Write-Host "Checking and restarting Strapi service on VPS1..."
Write-Host "------------------------------------------------"

# SSH command to check and restart Strapi
$sshCommand = @"
echo 'Checking PM2 processes...'
pm2 list

echo 'Checking system resources...'
free -h
df -h

echo 'Stopping Strapi...'
pm2 stop strapi

echo 'Checking Strapi logs before restart...'
tail -n 50 /var/www/strapi/logs/strapi.log

echo 'Starting Strapi...'
cd /var/www/strapi
NODE_ENV=production pm2 start strapi

echo 'Verifying Strapi status...'
pm2 status strapi
"@

# Execute SSH command
Write-Host "Connecting to VPS1..."
try {
    ssh root@153.92.223.23 $sshCommand
    Write-Host "Strapi service restart completed."
} catch {
    Write-Host "Error executing SSH command: $($_.Exception.Message)"
    exit 1
}

# Test connection after restart
Write-Host "`nTesting Strapi connection after restart..."
Start-Sleep -Seconds 10 # Wait for service to fully start

try {
    $response = Invoke-WebRequest -Uri "http://153.92.223.23:1337/admin" -TimeoutSec 5 -Method Head
    Write-Host "Connection successful! Status code: $($response.StatusCode)"
} catch {
    Write-Host "Connection failed after restart: $($_.Exception.Message)"
}