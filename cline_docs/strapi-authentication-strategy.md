# Strapi Authentication Strategy
Date: March 17, 2025

## Current Authentication Issues

- Frontend is making API requests but receiving 401 (Unauthorized) errors
- New API token has been created through the Strapi admin interface
- Token has been added to both Strapi's .env file and the frontend's .env.production
- API authentication is not working despite having a valid token

## Authentication Architecture

### Strapi API Authentication Methods

1. **API Tokens**:
   - Used for server-to-server communication
   - Can be created in the admin interface
   - Must be included in the Authorization header of API requests
   - Support different token scopes and permissions

2. **JWT Authentication**:
   - Used for authenticated user sessions
   - Generated after user login
   - Managed by the Users & Permissions plugin
   - Has configurable expiration and refresh mechanisms

3. **Public Endpoints**:
   - Content accessible without authentication
   - Configured through the Users & Permissions plugin
   - Requires proper role-based permissions setup

## Current Configuration Analysis

### API Token Configuration

- **Token Creation**: New token created in admin interface
- **Token Scope**: Needs verification (full access vs. custom permissions)
- **Token Usage**: Added to .env files but may not be properly utilized in API calls
- **Token Validation**: May be affected by Users & Permissions plugin issues

### Frontend Implementation

- **Authentication Header**: Must use `Authorization: Bearer <token>`
- **Environment Variables**: Token added to .env.production
- **API Client**: Should be configured to include the token in all requests
- **Error Handling**: Should handle 401 errors appropriately

## Authentication Resolution Strategy

### 1. Verify Token Configuration

```bash
# Check if token exists in Strapi admin interface
# Navigate to Settings > API Tokens
```

### 2. Check Token Permissions

Ensure the token has appropriate permissions:
- Read access to content types
- Appropriate endpoints access
- Correct token type (full access, read-only, custom)

### 3. Verify Token Usage in Frontend

Check how the token is being used in the frontend code:

```javascript
// Expected implementation in API client
const fetchData = async (endpoint) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`
    }
  });
  return response.json();
};
```

### 4. Configure Public Permissions

If appropriate for your content strategy:

1. Navigate to Settings > Users & Permissions > Roles > Public
2. Enable "find" and "findOne" permissions for content types that should be publicly accessible
3. Save the configuration

### 5. Test API Access

Use curl to test API access with the token:

```bash
# Test with token
curl -H "Authorization: Bearer YOUR_API_TOKEN" http://153.92.223.23:1337/api/pages

# Test public access (if configured)
curl http://153.92.223.23:1337/api/pages
```

### 6. Regenerate Token If Needed

If the token is not working:

1. Create a new API token with appropriate permissions
2. Update the .env files with the new token
3. Restart both the Strapi server and frontend application

## Advanced Troubleshooting

### Check JWT Configuration

If the token strategy doesn't work, verify JWT configuration:

```javascript
// config/plugins.js
module.exports = {
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '30d',
        jwtSecret: process.env.JWT_SECRET || 'your-secret'
      },
    },
  },
};
```

### Verify Role-Based Permissions

Check if the authenticated role has appropriate permissions:

1. Navigate to Settings > Users & Permissions > Roles > Authenticated
2. Ensure appropriate permissions are enabled for content types
3. Save the configuration

### Check Content API Configuration

Verify content API configuration in `config/api.js`:

```javascript
// config/api.js
module.exports = {
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
};
```

## Implementation Plan

1. **Database Restoration First**:
   - Restore the database as primary step (per database restoration plan)
   - This may resolve plugin and authentication issues automatically

2. **Plugin Repair Second**:
   - Fix the Users & Permissions plugin (per plugin repair strategy)
   - Necessary for proper authentication configuration

3. **Authentication Configuration Third**:
   - Verify and reconfigure API tokens
   - Set up public role permissions
   - Test API access

4. **Frontend Integration Fourth**:
   - Ensure the frontend is correctly using the API token
   - Update any environment variables or configuration files
   - Test frontend API requests

## Success Criteria

- [  ] API requests from frontend return 200 OK status
- [  ] Content is properly retrieved through API endpoints
- [  ] API token is validated by Strapi
- [  ] Users & Permissions plugin is functioning correctly
- [  ] Public endpoints accessible as configured