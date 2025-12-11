# 🔥 Phoenix Guardian - Self-Healing Security Meta-Script

## Overview

Phoenix Guardian is a **meta-security script** that monitors and protects the Guardian security monitoring system itself AND all security infrastructure. If an attacker manages to disable firewalls, stop security services, or delete Guardian scripts, Phoenix will automatically restore them.

### Key Features

- **🔥 Self-Healing**: If Phoenix is deleted, it restores itself from redundant hidden copies
- **🛡️ Self-Protecting**: Uses Linux immutable flag (chattr +i) to prevent modification
- **👁️ Meta-Monitoring**: Monitors the Guardian scripts and restores them if tampered
- **🧱 Firewall Protection**: Re-enables UFW and iptables rules if disabled by attackers
- **🚫 Service Protection**: Restarts Fail2ban, ClamAV, and other security services if stopped
- **🔐 SSH Hardening Monitor**: Detects and reverts SSH security weakening attempts
- **🥷 Stealth Mode**: Hidden in system directories with innocent process names
- **⚔️ Attack Detection**: Detects and kills malware, removes malicious cron entries
- **📧 Alerting**: Sends critical alerts when attacks are detected

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PHOENIX GUARDIAN                            │
│              Meta-Security Layer (Hidden)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Hidden Location 1        Hidden Location 2       Hidden Loc 3  │
│  ┌──────────────┐         ┌──────────────┐       ┌────────────┐│
│  │ .system-     │   <──>  │ .pkg-cache-d │  <──> │ .sd-pam-d  ││
│  │ health-d     │         │              │       │            ││
│  └──────────────┘         └──────────────┘       └────────────┘│
│         │                        │                      │       │
│         └────────────────────────┴──────────────────────┘       │
│                              │                                  │
│                     ┌────────┴────────┐                        │
│                     │   Phoenix Core   │                        │
│                     │   (Any copy)     │                        │
│                     └────────┬────────┘                        │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GUARDIAN SYSTEM                              │
│              (Protected by Phoenix)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Process    │  │  Network    │  │  Files      │            │
│  │  Monitor    │  │  Monitor    │  │  Monitor    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Cron       │  │  Services   │  │  Website    │            │
│  │  Monitor    │  │  Monitor    │  │  Monitor    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Hidden Locations

Phoenix installs itself in three hidden locations to ensure survival:

| Location | Disguise |
|----------|----------|
| `/usr/lib/x86_64-linux-gnu/.cache/.system-health-d` | Looks like system library cache |
| `/var/cache/apt/.pkg-cache-d` | Looks like APT package cache |
| `/lib/systemd/.sd-pam-d` | Looks like systemd PAM module |

All locations use:
- Hidden directories (starting with `.`)
- Innocent names (system-health, pkg-cache, sd-pam)
- Immutable flag to prevent deletion

## Installation

### Prerequisites

1. Guardian scripts must be installed in `/opt/guardian/`
2. Root access required
3. `openssl` for encrypted backups
4. `chattr` for immutable files (e2fsprogs package)

### Deploy to Both Servers

From your local machine (Windows with SSH access):

```powershell
# Deploy to both servers at once
.\scripts\security\phoenix\deploy-phoenix-all.ps1

# Or deploy individually
.\scripts\security\phoenix\deploy-phoenix-backend.ps1   # Backend VPS
.\scripts\security\phoenix\deploy-phoenix-frontend.ps1  # Frontend VPS
```

### Manual Installation (on server)

```bash
# Copy files to server first, then:
cd /path/to/phoenix/
chmod +x *.sh
./install-phoenix.sh install
```

## Management

### Commands

After installation, use the `phoenix-ctl` command:

```bash
# Check Phoenix status
phoenix-ctl status

# View Phoenix logs (real-time)
phoenix-ctl logs

# Run manual security check
phoenix-ctl check

# Create new Guardian backup
phoenix-ctl backup

# Restore Guardian from backup
phoenix-ctl restore

# Start/Stop/Restart Phoenix
phoenix-ctl start
phoenix-ctl stop
phoenix-ctl restart
```

### Systemd Service

Phoenix runs as `system-health-monitor.service` (innocent name):

```bash
# Check service status
systemctl status system-health-monitor.service

# View service logs
journalctl -u system-health-monitor.service -f
```

## How It Works

### Self-Healing Mechanism

1. Phoenix runs from the primary location
2. Every 30 seconds, it checks if other copies exist
3. If a copy is missing:
   - Copies itself from a surviving location
   - Sets file permissions (700)
   - Makes file immutable (chattr +i)
   - Sends alert email

### Guardian Protection

1. Monitors `/opt/guardian/` directory
2. Checks each Guardian script:
   - Exists?
   - Executable?
   - Hash matches baseline?
3. If issues found:
   - Restores from encrypted backup
   - Sends alert

### Attack Detection

Phoenix actively monitors for:

