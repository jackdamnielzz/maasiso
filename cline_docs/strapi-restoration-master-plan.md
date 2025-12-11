# Strapi CMS Restoration Master Plan
Date: March 17, 2025

## Executive Summary

The Strapi CMS (Content Management System) running at http://153.92.223.23:1337 is experiencing multiple critical issues. While the admin interface is accessible, it shows no content due to an empty database. Additionally, the Users & Permissions plugin is malfunctioning, causing 404 errors, and the frontend is unable to authenticate with the API despite token creation attempts. This document provides a comprehensive plan to restore full functionality.

## Current Status Assessment

### 🔴 Critical Issues
1. **Empty Database**: Admin interface accessible but shows no content
2. **Plugin Malfunction**: Users & Permissions plugin showing 404 errors
3. **Authentication Failure**: Frontend receiving 401 (Unauthorized) errors
4. **Runtime Errors**: Logs showing "Cannot read properties of undefined (reading 'pluginOptions')"

### 🟡 Available Resources
1. **Database Backup**: Located at `/root/strapi_backup.sql`
2. **Admin Access**: Strapi admin interface is accessible
3. **Server Access**: SSH access to the server is available
4. **PostgreSQL**: Database server is running and connectable

### 🔄 Previous Attempts
1. Created new API token through Strapi admin
2. Added token to environment files
3. Attempted permission configuration
4. Restarted Strapi service multiple times
5. Verified database connectivity

## Root Cause Analysis

The issues appear interconnected in the following causal chain:

1. **Primary Issue**: Empty database or corrupted database state
   - Without proper database content, the CMS cannot function correctly
   - Plugin configurations and content types are missing

2. **Secondary Issues**:
   - Plugin configuration failures due to missing database entries
   - Authentication failures due to improper permission configuration
   - Runtime errors in the admin UI due to missing content types

## Restoration Strategy

The restoration will follow a systematic approach addressing the foundational issues first, then working up to the application layer:

### 1️⃣ Database Restoration (Phase 1)

**Objective**: Restore database content from backup file

**Key Steps**:
- Create precautionary backup of current (empty) database
- Restore from `/root/strapi_backup.sql` backup file
- Verify database table structure and content
- Check for any permission issues during restoration

**Success Criteria**:
- All database tables restored with original content
- No errors during restoration process
- Database connectivity maintained

**Detailed Plan**: See `strapi-database-restoration-plan.md` for complete instructions

### 2️⃣ Plugin Repair (Phase 2)

**Objective**: Fix plugin configuration and functionality issues

**Key Steps**:
- Verify plugin installations
- Check plugin configuration files
- Reinstall Users & Permissions plugin if necessary
- Clear plugin cache and rebuild admin UI
- Verify plugin database tables

**Success Criteria**:
- Users & Permissions plugin accessible in admin UI
- No "pluginOptions" errors in logs
- Plugin configurations properly loaded

**Detailed Plan**: See `strapi-plugin-repair-strategy.md` for complete instructions

### 3️⃣ Authentication Configuration (Phase 3)

**Objective**: Resolve API authentication issues

**Key Steps**:
- Configure public and authenticated role permissions
- Create new API token with appropriate permissions
- Verify token usage in frontend code
- Test API access with the token

**Success Criteria**:
- API requests from frontend return 200 OK status
- Content successfully retrieved through API
- Token properly validated by Strapi

**Detailed Plan**: See `strapi-authentication-strategy.md` for complete instructions

### 4️⃣ Content Verification (Phase 4)

**Objective**: Ensure all content is accessible and properly structured

**Key Steps**:
- Verify all content types are present
- Check content relationships and structure
- Test API endpoints for content retrieval
- Confirm content structure matches frontend expectations

**Success Criteria**:
- All content types accessible in admin UI
- Content properly structured with correct relationships
- API endpoints returning expected content

## Implementation Plan

### Prerequisites
- SSH access to the server (153.92.223.23)
- PostgreSQL credentials
- Admin access to Strapi
- Backup file accessibility

### Step-by-Step Execution

#### Day 1: Database Restoration

1. **Preparation** (30 minutes)
   - Connect to server via SSH
   - Verify backup file exists and is readable
   - Check PostgreSQL service status

