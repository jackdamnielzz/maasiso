# 🚨 SSH Toegang Probleem - Actieplan

## Probleem Diagnose

### ✅ Wat Werkt
- Server is online en bereikbaar (ping succesvol)
- Hostinger firewall heeft poort 22 open staan
- Jouw IP: 192.168.178.200

### ❌ Wat Niet Werkt
- **SSH poort 22 is NIET bereikbaar**
- TCP verbinding naar poort 22 mislukt
- Waarschijnlijke oorzaak: SSH service draait niet OF interne firewall blokkeert

---

## 🎯 Actieplan (Stap voor Stap)

### Stap 1: Toegang Krijgen tot Server

**Optie A: Via Hostinger VPS Console (AANBEVOLEN)**

1. Ga naar: https://hpanel.hostinger.com
2. Log in met je Hostinger account
3. Selecteer je VPS (185.212.47.168)
4. Klik op **"Console"** of **"Browser Terminal"**
5. Log in als `root` met je wachtwoord

**Optie B: Via VNC Console (als beschikbaar)**
- Kijk in Hostinger panel voor VNC optie
- Dit geeft grafische toegang

---

### Stap 2: Diagnostiek Uitvoeren

Zodra je in de console bent, **copy-paste dit complete script**:

```bash
#!/bin/bash
echo "=========================================="
echo "SSH Diagnostics - $(date)"
echo "=========================================="
echo ""

echo "1. SSH Service Status:"
systemctl status sshd 2>/dev/null || systemctl status ssh 2>/dev/null
echo ""

echo "2. SSH Process:"
ps aux | grep sshd | grep -v grep
echo ""

echo "3. SSH Port Configuration:"
grep "^Port" /etc/ssh/sshd_config 2>/dev/null || echo "Using default port 22"
echo ""

echo "4. SSH Listening Ports:"
ss -tlnp | grep ssh || netstat -tlnp | grep ssh
echo ""

echo "5. Firewall Rules:"
iptables -L INPUT -n -v | grep -E "22|ssh"
echo ""

echo "6. UFW Status:"
if command -v ufw &> /dev/null; then ufw status; else echo "UFW not installed"; fi
echo ""

echo "=========================================="
```

**📋 Kopieer de output en deel deze met mij**

---

### Stap 3: SSH Herstellen

Afhankelijk van de diagnose output, voer één van deze fixes uit:

#### Fix A: SSH Service Starten (Meest Waarschijnlijk)

```bash
# Start SSH service
systemctl start sshd || systemctl start ssh

# Enable bij boot
systemctl enable sshd || systemctl enable ssh

# Controleer status
systemctl status sshd || systemctl status ssh
```

#### Fix B: Firewall Regel Toevoegen

```bash
# Voeg iptables regel toe
iptables -I INPUT -p tcp --dport 22 -j ACCEPT

# Save de regel
iptables-save > /etc/iptables/rules.v4

# Controleer
iptables -L INPUT -n -v | grep 22
```

#### Fix C: UFW Configureren

```bash
# Allow SSH
ufw allow 22/tcp

# Reload
ufw reload

# Check status
ufw status
```

#### Fix D: SSH Service Herstarten

```bash
# Restart SSH
systemctl restart sshd || systemctl restart ssh

# Check logs
tail -50 /var/log/auth.log | grep sshd
```

---

### Stap 4: Verificatie

**Test 1: Lokaal op server**
```bash
ssh localhost
```
Als dit werkt, is SSH service OK.

**Test 2: Van mijn computer**
Ik zal dit testen:
```bash
Test-NetConnection -ComputerName 185.212.47.168 -Port 22
```

**Test 3: SSH Verbinding**
```bash
ssh -v root@185.212.47.168
```

---

### Stap 5: Security Verificatie Uitvoeren

Zodra SSH werkt, voer de security verificatie uit:

