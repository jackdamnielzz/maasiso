# Rollback script for Frontend VPS
param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

# VPS configuration
$VPS_CONFIG = @{
    'host' = '147.93.62.188'
    'path' = '/var/www/jouw-frontend-website'
}

Write-Host "Starting rollback process for Frontend VPS..."

if ($BackupFile) {
    # Use specified backup file
    $backupToRestore = $BackupFile
} else {
    # Get latest backup file
    $backupList = ssh "root@$($VPS_CONFIG.host)" "ls -t ~/backup-*.tar.gz" | Select-Object -First 1
    if (-not $backupList) {
        Write-Error "No backup files found!"
        exit 1
    }
    $backupToRestore = $backupList
}

Write-Host "Using backup file: $backupToRestore"

# Create a new backup of current state before rolling back
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$preRollbackBackup = "pre-rollback-$timestamp.tar.gz"

Write-Host "Creating pre-rollback backup..."
ssh "root@$($VPS_CONFIG.host)" "cd $($VPS_CONFIG.path) && tar -czf ~/$preRollbackBackup ."

# Perform rollback
Write-Host "Performing rollback..."
$commands = @(
    "cd $($VPS_CONFIG.path)",
    "rm -rf ./*",
    "tar -xzf ~/$backupToRestore -C .",
    "npm ci --production",
    "pm2 restart frontend || pm2 start npm --name frontend -- start"
)

$rollbackCommand = $commands -join " && "
ssh "root@$($VPS_CONFIG.host)" $rollbackCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "Rollback completed successfully!"
    Write-Host "Pre-rollback backup saved as: $preRollbackBackup"
    Write-Host "To verify:"
    Write-Host "1. Check the website functionality at http://$($VPS_CONFIG.host):3000"
    Write-Host "2. Monitor logs: ssh root@$($VPS_CONFIG.host) 'pm2 logs frontend'"
} else {
    Write-Error "Rollback failed! Please check the logs and server status."
    Write-Host "You can manually restore from the pre-rollback backup: $preRollbackBackup"
}