# Backend Server Toegang & Verificatie Guide

**Last Updated**: 2025-12-09
**Status**: ✅ SSH Key Authentication CONFIGURED AND WORKING

---

## ✅ Quick Access - SSH Command

```bash
ssh root@153.92.223.23
```

SSH key authentication is configured and working!

---

## Server Informatie

**Server**: strapicms.maasiso.cloud (Backend - Strapi CMS)
**IP**: 153.92.223.23
**OS**: Ubuntu 22.04 LTS
**Plan**: KVM 4 (4 CPU cores, 16 GB RAM, 200 GB disk)
**Locatie**: Netherlands - Meppel
**Verloopt**: 2025-12-17 ⚠️ (Renew ASAP!)
**SSH Status**: ✅ Working (key-based authentication)

---

## Toegangs Methoden

### Primair: SSH Key Authentication (AANBEVOLEN)

```bash
ssh root@153.92.223.23
```

- SSH key is geconfigureerd op 2025-12-09
- Lokale key locatie: `C:\Users\niels\.ssh\id_rsa`
- Password authentication is uitgeschakeld (security)

### Backup: Hostinger VPS Terminal

### Stap 1: Open Hostinger Terminal

1. Ga naar: https://hpanel.hostinger.com
2. Log in met je Hostinger account
3. Selecteer VPS: **strapicms.maasiso.cloud**
4. Klik op **"Terminal"** knop (bovenaan de pagina)
5. Browser-based terminal opent automatisch
6. Je bent nu ingelogd als `root`

### Stap 2: Voer Security Verificatie Uit

Kopieer en plak dit complete script in de terminal:

```bash
#!/bin/bash
# Security Verification Script voor Backend Server

echo "=========================================="
echo "Backend Server Security Verification"
echo "Server: strapicms.maasiso.cloud"
echo "IP: 153.92.223.23"
echo "Date: $(date)"
echo "=========================================="
echo ""

# 1. Check Rootkit Detection
echo "1. ROOTKIT DETECTION:"
echo "--------------------"
if command -v rkhunter &> /dev/null; then
    echo "✓ rkhunter installed"
    rkhunter --version | head -1
else
    echo "✗ rkhunter NOT installed"
fi

if command -v chkrootkit &> /dev/null; then
    echo "✓ chkrootkit installed"
    chkrootkit -V 2>&1 | head -1
else
    echo "✗ chkrootkit NOT installed"
fi

if [ -f /etc/cron.daily/rkhunter-scan ]; then
    echo "✓ rkhunter cron job exists"
else
    echo "✗ rkhunter cron job missing"
fi

if [ -f /etc/cron.weekly/chkrootkit-scan ]; then
    echo "✓ chkrootkit cron job exists"
else
    echo "✗ chkrootkit cron job missing"
fi
echo ""

# 2. Check Unattended Upgrades
echo "2. UNATTENDED UPGRADES:"
echo "-----------------------"
if dpkg -l | grep -q unattended-upgrades; then
    echo "✓ unattended-upgrades installed"
    systemctl is-enabled unattended-upgrades && echo "✓ Service enabled" || echo "✗ Service not enabled"
    systemctl is-active unattended-upgrades && echo "✓ Service running" || echo "✗ Service not running"
else
    echo "✗ unattended-upgrades NOT installed"
fi
echo ""

# 3. Check Encrypted Backups
echo "3. ENCRYPTED BACKUPS:"
echo "---------------------"
if command -v restic &> /dev/null; then
    echo "✓ restic installed"
else
    echo "✗ restic NOT installed"
fi

if [ -d /var/backups/maasiso ]; then
    echo "✓ Backup directory exists"
    ls -lh /var/backups/maasiso/
else
    echo "✗ Backup directory missing"
fi

if [ -f /root/.backup-encryption-key ]; then
    echo "✓ Encryption key exists"
else
    echo "✗ Encryption key missing"
fi

if [ -f /usr/local/bin/backup-maasiso ]; then
    echo "✓ Backup script exists"
else
    echo "✗ Backup script missing"
fi
echo ""

# 4. Check Nginx (if applicable)
echo "4. NGINX STATUS:"
echo "----------------"
if command -v nginx &> /dev/null; then
    echo "✓ nginx installed"
    nginx -v 2>&1
    systemctl is-active nginx && echo "✓ nginx running" || echo "✗ nginx not running"
else
    echo "✗ nginx NOT installed (OK for backend if using different setup)"
fi
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
```

### Stap 3: Analyseer Resultaten

Kijk naar de output en noteer welke componenten ontbreken (✗ markers).

---

## 🔧 Installatie van Ontbrekende Componenten

### Als Rootkit Detection Ontbreekt:

```bash
# Download en run installatie script
wget https://raw.githubusercontent.com/[YOUR-REPO]/main/scripts/security/06-install-rootkit-detection.sh -O /tmp/install-rootkit.sh

# OF kopieer handmatig de inhoud en run:
chmod +x /tmp/install-rootkit.sh
/tmp/install-rootkit.sh
```