**Methode 1: Direct via SSH (als ik toegang heb)**
```bash
ssh root@185.212.47.168 'bash -s' < scripts/security/verify-security-tasks.sh
```

**Methode 2: Handmatig in console**
```bash
# Maak het script
cat > /tmp/verify.sh << 'EOFSCRIPT'
[HIER KOMT DE INHOUD VAN verify-security-tasks.sh]
EOFSCRIPT

# Maak executable
chmod +x /tmp/verify.sh

# Voer uit
/tmp/verify.sh
```

---

## 📝 Checklist

- [ ] Stap 1: Toegang via Hostinger Console
- [ ] Stap 2: Diagnostiek script uitgevoerd
- [ ] Stap 3: SSH service gestart/hersteld
- [ ] Stap 4: SSH verbinding getest en werkt
- [ ] Stap 5: Security verificatie uitgevoerd op Frontend (185.212.47.168)
- [ ] Stap 6: Security verificatie uitgevoerd op Backend (185.212.47.169)

---

## 🔍 Te Verifiëren Security Taken

### 1. Rootkit Detection
- rkhunter geïnstalleerd
- chkrootkit geïnstalleerd
- Dagelijkse/wekelijkse scans geconfigureerd

### 2. Unattended Upgrades
- Automatische security updates actief
- Configuratie correct

### 3. Encrypted Backups
- Backup tools geïnstalleerd
- Encryption key aanwezig
- Dagelijkse backup cron job

### 4. Nginx Hardening (Frontend)
- Security headers
- SSL/TLS configuratie
- Server tokens verborgen

---

## 🆘 Als Niets Werkt

### Plan B: Handmatige Verificatie via Console

1. Log in via Hostinger Console
2. Voer deze commando's één voor één uit:

```bash
# Check rootkit detection
command -v rkhunter && echo "✓ rkhunter installed" || echo "✗ rkhunter missing"
command -v chkrootkit && echo "✓ chkrootkit installed" || echo "✗ chkrootkit missing"
ls -la /etc/cron.daily/rkhunter-scan 2>/dev/null && echo "✓ rkhunter cron" || echo "✗ rkhunter cron missing"

# Check unattended upgrades
dpkg -l | grep unattended-upgrades && echo "✓ unattended-upgrades installed" || echo "✗ missing"
systemctl status unattended-upgrades

# Check backups
ls -la /var/backups/maasiso/ 2>/dev/null && echo "✓ backup dir exists" || echo "✗ backup dir missing"
ls -la /usr/local/bin/backup-maasiso 2>/dev/null && echo "✓ backup script" || echo "✗ backup script missing"

# Check nginx (frontend only)
nginx -T 2>/dev/null | grep -E "add_header (X-Frame|X-Content|Strict-Transport)" && echo "✓ security headers" || echo "✗ headers missing"
```

3. Kopieer de output en deel met mij

---

## 📞 Volgende Stappen

1. **JIJ**: Log in via Hostinger Console
2. **JIJ**: Voer diagnostiek script uit
3. **JIJ**: Deel output met mij
4. **IK**: Analyseer output en geef specifieke fix commando's
5. **JIJ**: Voer fix commando's uit
6. **IK**: Test SSH verbinding opnieuw
7. **IK/JIJ**: Voer security verificatie uit

---

## 📚 Referentie Documenten

- **Troubleshooting Guide**: [`SSH-TROUBLESHOOTING.md`](SSH-TROUBLESHOOTING.md)
- **Diagnostiek Script**: [`console-diagnostics.sh`](console-diagnostics.sh)
- **Verificatie Script**: [`verify-security-tasks.sh`](verify-security-tasks.sh)
- **Quick Commands**: [`QUICK-COMMANDS.md`](QUICK-COMMANDS.md)

---

**Status**: Wachtend op console toegang en diagnostiek output
**Datum**: 2025-12-09
**Servers**: Frontend (185.212.47.168), Backend (185.212.47.169)