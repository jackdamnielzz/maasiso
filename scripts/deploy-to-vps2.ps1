# Build the frontend
Write-Host "Building frontend..."
npm run build

# Create the production .env file
$envContent = @"
NEXT_PUBLIC_API_URL=http://147.93.62.188:3000
NEXT_PUBLIC_BACKEND_URL=http://147.93.62.187:1337
"@

Set-Content -Path ".env.production" -Value $envContent

# Deploy to VPS2 using SFTP
Write-Host "Deploying to VPS2..."
# Using VS Code SFTP extension, right-click on the project folder and select "SFTP: Upload Folder"
Write-Host "Please use VS Code SFTP extension to upload the project:"
Write-Host "1. Open VS Code Command Palette (Ctrl+Shift+P)"
Write-Host "2. Type 'SFTP: Upload Folder'"
Write-Host "3. Select the project folder"
Write-Host "4. Choose /var/www/jouw-frontend-website/ as the destination"

# Instructions for verifying deployment
Write-Host "`nDeployment complete. To verify:"
Write-Host "1. SSH into VPS2: ssh root@147.93.62.188"
Write-Host "2. Check files: ls -la /var/www/jouw-frontend-website/"
Write-Host "3. Start the application: cd /var/www/jouw-frontend-website/ && npm install && npm run start"
Write-Host "4. Access the website at http://147.93.62.188:3000"