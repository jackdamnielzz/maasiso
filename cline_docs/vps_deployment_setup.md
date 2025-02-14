# SFTP Deployment Setup for VPS2

This document details the setup and usage of SFTP deployment for the frontend website to Hostinger VPS2 (IP: 147.93.62.188) using VS Code's SFTP extension.

## Overview

We use VS Code's SFTP extension to directly deploy frontend files to VPS2. This method replaces the previous Git-based deployment process, offering a simpler and more direct deployment workflow.

## Prerequisites

### Local Machine Setup

1. VS Code Installation
   - Ensure VS Code is installed and running

2. SFTP Extension Installation
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "SFTP" by liximomo
   - Click Install
   - Reload VS Code if prompted

### VPS2 Requirements

- SSH Access:
  - IP: 147.93.62.188
  - Username: root
  - Port: 22
  - Hostname: srv718842.hstgr.cloud

## Configuration Steps

### 1. SFTP Project Configuration

Create an SFTP configuration file in your project:

1. Open Command Palette in VS Code (Ctrl+Shift+P)
2. Type "SFTP: Config" and select it
3. This creates `.vscode/sftp.json`
4. Configure with the following settings:

```json
{
    "name": "Deploy to VPS2 (Hostinger SFTP)",
    "host": "147.93.62.188",
    "protocol": "sftp",
    "port": 22,
    "username": "root",
    "remotePath": "/var/www/jouw-frontend-website/",
    "uploadOnSave": false,
    "syncOption": {
        "delete": false
    }
}
```

**Important Security Note**: Never commit passwords in sftp.json. Use SSH keys for authentication.

### 2. SSH Key Setup (Recommended)

For enhanced security, set up SSH key authentication:

1. Generate SSH key if needed:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Copy public key to VPS2:
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@147.93.62.188
```

3. Update sftp.json to use SSH key:
```json
{
    // ... other settings ...
    "privateKeyPath": "~/.ssh/id_ed25519"
}
```

## Deployment Workflow

### Initial Deployment

1. Open your project in VS Code
2. Open Command Palette (Ctrl+Shift+P)
3. Run "SFTP: List Remote Directory"
4. Right-click your project folder
5. Select "SFTP: Upload Folder"
6. Choose the remote directory (/var/www/jouw-frontend-website/)

### Regular Updates

#### Manual Method (Recommended for Production)
1. Make changes locally
2. Test changes
3. Right-click changed files/folders
4. Select "SFTP: Upload"

#### Automatic Method (Development Only)
1. Set "uploadOnSave": true in sftp.json
2. Files will automatically upload when saved
3. **Note**: Use with caution, not recommended for production

## Verification

After deployment:
1. Access your website via VPS2 IP or domain
2. Check if changes are reflected
3. Test functionality
4. Review browser console for errors

## Troubleshooting

### Common Issues

1. Connection Errors
   - Verify VPS2 IP and credentials
   - Check SSH service is running
   - Confirm firewall settings

2. Permission Denied
   - Check remote directory permissions
   - Verify SSH key/password authentication

3. Upload Failures
   - Ensure sufficient disk space
   - Check file permissions
   - Verify network connectivity

### Recovery Steps

1. If deployment fails:
   - Check VS Code's SFTP output panel
   - Verify remote directory exists
   - Check file permissions
   - Review error messages in Output panel

2. To revert changes:
   - Keep local backups before major uploads
   - Use SFTP: Sync Local → Remote for full synchronization

## Security Considerations

1. Always use SSH keys instead of passwords
2. Regularly update SSH keys and remove unused ones
3. Keep VS Code and SFTP extension updated
4. Never commit sftp.json with sensitive data
5. Use .gitignore to exclude sftp.json

## Best Practices

1. Always test locally before deployment
2. Use uploadOnSave with caution
3. Maintain regular backups
4. Document all configuration changes
5. Monitor deployment logs

## Support

For issues or questions:
1. Check VS Code's SFTP extension documentation
2. Review Hostinger VPS documentation
3. Contact system administrator for VPS-specific issues