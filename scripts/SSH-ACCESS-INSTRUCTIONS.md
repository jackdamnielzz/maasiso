# SSH Access Instructions

**Last Updated**: 2025-12-09
**Status**: ✅ SSH Key Authentication CONFIGURED AND WORKING

---

## ✅ Quick Access Commands

### Frontend Server (MaasISO.nl)
```bash
ssh root@maasiso.nl
```

### Backend Server (Strapi CMS)
```bash
ssh root@153.92.223.23
```

Both servers are configured with SSH key authentication. No password required!

---

## SSH Key Information

### Local Key Location
- **Private Key**: `C:\Users\niels\.ssh\id_rsa`
- **Public Key**: `C:\Users\niels\.ssh\id_rsa.pub`
- **Key Type**: RSA 4096-bit

### Your SSH Public Key

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDW94uxzAk+BCLCG9U+w32F8B57JuhmAAM9msJ0+aWYvkyH8vxFG67kcPs0/E7HJGdjXT5GgGGdHEtOZWeOgkjC0mLSEQye19NjDiXFpEGX6r88GCZ1SR+lcyy8xwKn65fz+RRBj4K0cPbn3cMW7UqO+0mj56eOeehPPX2vVFqsUzrt0JWVyndCnW8Ez32BX5laDuJ5bCon/5XFk3OMOfSeayoSzowULOyIRu6leqyGjAOaEVjBgy0J+oRUBOWTtVXAr8hdpR5PshsfA/hl+DHRmsoKg1/I1rKz3YjT3waxwkjYz3biQ4FDnnAxzaNq4in56FN0/NtaK15pEbsBtr/APyRhCQbBd+39Neq5UaQW668BHtIIgRjuUTG/T2iUHgeUIIZE6wbVPxncPXuqOUGjzCSFQYV+31xbbpf6QyDR6aVRGIQbPvI6kUbYLW2EzdeUvya2bnuMwhw80eLLfYeUkoZxKXXWOstkzb8AcDdfMsu8zAEF54t08E/c3K5dSTmjZ/ak5fko35FAU2HrO6VMmZ4K94m5VIp6HXSaXWU06Ao+D8aDVllqtBC5vTetJ8keJ8XsdAGB4IpEGVh3vjcGNUhtzymAwKtGhfLziHm6Wc9qi4BFTz46KxqFnnLVKT1R3NQ0rHPLgitsShYgsLn3KgAEspX65uwYdaABPhVhvo+lQ== niels_maas@hotmail.com
```

## Solution Options

### Option 1: VPS Control Panel (Recommended)

1. Log in to your VPS hosting provider's control panel
2. Find the SSH Keys or Security section
3. Add the public key above
4. The key will be automatically added to `/root/.ssh/authorized_keys`

### Option 2: Web Console/VNC Access

If your hosting provider offers web console or VNC access:

1. Access the server through web console
2. Log in as root with password: `Niekties@100`
3. Run these commands:

```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDW94uxzAk+BCLCG9U+w32F8B57JuhmAAM9msJ0+aWYvkyH8vxFG67kcPs0/E7HJGdjXT5GgGGdHEtOZWeOgkjC0mLSEQye19NjDiXFpEGX6r88GCZ1SR+lcyy8xwKn65fz+RRBj4K0cPbn3cMW7UqO+0mj56eOeehPPX2vVFqsUzrt0JWVyndCnW8Ez32BX5laDuJ5bCon/5XFk3OMOfSeayoSzowULOyIRu6leqyGjAOaEVjBgy0J+oRUBOWTtVXAr8hdpR5PshsfA/hl+DHRmsoKg1/I1rKz3YjT3waxwkjYz3biQ4FDnnAxzaNq4in56FN0/NtaK15pEbsBtr/APyRhCQbBd+39Neq5UaQW668BHtIIgRjuUTG/T2iUHgeUIIZE6wbVPxncPXuqOUGjzCSFQYV+31xbbpf6QyDR6aVRGIQbPvI6kUbYLW2EzdeUvya2bnuMwhw80eLLfYeUkoZxKXXWOstkzb8AcDdfMsu8zAEF54t08E/c3K5dSTmjZ/ak5fko35FAU2HrO6VMmZ4K94m5VIp6HXSaXWU06Ao+D8aDVllqtBC5vTetJ8keJ8XsdAGB4IpEGVh3vjcGNUhtzymAwKtGhfLziHm6Wc9qi4BFTz46KxqFnnLVKT1R3NQ0rHPLgitsShYgsLn3KgAEspX65uwYdaABPhVhvo+lQ== niels_maas@hotmail.com" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys

# Verify the key was added
cat ~/.ssh/authorized_keys
```

### Option 3: Temporarily Enable Password Authentication

If you have console access, you can temporarily enable password auth:

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find and change these lines:
PasswordAuthentication yes
PermitRootLogin yes

# Save and restart SSH
sudo systemctl restart sshd
```

Then from your local machine:
```powershell
# Copy your SSH key
ssh-copy-id root@maasiso.nl
# Enter password: Niekties@100

# Disable password auth again (security best practice)
ssh root@maasiso.nl "sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config && sudo systemctl restart sshd"
```

## Testing Connection

After adding your key, test the connection:

```powershell
ssh root@maasiso.nl "hostname && uptime"
```

You should connect without being asked for a password.

## Common VPS Providers

### DigitalOcean
- Dashboard → Droplet → Access → Add SSH Key

### Vultr
- Account → SSH Keys → Add SSH Key

### Linode
- Profile → SSH Keys → Add a Public Key

### Hetzner
- Cloud Console → Security → SSH Keys → Add SSH Key

### OVH
- Control Panel → Dedicated → SSH Keys → Add Key

## Server Details

### Frontend Server
| Property | Value |
|----------|-------|
| **SSH Command** | `ssh root@maasiso.nl` |
| **IP Address** | 147.93.62.188 |
| **Hostname** | srv718842 |
| **Status** | ✅ SSH Key Configured |

### Backend Server
| Property | Value |
|----------|-------|
| **SSH Command** | `ssh root@153.92.223.23` |
| **IP Address** | 153.92.223.23 |
| **Hostname** | strapicms |
| **Status** | ✅ SSH Key Configured |

## Backup Access: Hostinger Web Console

If SSH fails for any reason, use the Hostinger VPS panel:
1. Go to https://hpanel.hostinger.com
2. Navigate to VPS → Select server
3. Click "Browser terminal" or "Console"

## Troubleshooting

If you still can't connect:
1. Check key permissions on server: `ls -la ~/.ssh/`
2. Check SSH logs: `sudo tail -f /var/log/auth.log`
3. Verify SSH service: `sudo systemctl status sshd`
4. Test with verbose output: `ssh -v root@maasiso.nl`
5. Clear known hosts if needed: `ssh-keygen -R maasiso.nl`

## Related Documentation

- **Complete Guide**: [`docs/SERVER-ACCESS-GUIDE.md`](../docs/SERVER-ACCESS-GUIDE.md)
- **Active Context**: [`memory-bank/activeContext.md`](../memory-bank/activeContext.md)