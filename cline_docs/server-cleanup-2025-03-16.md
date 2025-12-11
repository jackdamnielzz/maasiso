# VPS2 Disk Usage Analysis Report
Date: March 16, 2025

## Current Disk Usage

### System Storage
- Total Disk Space: 97GB
- Used Space: 12GB (13%)
- Available Space: 86GB (87%)
- Status: HEALTHY - Plenty of free space available

### Directory Analysis (/var/www)
1. backups: 3.6GB
2. jouw-frontend-website: 2.1GB
3. maasiso.nl: 1.5GB
4. html: 12KB

## Analysis

The server is currently in a healthy state with 87% free space available. However, there are several areas where we can optimize storage usage:

1. **Backup Management (3.6GB)**
   - Current Issue: Backups are taking up the most space in /var/www
   - Recommendation: Implement a backup rotation policy
     * Keep only the last 3-5 backups
     * Move older backups to external storage
     * Set up automated cleanup for backups older than 30 days

2. **Frontend Applications (3.6GB total)**
   - jouw-frontend-website (2.1GB)
   - maasiso.nl (1.5GB)
   - Recommendations:
     * Clean node_modules directories and reinstall with --production flag
     * Remove .next/cache directories that are not needed in production
     * Implement better asset optimization for images and other static files

## Recommended Cleanup Actions

1. **Immediate Actions**
   ```bash
   # Clean old backups
   find /var/www/backups -type f -mtime +30 -delete

   # Clean development files
   cd /var/www/jouw-frontend-website
   rm -rf node_modules/.cache
   rm -rf .next/cache
   npm ci --production

   cd /var/www/maasiso.nl
   rm -rf node_modules/.cache
   rm -rf .next/cache
   npm ci --production
   ```

2. **Long-term Improvements**
   - Set up automated backup rotation
   - Implement compression for backup files
   - Configure nginx caching to reduce dynamic content generation
   - Set up monitoring for disk usage trends

## Recommendations for Reducing Disk Footprint

1. **Backup Strategy**
   - Implement automated backup rotation
   - Use compression for backup files
   - Move backups to external storage after 7 days
   - Keep only essential backups on the server

2. **Application Optimization**
   - Use production-only dependencies
   - Implement better asset optimization
   - Regular cleanup of temporary files
   - Monitor and clean log files regularly

3. **Monitoring and Maintenance**
   - Set up disk usage alerts (trigger at 80% usage)
   - Weekly cleanup of temporary files
   - Monthly review of backup storage
   - Quarterly full system cleanup

## Next Steps

1. Review and approve cleanup actions
2. Schedule maintenance window for cleanup
3. Implement automated cleanup scripts
4. Set up monitoring and alerts
