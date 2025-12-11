# Quick Deploy Guide: Local Frontend → VPS2

## Overview

This guide explains how to quickly deploy local frontend changes to VPS2 (147.93.62.188) using VS Code's SFTP extension. The frontend application communicates with our Strapi CMS backend running on VPS1 (153.92.223.23).

## System Architecture

- **VPS1 (153.92.223.23)**: Runs our Strapi CMS backend
  - Port: 1337
  - Purpose: Content management and API
  - Note: This server is managed separately and not part of our deployment process

- **VPS2 (147.93.62.188)**: Runs our Next.js frontend
  - Port: 3000
  - Purpose: Serves the frontend application
  - Fetches content from Strapi on VPS1

## Prerequisites

1. VS Code SFTP Extension
   - Open VS Code
   - Press Ctrl+Shift+X
   - Search for "SFTP" by liximomo
   - Install the extension

2. SFTP Configuration
   - Located in `.vscode/sftp.json`
   - Configured for VPS2 deployment
   - Uses SSH key authentication

## Quick Deploy Process

We've created a streamlined deployment script that combines building and SFTP deployment.

### Basic Usage

```powershell
# Deploy your local changes
./scripts/quick-deploy.ps1

# Skip the build step if you've already built locally
./scripts/quick-deploy.ps1 -SkipBuild
```

### What the Script Does

1. **Environment Setup**
   - Configures production environment variables
   - Ensures proper connection to Strapi backend on VPS1

2. **Build Process** (unless skipped)
   - Runs `npm run build`
   - Prepares production-ready assets

3. **SFTP Deployment**
   - Guides you through VS Code SFTP upload process
   - Ensures proper file transfer to VPS2
   - Maintains existing SFTP workflow

4. **Service Restart**
   - Automatically restarts the frontend service
   - Verifies the deployment

### Step-by-Step Deployment

1. **Start the Deployment**
   ```powershell
   ./scripts/quick-deploy.ps1
   ```

2. **Follow SFTP Upload Steps**
   - When prompted:
     1. Press Ctrl+Shift+P in VS Code
     2. Type 'SFTP: Upload Folder'
     3. Select the project folder
     4. Choose /var/www/jouw-frontend-website/ as destination

3. **Confirm Upload**
   - Type 'y' when asked if SFTP upload is complete
   - Script will then restart the frontend service

### Verification

After deployment, verify your changes:

1. **Frontend Access**
   ```
   http://147.93.62.188:3000
   ```

2. **Check Logs**
   ```powershell
   ssh root@147.93.62.188 'pm2 logs frontend'
   ```

3. **Monitor Health**
   ```powershell
   ./scripts/monitor-health.ps1
   ```

### Troubleshooting

1. **SFTP Issues**
   - Verify VS Code SFTP extension is installed
   - Check SSH key setup
   - Confirm sftp.json configuration
   - Try reloading VS Code

2. **Build Failures**
   - Review build logs
   - Check for syntax errors
   - Verify environment variables

3. **Runtime Errors**
   - Check PM2 logs
   - Verify Strapi connection
   - Review browser console

### Recovery

If something goes wrong:

1. **Quick Rollback**
   ```powershell
   ./scripts/rollback.ps1
   ```

2. **Manual Recovery**
   - Use VS Code SFTP: Sync Local → Remote
   - Or restore from backup on VPS2

## Best Practices

1. **Before Deploying**
   - Test changes locally
   - Ensure Strapi connectivity
   - Commit your changes
   - Run tests if available

2. **SFTP Usage**
   - Wait for uploads to complete
   - Don't interrupt the upload process
   - Verify file transfer completion

3. **Post-Deployment**
   - Verify frontend functionality
   - Check Strapi data integration
   - Monitor application logs
   - Test critical features

## Environment Variables

The script automatically manages these connections:

```env
NEXT_PUBLIC_API_URL=http://147.93.62.188:3000
NEXT_PUBLIC_BACKEND_URL=http://153.92.223.23:1337
```

This ensures your frontend properly communicates with:
- The frontend API on VPS2
- The Strapi backend on VPS1

## Support

If you encounter issues:
1. Check deployment logs
2. Review PM2 status
3. Verify SFTP configuration
4. Check Strapi connectivity
5. Contact the development team

Remember: VPS1 (Strapi) is managed separately. If you notice Strapi issues, contact the backend team.