# VPS Credentials

## VPS1 - Content Management System (Strapi)
- Purpose: Hosts the Strapi CMS system
- IP Address: 153.92.223.23
- Hostname: srv692111.hstgr.cloud
- Location: Netherlands
- Node: nl-srv-pve-node115
- OS: Ubuntu 22.04

### SSH Access
- Username: root
- Port: 22
- IPv6: 2a02:4780:d:4c28::1
- Command: `ssh root@153.92.223.23`

## VPS2 - Website Deployment
- Purpose: Hosts the Next.js website
- IP Address: 147.93.62.188
- Hostname: srv718842.hstgr.cloud
- Location: Germany
- Node: de-fra-pve-node606
- OS: Ubuntu 22.04

### SSH Access
- Username: root
- Port: 22
- IPv6: 2a02:4780:41:d836::1
- Command: `ssh root@147.93.62.188`

### Domain Configuration
- Primary Domain: maasiso.nl
- Subdomain: www.maasiso.nl
- DNS Provider: Hostinger
- A Record: points to 147.93.62.188
- CNAME Record: www points to maasiso.nl
- TTL: 300 seconds

### SSL Certificates
- Provider: Let's Encrypt
- Domains Covered: maasiso.nl, www.maasiso.nl
- Certificate Location: /etc/letsencrypt/live/maasiso.nl/
- Auto-renewal: Yes (via certbot)
- Last Updated: 2025-02-10

## Hostinger Control Panel
- Email: jackdamielz@gmail.com
- Password: Niekties@10!

## Revision History
- **Date:** 2025-02-10
- **Description:** Updated to include domain and SSL certificate information
- **Author:** AI

## Important Notes
- VPS1 (153.92.223.23) is dedicated to running the Strapi CMS
- VPS2 (147.93.62.188) is dedicated to hosting the Next.js website
- SSL certificates auto-renew 30 days before expiration
- Keep these credentials secure and never share them publicly
- Regular backups of SSL certificates recommended
