# Strapi API Token Update Guide

## Overview
This document provides information about the Strapi API token used for authentication with the Strapi CMS backend.

## Current Token (Updated March 18, 2025)
```
3c4ac08a200558b9283d56e31422487e9aebf3435a61b247b25c380b9950ea723ac2564b294f02491f28d184fc45d7fefe5d51db43e9fd0fcd81a3343c3cdc690311b89a418a177149b14347a5ebf749dd78c801aa7310bf2731c1233e9f2438bf113c2b020585bf0dcd76ea61f80ceee59cb1c5aabb23402440c30aa163c7cb
```

## Token Usage
The Strapi API token is used for authenticating API requests from the frontend to the Strapi backend. It is included in the Authorization header of API requests.

## Configuration Files
The token is configured in the following files:
1. `.env.production` - Used for production builds
2. `scripts/direct-deploy.ps1` - Used during deployment to VPS2
3. `scripts/quick-deploy.ps1` - Used for quick deployments

## Updating the Token
When the Strapi API token needs to be updated:

1. Generate a new token in the Strapi admin panel:
   - Log in to Strapi admin (http://153.92.223.23:1337/admin)
   - Go to Settings → API Tokens
   - Create a new token or regenerate the existing one
   - Set appropriate permissions for the token
2. Update the token in the following files:
   - `.env.production` - Used for production builds
   - `.env.local` - Used for local development (takes precedence over other .env files)
   - `scripts/direct-deploy.ps1` (in two places) - Used during deployment to VPS2
   - `scripts/quick-deploy.ps1` - Used for quick deployments
   - `scripts/quick-deploy.ps1`

3. Document the token update in:
   - `cline_docs/strapi-token-update-guide.md` (this file)
   - `cline_docs/activeContext.md`

4. Deploy the changes to ensure the new token is used in production.

## Security Considerations
- Keep the token secure and do not share it publicly
- The token should have the minimum necessary permissions
- Rotate the token periodically for enhanced security
- Consider using environment variables for local development

## Related Documentation
- [Strapi News Articles Fix](./strapi-news-articles-fix.md)
- [News Articles Fix 2025-03-18](./news-articles-fix-2025-03-18.md)
- [Strapi Token Update 2025-03-18](./strapi-token-update-2025-03-18.md)