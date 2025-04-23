# Enhanced deployment script with version checks and BOM handling
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    [Parameter(Mandatory=$false)]
    [int]$HealthCheckRetries = 5,
    [Parameter(Mandatory=$false)]
    [int]$HealthCheckDelay = 10,
    [Parameter(Mandatory=$false)]
    [int]$BuildTimeout = 300,
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    [Parameter(Mandatory=$true)]
    [string]$SshKeyPath,
    [Parameter(Mandatory=$true)]
    [string]$NextPublicApiUrl,
    [Parameter(Mandatory=$true)]
    [string]$NextPublicBackendUrl,
    [Parameter(Mandatory=$true)]
    [string]$NextPublicSiteUrl
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
# Parameters are defined at the top of the script
# $VPS and $SshKeyPath are now script parameters

# Create temp directory for build
$tempDir = Join-Path $env:TEMP "maasiso-build-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir | Out-Null

function Write-Step {
    param([string]$Message)
    Write-Host "`n🚀 $Message" -ForegroundColor Cyan
    Write-Host "================================================"
}

function Write-SubStep {
    param(
        [string]$Message,
        [string]$Status = "Running"
    )
    $color = switch($Status) {
        "Running" { "Yellow" }
        "Success" { "Green" }
        "Error" { "Red" }
        "Warning" { "DarkYellow" }
        default { "White" }
    }
    Write-Host "  → $Message" -ForegroundColor $color
}

function Get-UserConfirmation {
    param([string]$Message)
    $response = Read-Host "$Message (y/n)"
    return $response.ToLower() -eq 'y'
}


function Stop-NodeProcesses {
    Get-Process -Name "node", "npm" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $_.Kill()
            $_.WaitForExit()
        } catch {
            Write-SubStep "Failed to kill process $($_.Id): $_" -Status "Warning"
        }
    }
}

