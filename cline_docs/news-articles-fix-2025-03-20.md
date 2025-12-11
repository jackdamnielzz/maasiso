# News Articles Fix - March 20, 2025

## Issue
The news articles endpoint was returning a 404 error due to incorrect proxy routing and token validation issues.

## Root Causes
1. The monitoredFetch.ts file was automatically routing all API requests through a proxy
2. Token validation in auth route was expecting JWT format instead of Strapi API token format

## Solution
1. Removed proxy routing in monitoredFetch.ts to allow direct API calls
2. Updated token validation to accept Strapi API token format
3. Verified data structure mapping in api.ts was correctly handling the direct response format

## Technical Details
- Modified `getFullUrl` function in monitoredFetch.ts to allow direct API calls
- Updated token validation regex in auth/token/route.ts
- Confirmed proper data mapping in getNewsArticles function

## Testing
- News articles are now being fetched successfully
- API returns correct data structure with articles
- Articles are properly displayed on the /news page

## Related Files
- src/lib/monitoredFetch.ts
- app/api/auth/token/route.ts
- src/lib/api.ts