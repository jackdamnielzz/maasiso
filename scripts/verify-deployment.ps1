# Deployment Verification Script
Write-Host "Starting deployment verification..." -ForegroundColor Green

# Function to test endpoint
function Test-Endpoint {
    param (
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "Testing $Description..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET
        if ($response.StatusCode -eq 200) {
            Write-Host "OK" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "Failed (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "Failed (Error: $($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

# Function to check PM2 process
function Test-PM2Process {
    Write-Host "Checking PM2 processes..." -NoNewline
    try {
        $pm2Status = pm2 list
        if ($pm2Status -match "online") {
            Write-Host "OK" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "Not all processes are online" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "Failed to check PM2 status" -ForegroundColor Red
        return $false
    }
}

# Function to check system resources
function Test-SystemResources {
    Write-Host "Checking system resources..." -NoNewline
    try {
        $health = Invoke-WebRequest -Uri "http://localhost:3000/api/health" | ConvertFrom-Json
        $memoryUsage = [double]($health.memory.usage -replace '%')
        
        if ($memoryUsage -lt 80) {
            Write-Host "OK (Memory: $($health.memory.usage))" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "Warning: High memory usage ($($health.memory.usage))" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "Failed to check system resources" -ForegroundColor Red
        return $false
    }
}

# Main verification process
$allChecksPass = $true

# 1. Check if main application is responding
$allChecksPass = $allChecksPass -and (Test-Endpoint -Url "http://localhost:3000" -Description "Main application")

# 2. Check health endpoint
$allChecksPass = $allChecksPass -and (Test-Endpoint -Url "http://localhost:3000/api/health" -Description "Health endpoint")

# 3. Check PM2 processes
$allChecksPass = $allChecksPass -and (Test-PM2Process)

# 4. Check system resources
$allChecksPass = $allChecksPass -and (Test-SystemResources)

# Final result
if ($allChecksPass) {
    Write-Host "`nAll verification checks passed!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`nSome verification checks failed. Please review the output above." -ForegroundColor Red
    exit 1
}