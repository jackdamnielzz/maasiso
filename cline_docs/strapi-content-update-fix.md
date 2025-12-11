# Strapi Content Update Fix

## Issue
News article updates in Strapi (VPS1) were not reflecting immediately in the frontend for specific news articles due to caching issues.

## Changes Made

1. Updated Strapi API Token
   - Updated the token in `.env.production` to the correct value
   - This ensures proper authentication with the Strapi API

2. Removed Revalidation Cache
   - Modified `getNewsArticleBySlug` in `src/lib/api.ts`
   - Replaced `{ next: { revalidate: 60 } }` with `{ cache: 'no-store' }`
   - This prevents Next.js from caching the API responses

3. Added Cache Control Headers
   - Updated the proxy route in `app/api/proxy/[...path]/route.ts`
   - Added strict no-cache headers to prevent browser caching:
     ```typescript
     headers: {
       'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
       'Pragma': 'no-cache',
       'Expires': '0'
     }
     ```

## Testing Instructions
1. Make a change to a news article in Strapi
2. Visit the specific news article page on the frontend
3. The changes should be immediately visible without requiring a hard refresh

## Rollback Plan
If issues occur, revert the following files:
1. `.env.production`
2. `src/lib/api.ts`
3. `app/api/proxy/[...path]/route.ts`