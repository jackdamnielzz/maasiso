#!/bin/bash

# Exit on error
set -e

echo "Configuring CORS settings on VPS1 (Strapi backend)..."

# SSH into VPS1 and update Strapi configuration
ssh root@153.92.223.23 "cat > /var/www/strapi/config/middlewares.js << 'EOL'
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': [\"'self'\", 'https:', 'http:'],
          'img-src': [\"'self'\", 'data:', 'blob:', 'https:', 'http:'],
          'media-src': [\"'self'\", 'data:', 'blob:', 'https:', 'http:'],
          upgradeInsecureRequests: null,
        },
      },
      frameguard: false,
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: ['http://147.93.62.188', 'http://147.93.62.188:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]
EOL"

# Restart Strapi to apply changes
ssh root@153.92.223.23 "cd /var/www/strapi && pm2 restart strapi"

echo "CORS configuration on VPS1 complete!"
echo "The Strapi backend will now accept requests from VPS2"