# 🔐 BACKEND ENCRYPTION KEY - CRITICAL

**Server**: strapicms.maasiso.cloud (Backend)  
**IP**: 153.92.223.23  
**Downloaded**: 2025-12-09 16:14 UTC  
**Key Location**: `logs/BACKUP-ENCRYPTION-KEY-BACKEND.txt`

---

## ⚠️ CRITICAL INFORMATION

Deze encryption key is ESSENTIEEL voor het herstellen van alle encrypted backups van de backend server (Strapi CMS).

**Key Value**: `74ysSLCK1f0AswcAI1931S0n2iVLatt3ySSEztA1QSQ=`

---

## 🔒 BEVEILIGING

### ✅ VERPLICHT:

1. **Bewaar op meerdere veilige locaties**:
   - ✅ Lokaal opgeslagen (dit bestand)
   - ⚠️ Password manager (1Password, Bitwarden, LastPass)
   - ⚠️ Encrypted USB stick (offline backup)
   - ⚠️ Secure cloud storage (encrypted)

2. **Toegang beperken**:
   - Alleen voor systeembeheerders
   - Niet delen via onbeveiligde kanalen
   - Niet opslaan in plain text op onbeveiligde locaties

3. **Git Protection**:
   - ✅ Dit bestand staat in .gitignore
   - ✅ Wordt NOOIT gecommit naar Git
   - ✅ Controleer altijd voor commit

---

## 🔓 GEBRUIK

### Backup Herstellen

```bash
# 1. Download encrypted backup van server
scp root@153.92.223.23:/var/backups/maasiso/encrypted/[BACKUP_FILE].enc ./

# 2. Decrypt met de key
openssl enc -aes-256-cbc -d -pbkdf2 \
  -in [BACKUP_FILE].enc \
  -out [BACKUP_FILE] \
  -pass pass:74ysSLCK1f0AswcAI1931S0n2iVLatt3ySSEztA1QSQ=

# 3. Extract de backup
tar -xzf [BACKUP_FILE]
```

---

## 📋 BACKUP INFORMATIE

**Server**: Backend (Strapi CMS)  
**Backup Locatie**: `/var/backups/maasiso/`  
**Encryption**: AES-256-CBC  
**Schedule**: Dagelijks om 3:00 AM + Hourly configs

---

## 🆘 ALS KEY VERLOREN GAAT

**GEVOLGEN**:
- ❌ Alle encrypted backups zijn PERMANENT ontoegankelijk
- ❌ Geen enkele manier om data te herstellen
- ❌ Backups zijn nutteloos zonder de key

**PREVENTIE**:
- Bewaar key op minimaal 3 verschillende locaties
- Test maandelijks of key nog werkt
- Documenteer waar keys zijn opgeslagen

---

## 📝 CHANGELOG

| Datum | Actie | Door |
|-------|-------|------|
| 2025-12-09 16:14 | Key gedownload van backend server | Roo (AI) |
| 2025-12-09 16:14 | Lokaal opgeslagen en gedocumenteerd | Roo (AI) |

---

**⚠️ BELANGRIJK**: Deze key is KRITIEK voor disaster recovery van de backend server!