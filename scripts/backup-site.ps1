# Backup script for MaasISO Frontend
# Creates timestamped backups and maintains backup rotation

param(
    [string]$SitePath = "/var/www/jouw-frontend-website",
    [string]$BackupDir = "/var/www/backups",
    [int]$KeepBackups = 5  # Number of backups to retain
)

$ErrorActionPreference = "Stop"

# Ensure backup directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory: $BackupDir"
}

# Generate timestamp for backup name
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupName = "frontend_backup_$timestamp"
$backupPath = Join-Path $BackupDir $backupName

function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Test-BackupIntegrity {
    param($BackupPath)
    
    # Check for essential files
    $requiredFiles = @(
        "package.json",
        "next.config.js",
        ".next",
        "public"
    )
    
    $valid = $true
    foreach ($file in $requiredFiles) {
        $path = Join-Path $BackupPath $file
        if (-not (Test-Path $path)) {
            Write-Log "ERROR: Missing required file/directory: $file"
            $valid = $false
        }
    }
    
    # Check package.json can be parsed
    try {
        $packageJson = Join-Path $BackupPath "package.json"
        $null = Get-Content $packageJson | ConvertFrom-Json
    }
    catch {
        Write-Log "ERROR: Invalid package.json in backup"
        $valid = $false
    }
    
    return $valid
}

try {
    Write-Log "Starting backup of frontend site"
    Write-Log "Source: $SitePath"
    Write-Log "Destination: $backupPath"
    
    # Create backup
    Copy-Item -Path $SitePath -Destination $backupPath -Recurse
    
    # Verify backup integrity
    if (-not (Test-BackupIntegrity $backupPath)) {
        throw "Backup verification failed"
    }
    
    # Create symlink to latest backup
    $latestLink = Join-Path $BackupDir "latest"
    if (Test-Path $latestLink) {
        Remove-Item $latestLink
    }
    New-Item -ItemType SymbolicLink -Path $latestLink -Target $backupPath
    
    # Cleanup old backups
    $allBackups = Get-ChildItem -Path $BackupDir -Directory |
        Where-Object { $_.Name -match "frontend_backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}" } |
        Sort-Object CreationTime -Descending
    
    if ($allBackups.Count -gt $KeepBackups) {
        $toDelete = $allBackups | Select-Object -Skip $KeepBackups
        foreach ($backup in $toDelete) {
            Write-Log "Removing old backup: $($backup.Name)"
            Remove-Item $backup.FullName -Recurse -Force
        }
    }
    
    Write-Log "Backup completed successfully"
    Write-Log "Backup location: $backupPath"
    Write-Log "Latest backup symlink: $latestLink"
    Write-Log "Total backups: $($allBackups.Count)"
    
}
catch {
    Write-Log "ERROR: Backup failed - $($_.Exception.Message)"
    if (Test-Path $backupPath) {
        Remove-Item $backupPath -Recurse -Force
    }
    throw
}