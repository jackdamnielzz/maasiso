# Switching Strapi to Development Mode

To edit content types in Strapi, you need to run the server in development mode. Here's how to switch modes:

## Steps

1. Stop the current Strapi server:
   ```bash
   # If running in PM2
   pm2 stop strapi

   # If running directly
   Ctrl + C (to stop the current process)
   ```

2. Start Strapi in development mode:
   ```bash
   cd /path/to/strapi
   npm run develop
   # or
   yarn develop
   ```

3. After making content type changes:
   - Save all changes in the Content-Type Builder
   - Let Strapi rebuild with the new schemas
   - Test the new content types

4. Switch back to production mode:
   ```bash
   # Stop development server
   Ctrl + C

   # Restart in production
   npm run start
   # or with PM2
   pm2 start strapi
   ```

## Important Notes

1. Development mode is required for:
   - Creating new content types
   - Modifying existing content types
   - Adding new fields
   - Changing field configurations

2. Production mode is more secure and should be used when:
   - Running on live servers
   - Content types are finalized
   - Only content editing is needed

3. Always backup your database before making content type changes

4. After switching back to production:
   - Verify all content types work as expected
   - Check API endpoints are functioning
   - Ensure existing content is accessible

## Troubleshooting

If you encounter issues:
1. Check Strapi logs for errors
2. Verify database connection
3. Clear the build cache if needed:
   ```bash
   rm -rf .cache build
   ```

Remember to update any environment-specific configurations when switching modes.
