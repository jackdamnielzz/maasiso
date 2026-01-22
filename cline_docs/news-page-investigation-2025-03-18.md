# News Page Investigation - March 18, 2025

## Issue
The /news page was functioning correctly in the local development environment but returning 502 Bad Gateway errors on the VPS2 production server (maasiso.nl).

## Root Cause Analysis
Investigation revealed two key issues:

1. URL Construction Issue:
   - The monitoredFetch.ts utility was using NEXT_PUBLIC_API_URL for server-side requests
   - In production, this resulted in API requests being sent to the frontend domain (maasiso.nl) instead of through the proxy to Strapi
   - The environment configuration was correct, but the URL construction logic needed adjustment

2. Inconsistent Proxy Usage:
   - Some API endpoints in api.ts were not consistently using the /api/proxy prefix
   - This caused requests to bypass the nginx proxy configuration in production

## Solution Implemented

1. Modified monitoredFetch.ts to:
   - Use NEXT_PUBLIC_SITE_URL for proxied requests
   - Use NEXT_PUBLIC_BACKEND_URL for direct Strapi API calls
   - Add logic to differentiate between proxy and direct API routes

2. Updated api.ts to:
   - Consistently use /api/proxy prefix for all news article endpoints
   - Ensure proper routing through nginx proxy

## Configuration Verification
- Nginx proxy configuration is correct (nginx-frontend.conf)
- Environment variables are properly set in .env.production
- Strapi token and permissions are correctly configured

## Testing Instructions
1. Verify news page loads in production
2. Check network requests in browser dev tools
3. Confirm no 502 errors are returned
4. Validate news articles are displayed correctly

## Related Documentation
- [Strapi News Articles Fix](./strapi-news-articles-fix.md)
- [Strapi Token Update](./strapi-token-update-2025-03-18.md)

## Monitoring
Monitor the following for any recurrence:
- Nginx error logs
- Frontend application logs
- Strapi access logs