$body = @{
    name = "Test"
    email = "test@test.com"
    subject = "ISO 27001"
    message = "Test bericht voor verificatie van de API."
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri 'https://www.maasiso.nl/api/contact' -Method POST -ContentType 'application/json' -Body $body
    Write-Host "SUCCESS:" -ForegroundColor Green
    $r | ConvertTo-Json
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    Write-Host "STATUS: $statusCode" -ForegroundColor Red
    Write-Host "BODY: $errorBody" -ForegroundColor Red
    if (-not $errorBody) {
        Write-Host "BODY: (empty - original crash bug still present)" -ForegroundColor Red
    }
}