try {
    $startTime = Get-Date
    
    # 0. Check Node.js version on server
    Write-Step "Checking Server Environment"
    $nodeVersion = ssh -i $SshKeyPath "root@$ServerIP" "node -v"
    if ($nodeVersion -notmatch "v20") {
        Write-SubStep "Updating Node.js on server..." -Status "Warning"
        $updateNodeCommand = @'
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g npm@latest
'@
        ssh -i $SshKeyPath "root@$ServerIP" $updateNodeCommand
        Write-SubStep "Node.js updated on server" -Status "Success"
    }
    
    # 1. Copy project files to temp directory
    Write-Step "Preparing Build Environment"
    Write-SubStep "Copying project files to temporary directory..."
    
    # Stop any running Node processes
    Stop-NodeProcesses
    
    # Copy all files except node_modules and .next
    Get-ChildItem -Path . -Exclude @("node_modules", ".next", ".git") | Copy-Item -Destination $tempDir -Recurse
    
    # Set up environment file
    $buildNumber = "v$(Get-Date -Format 'yyyy.MM.dd.HHmm')"
    $envContent = @"
NODE_ENV=production
NEXT_PUBLIC_API_URL=$NextPublicApiUrl
NEXT_PUBLIC_BACKEND_URL=$NextPublicBackendUrl
NEXT_PUBLIC_SITE_URL=$NextPublicSiteUrl
NEXT_PUBLIC_STRAPI_TOKEN=3c4ac08a200558b9283d56e31422487e9aebf3435a61b247b25c380b9950ea723ac2564b294f02491f28d184fc45d7fefe5d51db43e9fd0fcd81a3343c3cdc690311b89a418a177149b14347a5ebf749dd78c801aa7310bf2731c1233e9f2438bf113c2b020585bf0dcd76ea61f80ceee59cb1c5aabb23402440c30aa163c7cb
NEXT_PUBLIC_BUILD_NUMBER=$buildNumber
"@
    Set-Content -Path (Join-Path $tempDir ".env.production") -Value $envContent -NoNewline -Encoding UTF8
    Write-SubStep "Environment configured" -Status "Success"
    
    # 2. Build in temp directory
    if(-not $SkipBuild) {
        Write-Step "Building Application"
        Push-Location $tempDir
        
        try {
            Write-SubStep "Installing dependencies..."
            npm install --no-audit --no-fund --legacy-peer-deps
            if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
            
            Write-SubStep "Building application..."
            npm run build:prod
            if ($LASTEXITCODE -ne 0) { throw "Build failed" }
            
            Write-SubStep "Build completed successfully" -Status "Success"
        }
        finally {
            Pop-Location
        }
    }
    
    
    # 4. Create deployment package
    Write-Step "Creating Deployment Package"
    Push-Location $tempDir
    try {
        tar -czf deploy.tar.gz --exclude=".git" --exclude="node_modules" --exclude="deploy.tar.gz" --exclude=".vscode" .
        if (-not (Test-Path "deploy.tar.gz")) {
            throw "Failed to create deployment package"
        }
        Write-SubStep "Package created successfully" -Status "Success"
        
        # Transfer package
        Write-Step "Transferring Files"
        scp -i $SshKeyPath deploy.tar.gz "root@${ServerIP}:/tmp/"
        Write-SubStep "Files transferred successfully" -Status "Success"
    }
    finally {
        Pop-Location
    }
    
    # 5. Deploy
    Write-Step "Deploying Application"
    $deployScript = @'
#!/bin/bash
set -e

echo "Extracting files..."
cd /var/www/frontend
tar -xzf /tmp/deploy.tar.gz

# Copy critical.css and ensure proper permissions
echo "Copying critical.css..."
mkdir -p .next/standalone/app
cp app/critical.css .next/standalone/app/
chmod 644 .next/standalone/app/critical.css
chown www-data:www-data .next/standalone/app/critical.css

# Copy static assets with proper structure
echo "Copying static assets..."
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
chmod -R 755 .next/standalone/.next/static

# Copy public directory
echo "Copying public directory..."
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/
chmod -R 755 .next/standalone/public

# Ensure proper ownership of static files and public directory
chown -R www-data:www-data .next/standalone/.next/static
chown -R www-data:www-data .next/standalone/public

# Fix permissions and ownership to avoid 403 errors
chown -R www-data:www-data /var/www/frontend
chmod -R 755 /var/www/frontend

# Do not overwrite the existing .env file on the server.
# The .env.production file is created locally before the build and included in the tarball.
# The server's .env file should be managed separately.
rm /tmp/deploy.tar.gz

# Remove npm install from server-side deployment as dependencies are included in standalone output.

echo "Cleaning up and restarting application..."
# Stop all Node processes
pkill -f node || true
sleep 2

# Clear all caches
echo "Clearing caches..."
# Clear Next.js cache
rm -rf .next/cache/*
# Clear Node.js cache
rm -rf /tmp/node-*
rm -rf ~/.npm/_cacache
# Clear nginx cache
rm -rf /var/cache/nginx/*
nginx -s reload || true

# Stop and remove PM2 process
pm2 stop frontend || true
pm2 delete frontend || true
pm2 flush

# Clear PM2 logs
pm2 flush

# Start application with PM2
cd .next/standalone
NODE_ENV=production pm2 start server.js --name frontend --cwd /var/www/frontend/.next/standalone
pm2 save
cd ../..
# Purge all caches after deployment
echo "Purging caches..."
# Purge nginx cache
nginx -s reload
# Force Next.js to revalidate all pages
curl -X POST http://localhost:3000/api/revalidate?secret=$REVALIDATE_TOKEN || true
# Clear CDN cache if present
curl -X PURGE https://maasiso.nl/* || true


# Give the application time to start
sleep 5

echo "Verifying deployment..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "Application is healthy"
        exit 0
    fi
    sleep 2
done

echo "Health check failed"
exit 1
'@
    
    # Save deploy script with Unix line endings and no BOM
    $deployScript = $deployScript.Replace("`r`n", "`n")
    $tempFile = [System.IO.Path]::GetTempFileName()
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($tempFile, $deployScript, $utf8NoBom)
    
    # Transfer and execute deployment script
    scp -i $SshKeyPath $tempFile "root@${ServerIP}:/tmp/deploy.sh"
    ssh -i $SshKeyPath "root@$ServerIP" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
    Write-SubStep "Deployment completed successfully" -Status "Success"
    
    # 6. Cleanup
    Write-Step "Cleaning Up"
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
    
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Step "Deployment Completed Successfully!"
    Write-Host "Duration: $($duration.Minutes)m $($duration.Seconds)s"
    Write-Host "Frontend URL: https://maasiso.nl"
    Write-Host "Strapi URL: http://strapicms.maasiso.cloud:1337"
    Write-Host "`nMonitoring Commands:"
    Write-Host "1. View logs: ssh -i `"$SshKeyPath`" root@$ServerIP 'pm2 logs frontend'"
    Write-Host "2. Check status: ssh -i `"$SshKeyPath`" root@$ServerIP 'pm2 show frontend'"
    Write-Host "3. Monitor health: ./scripts/monitor-health.ps1"
    
} catch {
    Write-Step "Deployment Failed!"
    Write-Host "Error: $_" -ForegroundColor Red
    
    Write-SubStep "Deployment failed. Manual intervention required." -Status "Error"
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}