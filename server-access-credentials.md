# Server Access Credentials and Notes

## Backend Server (Strapi CMS)
- Hostname: strapicms.maasiso.cloud
- IP Address: 153.92.223.23
- OS: Ubuntu 22.04 LTS
- SSH Username: root
- Root Password: (provided by user, not stored here for security)
- Server Location: Netherlands - Meppel
- CPU Cores: 4
- Memory: 16 GB
- Disk Space: 200 GB
- Notes:
  - Strapi backend running on port 1337
  - Nginx proxy configured to forward /api/ requests to Strapi backend
  - CORS configured in Strapi middleware
  - Favicon and image assets located in /var/www/strapi/public

## Frontend Server (Next.js)
- Hostname: frontend.maasiso.cloud
- IP Address: 147.93.62.188
- OS: Ubuntu 22.04 LTS
- SSH Username: root
- Root Password: (provided by user, not stored here for security)
- Server Location: Germany - Frankfurt
- CPU Cores: 2
- Memory: 8 GB
- Disk Space: 100 GB
- Notes:
  - Next.js frontend running on port 3000
  - Nginx proxy configured to forward other requests to Next.js frontend
  - Favicon.ico needs to be present in Next.js public directory to avoid 500 errors

---

## Summary of Actions Taken
- Fixed CORS header conflict by adjusting local proxy to use permissive Access-Control-Allow-Origin '*'
- Uploaded favicon.ico to Strapi public directory
- Attempted to configure Nginx to serve favicon.ico directly, but location block conflicts require manual config adjustment
- Provided corrected Nginx config with favicon location block at top level (maasiso.nl.fixed)
- Uploaded corrected Nginx config to backend server and reloaded Nginx (with warnings about conflicting server names)
- Identified that favicon 500 error on frontend is due to missing favicon.ico in Next.js public directory on frontend server

---

## Next Steps Recommendations
- Add favicon.ico file to Next.js public directory on frontend server (147.93.62.188)
- Verify and adjust Nginx configuration on frontend server if needed
- Monitor logs for any further errors related to static assets or proxying
- Consider setting up systemd service for Strapi for better management

This document will be kept updated with any further changes or access details.