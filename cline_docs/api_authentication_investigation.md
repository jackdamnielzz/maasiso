# API Authentication Investigation Report

## Current Situation
We are experiencing authentication issues between our Next.js frontend and Strapi backend. The frontend is unable to successfully authenticate with the Strapi API, resulting in 401 Unauthorized and 403 Forbidden errors.

## System Architecture
- Frontend: Next.js application running on http://localhost:3001
- Backend: Strapi CMS running on http://153.92.223.23:1337
- Authentication: JWT-based token system

## Detailed Problem Description
1. Authentication Errors:
   - 401 Unauthorized errors when fetching blog posts
   - 401 Unauthorized errors when fetching categories
   - 403 Forbidden errors in some cases
   - Token validation appears to be failing

2. API Endpoints Affected:
   - /api/blog-posts (GET)
   - /api/categories (GET)
   - /api/pages (GET)

## Attempted Solutions

### 1. URL Structure Modifications
- Tried removing /api from base URL
- Tried adding /api to base URL
- Tested with and without /api in endpoint paths
- Results: Still receiving authentication errors

### 2. Token Handling Approaches
```typescript
// Attempt 1: Original approach with Bearer prefix
headers: {
  'Authorization': `Bearer ${env.strapiToken}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

// Attempt 2: Without Bearer prefix
headers: {
  'Authorization': env.strapiToken,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

// Attempt 3: Using apiKey header
headers: {
  'apiKey': token,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
```

### 3. CORS and Credentials Configuration
- Tested different credentials modes:
  - credentials: 'include'
  - credentials: 'same-origin'
  - credentials: 'omit'
- Added CORS headers:
  - Origin
  - Access-Control-Allow-Origin
  - Access-Control-Allow-Methods
  - Access-Control-Allow-Headers

### 4. Environment Configuration
```env
# Original Configuration
NEXT_PUBLIC_API_URL=http://153.92.223.23:1337/api
NEXT_PUBLIC_STRAPI_TOKEN=Bearer [token]

# Modified Configuration
NEXT_PUBLIC_API_URL=http://153.92.223.23:1337
NEXT_PUBLIC_STRAPI_TOKEN=[token]
```

## Current Status
- All API requests are still failing with authentication errors
- Token validation is not working as expected
- CORS configuration might need adjustment on the Strapi side

## Error Patterns
1. Blog Posts Endpoint:
```
API Error: Error: Failed to fetch blog posts: 401 Unauthorized
```

2. Categories Endpoint:
```
Error fetching categories: TypeError: Cannot read properties of null (reading 'map')
```

3. Pages Endpoint:
```
[API] Failed to fetch page: {
  status: 401,
  statusText: 'Unauthorized',
  error: '{"data":null,"error":{"status":401,"name":"UnauthorizedError","message":"Missing or invalid credentials","details":{}}}'
}
```

## Next Steps and Recommendations
1. Token Verification:
   - Verify token generation process in Strapi
   - Confirm token format and expiration
   - Test token directly in Postman or similar tool

2. Strapi Configuration:
   - Review authentication settings in Strapi admin
   - Check CORS configuration
   - Verify API permissions for public endpoints

3. Frontend Implementation:
   - Consider implementing refresh token mechanism
   - Add better error handling for auth failures
   - Implement request retry logic with exponential backoff

4. Development Tools:
   - Set up detailed request logging
   - Implement better error tracking
   - Add authentication state monitoring

## Required Information for External Review
1. Access Requirements:
   - Strapi admin access
   - API documentation
   - Current token generation process
   - CORS configuration details

2. System Configuration:
   - Strapi version and plugins
   - Next.js version
   - Authentication middleware details
   - Network configuration between frontend and backend

## Last Updated: 2025-01-24