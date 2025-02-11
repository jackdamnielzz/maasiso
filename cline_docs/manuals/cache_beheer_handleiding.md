# Cache Beheer Handleiding

## Het Probleem
Wanneer afbeeldingen worden aangepast in het CMS (VPS1), worden deze wijzigingen niet altijd direct zichtbaar op de website (VPS2). Dit komt door verschillende lagen van caching:

1. Browser Cache
2. Next.js Cache
3. Nginx Cache
4. CDN Cache (indien aanwezig)

## Oplossingen

### 1. Directe Cache Reset

#### 1.1 Browser Cache Leegmaken
1. Open Chrome DevTools (F12)
2. Rechtsklik op de refresh knop
3. Kies "Empty Cache and Hard Reload"

#### 1.2 Next.js Cache Reset
```bash
# SSH naar VPS2
ssh root@147.93.62.188

# Ga naar de app directory
cd /var/www/maasiso/app

# Verwijder de .next cache directory
rm -rf .next

# Rebuild de applicatie
npm run build

# Herstart de applicatie
pm2 restart all
```

#### 1.3 Nginx Cache Reset
```bash
# SSH naar VPS2
ssh root@147.93.62.188

# Nginx cache directory leegmaken
rm -rf /var/cache/nginx/*

# Nginx herstarten
systemctl restart nginx
```

### 2. Automatische Cache Invalidatie Implementeren

#### 2.1 Next.js Configuration
Voeg deze configuratie toe aan `next.config.js`:

```javascript
module.exports = {
  images: {
    minimumCacheTTL: 60, // 1 minuut cache
    domains: ['153.92.223.23'], // VPS1 IP voor CMS afbeeldingen
  },
  onDemandEntries: {
    // Hoe lang pagina's in memory blijven
    maxInactiveAge: 60 * 1000, // 1 minuut
  },
}
```

#### 2.2 Nginx Configuration
Voeg deze regels toe aan de Nginx configuratie:

```nginx
# In de location block voor afbeeldingen
location ~ \.(jpg|jpeg|png|gif|ico|svg)$ {
    expires 1m; # Cache voor 1 minuut
    add_header Cache-Control "public, no-transform";
}
```

### 3. Best Practices voor Content Updates

#### 3.1 Afbeeldingen Updaten
1. Upload nieuwe afbeelding in Strapi
2. Gebruik een unieke bestandsnaam
3. Wacht 1-2 minuten voor propagatie
4. Controleer met incognito venster

#### 3.2 Snelle Cache Reset Procedure
1. Open terminal in VSCode
2. Voer dit command uit:
```bash
ssh root@147.93.62.188 "cd /var/www/maasiso/app && pm2 restart all && systemctl reload nginx"
```

### 4. Monitoring en Troubleshooting

#### 4.1 Cache Status Controleren
```bash
# Check Nginx cache status
curl -I https://maasiso.nl/path/to/image.jpg

# Check Next.js build cache
ls -la /var/www/maasiso/app/.next/cache
```

#### 4.2 Logs Bekijken
```bash
# Next.js logs
pm2 logs

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### 5. Lange-termijn Oplossingen

#### 5.1 Implementeer Cache-Busting
1. Voeg versienummers toe aan afbeelding URLs
2. Gebruik timestamp query parameters
3. Implementeer content hashing

#### 5.2 CDN Configuratie
```nginx
# Voeg deze headers toe in Nginx
location /images/ {
    add_header Cache-Control "public, max-age=60";
    add_header X-Cache-Status $upstream_cache_status;
}
```

### 6. Preventieve Maatregelen

#### 6.1 Voor Content Managers
1. Gebruik unieke bestandsnamen
2. Plan grote content updates
3. Test in incognito modus
4. Wacht 1-2 minuten na updates

#### 6.2 Voor Ontwikkelaars
1. Implementeer cache headers correct
2. Monitor cache hit/miss ratio
3. Gebruik cache-busting technieken
4. Implementeer progressive loading

## Snelle Referentie

### Commands voor Cache Reset
```bash
# Volledige cache reset
ssh root@147.93.62.188 "cd /var/www/maasiso/app && rm -rf .next && npm run build && pm2 restart all && systemctl reload nginx"

# Alleen applicatie herstarten
ssh root@147.93.62.188 "cd /var/www/maasiso/app && pm2 restart all"

# Nginx cache legen
ssh root@147.93.62.188 "rm -rf /var/cache/nginx/* && systemctl reload nginx"
```

### Checklist bij Cache Problemen
1. Clear browser cache
2. Check in incognito mode
3. Wacht 1-2 minuten
4. Restart applicatie indien nodig
5. Check logs voor errors
6. Controleer bestandsnamen
7. Verifieer cache headers

### Contact
Bij aanhoudende problemen:
- Email: niels@maasiso.nl
- Check server status in Hostinger panel
- Controleer beide VPS instances