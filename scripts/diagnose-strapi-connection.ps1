# PowerShell script to diagnose Strapi connection issues

Write-Host "Starting Strapi Connection Diagnostics..."
Write-Host "----------------------------------------"

# Test direct connection to Strapi
Write-Host "`n1. Testing direct connection to Strapi..."
try {
    $response = Invoke-WebRequest -Uri "http://153.92.223.23:1337/admin" -TimeoutSec 5 -Method Head
    Write-Host "Connection successful! Status code: $($response.StatusCode)"
} catch {
    Write-Host "Connection failed: $($_.Exception.Message)"
}

# Test API endpoint with token
Write-Host "`n2. Testing API endpoint with token..."
$token = "e6ef615e304a7f2c09eeafb933360edbaecba351d741b4ae249f4b7758c88da3d9823b50c885e98fe5206ea1a06db7551fc88da7310d8c7ffd54423b23f95070bf6729b81bccc8c79eb66e5d1faf1e329da901eb21979073b5787251c79e75a56234b2fabf557e34696a94cd57d53b9aff51caf956d576d8ccb54d1c35a96cfc"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "http://153.92.223.23:1337/api/pages" -Headers $headers -TimeoutSec 5
    Write-Host "API connection successful! Status code: $($response.StatusCode)"
} catch {
    Write-Host "API connection failed: $($_.Exception.Message)"
}

# Test DNS resolution
Write-Host "`n3. Testing DNS resolution..."
try {
    $dns = Resolve-DnsName -Name "153.92.223.23" -ErrorAction Stop
    Write-Host "DNS resolution successful: $($dns.NameHost)"
} catch {
    Write-Host "DNS resolution failed: $($_.Exception.Message)"
}

# Test network route
Write-Host "`n4. Testing network route..."
$result = Test-NetConnection -ComputerName "153.92.223.23" -Port 1337
Write-Host "TCP test result: $($result.TcpTestSucceeded)"
Write-Host "Trace route:"
$result.TraceRoute | ForEach-Object { Write-Host $_ }

Write-Host "`nDiagnostics complete!"