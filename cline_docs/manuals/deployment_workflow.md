# Deployment en Content Management Workflow

## 1. Content Management (VPS1 - Strapi CMS)

### Toegang tot CMS
- URL: http://153.92.223.23:1337/admin
- Login met je admin credentials

### Content Updaten
1. Log in op het CMS
2. Navigeer naar het juiste content type (Pages, News, Blog, etc.)
3. Maak wijzigingen of voeg nieuwe content toe
4. Klik op "Save" en "Publish"
5. Wacht ongeveer 1 minuut voor de cache vernieuwing

### Afbeeldingen Toevoegen/Wijzigen
1. Upload nieuwe afbeeldingen via de Media Library
2. Gebruik de afbeelding in je content
3. Wacht 1-2 minuten voor de cache vernieuwing
4. Controleer in incognito modus of de wijzigingen zichtbaar zijn

## 2. Code Wijzigingen (VPS2 - Next.js Frontend)

### Lokale Ontwikkeling
1. Open het project in VSCode
2. Maak de gewenste code wijzigingen
3. Test lokaal met:
   ```bash
   npm run dev
   ```
4. Controleer of alles werkt op http://localhost:3000

### Deployment naar VPS2
1. Verbind met VPS2:
   ```bash
   ssh root@147.93.62.188
   ```

2. Update de code:
   ```bash
   cd /var/www/maasiso/app
   git pull origin main
   ```

3. Installeer dependencies (indien nodig):
   ```bash
   npm install
   ```

4. Build en herstart:
   ```bash
   npm run build
   pm2 restart all
   ```

5. Controleer de website op https://maasiso.nl

### Cache Management

Als wijzigingen niet direct zichtbaar zijn:

1. Clear browser cache:
   - Open Chrome DevTools (F12)
   - Rechtsklik op refresh
   - Kies "Empty Cache and Hard Reload"

2. Server cache reset:
   ```bash
   ssh root@147.93.62.188
   cd /var/www/maasiso/app
   pm2 restart all
   systemctl reload nginx
   ```

## 3. Troubleshooting

### VPS1 (CMS) Issues
Als het CMS niet bereikbaar is:
```bash
ssh root@153.92.223.23
cd /var/www/strapi
pm2 status
pm2 restart all
```

### VPS2 (Frontend) Issues
Als de website niet goed laadt:
```bash
ssh root@147.93.62.188
cd /var/www/maasiso/app
pm2 logs
pm2 restart all
```

### SSL/HTTPS Issues
```bash
ssh root@147.93.62.188
systemctl status nginx
nginx -t
systemctl reload nginx
```

## 4. Belangrijke Locaties

### VPS1 (CMS)
- IP: 153.92.223.23
- CMS Directory: /var/www/strapi
- Admin URL: http://153.92.223.23:1337/admin

### VPS2 (Frontend)
- IP: 147.93.62.188
- Website Directory: /var/www/maasiso/app
- Website URL: https://maasiso.nl

## 5. Best Practices

1. Content Updates:
   - Test altijd in preview mode
   - Controleer afbeeldingen op juiste formaat
   - Wacht 1-2 minuten na publicatie

2. Code Updates:
   - Test altijd lokaal eerst
   - Maak backups voor grote wijzigingen
   - Controleer logs na deployment

3. Cache Management:
   - Gebruik incognito mode voor testen
   - Wacht minimaal 1 minuut na updates
   - Reset server cache indien nodig

## 6. Contact

Bij problemen:
- Email: niels@maasiso.nl
- VPS Provider: Hostinger
- Support: https://hpanel.hostinger.com/