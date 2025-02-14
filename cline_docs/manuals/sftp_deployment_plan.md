# SFTP Deployment Plan for Frontend Website on Hostinger VPS2

This plan details how to use an SFTP extension in VS Code to deploy your frontend website to your Hostinger VPS2 (IP: 147.93.62.188). SFTP (Secure File Transfer Protocol) allows you to securely transfer files between your local machine and your VPS. Using a VS Code extension makes this process integrated directly into your development environment.

## Goal

To set up easy and efficient deployment of frontend code changes from your local VS Code environment to your Hostinger VPS2 using an SFTP extension for VS Code.

## Prerequisites

### Local Machine

1. VS Code: You are already using VS Code.
2. Frontend Project: Your frontend website project is set up locally in VS Code.
3. SFTP VS Code Extension: You need to install an SFTP extension in VS Code. Popular options include:
   - SFTP (liximomo) (Most widely used and reliable)
   - Remote - SSH (Microsoft) (Can be used for file sync, though primarily for remote development)
   - FTP-sync (Also supports SFTP and offers sync features)

For this plan, we will focus on the SFTP (liximomo) extension as it's very popular and well-featured.

### VPS2 (srv718842.hstgr.cloud - 147.93.62.188)

1. SSH Access: You have SSH access to your VPS2 (username: root, IP: 147.93.62.188, port: 22).
2. SFTP Server Running: SFTP is typically enabled by default if SSH is running on your VPS, which is the case for Hostinger VPS.

## Step-by-Step Plan

### Phase 1: Installing and Configuring the SFTP VS Code Extension

1. Install SFTP (liximomo) Extension in VS Code:
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
   - Search for "SFTP"
   - Find "SFTP" by "liximomo" and click "Install"
   - Click "Reload" if prompted

2. Configure SFTP Connection:
   - Open your frontend project in VS Code
   - Open Command Palette (Ctrl+Shift+P)
   - Type "SFTP: Config" and select it
   - This creates sftp.json in .vscode folder

3. Edit sftp.json with VPS2 Details:
   ```json
   {
       "name": "Deploy to VPS2 (Hostinger SFTP)",
       "host": "147.93.62.188",
       "protocol": "sftp",
       "port": 22,
       "username": "root",
       "password": "YOUR_SSH_PASSWORD",
       "remotePath": "/var/www/jouw-frontend-website/",
       "uploadOnSave": false,
       "syncOption": {
           "delete": false
       }
   }
   ```

   Important Configuration Points:
   - "name": Descriptive name for your connection
   - "host": Your VPS2 IP address (147.93.62.188)
   - "protocol": Must be "sftp"
   - "port": Default SSH port (22)
   - "username": SSH username ("root")
   - "password": Replace with actual SSH password
   - "remotePath": Directory on VPS2 for deployment
   - "uploadOnSave": Set false initially
   - "syncOption.delete": Keep false for safety

### Phase 2: Initial Upload and Manual Synchronization

1. Establish SFTP Connection:
   - Open Command Palette
   - Select "SFTP: List Remote Directory"
   - Choose your configuration
   - Confirm host key if prompted

2. Initial Project Upload:
   - In VS Code Explorer, locate SFTP section
   - Right-click project folder
   - Select "SFTP: Upload Folder"
   - Choose remote directory

3. Manual Synchronization Options:
   - Upload single file: Right-click file → "SFTP: Upload File"
   - Download from server: Right-click in SFTP panel → "SFTP: Download File"
   - Sync Local to Remote: Right-click folder → "SFTP: Sync Local -> Remote"
   - Sync Remote to Local: Right-click in SFTP panel → "SFTP: Sync Remote -> Local"

### Phase 3: Setting up uploadOnSave (Optional)

1. Enable Feature:
   ```json
   {
       "uploadOnSave": true
   }
   ```

2. Testing:
   - Make changes to files
   - Save (Ctrl+S/Cmd+S)
   - Check VS Code Output panel for progress

Important Notes:
- Development vs. Production: Convenient for development, not ideal for production
- Performance Impact: Consider for large projects
- Unintended Changes: Be careful with shared files
- Build Steps: Only uploads source files, not built files

### Phase 4: Testing and Verification

1. Access Frontend Website:
   - Use VPS2 IP or domain
   - Verify changes are live
   - Test functionality

### Security Considerations

1. SSH Password:
   - Change default password immediately
   - Use SSH keys instead (recommended)

2. Root Access:
   - Consider creating limited user
   - Secure root access if used

3. SSH Keys Setup:
   ```json
   {
       "password": null,
       "privateKeyPath": "~/.ssh/id_rsa_deploy_vps2"
   }
   ```

### Optional Enhancements

1. SSH Key Authentication:
   - Generate key pair
   - Copy to VPS2
   - Update sftp.json

2. Advanced Sync Options:
   - Configure exclusion patterns
   - Set up specific sync rules

### Troubleshooting

1. Connection Issues:
   - Check IP, port, credentials
   - Verify SSH service
   - Check firewalls

2. Permission Errors:
   - Verify directory permissions
   - Check user access rights

3. Configuration Problems:
   - Validate sftp.json syntax
   - Check VS Code extension settings

## Support

For deployment issues:
- Check VS Code SFTP documentation
- Review Hostinger VPS documentation
- Contact system administrator if needed