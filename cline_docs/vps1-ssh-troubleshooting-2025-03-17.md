# VPS1 SSH Connection Troubleshooting
Date: March 17, 2025

## Issue Description

During the VPS1 disk usage analysis task, we encountered SSH connection issues with the VPS1 server (153.92.223.23). The server was responding to ping requests (ICMP) but not accepting SSH connections on port 22.

## Diagnostic Steps Performed

1. **Basic SSH Connection**
   ```bash
   ssh root@153.92.223.23
   ```
   Result: Connection timed out

2. **SSH with Timeout Parameter**
   ```bash
   ssh -o ConnectTimeout=10 root@153.92.223.23 "echo 'Connection test'"
   ```
   Result: Connection timed out

3. **ICMP Ping Test**
   ```bash
   ping -n 4 153.92.223.23
   ```
   Result: Successful (4 packets sent, 4 received, 0% loss)

4. **TCP Port Test**
   ```bash
   powershell -Command "Test-NetConnection -ComputerName 153.92.223.23 -Port 22"
   ```
   Result: TCP connect failed, but ping succeeded

## Possible Causes

1. **SSH Service Issues**
   - SSH daemon (sshd) not running on the server
   - SSH service crashed or was stopped
   - SSH configuration issues

2. **Network/Firewall Issues**
   - Firewall blocking port 22 (either on server or network level)
   - Network routing issues for TCP traffic
   - VPN or proxy interference

3. **Server Issues**
   - Server under high load or resource exhaustion
   - Disk space issues affecting service operation
   - System-level problems

## Troubleshooting Steps

### 1. Check SSH Service Status (when SSH access is restored)

```bash
# Check if SSH service is running
systemctl status sshd

# If not running, start it
systemctl start sshd

# Enable it to start on boot
systemctl enable sshd
```

### 2. Check SSH Logs

```bash
# Check SSH logs for errors
cat /var/log/auth.log | grep sshd
cat /var/log/secure | grep sshd  # On some systems
```

### 3. Check Firewall Settings

```bash
# Check UFW status (if installed)
ufw status

# Ensure port 22 is allowed
ufw allow 22/tcp

# Check iptables rules
iptables -L -n | grep 22
```

### 4. Test SSH on Different Port

If possible, configure SSH to listen on an alternative port (e.g., 2222) and test connection:

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Change: Port 22
# To: Port 2222

# Restart SSH service
systemctl restart sshd

# Connect using the new port
ssh -p 2222 root@153.92.223.23
```

### 5. Check Server Resources

```bash
# Check disk space
df -h

# Check memory usage
free -m

# Check load average
uptime

# Check for runaway processes
top
```

## Alternative Access Methods

If SSH remains inaccessible, consider these alternative access methods:

1. **Web-based Console**
   - If the VPS provider offers a web-based console, use it to access the server

2. **VPS Provider Support**
   - Contact the VPS provider's support team for assistance

3. **Server Reboot**
   - Request a server reboot from the VPS provider's control panel

## Prevention Measures

To prevent future SSH connection issues:

1. **Monitoring**
   - Set up monitoring for the SSH service
   - Configure alerts for SSH service failures

2. **Redundant Access**
   - Configure multiple SSH users with different authentication methods
   - Set up an alternative access method (e.g., VPN)

3. **Regular Maintenance**
   - Regularly check SSH logs for warnings or errors
   - Keep the SSH service and server up to date with security patches

## Next Steps

1. Attempt to resolve the SSH connection issues using the troubleshooting steps above
2. Once SSH access is restored, proceed with the disk usage analysis and cleanup tasks
3. Document the root cause of the SSH issues and the solution for future reference