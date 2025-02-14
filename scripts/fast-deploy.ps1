# PowerShell script for fast deployment using Git-like approach
param (
    [switch]$force = $false
)

$ErrorActionPreference = "Stop"
$REMOTE_HOST = "maasiso-vps"
$REMOTE_PATH = "/var/www/maasiso/app"
$LOCAL_PATH = $PSScriptRoot + "\.."
$HASH_FILE = ".deployment-hash"
$EXCLUDE_PATTERNS = @(
    "node_modules/*",
    ".next/*",
    ".git/*",
    "*.log",
    "*.lock",
    "scripts/latest_backup/*"
)

# Function to calculate hash of a file
function Get-FileHash256 {
    param($filePath)
    $hash = Get-FileHash -Path $filePath -Algorithm SHA256
    return $hash.Hash
}

# Function to get all files excluding patterns
function Get-TrackedFiles {
    $allFiles = Get-ChildItem -Path $LOCAL_PATH -Recurse -File | 
        Where-Object { 
            $file = $_.FullName.Replace($LOCAL_PATH, "").TrimStart("\")
            -not ($EXCLUDE_PATTERNS | Where-Object { $file -like $_ }).Count
        }
    return $allFiles
}

Write-Host "`n🔍 Analyzing changes..."

# Load previous hashes if they exist
$previousHashes = @{}
if (Test-Path "$LOCAL_PATH\$HASH_FILE") {
    Get-Content "$LOCAL_PATH\$HASH_FILE" | ForEach-Object {
        $parts = $_ -split "`t"
        if ($parts.Count -eq 2) {
            $previousHashes[$parts[0]] = $parts[1]
        }
    }
}

# Calculate current hashes and find changed files
$currentHashes = @{}
$changedFiles = @()
$trackedFiles = Get-TrackedFiles

foreach ($file in $trackedFiles) {
    $relativePath = $file.FullName.Replace($LOCAL_PATH, "").TrimStart("\")
    $currentHash = Get-FileHash256 $file.FullName
    $currentHashes[$relativePath] = $currentHash

    if ($force -or -not $previousHashes.ContainsKey($relativePath) -or 
        $previousHashes[$relativePath] -ne $currentHash) {
        $changedFiles += $relativePath
    }
}

if ($changedFiles.Count -eq 0) {
    Write-Host "✨ No changes detected. Use -force to deploy all files."
    exit 0
}

Write-Host "`n📦 Changed files to deploy: $($changedFiles.Count)"
$changedFiles | ForEach-Object { Write-Host "  - $_" }

# Create a temporary directory for changed files
$tempDir = Join-Path $env:TEMP "deploy-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    Write-Host "`n📤 Preparing files for deployment..."
    foreach ($file in $changedFiles) {
        $sourceFile = Join-Path $LOCAL_PATH $file
        $targetFile = Join-Path $tempDir $file
        $targetDir = Split-Path -Parent $targetFile
        
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item $sourceFile $targetFile -Force
    }

    Write-Host "`n🚀 Deploying changed files to server..."
    & scp -r "$tempDir/*" "${REMOTE_HOST}:${REMOTE_PATH}/"
    if ($LASTEXITCODE -ne 0) { throw "SCP failed with exit code $LASTEXITCODE" }

    Write-Host "`n🔄 Running build on server..."
    $remoteCommands = "cd $REMOTE_PATH && npm install && npm run build && pm2 restart all"
    & ssh $REMOTE_HOST $remoteCommands
    if ($LASTEXITCODE -ne 0) { throw "Remote commands failed with exit code $LASTEXITCODE" }

    # Save new hashes
    $currentHashes.GetEnumerator() | ForEach-Object {
        "$($_.Key)`t$($_.Value)"
    } | Set-Content "$LOCAL_PATH\$HASH_FILE"

    Write-Host "`n✨ Deployment completed successfully!"
    Write-Host "🌎 Please check https://maasiso.nl to verify the changes"

} catch {
    Write-Host "`n❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
} finally {
    # Cleanup
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir
    }
}