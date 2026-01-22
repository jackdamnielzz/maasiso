# Strapi Token Configuration Issue Fix

## Issue Overview

During testing, we discovered that the website was showing "NEXT_PUBLIC_STRAPI_TOKEN is not set" errors in the browser console, despite the token being correctly set in the `.env.production` file and verified to exist on the server. This issue prevented the website from fetching content from the Strapi CMS.

## Root Cause Analysis

After thorough investigation, we identified the true root cause:

1. The token was correctly included in:
   - Local `.env.production` file
   - Deployment scripts (`direct-deploy.ps1` and `quick-deploy.ps1`)
   - Server `.env` and `.env.production` files
   - The PM2 `ecosystem.config.js` configuration file

2. However, there was a critical name mismatch in the PM2 configuration:
   - In `ecosystem.config.js`, the application name was defined as `"maasiso"`
   - But in the deployment scripts (`direct-deploy.ps1` and `quick-deploy.ps1`), the application was being started/restarted with the name `"frontend"`

3. This mismatch caused PM2 to effectively run two separate instances with different environment configurations:
   - A `"maasiso"` instance defined in ecosystem.config.js (with the token correctly configured)
   - A `"frontend"` instance started by the deployment scripts (which didn't inherit the token configuration)

4. The website was being served from the `"frontend"` instance, which is why it couldn't access the token.

## Solution

The solution is simple but effective - align the application name in `ecosystem.config.js` with the name used in the deployment scripts:

```javascript
module.exports = {
  apps: [{
    name: "frontend", // Changed from "maasiso" to match deployment scripts
    script: "server.js",
    env: {
      PORT: 3000,
      NODE_ENV: "production",
      NEXT_PUBLIC_API_URL: "http://153.92.223.23:1337",
      NEXT_PUBLIC_STRAPI_API_URL: "http://153.92.223.23:1337",
      NEXT_PUBLIC_STRAPI_TOKEN: "72cf8a3310128157aaf97b9025a799d3b9c6c37fd65fab7e8fe9abff631b61a9305fbe1ff74f65ff3ad0547a981d606944f0c11b150bff7d6b96c1d0ca9df2c1d22950c980ecc97771661811310784aaf11bd4dc8065eaadbb923ec98817401d47cdb19b54ae637df13891c5ffa4622ab99b926e0468b40755af7056097e7d95",
    },
    // Other PM2 configuration options...
  }],
};
```

By making this simple name change, we ensure that the PM2 process started by the deployment scripts will use the configuration defined in `ecosystem.config.js`, including the properly defined token.

## Implementation Steps

1. Update `ecosystem.config.js` in the project root to change the application name from "maasiso" to "frontend"
2. Deploy the updated file to the server using `direct-deploy.ps1` 
3. Restart the frontend service on the server

## Verification

After implementing the fix, verify that:

1. The console no longer shows "NEXT_PUBLIC_STRAPI_TOKEN is not set" errors
2. API requests to Strapi succeed with 200 status codes (check Network tab)
3. Content from Strapi is properly displayed on the website
4. Specifically test the "diensten" page which was previously showing issues

## Technical Details

### PM2 Process Naming and Configuration

In applications managed by PM2, the process name is critical because it determines which configuration block in `ecosystem.config.js` will be used. When starting a PM2 process, the name parameter must match exactly for the configuration to be applied correctly.

The deployment scripts were using:

```bash
pm2 restart frontend || pm2 start npm --name frontend -- start
```

But ecosystem.config.js was defining:

```javascript
{
  name: "maasiso",
  // configuration...
}
```

This mismatch was causing PM2 to ignore the configuration in ecosystem.config.js when starting the "frontend" process.

### Environment Variable Loading Order

In Next.js applications running under PM2, environment variables are loaded in the following order (highest precedence first):

1. PM2 ecosystem.config.js environment variables (for the correct process name)
2. System environment variables
3. .env.production file variables (in production mode)
4. .env file variables
5. Default values in code

This is why ensuring the correct process name is crucial - it determines whether the PM2 configuration will be used at all.

### API Request Headers

With this fix, API requests to Strapi will now include the token in the Authorization header:

```
Authorization: 'Bearer 72cf8a3310128157aaf97b9025a799d3b9c6c37fd65fab7e8fe9abff631b61a9305fbe1ff74f65ff3ad0547a981d606944f0c11b150bff7d6b96c1d0ca9df2c1d22950c980ecc97771661811310784aaf11bd4dc8065eaadbb923ec98817401d47cdb19b54ae637df13891c5ffa4622ab99b926e0468b40755af7056097e7d95'
```

This will allow the application to authenticate with Strapi and receive the protected content.

## Lessons Learned

1. When using process managers like PM2, ensure that process names are consistent across all configuration files and deployment scripts.

2. When troubleshooting environment variable issues in PM2-managed applications, check that the correct process name is being used in all contexts.

3. Add process name checks in deployment scripts to verify that the process being restarted matches the configuration.

4. Document the process names used in the project to ensure consistency in future updates.

5. Consider using service verification steps after deployment to catch configuration mismatches before they impact users.