# MaasISO Security Action Plan

## Overzicht van alle beschikbare beveiligingsmaatregelen

Dit document geeft een compleet overzicht van alle beveiligingsmaatregelen die nog geïmplementeerd kunnen worden, met per maatregel:
- **Tijd**: Geschatte implementatietijd in uren
- **Effectiviteit**: Score van 0-10 (10 = meest effectief tegen aanvallen zoals op 9 dec 2025)
- **Script**: Welk script dit uitvoert

---

## 🔴 HOGE PRIORITEIT (Direct uitvoeren)

### 1. Rootkit Detection Installeren
**Script:** `06-install-rootkit-detection.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 0.5 uur |
| Effectiviteit | **9/10** |
| Wat het doet | Installeert rkhunter en chkrootkit om verborgen backdoors te vinden |
| Waarom belangrijk | Aanvaller had root access - kan rootkit hebben achtergelaten die ClamAV niet vindt |

**Commando:**
```bash
sudo bash scripts/security/06-install-rootkit-detection.sh
```

---

### 2. Nginx Hardening (Rate Limiting + Security Headers)
**Script:** `07-harden-nginx.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 1 uur |
| Effectiviteit | **8/10** |
| Wat het doet | Voegt rate limiting toe, security headers, SSL hardening, bot blocking |
| Waarom belangrijk | Voorkomt brute-force attacks, XSS, clickjacking |

**Commando:**
```bash
sudo bash scripts/security/07-harden-nginx.sh
```

---

### 3. Automatische Security Updates
**Script:** `09-setup-unattended-upgrades.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 0.25 uur |
| Effectiviteit | **9/10** |
| Wat het doet | Installeert automatisch security patches |
| Waarom belangrijk | 85% van aanvallen maakt gebruik van bekende kwetsbaarheden |

**Commando:**
```bash
sudo bash scripts/security/09-setup-unattended-upgrades.sh
```

---

### 4. Encrypted Backups (3-2-1 Regel)
**Script:** `15-encrypted-backups.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 1 uur |
| Effectiviteit | **10/10** |
| Wat het doet | AES-256 versleutelde backups, automatisch dagelijks |
| Waarom belangrijk | Bij ransomware of data loss kun je herstellen |

**Commando:**
```bash
sudo bash scripts/security/15-encrypted-backups.sh
```

---

### 5. Cloudflare Setup (Hide IP + DDoS Protection)
**Script:** `19-cloudflare-setup-guide.md` (handleiding)

| Aspect | Waarde |
|--------|--------|
| Tijd | 2-3 uur |
| Effectiviteit | **9/10** |
| Wat het doet | Verbergt server IP, DDoS bescherming, gratis WAF |
| Waarom belangrijk | Aanvallers konden direct naar je server IP |

**Stappen:**
1. Cloudflare account aanmaken
2. Domain toevoegen
3. DNS records instellen
4. UFW aanpassen voor alleen Cloudflare IPs

---

## 🟡 MEDIUM PRIORITEIT (Deze week)

### 6. File Integrity Monitoring (AIDE)
**Script:** `08-install-aide.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 1.5 uur |
| Effectiviteit | **8/10** |
| Wat het doet | Detecteert ongeautoriseerde bestandswijzigingen |
| Waarom belangrijk | Had de nginx config wijziging direct gedetecteerd |

**Commando:**
```bash
sudo bash scripts/security/08-install-aide.sh
```

---

### 7. CrowdSec (Collaborative IPS)
**Script:** `10-install-crowdsec.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 1 uur |
| Effectiviteit | **8/10** |
| Wat het doet | Deelt threat intelligence met community, blokkeert bekende aanvallers |
| Waarom belangrijk | Beter dan fail2ban, blokkeert aanvallers voordat ze jou raken |

**Commando:**
```bash
sudo bash scripts/security/10-install-crowdsec.sh
```

---

### 8. Centralized Logging (Logwatch + GoAccess)
**Script:** `12-setup-logging.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 0.5 uur |
| Effectiviteit | **7/10** |
| Wat het doet | Dagelijkse security rapporten, real-time nginx analytics |
| Waarom belangrijk | Zichtbaarheid in wat er op je servers gebeurt |

**Commando:**
```bash
sudo bash scripts/security/12-setup-logging.sh
```

---

### 9. Data Leak Monitoring
**Script:** `16-data-leak-monitoring.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 0.5 uur |
| Effectiviteit | **7/10** |
| Wat het doet | Scant code voor hardcoded secrets, checkt exposed files |
| Waarom belangrijk | API keys of wachtwoorden in code = makkelijke toegang |

**Commando:**
```bash
sudo bash scripts/security/16-data-leak-monitoring.sh
scan-secrets /var/www
```

---

### 10. Metadata Stripping (EXIF/GPS)
**Script:** `17-metadata-stripping.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 0.5 uur |
| Effectiviteit | **5/10** |
| Wat het doet | Verwijdert GPS en persoonlijke info uit uploads |
| Waarom belangrijk | Privacy bescherming voor gebruikers |

**Commando:**
```bash
sudo bash scripts/security/17-metadata-stripping.sh
```

---

### 11. Database Security
**Script:** `18-database-security.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 0.5 uur |
| Effectiviteit | **7/10** |
| Wat het doet | Hardent PostgreSQL/MySQL, alleen localhost access |
| Waarom belangrijk | Database bevat gevoelige gegevens |

**Commando:**
```bash
sudo bash scripts/security/18-database-security.sh
```

---

## 🟢 LAGERE PRIORITEIT (Deze maand)

