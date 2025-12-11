$files = Get-ChildItem -Path "backups/uploads-extracted" -Recurse -File
Write-Host "Total media files: $($files.Count)"
$totalSize = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Total size: $totalSize MB"