# Deployment Workflow

Dit document beschrijft het proces voor het deployen van wijzigingen naar de productieomgeving (VPS2).

## Snelle Deployment met Git-achtige Aanpak

We gebruiken een Git-achtige aanpak voor snelle en efficiënte deployments. Het script houdt bij welke bestanden zijn gewijzigd en uploadt alleen de noodzakelijke bestanden.

### Voordelen
- ✨ Veel snellere deployments
- 🔍 Alleen gewijzigde bestanden worden geüpload
- 🚫 Automatische uitsluiting van node_modules, .next, etc.
- 📝 Houdt een geschiedenis bij van gedeployde bestanden

### Commando's

#### Normale Deployment
Voor het deployen van alleen gewijzigde bestanden:
```powershell
./scripts/fast-deploy.ps1
```

#### Force Deployment
Voor het opnieuw deployen van alle bestanden (bijvoorbeeld bij eerste deployment of problemen):
```powershell
./scripts/fast-deploy.ps1 -force
```

### Hoe het Werkt

1. **Bestandstracking**
   - Het script houdt een `.deployment-hash` bestand bij
   - Hierin staan SHA256 hashes van alle bestanden
   - Alleen bestanden met gewijzigde hashes worden geüpload

2. **Uitgesloten Bestanden**
   - node_modules/*
   - .next/*
   - .git/*
   - *.log
   - *.lock
   - scripts/latest_backup/*

3. **Deployment Process**
   - Berekent hashes van alle bestanden
   - Vergelijkt met vorige deployment
   - Kopieert alleen gewijzigde bestanden naar een tijdelijke map
   - Uploadt deze bestanden naar de server
   - Voert npm install en build uit op de server
   - Herstart de applicatie

### Troubleshooting

#### Hash Reset
Als je vermoedt dat de hash-tracking niet correct werkt:
```powershell
./scripts/fast-deploy.ps1 -force
```
Dit forceert een volledige deployment en reset de hash-tracking.

#### Deployment Verificatie
Na elke deployment:
1. Controleer https://maasiso.nl
2. Test de belangrijkste functionaliteiten
3. Controleer de server logs indien nodig

## Legacy Deployment Script

Het oude deployment script (`deploy.ps1`) is nog steeds beschikbaar maar wordt niet meer aanbevolen vanwege de langzamere snelheid en inefficiënte bestandsoverdracht.

## Best Practices

1. **Voor Deployment**
   - Commit je wijzigingen lokaal
   - Test de wijzigingen lokaal
   - Zorg dat alle builds lokaal werken

2. **Tijdens Deployment**
   - Gebruik standaard de `fast-deploy.ps1`
   - Controleer de output voor eventuele fouten
   - Wacht tot het process volledig is afgerond

3. **Na Deployment**
   - Verifieer de wijzigingen op de live site
   - Controleer of alle nieuwe functionaliteit werkt
   - Monitor de logs voor eventuele errors

## Veiligheid

- Het script gebruikt SSH voor veilige bestandsoverdracht
- Credentials worden beheerd via SSH keys
- Geen gevoelige informatie in de scripts