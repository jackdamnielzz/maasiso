#!/bin/bash

# Exit on error
set -e

echo "Checking Strapi status on VPS1..."

# SSH into VPS1 and check Strapi process
ssh root@153.92.223.23 "pm2 status strapi && curl -I http://localhost:1337/admin"

echo "Status check complete!"