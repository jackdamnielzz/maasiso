# Enhanced deployment script with version checks and BOM handling
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    [Parameter(Mandatory=$false)]
    [int]$HealthCheckRetries = 5,
    [Parameter(Mandatory=$false)]
    [int]$HealthCheckDelay = 10,
    [Parameter(Mandatory=$false)]
    [int]$BuildTimeout = 300
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$VPS = "147.93.62.188"
$SshKeyPath = "$env:USERPROFILE\.ssh\maasiso_vps_deploy"

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

    Write-Step "Building Application"

    # Redirect npm install output to a log file
    Write-SubStep "Installing dependencies..."
    $npmInstallArgs = "--no-audit --no-fund --legacy-peer-deps"
    $npmInstallOutput = & npm install $npmInstallArgs *>&1
    $npmInstallOutput | Set-Content -Path npm-install.log -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }

    # Set environment variable for verbose logging
    $env:NEXT_VERBOSE_LOGGING = "true"

    # Run the build command and redirect output to build.log
    Write-SubStep "Building application..."
    $env:NEXT_VERBOSE_LOGGING = "true" # Ensure this is set before the command
    $npmBuildOutput = & npm "run" "build:prod" *>&1
    $npmBuildOutput | Set-Content -Path build.log -Encoding UTF8
    if ($LASTEXITCODE -ne 0) { throw "npm run build:prod failed with exit code $LASTEXITCODE" }

    # Check if build.log exists and output last 50 lines for quick feedback
    if (Test-Path "build.log") {
        Write-Host "Last 50 lines of build.log:"
        Get-Content -Path "build.log" -Tail 50
    } else {
        Write-Host "build.log not found."
    }

try {
    $startTime = Get-Date
    
    # 0. Check Node.js version on server
    Write-Step "Checking Server Environment"
    $nodeVersion = ssh -i $SshKeyPath "root@$VPS" "node -v"
    if ($nodeVersion -notmatch "v20") {
        Write-SubStep "Updating Node.js on server..." -Status "Warning"
        $updateNodeCommand = @'
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g npm@latest
'@
        ssh -i $SshKeyPath "root@$VPS" $updateNodeCommand
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
NEXT_PUBLIC_API_URL=http://153.92.223.23:1337
NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
NEXT_PUBLIC_SITE_URL=https://maasiso.nl
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
            # Clean node_modules and package-lock.json to ensure fresh install
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$tempDir\node_modules"
            Remove-Item -Force -ErrorAction SilentlyContinue "$tempDir\package-lock.json"
            $npmInstallArgs = "--no-audit --no-fund --legacy-peer-deps"
            $npmInstallOutput = & npm install $npmInstallArgs *>&1
            $npmInstallOutput | Set-Content -Path npm-install.log -Encoding UTF8
            if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }
            
            Write-SubStep "Building application..."
            # Log all build output to build.log for debugging API route and build issues
            $env:NEXT_VERBOSE_LOGGING = "true" # Ensure this is set before the command
            $npmBuildOutput = & npm "run" "build:prod" *>&1
            $npmBuildOutput | Set-Content -Path build.log -Encoding UTF8
            if ($LASTEXITCODE -ne 0) {
                Write-SubStep "Build failed. See build.log for details." -Status "Error"
                throw "Build failed with exit code $LASTEXITCODE"
            }
            
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
        $tarArgs = "-czf deploy.tar.gz --exclude=.git --exclude=node_modules --exclude=deploy.tar.gz --exclude=.vscode ."
        $tarOutput = & tar $tarArgs *>&1 # Redirect tar output to a log file
        $tarOutput | Set-Content -Path tar.log -Encoding UTF8
        if ($LASTEXITCODE -ne 0) { throw "tar command failed with exit code $LASTEXITCODE" }
        if (-not (Test-Path (Join-Path $tempDir "deploy.tar.gz"))) {
            throw "Failed to create deployment package"
        }
        Write-SubStep "Package created successfully" -Status "Success"
        
        # Transfer package
        Write-Step "Transferring Files"
        & scp -i $SshKeyPath deploy.tar.gz "root@${VPS}:/tmp/"
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

# Copy entire .next/standalone directory recursively to ensure all files and subdirectories are included
echo "Copying entire .next/standalone directory recursively..."
cp -r .next/standalone /var/www/frontend/.next/standalone

# Fix permissions and ownership to avoid 403 errors
chown -R www-data:www-data /var/www/frontend
chmod -R 755 /var/www/frontend

# Ensure critical.css and other static files are copied
cp -r .next/standalone/app /var/www/frontend/.next/standalone/app

echo "Setting up environment..."
cat > .env << EOL
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://153.92.223.23:1337
NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
NEXT_PUBLIC_SITE_URL=https://maasiso.nl
NEXT_PUBLIC_STRAPI_TOKEN=3c4ac08a200558b9283a61b247b25c380b9950ea723ac2564b294f02491f28d184fc45d7fefe5d51db43e9fd0fcd81a3343c3cdc690311b89a418a177149b14347a5ebf749dd78c801aa7310bf2731c1233e9f2438bf113c2b020585bf0dcd76ea61f80ceee59cb1c5aabb23402440c30aa163c7cb
NEXT_PUBLIC_BUILD_NUMBER='$buildNumber'
EOL

chmod 600 .env
rm /tmp/deploy.tar.gz

echo "Installing dependencies..."
npm install --no-audit --no-fund --legacy-peer-deps

echo "Copying dependencies to standalone directory..."
cp -r node_modules /var/www/frontend/.next/standalone/
cp package.json /var/www/frontend/.next/standalone/

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
    & scp -i $SshKeyPath $tempFile "root@${VPS}:/tmp/deploy.sh"
    # Run deploy.sh on server and redirect output to /tmp/deploy.log
    & ssh -i $SshKeyPath "root@$VPS" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh > /tmp/deploy.log 2>&1"
    
    # Download the deploy.log file from server to local tempDir for review
    & scp -i $SshKeyPath "root@${VPS}:/tmp/deploy.log" (Join-Path $tempDir "deploy.log")
    
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
    Write-Host "1. View logs: ssh -i `"$SshKeyPath`" root@$VPS 'pm2 logs frontend'"
    Write-Host "2. Check status: ssh -i `"$SshKeyPath`" root@$VPS 'pm2 show frontend'"
    Write-Host "3. Monitor health: ./scripts/monitor-health.ps1"
    
} catch {
    Write-Step "Deployment Failed!"
    Write-Host "Error: $_" -ForegroundColor Red
    
    Write-SubStep "Deployment failed. Manual intervention required." -Status "Error"
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}