# Health monitoring script for MaasISO Frontend
# This script monitors the application health endpoint and alerts on issues

param(
    [string]$BaseUrl = "http://147.93.62.188",
    [int]$IntervalSeconds = 300,  # 5 minutes
    [int]$MemoryThresholdPercent = 85,
    [double]$CpuThresholdLoad = 4.0,
    [string]$LogPath = "logs/health-monitor.log"
)

$ErrorActionPreference = "Stop"

# Create logs directory if it doesn't exist
$logsDir = Split-Path $LogPath -Parent
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Add-Content -Path $LogPath -Value $logMessage
    Write-Host $logMessage
}

function Send-Alert {
    param($Subject, $Message)
    Write-Log "ALERT: $Subject - $Message"
    # TODO: Implement actual alert sending (email, Slack, etc.)
    # For now, we'll just log alerts
}

function Test-Thresholds {
    param($HealthData)
    
    $alerts = @()
    
    # Check memory usage
    $memoryUsage = [double]($HealthData.memory.usage -replace '%')
    if ($memoryUsage -gt $MemoryThresholdPercent) {
        $alerts += "Memory usage at ${memoryUsage}% (threshold: ${MemoryThresholdPercent}%)"
    }
    
    # Check CPU load
    $cpuLoad = $HealthData.cpu.load[0]  # 1-minute load average
    if ($cpuLoad -gt $CpuThresholdLoad) {
        $alerts += "CPU load at $cpuLoad (threshold: $CpuThresholdLoad)"
    }
    
    # Check uptime (alert if less than 5 minutes, indicating recent restart)
    if ($HealthData.uptime -lt 300) {
        $alerts += "Application recently restarted (uptime: $($HealthData.uptime) seconds)"
    }
    
    return $alerts
}

Write-Log "Starting health monitoring for $BaseUrl"
Write-Log "Checking every $IntervalSeconds seconds"

while ($true) {
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get
        
        if ($response.status -eq "healthy") {
            Write-Log "Health check passed"
            
            # Check thresholds
            $alerts = Test-Thresholds -HealthData $response
            if ($alerts.Count -gt 0) {
                foreach ($alert in $alerts) {
                    Send-Alert -Subject "Performance Warning" -Message $alert
                }
            }
        }
        else {
            Send-Alert -Subject "Health Check Failed" -Message "Status: $($response.status)"
        }
        
        # Log detailed metrics
        Write-Log "Memory Usage: $($response.memory.usage)"
        Write-Log "CPU Load: $($response.cpu.load[0])"
        Write-Log "Uptime: $($response.uptime) seconds"
        
    }
    catch {
        $errorMessage = $_.Exception.Message
        Send-Alert -Subject "Health Check Error" -Message $errorMessage
        Write-Log "Error: $errorMessage"
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}