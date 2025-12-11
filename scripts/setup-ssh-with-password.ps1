# Setup SSH with Password Authentication
# This script will help set up SSH key authentication using password

Write-Host "=== SSH Setup with Password ===" -ForegroundColor Cyan
Write-Host ""

$frontend_server = "maasiso.nl"
$ssh_user = "root"
$password = "Niekties@100"

Write-Host "Step 1: Testing if SSH key already exists..." -ForegroundColor Yellow
$ssh_key_path = "$env:USERPROFILE\.ssh\id_rsa"

if (Test-Path $ssh_key_path) {
    Write-Host "SSH key found at: $ssh_key_path" -ForegroundColor Green
} else {
    Write-Host "No SSH key found. Generating new SSH key..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $ssh_key_path -N '""'
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SSH key generated successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to generate SSH key" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

Write-Host "Step 2: Copying SSH key to frontend server..." -ForegroundColor Yellow
Write-Host "Server: $frontend_server" -ForegroundColor Gray
Write-Host "You will be prompted for the password: $password" -ForegroundColor Cyan
Write-Host ""

# Use ssh-copy-id equivalent for Windows
$pub_key = Get-Content "$ssh_key_path.pub"
$command = "mkdir -p ~/.ssh && echo '$pub_key' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"

Write-Host "Attempting to copy SSH key..." -ForegroundColor Yellow
Write-Host "When prompted, enter password: $password" -ForegroundColor Cyan
Write-Host ""

# Try to connect and set up the key
ssh "$ssh_user@$frontend_server" $command

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSSH key copied successfully!" -ForegroundColor Green
} else {
    Write-Host "`nFailed to copy SSH key. Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: use scp
    Write-Host "Creating temporary authorized_keys file..." -ForegroundColor Gray
    $temp_file = "$env:TEMP\authorized_keys_temp"
    Copy-Item "$ssh_key_path.pub" $temp_file
    
    Write-Host "Uploading via SCP (password: $password)..." -ForegroundColor Cyan
    scp $temp_file "$ssh_user@${frontend_server}:~/authorized_keys_temp"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "File uploaded. Setting up on server..." -ForegroundColor Yellow
        ssh "$ssh_user@$frontend_server" "mkdir -p ~/.ssh && cat ~/authorized_keys_temp >> ~/.ssh/authorized_keys && rm ~/authorized_keys_temp && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SSH key setup completed!" -ForegroundColor Green
        }
    }
    
    Remove-Item $temp_file -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Step 3: Testing SSH connection without password..." -ForegroundColor Yellow

ssh "$ssh_user@$frontend_server" "echo 'SSH key authentication successful!' && hostname && uptime"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! You can now connect without password." -ForegroundColor Green
} else {
    Write-Host "`nSSH key authentication still not working." -ForegroundColor Red
    Write-Host "You may need to manually add the key or check server configuration." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Checking backend server..." -ForegroundColor Yellow
Write-Host "Attempting to resolve backend.maasiso.nl..." -ForegroundColor Gray

try {
    $backend_ip = [System.Net.Dns]::GetHostAddresses("backend.maasiso.nl")
    Write-Host "Backend server resolved to: $backend_ip" -ForegroundColor Green
} catch {
    Write-Host "Cannot resolve backend.maasiso.nl" -ForegroundColor Red
    Write-Host "The backend server might be:" -ForegroundColor Yellow
    Write-Host "  - Using a different hostname" -ForegroundColor Gray
    Write-Host "  - On the same server as frontend (maasiso.nl)" -ForegroundColor Gray
    Write-Host "  - Using an IP address directly" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. If frontend connection works, you're ready to deploy" -ForegroundColor White
Write-Host "2. For backend, we need to determine the correct address" -ForegroundColor White
Write-Host "3. You can manually connect: ssh $ssh_user@$frontend_server" -ForegroundColor White