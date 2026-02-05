#!/usr/bin/env pwsh
# Quick deployment script for pushing local frontend changes to VPS2
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Quick Deploy: Local Frontend → VPS2" -ForegroundColor Cyan
Write-Host "================================================"

# Wrap the entire script in a try-catch block
try {
    # 1. Environment Setup
    Write-Host "📝 Setting up environment..." -ForegroundColor Yellow

    if (-not $env:STRAPI_TOKEN) {
        throw "Missing STRAPI_TOKEN in local environment. Set it before deployment."
    }

    if (-not $env:EMAIL_PASSWORD) {
        throw "Missing EMAIL_PASSWORD in local environment. Set it before deployment."
    }
    
    # Ensure production environment variables are set
    $envContent = @"
NEXT_PUBLIC_API_URL=https://maasiso.nl
NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
NEXT_PUBLIC_SITE_URL=https://maasiso.nl
STRAPI_TOKEN=$env:STRAPI_TOKEN
EMAIL_PASSWORD=$env:EMAIL_PASSWORD
"@
    $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "Environment variables configured" -ForegroundColor Green
    
    # 2. Build (if not skipped)
    if (-not $SkipBuild) {
        Write-Host "`n🔨 Building frontend..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed!"
        }
        Write-Host "Build completed" -ForegroundColor Green
    }
    else {
        Write-Host "`n⏩ Skipping build phase" -ForegroundColor Yellow
    }
    
    # 3. Deploy using VS Code SFTP
    Write-Host "`n📤 Deploying to VPS2 using SFTP..." -ForegroundColor Yellow
    Write-Host "Please complete the following steps:" -ForegroundColor Yellow
    Write-Host "1. In VS Code, press Ctrl+Shift+P" -ForegroundColor Yellow
    Write-Host "2. Type 'SFTP: Upload Folder' and press Enter" -ForegroundColor Yellow
    Write-Host "3. Select the project folder" -ForegroundColor Yellow
    Write-Host "4. Choose /var/www/jouw-frontend-website/ as the destination" -ForegroundColor Yellow
    Write-Host "`nWaiting for SFTP upload to complete..." -ForegroundColor Yellow
    
    # Prompt user to confirm SFTP upload
    $confirmation = Read-Host "`nHave you completed the SFTP upload? (y/n)"
    if ($confirmation -ne 'y') {
        throw "Deployment cancelled!"
    }
    
    # 4. Restart the application
    Write-Host "`n🔄 Restarting frontend application..." -ForegroundColor Yellow
    ssh root@147.93.62.188 @"
cd /var/www/jouw-frontend-website
pm2 show frontend 2>/dev/null
if [ $? -eq 0 ]; then
    pm2 restart frontend
else
    pm2 start npm --name frontend -- start
fi
"@
    Write-Host "Application restarted" -ForegroundColor Green
    
    Write-Host "`n✨ Deployment Complete!" -ForegroundColor Cyan
    Write-Host "================================================"
    Write-Host "Frontend URL: https://maasiso.nl"
    Write-Host "Strapi URL: http://153.92.223.23:1337"
    Write-Host "`nTo monitor the application:"
    Write-Host "1. View logs: ssh root@147.93.62.188 'pm2 logs frontend'"
    Write-Host "2. Check status: ssh root@147.93.62.188 'pm2 show frontend'"
    Write-Host "3. Monitor health: .\scripts\monitor-health.ps1"
}
catch {
    Write-Host "`nDeployment Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTo rollback to previous version:"
    Write-Host ".\scripts\rollback.ps1"
    exit 1
}
