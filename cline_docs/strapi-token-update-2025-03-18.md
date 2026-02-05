# Strapi API Token Update - March 18, 2025

## Overview
Updated the Strapi API token used for authentication with the Strapi CMS backend.

## Changes Made
1. Added the new Strapi API token to the following files:
   - `.env.production` (for production builds):
     ```
     NEXT_PUBLIC_STRAPI_TOKEN=[REDACTED_STRAPI_TOKEN]
     ```
   - `.env.local` (for local development):
     ```
     NEXT_PUBLIC_STRAPI_TOKEN=[REDACTED_STRAPI_TOKEN]
     ```

2. Fixed API endpoint paths in `src/lib/api.ts` to correctly use `/api/news-articles` instead of `/news-articles`.

## Verification
The news articles are now successfully fetched from the Strapi backend and displayed on the news page.

### Development Environment
- Created `.env.local` file to ensure the token is properly loaded in the development environment
- Verified API requests are successful with 200 status code
- Confirmed news articles are displayed correctly

### Production Environment
- Updated deployment scripts to use the new token for production deployments

## Related Documentation
- [Strapi News Articles Fix](./strapi-news-articles-fix.md)
- [News Articles Fix 2025-03-18](./news-articles-fix-2025-03-18.md)