### 12. ModSecurity WAF
**Script:** `11-install-modsecurity.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 2-4 uur |
| Effectiviteit | **7/10** |
| Wat het doet | Web Application Firewall, blokkeert SQLi, XSS, etc. |
| Waarom belangrijk | Extra laag bescherming voor web applicatie |
| Let op | Kan complexer zijn, test grondig |

**Commando:**
```bash
sudo bash scripts/security/11-install-modsecurity.sh
```

---

### 13. Kernel Hardening
**Script:** `13-kernel-hardening.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 0.5 uur |
| Effectiviteit | **6/10** |
| Wat het doet | ASLR, SYN cookies, disable unused modules |
| Waarom belangrijk | Maakt exploits moeilijker |

**Commando:**
```bash
sudo bash scripts/security/13-kernel-hardening.sh
```

---

### 14. Advanced SSH Hardening (2FA)
**Script:** `14-advanced-ssh-hardening.sh`

| Aspect | Waarde |
|--------|--------|
| Tijd | 1-2 uur |
| Effectiviteit | **8/10** |
| Wat het doet | Google Authenticator 2FA, IP whitelisting |
| Waarom belangrijk | Extra laag voor SSH toegang |
| Let op | Test goed, je kunt jezelf buitensluiten |

**Commando:**
```bash
sudo bash scripts/security/14-advanced-ssh-hardening.sh
```

---

## 📊 TOTAALOVERZICHT

| # | Maatregel | Tijd | Effectiviteit | Frontend | Backend |
|---|-----------|------|---------------|----------|---------|
| 1 | Rootkit Detection | 0.5 uur | 9/10 | ✅ DEPLOYED | ⏳ Pending |
| 2 | Nginx Hardening | 1 uur | 8/10 | ✅ DEPLOYED | ⏳ Pending |
| 3 | Auto Security Updates | 0.25 uur | 9/10 | ✅ DEPLOYED | ⏳ Pending |
| 4 | Encrypted Backups | 1 uur | 10/10 | ✅ DEPLOYED | ⏳ Pending |
| 5 | Cloudflare Setup | 2-3 uur | 9/10 | 📝 Guide Ready | 📝 Guide Ready |
| 6 | AIDE File Integrity | 1.5 uur | 8/10 | ⏳ Pending | ⏳ Pending |
| 7 | CrowdSec IPS | 1 uur | 8/10 | ⏳ Pending | ⏳ Pending |
| 8 | Logging Setup | 0.5 uur | 7/10 | ⏳ Pending | ⏳ Pending |
| 9 | Data Leak Monitoring | 0.5 uur | 7/10 | ⏳ Pending | ⏳ Pending |
| 10 | Metadata Stripping | 0.5 uur | 5/10 | ⏳ Pending | ⏳ Pending |
| 11 | Database Security | 0.5 uur | 7/10 | N/A | ⏳ Pending |
| 12 | ModSecurity WAF | 2-4 uur | 7/10 | ⏳ Pending | ⏳ Pending |
| 13 | Kernel Hardening | 0.5 uur | 6/10 | ⏳ Pending | ⏳ Pending |
| 14 | SSH 2FA | 1-2 uur | 8/10 | ⏳ Pending | ⏳ Pending |

**Frontend Server (147.93.62.188): 4/14 HIGH PRIORITY COMPLETE ✅**
**Backend Server (153.92.223.23): SSH timeout - requires VPS console access**

**Deployed: December 9, 2025 14:21 CET**

---

## 🎯 AANBEVOLEN VOLGORDE

### Vandaag (2-3 uur, hoogste impact)
```bash
# 1. Rootkit check na de aanval
sudo bash scripts/security/06-install-rootkit-detection.sh
rootkit-scan

# 2. Automatische security updates
sudo bash scripts/security/09-setup-unattended-upgrades.sh

# 3. Encrypted backups opzetten
sudo bash scripts/security/15-encrypted-backups.sh
```

### Deze week (5-6 uur)
```bash
# 4. Nginx hardening
sudo bash scripts/security/07-harden-nginx.sh

# 5. File integrity monitoring
sudo bash scripts/security/08-install-aide.sh

# 6. CrowdSec installeren
sudo bash scripts/security/10-install-crowdsec.sh

# 7. Cloudflare configureren (volg de guide)
```

### Deze maand (4-6 uur)
```bash
# 8. Alle overige scripts
sudo bash scripts/security/12-setup-logging.sh
sudo bash scripts/security/16-data-leak-monitoring.sh
sudo bash scripts/security/18-database-security.sh
sudo bash scripts/security/13-kernel-hardening.sh
sudo bash scripts/security/14-advanced-ssh-hardening.sh
```

---

## 💡 KOSTEN-BATEN ANALYSE

**Beste ROI (Return on Investment):**

| Maatregel | Tijd | Impact | ROI |
|-----------|------|--------|-----|
| Auto Security Updates | 15 min | Blokkeert 85% aanvallen | ⭐⭐⭐⭐⭐ |
| Rootkit Detection | 30 min | Vindt verborgen backdoors | ⭐⭐⭐⭐⭐ |
| Encrypted Backups | 1 uur | Beschermt tegen data loss | ⭐⭐⭐⭐⭐ |
| Cloudflare | 2-3 uur | Verbergt IP, DDoS bescherming | ⭐⭐⭐⭐ |
| Nginx Hardening | 1 uur | Rate limiting, headers | ⭐⭐⭐⭐ |

**Als je maar 2 uur hebt:**
1. ✅ Auto Security Updates (15 min)
2. ✅ Rootkit Detection (30 min)
3. ✅ Encrypted Backups (1 uur)

**Als je maar 5 uur hebt:**
- Bovenstaande + Nginx Hardening + Cloudflare

---

*Document aangemaakt: 9 december 2025*
*Na security incident met cryptominer en nginx redirect*
*Scripts verified: 9 december 2025 14:16 CET*