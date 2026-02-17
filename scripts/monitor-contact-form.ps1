# MaasISO Contact Form Monitor
# Run manually or schedule via Windows Task Scheduler
# Logs to: scripts/contact-monitor-log.txt

param(
    [string]$Url = "https://www.maasiso.nl/api/contact"
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logFile = "$PSScriptRoot\contact-monitor-log.txt"

Write-Host ""
Write-Host "=== MaasISO Contact Form Monitor ===" -ForegroundColor Cyan
Write-Host "Tijdstip: $timestamp" -ForegroundColor Gray
Write-Host "URL: $Url" -ForegroundColor Gray
Write-Host ""

$body = @{
    name = "Monitor Bot"
    email = "monitor@maasiso.nl"
    subject = "ISO 9001"
    message = "Automatische monitoring test - contactformulier werkt. Tijdstip: $timestamp"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $Url -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30 `
        -ErrorAction Stop

    $json = $response.Content | ConvertFrom-Json

    if ($json.success -eq $true) {
        $result = "✅ SUCCES"
        Write-Host "✅ SUCCES - Contactformulier werkt!" -ForegroundColor Green
        Write-Host "   Bericht: $($json.message)" -ForegroundColor Green
    } else {
        $result = "❌ FOUT (API returned success:false)"
        Write-Host "❌ FOUT - API gaf success:false terug" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Red
    }
} catch {
    $result = "❌ FOUT - $($_.Exception.Message)"
    Write-Host "❌ FOUT - Verzoek mislukt!" -ForegroundColor Red
    Write-Host "   Fout: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Log to file
$logEntry = "$timestamp | $result"
Add-Content -Path $logFile -Value $logEntry
Write-Host ""
Write-Host "Log opgeslagen: $logFile" -ForegroundColor Gray
