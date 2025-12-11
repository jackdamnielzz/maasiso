#!/bin/bash

# Exit on error
set -e

echo "Starting Strapi Connection Diagnostics..."
echo "----------------------------------------"

# 1. Check if Strapi server is running
echo "1. Checking Strapi process status..."
ssh root@153.92.223.23 "pm2 list | grep strapi" || echo "Strapi process not found!"

# 2. Check if port 1337 is listening
echo -e "\n2. Checking if port 1337 is open..."
ssh root@153.92.223.23 "netstat -tulpn | grep :1337" || echo "Port 1337 not listening!"

# 3. Check Strapi logs
echo -e "\n3. Last 10 lines of Strapi logs..."
ssh root@153.92.223.23 "pm2 logs strapi --lines 10 --nostream"

# 4. Test local connection to Strapi
echo -e "\n4. Testing connection to Strapi..."
curl -I -m 5 http://153.92.223.23:1337/admin || echo "Could not connect to Strapi!"

# 5. Check CORS configuration
echo -e "\n5. Verifying CORS configuration..."
ssh root@153.92.223.23 "cat /var/www/strapi/config/middlewares.js"

echo -e "\nDiagnostics complete!"