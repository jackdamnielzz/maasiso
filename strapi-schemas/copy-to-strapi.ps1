# Strapi Schema Deployment Script
# This script copies all schema files to your Strapi backend repository

param(
    [Parameter(Mandatory=$true)]
    [string]$StrapiPath
)

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "STRAPI SCHEMA DEPLOYMENT" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Validate Strapi path
if (-not (Test-Path $StrapiPath)) {
    Write-Host "ERROR: Strapi path does not exist: $StrapiPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please provide the correct path to your Strapi backend repository." -ForegroundColor Yellow
    Write-Host "Example: .\copy-to-strapi.ps1 -StrapiPath 'C:\Projects\maasiso-strapi'" -ForegroundColor Yellow
    exit 1
}

# Verify it looks like a Strapi project
$packageJsonPath = Join-Path $StrapiPath "package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "WARNING: No package.json found in $StrapiPath" -ForegroundColor Yellow
    Write-Host "Are you sure this is a Strapi project?" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 0
    }
}

Write-Host "Source: $PSScriptRoot" -ForegroundColor Green
Write-Host "Target: $StrapiPath" -ForegroundColor Green
Write-Host ""

# Function to copy with logging
function Copy-WithLog {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Description
    )

    Write-Host "Copying $Description..." -ForegroundColor Cyan

    # Create destination directory if it doesn't exist
    $destDir = Split-Path -Parent $Destination
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Write-Host "  Created directory: $destDir" -ForegroundColor Gray
    }

    # Copy file or directory
    if (Test-Path $Source) {
        Copy-Item -Path $Source -Destination $Destination -Recurse -Force
        Write-Host "  OK: $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  SKIP: Source not found: $Source" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "Starting file copy..." -ForegroundColor Cyan
Write-Host ""

$copied = 0
$skipped = 0

# Copy Author schema
$authorSrc = Join-Path $PSScriptRoot "api\author"
$authorDest = Join-Path $StrapiPath "src\api\author"
if (Copy-WithLog -Source $authorSrc -Destination $authorDest -Description "Author collection schema") {
    $copied++
} else {
    $skipped++
}

# Copy Blog Post schema (only the schema.json, not the entire directory to preserve other files)
$blogPostSrc = Join-Path $PSScriptRoot "api\blog-post\content-types\blog-post\schema.json"
$blogPostDest = Join-Path $StrapiPath "src\api\blog-post\content-types\blog-post\schema.json"
if (Copy-WithLog -Source $blogPostSrc -Destination $blogPostDest -Description "Blog Post schema") {
    $copied++
} else {
    $skipped++
}

# Copy components
$componentsSrc = Join-Path $PSScriptRoot "components\blog"
$componentsDest = Join-Path $StrapiPath "src\components\blog"
if (Copy-WithLog -Source $componentsSrc -Destination $componentsDest -Description "Blog components (tldr-item, faq-item)") {
    $copied++
} else {
    $skipped++
}

# Copy migration script
$migrationSrc = Join-Path $PSScriptRoot "scripts\migrate-authors.js"
$migrationDest = Join-Path $StrapiPath "scripts\migrate-authors.js"
if (Copy-WithLog -Source $migrationSrc -Destination $migrationDest -Description "Migration script") {
    $copied++
} else {
    $skipped++
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "COPY SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Files copied: $copied" -ForegroundColor Green
Write-Host "Files skipped: $skipped" -ForegroundColor Yellow
Write-Host ""

if ($copied -gt 0) {
    Write-Host "SUCCESS! Schema files copied to Strapi repository." -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Review changes:" -ForegroundColor White
    Write-Host "   cd `"$StrapiPath`"" -ForegroundColor Gray
    Write-Host "   git status" -ForegroundColor Gray
    Write-Host "   git diff src/api/blog-post/content-types/blog-post/schema.json" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Commit changes:" -ForegroundColor White
    Write-Host "   git add src/api/ src/components/ scripts/" -ForegroundColor Gray
    Write-Host "   git commit -m `"feat: add SEO/GEO enhanced schemas with Authors collection`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Deploy to Railway:" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Run migration script (after deployment):" -ForegroundColor White
    Write-Host "   cd `"$StrapiPath`"" -ForegroundColor Gray
    Write-Host "   node scripts/migrate-authors.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See DEPLOY.md for detailed instructions." -ForegroundColor Yellow
} else {
    Write-Host "WARNING: No files were copied. Check source paths." -ForegroundColor Yellow
}

Write-Host ""