2. **Database Backup** (15 minutes)
   - Create precautionary backup of current state
   ```bash
   su - postgres -c "pg_dump strapi_db > /tmp/strapi_db_empty_backup.sql"
   ```

3. **Database Restoration** (45 minutes)
   - Restore from backup file
   ```bash
   su - postgres -c "psql strapi_db < /root/strapi_backup.sql"
   ```
   - Verify restoration success
   ```bash
   su - postgres -c "psql strapi_db -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \"public\";'"
   ```

4. **Initial Testing** (30 minutes)
   - Restart Strapi service
   ```bash
   cd /var/www/strapi
   pm2 restart strapi
   ```
   - Check admin interface for content
   - Review error logs for any new issues

#### Day 2: Plugin Repair

1. **Plugin Verification** (30 minutes)
   - Check installed plugins
   ```bash
   cd /var/www/strapi
   npm list @strapi/plugin-users-permissions
   ```
   - Examine plugin configuration
   ```bash
   cat /var/www/strapi/config/plugins.js
   ```

2. **Plugin Reinstallation** (if necessary) (45 minutes)
   - Reinstall Users & Permissions plugin
   ```bash
   cd /var/www/strapi
   npm uninstall @strapi/plugin-users-permissions
   npm install @strapi/plugin-users-permissions
   ```

3. **Cache Clearing and Rebuild** (30 minutes)
   - Clear plugin cache
   ```bash
   rm -rf /var/www/strapi/.cache
   rm -rf /var/www/strapi/.tmp
   ```
   - Rebuild admin UI
   ```bash
   cd /var/www/strapi
   NODE_ENV=production npm run build
   ```

4. **Plugin Testing** (30 minutes)
   - Restart Strapi service
   ```bash
   pm2 restart strapi
   ```
   - Check Users & Permissions in admin UI
   - Monitor logs for plugin-related errors

#### Day 3: Authentication Configuration

1. **Permission Configuration** (45 minutes)
   - Configure public role permissions
   - Set up authenticated role permissions
   - Create new API token with appropriate permissions

2. **Token Implementation** (30 minutes)
   - Update environment variables with new token
   - Verify token usage in frontend code
   - Restart frontend application

3. **API Testing** (45 minutes)
   - Test API access with token
   ```bash
   curl -H "Authorization: Bearer YOUR_API_TOKEN" http://153.92.223.23:1337/api/pages
   ```
   - Test public endpoints (if configured)
   - Verify frontend API requests

4. **Final Verification** (30 minutes)
   - Monitor logs for authentication issues
   - Test all content types through API
   - Verify frontend displays content correctly

## Potential Challenges and Mitigations

### Database Restoration Challenges
- **Issue**: Backup file might be from a different Strapi version
- **Mitigation**: Check Strapi version compatibility before restoration

### Plugin Compatibility Issues
- **Issue**: Plugin versions might not match the Strapi version
- **Mitigation**: Verify plugin and Strapi versions match

### Permission Configuration Complexity
- **Issue**: Complex permission structure difficult to configure correctly
- **Mitigation**: Start with minimal permissions and gradually expand

### Frontend Integration Issues
- **Issue**: Frontend code might need updates to use new token
- **Mitigation**: Review and update API client code if necessary

## Success Criteria

The restoration will be considered successful when:

1. ✅ Database is fully restored with all original content
2. ✅ Users & Permissions plugin functions correctly
3. ✅ API authentication works properly
4. ✅ Content is visible in the admin interface
5. ✅ Frontend can fetch and display content
6. ✅ No critical errors in logs

## Monitoring and Maintenance

After successful restoration:

1. **Regular Backups**:
   - Implement daily database backups
   - Store backups securely with rotation policy

2. **Health Monitoring**:
   - Set up health checks for Strapi service
   - Monitor API response times and error rates

3. **Documentation**:
   - Update recovery procedures based on lessons learned
   - Document server configuration and plugin settings

## References

- [Strapi Database Restoration Plan](./strapi-database-restoration-plan.md)
- [Strapi Plugin Repair Strategy](./strapi-plugin-repair-strategy.md)
- [Strapi Authentication Strategy](./strapi-authentication-strategy.md)