# Strapi API Token Update - March 18, 2025

## Overview
Updated the Strapi API token used for authentication with the Strapi CMS backend.

## Changes Made
1. Added the new Strapi API token to the following files:
   - `.env.production` (for production builds):
     ```
     NEXT_PUBLIC_STRAPI_TOKEN=3c4ac08a200558b9283d56e31422487e9aebf3435a61b247b25c380b9950ea723ac2564b294f02491f28d184fc45d7fefe5d51db43e9fd0fcd81a3343c3cdc690311b89a418a177149b14347a5ebf749dd78c801aa7310bf2731c1233e9f2438bf113c2b020585bf0dcd76ea61f80ceee59cb1c5aabb23402440c30aa163c7cb
     ```
   - `.env.local` (for local development):
     ```
     NEXT_PUBLIC_STRAPI_TOKEN=3c4ac08a200558b9283d56e31422487e9aebf3435a61b247b25c380b9950ea723ac2564b294f02491f28d184fc45d7fefe5d51db43e9fd0fcd81a3343c3cdc690311b89a418a177149b14347a5ebf749dd78c801aa7310bf2731c1233e9f2438bf113c2b020585bf0dcd76ea61f80ceee59cb1c5aabb23402440c30aa163c7cb
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