| Threat | Detection | Response |
|--------|-----------|----------|
| Crypto miners | Process name patterns | Kill process |
| Malware directories | Known paths (/etc/de, etc.) | Remove directory |
| Malicious cron | Patterns (wget\|bash, c3pool) | Remove entry |
| C2 connections | Known IPs | Alert |
| Guardian tampering | Hash verification | Restore from backup |

## Security Features

### Encryption

Guardian backups are encrypted using AES-256-CBC:
- Key derived from hostname + machine-id
- PBKDF2 key derivation
- Stored in `/var/lib/.system-state/.guardian-backup.enc`

### Hiding from Discovery

Phoenix is hidden from common discovery methods:

1. **locate/find**: Added to PRUNEPATHS in updatedb.conf
2. **ps output**: Uses kernel worker process name
3. **File listing**: Hidden directories and files
4. **Service name**: "system-health-monitor" sounds legitimate

### File Protection

- Immutable flag (chattr +i) prevents:
  - Deletion
  - Modification
  - Renaming
- Only root with `chattr -i` can remove protection

## Testing

Run the test suite after installation:

```bash
# Basic tests
./phoenix-test.sh

# Full tests (includes self-healing test)
./phoenix-test.sh --full

# Stress test (deletes all copies)
./phoenix-test.sh --stress
```

## Uninstallation

To completely remove Phoenix:

```bash
# On the server
./install-phoenix.sh uninstall

# Or manually:
systemctl stop system-health-monitor.service
systemctl disable system-health-monitor.service
rm /etc/systemd/system/system-health-monitor.service
chattr -i /usr/lib/x86_64-linux-gnu/.cache/.system-health-d
chattr -i /var/cache/apt/.pkg-cache-d
chattr -i /lib/systemd/.sd-pam-d
rm -f /usr/lib/x86_64-linux-gnu/.cache/.system-health-d
rm -f /var/cache/apt/.pkg-cache-d
rm -f /lib/systemd/.sd-pam-d
rm -f /usr/local/sbin/phoenix-ctl
rm -f /etc/cron.d/system-health
systemctl daemon-reload
```

## Logs

Phoenix logs are hidden at `/var/log/.system-health.log`:

```bash
# View logs
tail -f /var/log/.system-health.log

# Or use phoenix-ctl
phoenix-ctl logs
```

## Alert Format

Phoenix sends alerts with this format:

```
═══════════════════════════════════════════════
🔥 PHOENIX GUARDIAN - CRITICAL ALERT
═══════════════════════════════════════════════

🕐 Time:     2025-12-10 21:00:00
🖥️  Server:   backend-vps (153.92.223.23)
🎯 Level:    CRITICAL
🔥 Source:   Phoenix Meta-Guardian

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Alert message here]

--
Phoenix Meta-Guardian Security System
🔥 Self-Healing | 🛡️ Self-Protecting | 👁️ Always Watching
```

## Files

```
scripts/security/phoenix/
├── README.md                    # This documentation
├── phoenix-guardian.sh          # Main Phoenix script
├── install-phoenix.sh           # Installation script
├── phoenix-test.sh              # Test suite
├── deploy-phoenix-all.ps1       # Deploy to both servers
├── deploy-phoenix-backend.ps1   # Deploy to backend
└── deploy-phoenix-frontend.ps1  # Deploy to frontend
```

## Troubleshooting

### Phoenix Not Starting

```bash
# Check service status
systemctl status system-health-monitor.service

# Check if file exists and is executable
ls -la /usr/lib/x86_64-linux-gnu/.cache/.system-health-d

# Check immutable flag
lsattr /usr/lib/x86_64-linux-gnu/.cache/.system-health-d

# View recent logs
journalctl -u system-health-monitor.service -n 50
```

### Cannot Delete Phoenix (for maintenance)

```bash
# Remove immutable flag first
chattr -i /usr/lib/x86_64-linux-gnu/.cache/.system-health-d
chattr -i /var/cache/apt/.pkg-cache-d
chattr -i /lib/systemd/.sd-pam-d

# Now you can delete
rm -f /usr/lib/x86_64-linux-gnu/.cache/.system-health-d
```

### Guardian Scripts Not Restoring

```bash
# Check if backup exists
ls -la /var/lib/.system-state/.guardian-backup.enc

# Manual restore
phoenix-ctl restore

# If backup is corrupted, recreate:
# (Guardian must be intact first)
phoenix-ctl backup
```

## Security Considerations

1. **Phoenix knows everything**: Phoenix has root access and can see all Guardian operations
2. **Backup encryption**: The encryption key is derived from system identifiers - don't share machine-id
3. **Immutable files**: An attacker with root can still use `chattr -i` to remove protection
4. **Log files**: Phoenix logs may contain sensitive information about attacks

## Version History

- **1.0** (December 10, 2025): Initial release
  - Self-healing capability
  - Guardian monitoring
  - Attack detection
  - Encrypted backups
  - Stealth operation