# PowerShell script to update CORS configuration on VPS1

$middlewaresConfig = @'
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
          upgradeInsecureRequests: null,
        },
      },
      frameguard: false,
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: ['http://147.93.62.188', 'http://147.93.62.188:3000', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]
'@

Write-Host "Updating CORS configuration on VPS1..."
Write-Host "----------------------------------------"

# Create a temporary file with the new configuration
$tempFile = New-TemporaryFile
$middlewaresConfig | Out-File -FilePath $tempFile -Encoding UTF8

# Copy the file to VPS1
Write-Host "Copying new configuration to VPS1..."
try {
    scp -i ~/.ssh/maasiso_vps1 $tempFile "root@153.92.223.23:/var/www/strapi/config/middlewares.js"
    
    # Restart Strapi to apply changes
    Write-Host "Restarting Strapi service..."
    ssh -i ~/.ssh/maasiso_vps1 root@153.92.223.23 "cd /var/www/strapi && pm2 restart strapi"
    
    Write-Host "CORS configuration updated successfully!"
} catch {
    Write-Host "Error updating CORS configuration: $($_.Exception.Message)"
    exit 1
}

# Clean up temporary file
Remove-Item $tempFile

# Test connection after update
Write-Host "`nTesting connection after CORS update..."
Start-Sleep -Seconds 5 # Wait for service to restart

try {
    $response = Invoke-WebRequest -Uri "http://153.92.223.23:1337/admin" -TimeoutSec 5 -Method Head
    Write-Host "Connection successful! Status code: $($response.StatusCode)"
} catch {
    Write-Host "Connection failed after update: $($_.Exception.Message)"
}