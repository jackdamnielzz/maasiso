# Contactformulier SMTP Authenticatie Probleem

## Probleem
Het contactformulier op de live website (http://147.93.62.188:3000/contact) gaf een 500 Internal Server Error wanneer gebruikers probeerden het formulier in te dienen. Maar lokale testen werkten wel correct.

## Symptomen
- 500 Internal Server Error bij het verzenden van het contactformulier
- Geen gedetailleerde foutmeldingen zichtbaar in de browser
- E-mails werden niet verzonden
- Lokale testen werkten prima

## Diagnose
Om het probleem te diagnosticeren hebben we de volgende stappen ondernomen:

1. De API route `app/api/contact/route.ts` aangepast met uitgebreide logging en foutmeldingen
2. Een test endpoint `app/api/contact-test/route.ts` gecreëerd om de environment variables te controleren

De test endpoint onthulde twee cruciale problemen:
```json
{"success":true,"message":"Contact test route working","timestamp":"2025-02-25T09:39:20.830Z","environment":"development","debug":{"emailPasswordSet":false,"deploymentTimestamp":"2025-02-25T09:39:20.830Z"}}
```

De resultaten toonden:
1. `emailPasswordSet: false` - De `EMAIL_PASSWORD` environment variable werd niet correct ingesteld op de server
2. `environment: development` - De server draaide in development mode in plaats van production mode

## Oorzaak
Het deployment script `scripts/direct-deploy.ps1` had twee problemen:

1. **Probleem met EMAIL_PASSWORD**: 
   ```powershell
   # Backup .env file if it exists
   if [ -f .env ]; then
       cp .env /tmp/env.backup
   fi
   # Later in het script
   # Restore .env file if it was backed up
   if [ -f /tmp/env.backup ]; then
       cp /tmp/env.backup .env
   fi
   ```
   Dit betekende dat de oude `.env` file werd geback-upt en later teruggezet, waardoor onze nieuwe environment variables verloren gingen tijdens deployment.

2. **Probleem met development/production modus**:
   De `NODE_ENV` werd niet expliciet ingesteld op de server, wat resulteerde in de standaard 'development' mode.

## Oplossing
We hebben de volgende wijzigingen doorgevoerd:

1. Het deployment script aangepast om een nieuwe `.env` file te genereren op de server met alle benodigde variables:
   ```bash
   # Create a production .env file with correct settings
   cat > /var/www/jouw-frontend-website/.env << EOL
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=http://147.93.62.188:3000
   NEXT_PUBLIC_BACKEND_URL=http://147.93.62.187:1337
   EMAIL_PASSWORD=Niekties@100
   EOL

   # Make sure the file has correct permissions
   chmod 600 /var/www/jouw-frontend-website/.env
   ```

2. Improved error handling in the API route for better diagnostics:
   - Enhanced email error logging
   - Added SMTP connection verification
   - Created test endpoint for environment verification

## Resultaat
- Het contactformulier werkt nu correct op de live website
- E-mails worden succesvol verzonden naar info@maasiso.nl
- De server draait in production mode
- Betere error handling voor toekomstige troubleshooting

## Geleerde lessen
1. Het is cruciaal om zeker te stellen dat de deployment scripts de environment variables correct behandelen, vooral wanneer er services zijn die hier afhankelijk van zijn, zoals SMTP-authenticatie.
2. Expliciete environment instellingen zijn beter dan impliciete defaults (vooral NODE_ENV=production).
3. Diagnostische endpoints zijn waardevol voor het identificeren van problemen zonder toegang tot server logs.
4. Test de volledige e-mail stroom van begin tot eind op de productieserver, niet alleen de frontend.
5. Zorg voor veilige maar toegankelijke manieren om te debuggen op productie.

## Betrokken componenten
- `app/api/contact/route.ts` - De API route die e-mails verstuurt
- `app/api/contact-test/route.ts` - De diagnostische test route
- `scripts/direct-deploy.ps1` - Het deployment script
- `.env.production` - Het lokale environment bestand

## Gerelateerde documenten
- [Deployment Setup Guide](../vps_deployment_setup.md)
- [Active Context](../activeContext.md)
- [Progress](../progress.md)