**Handmatige installatie**:
```bash
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y rkhunter chkrootkit
sudo rkhunter --update
sudo rkhunter --propupd

# Dagelijkse rkhunter scan
sudo bash -c 'cat > /etc/cron.daily/rkhunter-scan << "EOF"
#!/bin/bash
LOG_FILE="/var/log/rkhunter.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")
echo "========================================" >> "$LOG_FILE"
echo "rkhunter Scan - $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
/usr/bin/rkhunter --check --skip-keypress --report-warnings-only >> "$LOG_FILE" 2>&1
EOF
chmod +x /etc/cron.daily/rkhunter-scan
'

# Wekelijkse chkrootkit scan
sudo bash -c 'cat > /etc/cron.weekly/chkrootkit-scan << "EOF"
#!/bin/bash
LOG_FILE="/var/log/chkrootkit.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")
echo "========================================" >> "$LOG_FILE"
echo "chkrootkit Scan - $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
/usr/sbin/chkrootkit >> "$LOG_FILE" 2>&1
EOF
chmod +x /etc/cron.weekly/chkrootkit-scan
'
```

### Als Unattended Upgrades Ontbreekt:

```bash
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y unattended-upgrades apt-listchanges

# Config
sudo bash -c 'cat > /etc/apt/apt.conf.d/50unattended-upgrades << "EOF"
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::MinimalSteps "true";
EOF
'

# Schedule
sudo bash -c 'cat > /etc/apt/apt.conf.d/20auto-upgrades << "EOF"
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF
'

sudo systemctl enable unattended-upgrades
sudo systemctl start unattended-upgrades
```

### Als Encrypted Backups Ontbreekt:

```bash
sudo apt-get update -qq
sudo apt-get install -y gnupg2 restic rclone pigz

sudo mkdir -p /var/backups/maasiso/{daily,weekly,monthly,encrypted}
sudo mkdir -p /var/log/backups
sudo chmod 700 /var/backups/maasiso

# Encryption key
sudo bash -c 'if [ ! -f /root/.backup-encryption-key ]; then
  openssl rand -base64 32 > /root/.backup-encryption-key
  chmod 600 /root/.backup-encryption-key
fi'

# Backup script (zie 15-encrypted-backups.sh voor volledige versie)
# ... [kopieer script inhoud hier]

# Cron job
sudo bash -c 'cat > /etc/cron.d/maasiso-backup << "EOF"
0 3 * * * root /usr/local/bin/backup-maasiso full >> /var/log/backups/cron.log 2>&1
EOF
'
```


---

## 📋 Checklist na Verificatie

- [ ] Rootkit detection geïnstalleerd en geconfigureerd
- [ ] Unattended upgrades actief
- [ ] Encrypted backups geconfigureerd
- [ ] Backup encryption key opgeslagen (download naar veilige locatie!)
- [ ] Nginx status gecontroleerd (indien van toepassing)
- [ ] Firewall regels gecontroleerd
- [ ] SSH toegang getest (indien gewenst)
- [ ] Server renewal gepland (verloopt 2025-12-17!)

---

## ⚠️ Belangrijke Notities

### Backend vs Frontend

**Backend Server (strapicms.maasiso.cloud)**:
- Draait Strapi CMS
- Mogelijk geen publieke nginx (alleen API)
- Nginx hardening minder kritiek als niet publiek toegankelijk
- Focus op: rootkit detection, updates, backups

**Frontend Server (srv718842.hstgr.cloud)**:
- Publiek toegankelijk
- Nginx hardening KRITIEK
- Alle security maatregelen nodig

### Server Verlenging

⚠️ **URGENT**: Backend server verloopt op **2025-12-17** (over 8 dagen!)
- Auto-renewal staat aan, maar controleer of betaling succesvol is
- Zorg voor tijdige verlenging om downtime te voorkomen

### Backup Encryption Key

Als je een nieuwe encryption key genereert op backend:
```bash
# Download key
cat /root/.backup-encryption-key

# Kopieer output en sla veilig op
# Gebruik zelfde procedure als frontend key
```

---

## 🆘 Troubleshooting

### Terminal Werkt Niet

1. Probeer browser refresh
2. Probeer andere browser
3. Check Hostinger status page
4. Contact Hostinger support

### Commando's Werken Niet

- Check of je root rechten hebt: `whoami` (moet "root" zijn)
- Gebruik `sudo` voor admin commando's
- Check syntax errors in scripts

### Firewall Blokkeert Alles

```bash
# Emergency: Disable firewall tijdelijk
sudo ufw disable

# Of reset iptables
sudo iptables -F
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
```

---

## Gerelateerde Documentatie

- **Complete Server Guide**: [`docs/SERVER-ACCESS-GUIDE.md`](../../docs/SERVER-ACCESS-GUIDE.md)
- **SSH Instructions**: [`scripts/SSH-ACCESS-INSTRUCTIONS.md`](../SSH-ACCESS-INSTRUCTIONS.md)
- **Active Context**: [`memory-bank/activeContext.md`](../../memory-bank/activeContext.md)

---

**Laatste Update**: 2025-12-09
**SSH Status**: ✅ Configured and Working
**Next Action**: Renew server before 2025-12-17!