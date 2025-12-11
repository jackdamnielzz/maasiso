# Local Development Startup Script
# This script sets the correct environment variables for local development

Write-Host "🚀 Starting Local Development Server" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Set environment variables for local development
$env:NEXT_PUBLIC_API_URL = "/api/proxy"
$env:NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
$env:STRAPI_URL = "http://153.92.223.23:1337"
$env:NEXT_PUBLIC_BACKEND_URL = "http://153.92.223.23:1337"
$env:STRAPI_TOKEN = "0a5381338f9b9b1382d31e59293ee4753b1b089ade561d58159da1a0d78e1914e5f7effe1bc46decb68017ff996d4fe18c972d03f00a62906b104c2370cbac312b20e64b48ee84fc61fc9ac9602769941763e7f5a224307ecc4418deb742e7117f1b68ce1e6a5047f3a0ae332a5ddc3d64d1d45ca2671536fa38b71dfcc860c4"
$env:NEXT_PUBLIC_STRAPI_TOKEN = "0a5381338f9b9b1382d31e59293ee4753b1b089ade561d58159da1a0d78e1914e5f7effe1bc46decb68017ff996d4fe18c972d03f00a62906b104c2370cbac312b20e64b48ee84fc61fc9ac9602769941763e7f5a224307ecc4418deb742e7117f1b68ce1e6a5047f3a0ae332a5ddc3d64d1d45ca2671536fa38b71dfcc860c4"
$env:NEXT_PUBLIC_ENABLE_BLOG = "true"
$env:NEXT_PUBLIC_ENABLE_TOOLS = "true"
$env:NEXT_PUBLIC_DEBUG = "true"
$env:NEXTAUTH_SECRET = "local-dev-secret-change-in-production"
$env:NEXTAUTH_URL = "http://localhost:3000"

Write-Host "✅ Environment variables set:" -ForegroundColor Green
Write-Host "   NEXT_PUBLIC_API_URL: $env:NEXT_PUBLIC_API_URL" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_SITE_URL: $env:NEXT_PUBLIC_SITE_URL" -ForegroundColor Yellow
Write-Host "   STRAPI_URL: $env:STRAPI_URL" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔧 Starting development server..." -ForegroundColor Blue
npm run dev 