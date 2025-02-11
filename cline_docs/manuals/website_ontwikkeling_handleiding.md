# Website Ontwikkeling en Deployment Handleiding

## Inhoudsopgave
1. VSCode Setup
2. Lokale Ontwikkeling
3. Code Aanpassen
4. Testen
5. Deployment naar VPS2
6. Troubleshooting

## 1. VSCode Setup

### 1.1 VSCode Verbinding met VPS2
1. Open VSCode
2. Druk op F1 of Ctrl+Shift+P
3. Type: "Remote-SSH: Connect to Host"
4. Selecteer: "root@147.93.62.188"
5. Wacht tot de verbinding is opgezet

### 1.2 Project Openen
1. Ga naar File > Open Folder
2. Navigate naar: `/var/www/maasiso/app`
3. Klik "OK"

## 2. Lokale Ontwikkeling

### 2.1 Code Downloaden voor Lokaal Werken
```bash
git clone [repository-url]
cd maasiso
npm install
```

### 2.2 Lokale Development Server Starten
```bash
npm run dev
```
- Website is nu beschikbaar op: http://localhost:3000

## 3. Code Aanpassen

### 3.1 Belangrijke Mappen en Bestanden
- `/app`: Hoofdpagina's en routing
- `/src/components`: React componenten
- `/public`: Statische bestanden (afbeeldingen, etc.)
- `/styles`: CSS bestanden

### 3.2 Veel Voorkomende Aanpassingen

#### Tekst Wijzigen
1. Open het relevante bestand in `/app` of `/src/components`
2. Zoek de tekst die je wilt wijzigen
3. Maak de aanpassing
4. Sla het bestand op (Ctrl+S)

#### Styling Aanpassen
1. Open relevante CSS bestanden in `/styles`
2. Maak de gewenste aanpassingen
3. Sla op en check direct het resultaat in de browser

#### Nieuwe Pagina Toevoegen
1. Maak nieuw bestand in `/app` map
2. Gebruik de standaard Next.js page template:
```tsx
export default function NieuwePagina() {
  return (
    <div>
      <h1>Nieuwe Pagina</h1>
    </div>
  );
}
```

## 4. Testen

### 4.1 Lokaal Testen
1. Controleer de website op http://localhost:3000
2. Test op verschillende schermgroottes
3. Controleer console voor errors (F12)
4. Verifieer dat alle links werken

### 4.2 Build Testen
```bash
npm run build
```
- Controleer of er geen build errors zijn

## 5. Deployment naar VPS2

### 5.1 Snelle Deployment Methode
1. Open VSCode met VPS2 verbinding
2. Open terminal (Ctrl+`)
3. Ga naar project directory:
```bash
cd /var/www/maasiso/app
```

4. Pull laatste wijzigingen:
```bash
git pull origin main
```

5. Installeer dependencies (indien nodig):
```bash
npm install
```

6. Build de applicatie:
```bash
npm run build
```

7. Herstart de applicatie:
```bash
pm2 restart all
```

### 5.2 Deployment Verifiëren
1. Open https://maasiso.nl
2. Controleer of wijzigingen zichtbaar zijn
3. Test belangrijke functionaliteiten
4. Check console voor errors

## 6. Troubleshooting

### 6.1 Veel Voorkomende Problemen

#### Build Errors
```bash
# Verwijder build cache
rm -rf .next
# Verwijder node_modules
rm -rf node_modules
# Opnieuw installeren en builden
npm install
npm run build
```

#### Website Niet Bereikbaar
1. Check PM2 status:
```bash
pm2 status
```

2. Check Nginx status:
```bash
systemctl status nginx
```

3. Herstart services indien nodig:
```bash
pm2 restart all
systemctl restart nginx
```

### 6.2 Logs Bekijken

#### PM2 Logs
```bash
pm2 logs
```

#### Nginx Logs
```bash
tail -f /var/log/nginx/error.log
```

### 6.3 Backup Maken voor Wijzigingen
```bash
# Maak backup van huidige versie
cd /var/www/maasiso
tar -czf backup-$(date +%Y%m%d).tar.gz app/
```

## Tips & Tricks

### Snelle Commands
- `npm run dev`: Start development server
- `npm run build`: Build de applicatie
- `pm2 restart all`: Herstart de website
- `pm2 logs`: Bekijk live logs
- `git status`: Check gewijzigde bestanden

### Best Practices
1. Maak altijd eerst een backup
2. Test lokaal voor deployment
3. Check logs bij problemen
4. Gebruik comments in je code
5. Commit regelmatig wijzigingen

### Belangrijke Locaties
- Website: https://maasiso.nl
- Backend CMS: http://153.92.223.23:1337/admin
- Project map: /var/www/maasiso/app
- Nginx config: /etc/nginx/sites-available/maasiso

### Contact
Bij ernstige problemen:
- Email: niels@maasiso.nl
- VPS Provider: Hostinger
- Support: https://hpanel.hostinger.com/