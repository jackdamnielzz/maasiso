# PowerShell script to deploy to production

# Configuration
$ErrorActionPreference = "Stop"
$REMOTE_HOST = "maasiso-vps"
$REMOTE_PATH = "/var/www/maasiso/app"
$LOCAL_PATH = $PSScriptRoot + "\.."

Write-Host "`n🚀 Starting deployment to production..."

try {
    # 1. Create a temporary directory for deployment files
    $tempDir = Join-Path $env:TEMP "maasiso-deploy"
    if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
    New-Item -ItemType Directory -Path $tempDir | Out-Null

    # 2. Copy only necessary files to temp directory
    Write-Host "`n📦 Preparing deployment files..."
    $filesToCopy = @(
        "app",
        "src",
        "public",
        "package.json",
        "package-lock.json",
        "next.config.js",
        "tsconfig.json",
        "postcss.config.js",
        "tailwind.config.js"
    )
    foreach ($file in $filesToCopy) {
        Copy-Item -Path "$LOCAL_PATH\$file" -Destination "$tempDir\" -Recurse -Force
    }

    # 3. Sync to VPS2 using rsync-style excludes
    Write-Host "`n🔄 Syncing files to VPS2..."
    & scp -r "$tempDir\*" "${REMOTE_HOST}:${REMOTE_PATH}/"
    if ($LASTEXITCODE -ne 0) { throw "SCP failed with exit code $LASTEXITCODE" }
    Write-Host "✅ Files synced to VPS2"

    # 4. Clean up temp directory
    Remove-Item -Recurse -Force $tempDir

    # 5. Run remote commands
    Write-Host "`n🔄 Installing dependencies and building on VPS2..."
    $remoteCommands = "cd $REMOTE_PATH && npm install && npm run build && pm2 restart all"
    & ssh $REMOTE_HOST $remoteCommands
    if ($LASTEXITCODE -ne 0) { throw "Remote commands failed with exit code $LASTEXITCODE" }
    Write-Host "✅ Remote commands completed"

    Write-Host "`n✨ Deployment completed successfully!"
    Write-Host "🌎 Please check https://maasiso.nl to verify the changes"

} catch {
    Write-Host "`n❌ Deployment failed: $_" -ForegroundColor Red
    if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
    exit 1
}