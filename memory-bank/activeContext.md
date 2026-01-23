# Active Context - Railway Strapi Migration

## Current Task
Diagnosing the failed Vercel deployment (commit `b363795`) following the Railway Strapi migration.

## Recent Changes
- Identified the root cause of Vercel deployment failure: Security block due to vulnerable Next.js version (15.1.6, CVE-2025-66478).
- Verified Railway Strapi connectivity: Reachable but returning 401 Unauthorized with current token.
- Identified missing `NEXT_PUBLIC_STRAPI_TOKEN` in Vercel production environment variables.

## Current Focus
- Awaiting user confirmation to update Next.js version and fix API token.
