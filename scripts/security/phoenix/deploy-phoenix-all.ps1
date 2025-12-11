# Deploy Phoenix Guardian to BOTH VPS Servers
# ============================================
# Deploys to:
#   - Frontend VPS: 147.93.62.188
#   - Backend VPS:  153.92.223.23
#
# Created: December 10, 2025

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  🔥 PHOENIX GUARDIAN DEPLOYMENT - ALL SERVERS 🔥" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$scriptDir = $PSScriptRoot

# Deploy to Backend first (Strapi - more critical)
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  STEP 1: Deploying to Backend VPS (153.92.223.23)                 ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

try {
    & "$scriptDir\deploy-phoenix-backend.ps1"
    Write-Host "✓ Backend deployment completed" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend deployment failed: $_" -ForegroundColor Red
    Write-Host "Continuing with frontend..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host ""

# Deploy to Frontend
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  STEP 2: Deploying to Frontend VPS (147.93.62.188)                ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

try {
    & "$scriptDir\deploy-phoenix-frontend.ps1"
    Write-Host "✓ Frontend deployment completed" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend deployment failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🔥 PHOENIX GUARDIAN DEPLOYMENT COMPLETE 🔥" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers now have Phoenix Guardian installed and running." -ForegroundColor Cyan
Write-Host ""
Write-Host "Phoenix Guardian provides:" -ForegroundColor Yellow
Write-Host "  ✓ Self-healing (restores itself if deleted)" -ForegroundColor White
Write-Host "  ✓ Guardian monitoring (restores Guardian scripts)" -ForegroundColor White
Write-Host "  ✓ Attack detection (kills malware, blocks threats)" -ForegroundColor White
Write-Host "  ✓ Hidden operation (stealth mode)" -ForegroundColor White
Write-Host ""
Write-Host "Verify status on each server:" -ForegroundColor Yellow
Write-Host "  ssh root@153.92.223.23 'phoenix-ctl status'" -ForegroundColor White
Write-Host "  ssh root@147.93.62.188 'phoenix-ctl status'" -ForegroundColor White
Write-Host ""