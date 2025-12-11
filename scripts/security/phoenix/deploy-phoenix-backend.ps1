# Deploy Phoenix Guardian to Backend VPS (Strapi)
# ================================================
# Server: 153.92.223.23
# 
# This script copies Phoenix files and runs installation
#
# Created: December 10, 2025

$ErrorActionPreference = "Stop"

# Configuration
$BACKEND_IP = "153.92.223.23"
$BACKEND_USER = "root"
$LOCAL_PHOENIX_DIR = "$PSScriptRoot"
$REMOTE_TEMP_DIR = "/tmp/phoenix-install"

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "  🔥 PHOENIX GUARDIAN DEPLOYMENT - BACKEND VPS 🔥" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""
Write-Host "Target: ${BACKEND_USER}@${BACKEND_IP}" -ForegroundColor Cyan
Write-Host ""

# Check if Phoenix files exist
$phoenixFiles = @(
    "phoenix-guardian.sh",
    "install-phoenix.sh",
    "phoenix-test.sh"
)

Write-Host "[1/5] Checking local files..." -ForegroundColor Yellow
foreach ($file in $phoenixFiles) {
    $filePath = Join-Path $LOCAL_PHOENIX_DIR $file
    if (!(Test-Path $filePath)) {
        Write-Host "ERROR: Missing file: $file" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ $file" -ForegroundColor Green
}

# Create remote directory and copy files
Write-Host ""
Write-Host "[2/5] Creating remote directory..." -ForegroundColor Yellow
ssh ${BACKEND_USER}@${BACKEND_IP} "mkdir -p $REMOTE_TEMP_DIR"

Write-Host ""
Write-Host "[3/5] Copying Phoenix files to backend..." -ForegroundColor Yellow
foreach ($file in $phoenixFiles) {
    $filePath = Join-Path $LOCAL_PHOENIX_DIR $file
    Write-Host "  Copying $file..."
    scp $filePath "${BACKEND_USER}@${BACKEND_IP}:${REMOTE_TEMP_DIR}/"
}

# Make scripts executable
Write-Host ""
Write-Host "[4/5] Setting permissions..." -ForegroundColor Yellow
ssh ${BACKEND_USER}@${BACKEND_IP} "chmod +x ${REMOTE_TEMP_DIR}/*.sh"

# Run installation
Write-Host ""
Write-Host "[5/5] Running Phoenix installation on backend..." -ForegroundColor Yellow
Write-Host ""
ssh ${BACKEND_USER}@${BACKEND_IP} "cd ${REMOTE_TEMP_DIR} && ./install-phoenix.sh install"

# Verify installation
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Verifying Installation..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

ssh ${BACKEND_USER}@${BACKEND_IP} "phoenix-ctl status" 2>$null

# Cleanup
Write-Host ""
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
ssh ${BACKEND_USER}@${BACKEND_IP} "rm -rf ${REMOTE_TEMP_DIR}"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ Phoenix Guardian deployed to Backend VPS!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Management commands (run on backend):" -ForegroundColor Cyan
Write-Host "  phoenix-ctl status   - Check Phoenix status"
Write-Host "  phoenix-ctl logs     - View Phoenix logs"
Write-Host "  phoenix-ctl check    - Run manual security check"
Write-Host ""