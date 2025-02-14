# PowerShell script to sync with production

# Configuration
$ErrorActionPreference = "Stop"
$VerbosePreference = "Continue"
$REMOTE_HOST = "147.93.62.188"
$REMOTE_PATH = "/var/www/maasiso/app"
$LOCAL_PATH = (Get-Item $PSScriptRoot).Parent.FullName
$TEMP_DIR = Join-Path $LOCAL_PATH "temp_prod_files"
$PASSWORD = "Niekties@10!"

# Simple progress display function
function Write-ProcessStep {
    param([string]$Step)
    Write-Host "`n$Step " -NoNewline
    $job = Start-Job -ScriptBlock {
        while ($true) {
            Start-Sleep -Milliseconds 500
            Write-Host "." -NoNewline
        }
    }
    return $job
}

function Complete-ProcessStep {
    param($Job)
    if ($Job) {
        Stop-Job $Job
        Remove-Job $Job
        Write-Host " Done"
    }
}

# Function to execute remote command with password
function Invoke-RemoteCommand {
    param([string]$Command)
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = "ssh.exe"
    $pinfo.RedirectStandardInput = $true
    $pinfo.RedirectStandardOutput = $true
    $pinfo.RedirectStandardError = $true
    $pinfo.UseShellExecute = $false
    $pinfo.Arguments = "root@$REMOTE_HOST `"$Command`""

    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $pinfo
    $p.Start() | Out-Null

    Start-Sleep -Milliseconds 1000
    $p.StandardInput.WriteLine($PASSWORD)
    $output = $p.StandardOutput.ReadToEnd()
    $errorOutput = $p.StandardError.ReadToEnd()
    $p.WaitForExit()

    return @{
        Output = $output
        Error = $errorOutput
        ExitCode = $p.ExitCode
    }
}

Write-Host "`nStarting sync from production..."
Write-Host "This will make your local version exactly match the production version on VPS2"

try {
    # 0. Stop any running processes
    Write-Host "`nStopping any running processes..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2

    # 1. Create temp directory
    Write-Host "`nPreparing local environment..."
    if (Test-Path $TEMP_DIR) {
        Set-Location $LOCAL_PATH
        Remove-Item -Path $TEMP_DIR -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null
    Write-Host "Local environment ready"

    # 2. Get .env file first
    $progress = Write-ProcessStep "Getting environment configuration"
    $result = Invoke-RemoteCommand "cat $REMOTE_PATH/.env"
    if ($result.ExitCode -eq 0) {
        $result.Output | Out-File -FilePath (Join-Path $LOCAL_PATH ".env") -Encoding UTF8 -Force
    }
    Complete-ProcessStep $progress

    # 3. Create and download archive
    $progress = Write-ProcessStep "Creating archive on server"
    $result = Invoke-RemoteCommand "cd $REMOTE_PATH && tar --exclude='node_modules' --exclude='.next' -czf /tmp/site.tar.gz ./*"
    Complete-ProcessStep $progress
    if ($result.ExitCode -ne 0) {
        throw "Failed to create archive: $($result.Error)"
    }

    # 4. Download the archive
    $progress = Write-ProcessStep "Downloading files"
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = "scp.exe"
    $pinfo.RedirectStandardInput = $true
    $pinfo.RedirectStandardOutput = $true
    $pinfo.RedirectStandardError = $true
    $pinfo.UseShellExecute = $false
    $pinfo.Arguments = "root@${REMOTE_HOST}:/tmp/site.tar.gz `"$TEMP_DIR/site.tar.gz`""

    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $pinfo
    $p.Start() | Out-Null

    Start-Sleep -Milliseconds 1000
    $p.StandardInput.WriteLine($PASSWORD)
    $p.WaitForExit()
    Complete-ProcessStep $progress
    if ($p.ExitCode -ne 0) {
        throw "Failed to download archive"
    }

    # 5. Extract the archive
    $progress = Write-ProcessStep "Extracting files"
    Set-Location $TEMP_DIR
    tar -xzf site.tar.gz
    Complete-ProcessStep $progress
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to extract archive"
    }
    Remove-Item site.tar.gz

    # 6. Replace local files
    $progress = Write-ProcessStep "Updating local files"
    Set-Location $LOCAL_PATH
    Get-ChildItem -Path $LOCAL_PATH -Exclude @("temp_prod_files", ".git", "node_modules", ".next", "scripts") | 
    ForEach-Object {
        Remove-Item -Path $_.FullName -Recurse -Force
    }
    
    Start-Sleep -Seconds 2
    Get-ChildItem -Path $TEMP_DIR | Copy-Item -Destination $LOCAL_PATH -Recurse -Force
    Set-Location $LOCAL_PATH
    Remove-Item -Path $TEMP_DIR -Recurse -Force
    Complete-ProcessStep $progress

    # 7. Clean up server
    Write-Host "`nCleaning up temporary files..."
    $result = Invoke-RemoteCommand "rm -f /tmp/site.tar.gz"
    Write-Host "Cleanup completed"

    # 8. Install dependencies
    $progress = Write-ProcessStep "Installing dependencies"
    Set-Location $LOCAL_PATH
    & npm install
    Complete-ProcessStep $progress
    if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }

    # 9. Build the application
    $progress = Write-ProcessStep "Building application"
    & npm run build
    Complete-ProcessStep $progress
    if ($LASTEXITCODE -ne 0) { throw "npm build failed with exit code $LASTEXITCODE" }

    Write-Host "`nSync completed successfully!"
    Write-Host "Your local version now exactly matches the production version"
    Write-Host "You can run 'npm run dev' to test the synced version locally"

} catch {
    Write-Host "`nSync failed: $_" -ForegroundColor Red
    Write-Host "Error details:" -ForegroundColor Red
    $_.Exception | Format-List -Force
    
    # Clean up any running progress jobs
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    
    exit 1
}