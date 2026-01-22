# Proxy Authentication Fix Implementation Plan

## Current Issues
1. Token configuration mismatch between environment and PM2
2. Inconsistent token handling in proxy route
3. Limited error handling and logging
4. No token refresh mechanism

## Implementation Steps

### 1. Update PM2 Configuration
```javascript
// ecosystem.config.js changes
module.exports = {
  apps: [{
    name: 'frontend',
    // ... other config
    env: {
      // ... other env vars
      STRAPI_TOKEN: '72cf8a3310128157aaf97b9025a799d3b9c6c37fd65fab7e8fe9abff631b61a9305fbe1ff74f65ff3ad0547a981d606944f0c11b150bff7d6b96c1d0ca9df2c1d22950c980ecc97771661811310784aaf11bd4dc8065eaadbb923ec98817401d47cdb19b54ae637df13891c5ffa4622ab99b926e0468b40755af7056097e7d95',
      NEXT_PUBLIC_STRAPI_TOKEN: '72cf8a3310128157aaf97b9025a799d3b9c6c37fd65fab7e8fe9abff631b61a9305fbe1ff74f65ff3ad0547a981d606944f0c11b150bff7d6b96c1d0ca9df2c1d22950c980ecc97771661811310784aaf11bd4dc8065eaadbb923ec98817401d47cdb19b54ae637df13891c5ffa4622ab99b926e0468b40755af7056097e7d95'
    }
  }]
}
```

### 2. Enhance Proxy Route Handler
```typescript
// app/api/proxy/[...path]/route.ts changes

// Add token validation utility
const validateToken = (token: string | undefined): boolean => {
  if (!token) return false;
  // Add additional validation if needed (e.g., token format, expiration)
  return token.length > 0;
};

// Add detailed error logging
const logError = (context: string, error: any, details?: any) => {
  console.error(`[Proxy Error] ${context}:`, {
    message: error.message || error,
    stack: error.stack,
    details,
    timestamp: new Date().toISOString()
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!strapiUrl) {
      throw new Error('Strapi URL not configured');
    }

    // Enhanced token handling
    const token = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    if (!validateToken(token)) {
      logError('Token Validation', 'Invalid or missing token');
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 401 }
      );
    }

    const pathArray = await Promise.resolve(params.path);
    const path = pathArray.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${strapiUrl}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

    // Add request logging
    console.log('[Proxy Request]', {
      url,
      method: request.method,
      path,
      searchParams,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(url, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      logError('Strapi Response', {
        status: response.status,
        data: errorData,
        url
      });

      // Enhanced error responses
      const errorMessage = response.status === 401 
        ? 'Authentication failed. Please check your token configuration.'
        : 'An error occurred while processing your request.';

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData
        },
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logError('Unhandled Error', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing your request.'
      },
      { status: 500 }
    );
  }
}
```

### 3. Deployment Steps

1. Update ecosystem.config.js:
   ```bash
   # Deploy updated ecosystem.config.js
   scp ecosystem.config.js user@147.93.62.188:/var/www/html/
   ```

2. Restart PM2 process:
   ```bash
   ssh user@147.93.62.188 "cd /var/www/html && pm2 delete frontend && pm2 start ecosystem.config.js"
   ```

3. Verify token configuration:
   ```bash
   ssh user@147.93.62.188 "pm2 env frontend | grep STRAPI_TOKEN"
   ```

### 4. Testing Steps

1. Test proxy endpoint with token:
   ```bash
   curl -H "Authorization: Bearer $STRAPI_TOKEN" http://localhost:3000/api/proxy/pages
   ```

2. Verify error handling:
   ```bash
   # Test without token
   curl http://localhost:3000/api/proxy/pages
   
   # Test with invalid token
   curl -H "Authorization: Bearer invalid_token" http://localhost:3000/api/proxy/pages
   ```

3. Check PM2 logs for detailed error information:
   ```bash
   pm2 logs frontend
   ```

## Success Criteria

1. No more 401 unauthorized errors in production
2. Both STRAPI_TOKEN and NEXT_PUBLIC_STRAPI_TOKEN are properly set
3. Error logs provide clear information about any issues
4. All API requests through the proxy are successful

## Rollback Plan

If issues occur after deployment:

1. Restore previous ecosystem.config.js:
   ```bash
   scp ecosystem.config.js.backup user@147.93.62.188:/var/www/html/ecosystem.config.js
   ```

2. Restart PM2:
   ```bash
   ssh user@147.93.62.188 "cd /var/www/html && pm2 delete frontend && pm2 start ecosystem.config.js"
   ```

## Monitoring

1. Add monitoring for 401 errors in application logs
2. Set up alerts for repeated authentication failures
3. Monitor token expiration and refresh cycles

Would you like me to proceed with implementing these changes? We can start with updating the ecosystem.config.js file and then move on to enhancing the proxy route handler.