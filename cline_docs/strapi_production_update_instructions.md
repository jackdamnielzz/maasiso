# Strapi Production Mode Content Type Update Instructions

## Current Situation
We need to add new fields to the Event content type, but content type modifications are disabled because Strapi is running in production mode on the VPS (153.92.223.23).

## Safe Update Process

1. **Create Backup**
   ```bash
   # SSH into the server
   ssh root@153.92.223.23

   # Create database backup
   pg_dump -U postgres maasiso > /backups/maasiso_pre_event_update.sql
   ```

2. **Enable Development Mode**
   ```bash
   # Stop Strapi
   pm2 stop strapi

   # Set NODE_ENV to development temporarily
   export NODE_ENV=development

   # Start Strapi in development mode
   pm2 start npm --name "strapi-dev" -- run develop
   ```

3. **Make Content Type Changes**
   - Add the new fields as specified in strapi_content_type_updates.md
   - Test the changes
   - Build the updated schema

4. **Return to Production**
   ```bash
   # Stop development instance
   pm2 stop strapi-dev

   # Build with new changes
   npm run build

   # Restart in production mode
   pm2 start strapi
   ```

## Verification Steps
After completing the update:
1. Verify all existing event data is intact
2. Test creating a new event with the new fields
3. Confirm GraphQL schema includes new fields

## Rollback Plan
If issues occur:
```bash
# Stop Strapi
pm2 stop strapi

# Restore database backup
psql -U postgres maasiso < /backups/maasiso_pre_event_update.sql

# Restart Strapi
pm2 start strapi
```

## Revision History
- **Date:** 2025-01-12
- **Description:** Initial production update instructions
- **Author:** AI
