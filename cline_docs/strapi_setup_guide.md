# Strapi API Permissions Setup Guide

This guide provides step-by-step instructions for configuring API permissions in Strapi, specifically for setting up page access.

## Setting Up Page Permissions

### Step 1: Access Settings Panel
1. Open your Strapi admin panel
2. Click on "Settings" in the left sidebar (the gear icon)
3. Under "USERS & PERMISSIONS PLUGIN", click on "Roles"

### Step 2: Configure Public Role
1. Click on the "Public" role
2. This will open the permissions configuration page

### Step 3: Enable Page Permissions
1. Scroll through the list of API permissions
2. Look for "Page" or "Pages" in the list
3. If you don't see it, you need to create the content type first:
   - Go back to "Content-Type Builder" in the left sidebar
   - Click "Create new collection type"
   - Name it "Page"
   - Add the required fields:
     * Title (Text)
     * Slug (UID, connected to Title)
     * Content (Rich Text)
     * Layout (Relation to Layout)
     * SEO Metadata (Component)
   - Save the content type

### Step 4: Set Page Permissions
1. Go back to Settings → Roles → Public
2. Find "Page" in the list
3. Enable the following permissions:
   - [x] find (GET)
   - [x] findOne (GET)
   - [ ] create (POST)
   - [ ] update (PUT)
   - [ ] delete (DELETE)
4. Click "Save" to apply the changes

### Step 5: Configure Layout Permissions
1. Still in the Public role settings
2. Find "Layout" in the permissions list
3. Enable:
   - [x] find
   - [x] findOne

### Step 6: Configure Component Permissions
1. For each component used in pages:
   - Enable find and findOne permissions
   - This includes any custom components used in your layouts

### Step 7: Test the Configuration
1. Create a test page in Strapi:
   - Go to "Content Manager"
   - Select "Pages"
   - Create a new page with:
     * Title: "Test Page"
     * Slug: "test-page"
     * Add some content
     * Save and publish
2. Test the API endpoint:
   ```
   GET http://153.92.223.23:1337/api/pages?filters[slug][$eq]=test-page
   ```

## Troubleshooting

If you still can't access the pages after configuration:

1. Check that the page is published
2. Verify the API token has the correct permissions
3. Clear the Strapi cache:
   - Settings → Server Configuration
   - Click "Clear cache"
4. Restart the Strapi server

## API Token Configuration

If you need to create a new API token:

1. Go to Settings → API Tokens
2. Click "Create new API Token"
3. Set:
   - Name: "Frontend Application"
   - Description: "Token for frontend API access"
   - Token type: "Full access"
   - Token duration: Unlimited
4. Copy the generated token
5. Update your frontend .env file:
   ```
   NEXT_PUBLIC_STRAPI_TOKEN=your_new_token
   ```

## Next Steps

After configuring permissions:
1. Restart your Strapi server
2. Restart your Next.js development server
3. Try accessing the test page again through your application

If you need to modify these settings later, you can always return to the Roles section in the Settings panel.
