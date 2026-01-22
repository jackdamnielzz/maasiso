# Active Context - Updated March 20, 2025

## Current Task: Frontend API Configuration and Deployment

### Token Update (March 20, 2025)
Updated Strapi API token across all configuration files:
- Updated token in .env, .env.production, and ecosystem.config.js
- New token value:
  ```
  d52d11ab3633ba12f38ee5e7b8f79d8507a148b1dd2b4b6dacb02e3057d6ea60ff0f8335e5658a06926d217cc40abdb399c576babe36b3274407b069e840042e5e8b461386dd785838b012652add9aae6d2b44a4c20488e974747ed56acfe034b928d1d9d93ebad4d6d4d80b4e74f9043e7f2ec2e7439144e119d9bbb6fff61d
  ```
- Updated both STRAPI_TOKEN and NEXT_PUBLIC_STRAPI_TOKEN in PM2 configuration
- Ensured consistent token usage across development and production environments

### Issue Resolution (March 18, 2025)
Fixed API connection issues and deployment process:

1. **API Configuration Updates**:
   - Updated API URLs to connect directly to Strapi backend (VPS1)
   - Removed proxy prefix from API endpoints
   - Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_BACKEND_URL to http://153.92.223.23:1337
   - Configured proper Strapi token authentication
   - Fixed API endpoint paths in src/lib/api.ts to use `/api/news-articles` format

2. **Deployment Changes**:
   - Successfully deployed to VPS2 (147.93.62.188)
   - Updated deployment script with correct environment variables
   - Enhanced restart process to prevent white screen issues:
     * Added Node.js process cleanup
     * Clear Node.js module cache
     * Added proper PM2 process management
     * Implemented wait time for application startup
   - Verified API connections working in production
   - Confirmed content loading from Strapi

3. **Known Issues and Solutions**:
   - Initial deployment resulted in white screen
     * Root cause: Incomplete process cleanup during restart
     * Solution: Added comprehensive cleanup steps in deployment script
     * Temporary fix: Manual server restart via Hostinger resolved the issue
   - Node.js version on VPS2 is v18.20.6 (needs upgrade to v20)
   - Some npm packages show engine compatibility warnings
   - These issues don't affect functionality but should be addressed in future updates

### Next Steps
1. Monitor deployment process with new cleanup steps
2. Upgrade Node.js on VPS2 to version 20
3. Update npm to latest version
4. Monitor API response times and performance
5. Document deployment process in technical documentation

## Server Configuration
- VPS1 (153.92.223.23): Strapi Backend
- VPS2 (147.93.62.188): Frontend Website
- Production URL: https://maasiso.nl

## Previous Tasks

### Frontend TypeScript Error Resolution
Successfully fixed:
- Added missing trackEvent method to MonitoringService interface
- Fixed Image type usage in multiple components
- Added @types/lodash to fix type definition errors
- Added timestamp property to WebVitalMetric interface