# MaasISO Contact Form Monitor

Automatisch monitoring systeem voor het contactformulier op https://www.maasiso.nl/contact/

---

## Overzicht

Er zijn **drie manieren** om het contactformulier te monitoren:

| Methode | Frequentie | Vereist |
|---------|-----------|---------|
| GitHub Actions | 3x per dag (08:00, 13:00, 16:00 NL) | GitHub repository |
| Windows Task Scheduler | 3x per dag (08:00, 13:00, 16:00) | Windows PC aan |
| BetterStack Uptime | Elke 10 minuten | Gratis account |

---

## Methode 1: GitHub Actions (aanbevolen)

Het workflow bestand `.github/workflows/contact-form-monitor.yml` voert automatisch 3x per dag een test uit.

**Bij een fout:** GitHub maakt automatisch een Issue aan in de repository — je ontvangt een e-mailmelding van GitHub.

**Handmatig starten:**
1. Ga naar de GitHub repository
2. Klik op **Actions** → **Contact Form Health Monitor**
3. Klik op **Run workflow**

---

## Methode 2: Windows Task Scheduler

### Stap 1: Script testen

Open PowerShell en voer uit:

```powershell
.\scripts\monitor-contact-form.ps1
```

Je ziet een groene ✅ bij succes of rode ❌ bij een fout.

### Stap 2: Automatisch instellen (eenmalig uitvoeren)

Kopieer en plak dit in PowerShell als **Administrator**:

```powershell
# Pas dit pad aan naar jouw projectlocatie
$scriptPath = "D:\Programmeren\MaasISO\New without errors\maasiso - Copy\scripts\monitor-contact-form.ps1"

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NonInteractive -File `"$scriptPath`""
$triggerMorning   = New-ScheduledTaskTrigger -Daily -At "08:00"
$triggerNoon      = New-ScheduledTaskTrigger -Daily -At "13:00"
$triggerAfternoon = New-ScheduledTaskTrigger -Daily -At "16:00"

Register-ScheduledTask -TaskName "MaasISO Contact Monitor Ochtend"   -Action $action -Trigger $triggerMorning   -RunLevel Highest
Register-ScheduledTask -TaskName "MaasISO Contact Monitor Middag"    -Action $action -Trigger $triggerNoon      -RunLevel Highest
Register-ScheduledTask -TaskName "MaasISO Contact Monitor Namiddag"  -Action $action -Trigger $triggerAfternoon -RunLevel Highest

Write-Host "✅ Drie geplande taken aangemaakt!" -ForegroundColor Green
```

### Stap 3: Log bekijken

De resultaten worden opgeslagen in `scripts/contact-monitor-log.txt`.

Log bekijken via PowerShell:
```powershell
Get-Content .\scripts\contact-monitor-log.txt
```

Of open het bestand in Notepad/VS Code. Voorbeeld van logregels:

```
2026-02-17 08:00:01 | ✅ SUCCES
2026-02-17 13:00:02 | ✅ SUCCES
2026-02-17 16:00:01 | ❌ FOUT - The remote name could not be resolved
```

### Geplande taken verwijderen

```powershell
Unregister-ScheduledTask -TaskName "MaasISO Contact Monitor Ochtend"   -Confirm:$false
Unregister-ScheduledTask -TaskName "MaasISO Contact Monitor Middag"    -Confirm:$false
Unregister-ScheduledTask -TaskName "MaasISO Contact Monitor Namiddag"  -Confirm:$false
```

---

## Methode 3: BetterStack Uptime (externe monitoring)

**BetterStack** is een gratis externe monitoringservice die elke 10 minuten checkt of jouw contactformulier bereikbaar is — ook als jouw pc uit staat.

### Stap-voor-stap instellen

**1. Account aanmaken**
- Ga naar https://betterstack.com/uptime
- Klik op **"Start for free"** en maak een gratis account aan

**2. Nieuwe monitor toevoegen**
- Klik op **"New Monitor"** (of het +-icoon)

**3. Monitor configureren**

| Instelling | Waarde |
|-----------|--------|
| **Type** | HTTP |
| **URL** | `https://www.maasiso.nl/api/contact` |
| **Method** | POST |
| **Content-Type header** | `application/json` |
| **Request body** | zie hieronder |
| **Expected keyword** | `"success":true` |
| **Check interval** | 10 minuten (of 60 min voor minder e-mails) |

**Request body voor BetterStack:**
```json
{"name":"BetterStack Monitor","email":"monitor@maasiso.nl","subject":"ISO 9001","message":"Uptime check","acceptTerms":true}
```

**4. Alert instellen**
- Ga naar **Alerting** of **On-call**
- Voeg e-mailadres toe: `niels.maas@maasiso.nl`
- Kies: stuur alert na **1 fout** (of na 2 opeenvolgende fouten om valse alarmen te vermijden)

**5. Opslaan**
- Klik op **"Create Monitor"**
- BetterStack begint direct met monitoren

### Voordelen BetterStack
- ✅ Werkt 24/7, ook als je pc uit staat
- ✅ Gratis plan: tot 10 monitors, elke 3 minuten
- ✅ Statuspage mogelijk (publieke statuspagina)
- ✅ Geschiedenis en grafieken beschikbaar

---

## Probleemoplossing

| Fout | Oplossing |
|------|-----------|
| `success:false` | Controleer Resend API key op https://resend.com/api-keys |
| HTTP 500 | Controleer Vercel deployment op https://vercel.com/dashboard |
| HTTP 404 | Route `/api/contact` bestaat niet meer — controleer deployment |
| Timeout | Vercel server reageert niet — wacht 5 min en probeer opnieuw |
| PowerShell: "niet digitaal ondertekend" | Voer uit: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## Wat doet de monitoringtest?

Het script stuurt een echte POST naar de contactformulier API:
- **Naam:** Monitor Bot
- **E-mail:** monitor@maasiso.nl  
- **Onderwerp:** ISO 9001
- **Bericht:** Automatische monitoring test met tijdstip

Dit e-mailbericht gaat naar `info@maasiso.nl` — dit is bewust zodat de **volledige flow** getest wordt (API → Resend → inbox).
