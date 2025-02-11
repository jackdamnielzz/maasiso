# VSCode Remote SSH Deployment Guide for MaasISO

This guide outlines the new deployment workflow using VSCode's Remote-SSH extension to manage website updates on the Hostinger VPS.

## Overview
Instead of using Git-based deployment, we now use VSCode's Remote-SSH extension to directly edit and manage files on the VPS. This provides:
- Real-time file editing on the server
- Immediate deployment of changes
- Integrated development environment
- Direct server access through VSCode

## Setup Instructions

### 1. Install VSCode Remote-SSH Extension
1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions view
3. Search for "Remote - SSH"
4. Install the Microsoft Remote-SSH extension

### 2. Configure SSH Connection
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Remote-SSH: Open SSH Configuration File..."
3. Add VPS configuration:
```ssh
Host maasiso-vps
    HostName [VPS_IP_ADDRESS]
    User [SSH_USERNAME]
    IdentityFile ~/.ssh/[PRIVATE_KEY_FILE]
```

### 3. Connect to VPS
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Remote-SSH: Connect to Host..."
3. Select `maasiso-vps`
4. Wait for VSCode to establish connection
5. Enter passphrase if using key-based authentication

### 4. Access Website Directory
1. Once connected, use VSCode's file explorer
2. Navigate to website directory (typically `/var/www/maasiso`)
3. Open the project folder

## Deployment Workflow

### Making Updates
1. Connect to VPS using Remote-SSH
2. Navigate to website directory
3. Edit files directly in VSCode
4. Save changes (`Ctrl+S`)
5. Changes are immediately live on the server

### Best Practices
1. Always test changes in development environment first
2. Make backups before significant changes
3. Use VSCode's integrated terminal for server commands
4. Keep SSH keys secure and use key-based authentication

### Troubleshooting
1. Connection Issues:
   - Verify VPS IP address and SSH credentials
   - Check SSH service status on VPS
   - Ensure proper SSH key permissions

2. Performance Issues:
   - Check network connection
   - Work with smaller sets of files
   - Use VSCode's integrated terminal for server operations

3. File Access Issues:
   - Verify file permissions
   - Check user group memberships
   - Ensure proper ownership of website files

## Security Considerations
1. Use key-based authentication instead of passwords
2. Keep private keys secure
3. Regularly update SSH keys
4. Monitor SSH access logs
5. Use strong passphrases for SSH keys

## Support
For technical support or questions about the deployment process:
1. Check server logs
2. Review VSCode Remote-SSH documentation
3. Contact development team for assistance
