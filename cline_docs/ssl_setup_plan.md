# SSL Setup Plan - Last Updated: 2025-02-08 14:32

## Completed Steps (DNS Configuration)
1. Connected to VPS (147.93.62.188)
2. Fixed Next.js application startup:
   - Rebuilt application with `npm run build`
   - Started in standalone mode using `.next/standalone/server.js`
   - Application running on port 3000

3. Configured Nginx:
   - Created configuration for maasiso.nl
   - Set up reverse proxy to port 3000
   - Configured for future SSL setup with acme-challenge location

4. DNS Configuration:
   - Added A records in Hostinger DNS Manager
   - Verified DNS propagation
   - Confirmed website accessibility

## Next Steps (SSL Setup)
1. Install Certbot:
   ```bash
   apt update
   apt install certbot python3-certbot-nginx
   ```

2. Obtain SSL Certificate:
   ```bash
   certbot --nginx -d maasiso.nl -d www.maasiso.nl
   ```
   - This will:
     * Verify domain ownership
     * Generate SSL certificate
     * Automatically configure Nginx
     * Set up auto-renewal

3. Verify SSL Configuration:
   - Check HTTPS access
   - Verify certificate validity
   - Test automatic renewal

4. Update Application Configuration:
   - Ensure all assets are served over HTTPS
   - Configure HSTS headers
   - Update any hardcoded HTTP URLs

## Notes
- Current IP: 147.93.62.188
- Domain: maasiso.nl
- SSL Provider: Let's Encrypt (via Certbot)
- Web Server: Nginx 1.18.0
- Auto-renewal: Will be configured by Certbot