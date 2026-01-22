# Strapi News Articles Fix
Date: March 18, 2025

## Issue
The news articles endpoint (/api/proxy/news-articles) is returning 404/401 errors after the recent Strapi restoration.

## Root Cause
After the Strapi database restoration on March 17, the public permissions for the news-articles content type need to be reconfigured.

## Fix Instructions

1. Access Strapi Admin Panel
   - URL: http://153.92.223.23:1337/admin
   - Login with admin credentials

2. Configure Public Permissions
   - Go to Settings → Users & Permissions plugin
   - Click on "Public" role
   - Find "News-articles" in the content types list
   - Enable the following permissions:
     * find (GET)
     * findOne (GET)
   - Save the changes

3. Verify API Token Permissions
   - Go to Settings → API Tokens
   - Check the existing token or create a new one
   - Ensure it has read permissions for news-articles
   - If creating new token, update the frontend .env file

4. Test the Endpoint
   - Test the endpoint: /api/proxy/news-articles?populate=*&sort=publishedAt:desc
   - Verify it returns the expected data

## Expected Result
After applying these fixes, the news articles endpoint should return the proper data without 404/401 errors.

## Monitoring
Monitor the Strapi logs for any permission-related errors after applying the fix.