# Strapi Database Restoration Plan
Date: March 17, 2025

## Current Status

### Identified Issues
- **Empty Database**: The Strapi admin interface (http://153.92.223.23:1337/admin) is accessible but shows no content
- **Database Connection**: The database (strapi_db) exists and is connected, but appears to be empty
- **Backup Available**: Found a backup file at `/root/strapi_backup.sql` that could contain the original content
- **Plugin Issues**: The Users & Permissions plugin is showing 404 errors (`/users-permissions/roles`)
- **Runtime Errors**: Seeing errors about "Cannot read properties of undefined (reading 'pluginOptions')"
- **Authentication Failures**: Frontend is making API requests but receiving 401 (Unauthorized) errors

### Prior Resolution Attempts
- Created a new API token through the Strapi admin interface
- Added the token to both Strapi's .env file and the frontend's .env.production
- Attempted to configure permissions through the admin UI but encountered issues
- Tried to access the Users & Permissions section but got 404 errors
- Restarted the Strapi service multiple times
- Checked database connectivity and configuration

## Root Cause Analysis

### Primary Issues
1. **Empty Database**: The absence of content indicates either database connection issues or missing data
2. **Plugin Configuration**: The Users & Permissions plugin errors suggest configuration problems
3. **Authentication Flow**: API token is created but not being properly recognized

### Secondary Issues
1. **Permission Issues**: Potential filesystem permissions affecting backup restoration
2. **Plugin Dependencies**: Possible missing or corrupted plugin dependencies
3. **Plugin Data Integrity**: Potential issues with plugin-related data

## Restoration Plan

### 1. Database Restoration
- [ ] Verify PostgreSQL permissions for current user
- [ ] Create a backup of the current (empty) database as a precaution
- [ ] Restore the backup from `/root/strapi_backup.sql`
- [ ] Handle any permission issues during restoration
- [ ] Verify data integrity after restoration

### 2. Plugin Configuration
- [ ] Check Strapi plugin configuration in config files
- [ ] Reinstall the Users & Permissions plugin if needed
- [ ] Verify plugin dependencies are correctly installed
- [ ] Check for any corrupted plugin data

### 3. Permission Configuration
- [ ] Configure public role permissions once plugins are working
- [ ] Set up proper API token permissions
- [ ] Test API access with the configured token
- [ ] Verify authentication flow is working correctly

### 4. Content Verification
- [ ] Verify all content types are present after database restoration
- [ ] Check if content is accessible through the admin interface
- [ ] Test API endpoints for content retrieval
- [ ] Confirm content structure matches frontend expectations

## Implementation Approach

### Database Restoration Commands
```bash
# Backup current database (precautionary)
su - postgres -c "pg_dump strapi_db > /tmp/strapi_db_empty_backup.sql"

# Restore from backup file
su - postgres -c "psql strapi_db < /root/strapi_backup.sql"

# Verify restoration
su - postgres -c "psql strapi_db -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = public;'"
```

### Plugin Verification
```bash
# Check installed npm packages
cd /var/www/strapi
npm list @strapi/plugin-users-permissions

# Reinstall plugin if needed
npm install @strapi/plugin-users-permissions
```

### Strapi Restart Procedure
```bash
# Stop Strapi
pm2 stop strapi

# Build admin UI (if needed)
cd /var/www/strapi
NODE_ENV=production npm run build

# Start Strapi
NODE_ENV=production pm2 start strapi --name strapi -- start
```

## Potential Challenges

1. **Database Compatibility**: The backup might be from a different Strapi version
2. **Permission Issues**: PostgreSQL user permissions might require adjustment
3. **Plugin Version Mismatch**: Installed plugins might not match the backed-up configuration
4. **Admin UI Rebuild**: May need to rebuild the admin UI after configuration changes
5. **Data Corruption**: Backup file might be incomplete or corrupted

## Success Criteria

- [ ] Database successfully restored with original content
- [ ] Users & Permissions plugin functioning correctly
- [ ] Public API endpoints accessible with proper authentication
- [ ] Content visible and manageable in the admin interface
- [ ] Frontend able to fetch content successfully

## Monitoring and Verification

- Monitor Strapi logs for errors during and after restoration
- Check for any errors in the admin UI after restoration
- Verify API endpoints return expected data
- Test frontend connectivity to all required endpoints
- Verify user roles and permissions are correctly configured

## Documentation Updates

After successful restoration, update the following documentation:
- Database backup and restoration procedures
- Plugin configuration settings
- API token management process
- Permission configuration guidelines