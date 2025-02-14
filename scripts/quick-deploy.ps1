# Quick deployment script for pushing local frontend changes to VPS2
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Quick Deploy: Local Frontend → VPS2" -ForegroundColor Cyan
Write-Host "================================================`n"

try {
    # 1. Environment Setup
    Write-Host "📝 Setting up environment..." -ForegroundColor Yellow
    
    # Ensure production environment variables are set
    $envContent = @"
NEXT_PUBLIC_API_URL=http://147.93.62.188:3000
NEXT_PUBLIC_BACKEND_URL=http://147.93.62.187:1337
"@
    Set-Content -Path ".env.production" -Value $envContent
    Write-Host "✓ Environment variables configured" -ForegroundColor Green
    
    # 2. Build (if not skipped)
    if (-not $SkipBuild) {
        Write-Host "`n🔨 Building frontend..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed!"
        }
        Write-Host "✓ Build completed" -ForegroundColor Green
    } else {
        Write-Host "`n⏩ Skipping build phase" -ForegroundColor Yellow
    }
    
    # 3. Deploy using VS Code SFTP
    Write-Host "`n📤 Deploying to VPS2 using SFTP..." -ForegroundColor Yellow
    Write-Host "Please complete the following steps:"
    Write-Host "1. In VS Code, press Ctrl+Shift+P" -ForegroundColor Yellow
    Write-Host "2. Type 'SFTP: Upload Folder' and press Enter" -ForegroundColor Yellow
    Write-Host "3. Select the project folder" -ForegroundColor Yellow
    Write-Host "4. Choose /var/www/jouw-frontend-website/ as the destination" -ForegroundColor Yellow
    Write-Host "`nWaiting for SFTP upload to complete..."
    
    # Prompt user to confirm SFTP upload
    $confirmation = Read-Host "`nHave you completed the SFTP upload? (y/n)"
    if ($confirmation -ne 'y') {
        throw "Deployment cancelled!"
    }
    
    # 4. Restart the application
    Write-Host "`n🔄 Restarting frontend application..." -ForegroundColor Yellow
    ssh "root@147.93.62.188" "cd /var/www/jouw-frontend-website && pm2 restart frontend || pm2 start npm --name frontend -- start"
    Write-Host "✓ Application restarted" -ForegroundColor Green
    
    Write-Host "`n✨ Deployment Complete!" -ForegroundColor Cyan
    Write-Host "================================================"
    Write-Host "Frontend URL: http://147.93.62.188:3000"
    Write-Host "Strapi URL: http://147.93.62.187:1337"
    Write-Host "`nTo monitor the application:"
    Write-Host "1. View logs: ssh root@147.93.62.188 'pm2 logs frontend'"
    Write-Host "2. Check status: ssh root@147.93.62.188 'pm2 show frontend'"
    Write-Host "3. Monitor health: ./scripts/monitor-health.ps1"
    
} catch {
    Write-Host "`n❌ Deployment Failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nTo rollback to previous version:"
    Write-Host "./scripts/rollback.ps1"
    exit 1
}