# 🔐 BACKUP ENCRYPTION KEY - CRITICAL INFORMATION

## ⚠️ WAARSCHUWING: ZEER GEVOELIGE INFORMATIE

Dit bestand bevat de encryption key die nodig is om alle encrypted backups van de frontend server te kunnen herstellen.

---

## 📍 Key Locatie

**Lokaal opgeslagen**: `logs/BACKUP-ENCRYPTION-KEY-FRONTEND.txt`  
**Originele locatie op server**: `/root/.backup-encryption-key` (147.93.62.188)  
**Server**: srv718842.hstgr.cloud (Frontend)  
**Gedownload op**: 2025-12-09 16:03:15 UTC

---

## 🔒 Beveiliging

### ✅ WAT TE DOEN:

1. **Bewaar deze key op meerdere veilige locaties**:
   - Password manager (bijv. 1Password, Bitwarden, LastPass)
   - Encrypted USB stick (offline backup)
   - Secure cloud storage (encrypted)
   - Fysieke kluis (printed copy in sealed envelope)

2. **Toegang beperken**:
   - Alleen voor systeembeheerders
   - Niet delen via email of chat
   - Niet opslaan in plain text op onbeveiligde locaties

3. **Backup van de backup**:
   - Maak minimaal 2 kopieën
   - Bewaar op verschillende fysieke locaties
   - Test periodiek of de key nog werkt

### ❌ WAT NIET TE DOEN:

1. **NOOIT committen naar Git/GitHub**
   - Dit bestand staat in `.gitignore`
   - Controleer altijd voor commit
   - Gebruik `git status` om te verifiëren

2. **NOOIT delen via onbeveiligde kanalen**:
   - Geen email
   - Geen Slack/Teams/Discord
   - Geen SMS
   - Geen WhatsApp

3. **NOOIT opslaan op**:
   - Publieke cloud zonder encryptie
   - Gedeelde netwerkschijven
   - Onbeveiligde computers
   - Screenshots of foto's

---

## 🔓 Key Gebruik

### Backup Herstellen

Als je een encrypted backup moet herstellen:

```bash
# 1. Download encrypted backup van server
scp root@147.93.62.188:/var/backups/maasiso/encrypted/[BACKUP_FILE].enc ./

# 2. Decrypt met de key
openssl enc -aes-256-cbc -d -pbkdf2 \
  -in [BACKUP_FILE].enc \
  -out [BACKUP_FILE] \
  -pass file:./logs/BACKUP-ENCRYPTION-KEY-FRONTEND.txt

# 3. Extract de backup
tar -xzf [BACKUP_FILE]
```

### Backup Types

De key werkt voor alle encrypted backups:
- **Config backups**: `configs_YYYYMMDD_HHMMSS.tar.gz.enc`
- **Web files**: `web_files_YYYYMMDD_HHMMSS.tar.gz.enc`
- **Database**: `db_YYYYMMDD_HHMMSS.sql.gz.enc`

---

## 📋 Backup Informatie

### Backup Schedule (Frontend Server)

- **Dagelijks om 3:00 AM**: Full backup (config + files + database)
- **Elk uur**: Config backup (lightweight)

### Backup Locaties op Server

```
/var/backups/maasiso/
├── daily/          # Unencrypted temporary files (deleted after encryption)
├── weekly/         # Weekly retention
├── monthly/        # Monthly retention
└── encrypted/      # Encrypted backups (permanent storage)
```

### Logs

- **Backup logs**: `/var/log/backups/`
- **Cron logs**: `/var/log/backups/cron.log`
- **Hourly logs**: `/var/log/backups/cron-hourly.log`

---

## 🧪 Key Testen

Test periodiek of de key nog werkt:

```bash
# Download een recente encrypted backup
scp root@147.93.62.188:/var/backups/maasiso/encrypted/configs_*.enc ./test-backup.enc

# Test decryptie
openssl enc -aes-256-cbc -d -pbkdf2 \
  -in test-backup.enc \
  -out test-backup.tar.gz \
  -pass file:./logs/BACKUP-ENCRYPTION-KEY-FRONTEND.txt

# Als succesvol, verwijder test files
rm test-backup.enc test-backup.tar.gz
```

**Test frequentie**: Maandelijks aanbevolen

---

## 🆘 Als Key Verloren Gaat

### Gevolgen:
- ❌ Alle encrypted backups zijn **PERMANENT ONTOEGANKELIJK**
- ❌ Geen enkele manier om data te herstellen
- ❌ Backups zijn nutteloos zonder de key

### Preventie:
1. Bewaar key op minimaal 3 verschillende locaties
2. Test maandelijks of key nog werkt
3. Documenteer waar keys zijn opgeslagen
4. Zorg voor toegang door meerdere personen (disaster recovery)

### Als Key Echt Verloren Is:
1. Genereer nieuwe key op server
2. Oude encrypted backups zijn verloren
3. Start nieuwe backup cyclus met nieuwe key
4. Update deze documentatie

---

## 📞 Contact & Verantwoordelijkheid

**Systeembeheerder**: [Vul in]  
**Backup verantwoordelijke**: [Vul in]  
**Laatste verificatie**: 2025-12-09  
**Volgende verificatie**: 2026-01-09

---

## 📝 Changelog

| Datum | Actie | Door |
|-------|-------|------|
| 2025-12-09 | Key gedownload van frontend server | Roo (AI) |
| 2025-12-09 | Documentatie aangemaakt | Roo (AI) |

---

## 🔗 Gerelateerde Documenten

- **Backup Script**: `/usr/local/bin/backup-maasiso` (on server)
- **Verification Report**: `logs/security-verification-report-20251209.md`
- **Active Context**: `memory-bank/activeContext.md`
- **Security Scripts**: `scripts/security/15-encrypted-backups.sh`

---

**⚠️ BELANGRIJK**: Deze key is KRITIEK voor disaster recovery. Behandel met uiterste zorg!