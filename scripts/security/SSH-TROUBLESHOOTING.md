# SSH Connection Troubleshooting Guide

**Last Updated**: 2025-12-09
**Status**: ✅ SSH Access WORKING on Both Servers

---

## ✅ Current Status - SSH Working

### Frontend Server (maasiso.nl)
```bash
ssh root@maasiso.nl
```
- **IP**: 147.93.62.188
- **Status**: ✅ SSH Key Authentication Working

### Backend Server (strapicms)
```bash
ssh root@153.92.223.23
```
- **IP**: 153.92.223.23
- **Status**: ✅ SSH Key Authentication Working

---

## Troubleshooting Guide (If SSH Stops Working)

## Mogelijke Oorzaken & Oplossingen

### 1. SSH Service Draait Niet (Meest Waarschijnlijk)

**Diagnose via Hostinger Panel:**
1. Log in op Hostinger VPS panel
2. Ga naar je VPS
3. Klik op "Console" of "VNC Console" (browser-based terminal)
4. Log in met root credentials

**Controleer SSH status:**
```bash
systemctl status sshd
# OF
systemctl status ssh
```

**Als SSH niet draait, start het:**
```bash
systemctl start sshd
systemctl enable sshd
```

**Controleer of SSH luistert op poort 22:**
```bash
ss -tlnp | grep :22
# OF
netstat -tlnp | grep :22
```

---

### 2. SSH Luistert op Andere Poort

**Controleer SSH configuratie:**
```bash
cat /etc/ssh/sshd_config | grep "^Port"
```

**Als SSH op andere poort draait:**
- Noteer het poortnummer
- Voeg firewall regel toe voor die poort
- Gebruik: `ssh -p [POORT] root@185.212.47.168`

---

### 3. Firewall Regel Niet Actief

**Controleer iptables regels:**
```bash
iptables -L -n -v
```

**Controleer of poort 22 echt open is:**
```bash
iptables -L INPUT -n -v | grep 22
```

**Als regel ontbreekt, voeg toe:**
```bash
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables-save > /etc/iptables/rules.v4
```

---

### 4. UFW of Andere Firewall Actief

**Controleer UFW:**
```bash
ufw status
```

**Als UFW actief is:**
```bash
ufw allow 22/tcp
ufw reload
```

---

### 5. Fail2Ban Heeft Je IP Geblokkeerd

**Controleer Fail2Ban:**
```bash
fail2ban-client status sshd
```

**Als je IP geblokkeerd is:**
```bash
fail2ban-client set sshd unbanip 192.168.178.200
```

---

### 6. SELinux Blokkeert SSH

**Controleer SELinux status:**
```bash
getenforce
```

**Tijdelijk uitschakelen (voor test):**
```bash
setenforce 0
```

---

## Stap-voor-Stap Oplossing

### Via Hostinger VPS Console

1. **Open Hostinger Panel**
   - Ga naar https://hpanel.hostinger.com
   - Selecteer je VPS

2. **Open Console**
   - Klik op "Console" of "Browser Terminal"
   - Log in als root

3. **Voer deze commando's uit:**

```bash
# Stap 1: Controleer SSH status
echo "=== SSH Service Status ==="
systemctl status sshd || systemctl status ssh

# Stap 2: Start SSH als het niet draait
systemctl start sshd || systemctl start ssh
systemctl enable sshd || systemctl enable ssh

# Stap 3: Controleer welke poort SSH gebruikt
echo "=== SSH Configuration ==="
grep "^Port" /etc/ssh/sshd_config || echo "Port 22 (default)"

# Stap 4: Controleer of SSH luistert
echo "=== SSH Listening Ports ==="
ss -tlnp | grep ssh

# Stap 5: Controleer firewall
echo "=== Firewall Status ==="
iptables -L INPUT -n -v | grep 22

# Stap 6: Test SSH lokaal
echo "=== Local SSH Test ==="
ssh -v localhost -p 22 2>&1 | head -20

# Stap 7: Controleer logs
echo "=== SSH Logs ==="
tail -50 /var/log/auth.log | grep sshd
```

4. **Kopieer de output en deel deze**

---

## Quick Fix Commando's

### Als SSH niet draait:
```bash
systemctl start sshd && systemctl enable sshd
```

### Als firewall het blokkeert:
```bash
iptables -I INPUT -p tcp --dport 22 -j ACCEPT
iptables-save > /etc/iptables/rules.v4
```

### Als UFW actief is:
```bash
ufw allow 22/tcp && ufw reload
```

### Herstart SSH service:
```bash
systemctl restart sshd
```

---

## Verificatie Na Fix

### Test 1: Lokaal op server
```bash
ssh localhost
```

### Test 2: Van je computer
```bash
Test-NetConnection -ComputerName 185.212.47.168 -Port 22
```

### Test 3: SSH verbinding
```bash
ssh -v root@185.212.47.168
```

---

## Alternatieve Toegang Methoden

### 1. Via Hostinger VPS Console
- Altijd beschikbaar via browser
- Geen SSH nodig
- Direct root toegang

### 2. Via VNC (als beschikbaar)
- Grafische interface
- Onafhankelijk van SSH

### 3. Via Serial Console
- Laagste niveau toegang
- Werkt altijd

---

## Na Toegang: Voer Verificatie Uit

Zodra je SSH toegang hebt, voer deze commando's uit:

```bash
# Download verificatie script
wget https://raw.githubusercontent.com/[jouw-repo]/main/scripts/security/verify-security-tasks.sh -O /tmp/verify.sh

# OF kopieer de inhoud handmatig en maak het bestand:
nano /tmp/verify.sh
# Plak de inhoud, save met Ctrl+X, Y, Enter

# Maak executable
chmod +x /tmp/verify.sh

# Voer uit
sudo /tmp/verify.sh
```

---

## Belangrijke Notities

1. **Hostinger Firewall vs Server Firewall**
   - Hostinger heeft een externe firewall (die je hebt geconfigureerd)
   - De server heeft mogelijk ook een interne firewall (iptables/ufw)
   - BEIDE moeten poort 22 toestaan

2. **SSH Hardening Scripts**
   - Als je eerder SSH hardening scripts hebt uitgevoerd
   - Mogelijk is de poort gewijzigd
   - Mogelijk zijn er IP restricties toegevoegd

3. **Backup Toegang**
   - Zorg altijd dat je via Hostinger Console kunt inloggen
   - Dit is je backup als SSH niet werkt

---

## Server Information

### Frontend Server
- **SSH Command**: `ssh root@maasiso.nl`
- **IP**: 147.93.62.188
- **Hostname**: srv718842
- **Hostinger Panel**: https://hpanel.hostinger.com

### Backend Server
- **SSH Command**: `ssh root@153.92.223.23`
- **IP**: 153.92.223.23
- **Hostname**: strapicms
- **Hostinger Panel**: https://hpanel.hostinger.com

### Local SSH Key
- **Location**: `C:\Users\niels\.ssh\id_rsa`
- **Type**: RSA 4096-bit

## Related Documentation

- **Complete Guide**: [`docs/SERVER-ACCESS-GUIDE.md`](../../docs/SERVER-ACCESS-GUIDE.md)
- **SSH Instructions**: [`scripts/SSH-ACCESS-INSTRUCTIONS.md`](../SSH-ACCESS-INSTRUCTIONS.md)
- **Active Context**: [`memory-bank/activeContext.md`](../../memory-bank/activeContext.md)