# VPS1 (Backend) SSH Key Authentication Setup

## Overview
This guide documents the SSH key authentication setup for VPS1 (153.92.223.23), which hosts the Strapi backend.

## SSH Configuration

### Local Setup
1. SSH key pair location:
   ```
   Private key: C:\Users\<username>\.ssh\maasiso_vps1_key
   Public key: C:\Users\<username>\.ssh\maasiso_vps1_key.pub
   ```

2. SSH config file (`~/.ssh/config`):
   ```
   Host vps1
       HostName 153.92.223.23
       User root
       IdentityFile ~/.ssh/maasiso_vps1_key
       PreferredAuthentications publickey
       PubkeyAuthentication yes
       PasswordAuthentication no
   ```

### Server Setup
1. SSH directory permissions:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

2. SSH daemon configuration:
   ```bash
   # /etc/ssh/sshd_config
   PubkeyAuthentication yes
   PasswordAuthentication no
   UsePAM no
   ```

## Usage

### Testing Connection
```bash
ssh vps1 "echo 'Connection test'"
```

### Deployment Commands
```bash
# Copy files to server
scp -i ~/.ssh/maasiso_vps1_key file.txt root@153.92.223.23:/path/to/destination

# Execute remote commands
ssh vps1 "command here"
```

## Troubleshooting

1. Check SSH key permissions:
   ```bash
   ls -la ~/.ssh
   ```

2. Verify authorized_keys content:
   ```bash
   cat ~/.ssh/authorized_keys
   ```

3. Check SSH daemon logs:
   ```bash
   tail -f /var/log/auth.log
   ```

## Security Notes

- The SSH key is ED25519 type for enhanced security
- Password authentication is disabled
- PAM authentication is disabled to prevent authentication method conflicts
- Root login is allowed but only with SSH key authentication