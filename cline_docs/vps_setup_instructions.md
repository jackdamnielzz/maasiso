# VPS Setup Instructions

## Initial OS Installation

1. Log in to your Hostinger control panel
2. Navigate to the VPS section
3. Select your KVM1 VPS instance
4. Click on "Operating Systems" or "Reinstall"
5. Choose the following options:
   - Operating System: **Ubuntu**
   - Version: **22.04 LTS**
   - Architecture: **x64**
6. Set a strong root password
   - Use a combination of uppercase, lowercase, numbers, and special characters
   - Store this password securely - you'll need it for initial SSH access

## Post-Installation Security Steps

After Ubuntu is installed, you'll need to:

1. Create a non-root user for better security
```bash
# Login as root first time
ssh root@your-vps-ip

# Create new user
adduser admin
# Follow prompts to set password and user details

# Add user to sudo group
usermod -aG sudo admin

# Test sudo access
su - admin
sudo whoami  # Should output "root"
```

2. Set up SSH key authentication (more secure than password)
```bash
# On your local machine:
ssh-keygen -t ed25519 -C "your-email@example.com"
# Follow prompts to save the key

# Copy public key to server
ssh-copy-id admin@your-vps-ip
```

3. Disable root SSH login and password authentication
```bash
sudo nano /etc/ssh/sshd_config

# Set these values:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Save and restart SSH
sudo systemctl restart sshd
```

4. Set up basic firewall
```bash
# Install UFW if not present
sudo apt update
sudo apt install ufw

# Allow SSH first to avoid lockout
sudo ufw allow ssh

# Enable firewall
sudo ufw enable

# Verify status
sudo ufw status
```

## System Updates

Keep the system updated:
```bash
sudo apt update
sudo apt upgrade -y
```

## Next Steps

After completing these steps, your VPS will have:
- Ubuntu 22.04 LTS installed
- A secure non-root user with sudo privileges
- SSH key authentication enabled
- Basic firewall protection

The system will be ready for:
1. PostgreSQL installation
2. Node.js setup
3. Strapi deployment

## Important Notes

- Save your SSH private key securely
- Document the following:
  - VPS IP address
  - Admin username
  - SSH key location
  - Any custom configurations
- Keep regular backups of your SSH keys
- Monitor system logs for any suspicious activity

## Troubleshooting

If you can't connect via SSH:
1. Verify IP address is correct
2. Check if SSH service is running on VPS
3. Ensure firewall allows SSH (port 22)
4. Verify SSH key permissions (should be 600)

## Security Best Practices

- Change SSH port from default 22 (optional)
- Set up fail2ban for brute force protection
- Regular security updates
- Monitor system logs
- Use strong passwords
- Implement rate limiting

## Revision History
- **Date:** 2025-01-11
- **Description:** Initial VPS setup instructions
- **Author:** AI
