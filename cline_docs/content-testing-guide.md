# Content Dynamic Loading Testing Guide

## Overview

This guide provides step-by-step instructions for testing the content dynamic loading functionality of the MaasISO website, with a particular focus on the diensten and over-ons pages. The goal is to verify that all content is being correctly fetched from Strapi and that the feature grid component is displaying properly.

## Prerequisites

Before starting the tests, ensure you have the following:

1. Access to the MaasISO website codebase
2. Node.js and npm installed
3. Access to the Strapi CMS
4. The correct environment variables set up in the `.env` file:
   - `STRAPI_URL` or `NEXT_PUBLIC_BACKEND_URL`: The URL of the Strapi CMS (e.g., http://153.92.223.23:1337)
   - `NEXT_PUBLIC_STRAPI_TOKEN`: The API token for accessing Strapi

## Test 1: Automated Content Dynamic Loading Test

### Step 1: Install Dependencies

First, install the required dependencies for the test script:

```bash
npm install node-fetch jsdom
```

### Step 2: Run the Test Script

Run the test script to verify that the diensten and over-ons pages are correctly fetching and displaying content from Strapi:

```bash
node scripts/test-content-dynamic.js
```

### Step 3: Analyze the Results

The script will output detailed information about each test, including:

- Whether dynamic content is rendered
- Whether fallback content is rendered
- Whether Strapi content is available
- Success or error messages for each test case

Look for the following success messages:

```
=== Testing /diensten ===
Dynamic content element found: true
Fallback content element found: false
Strapi content available: true
✅ SUCCESS: Page /diensten is correctly displaying dynamic content from Strapi
Feature grid should be present: true
Feature grid element found: true
Number of feature cards found: 6

=== Testing /over-ons ===
Dynamic content element found: true
Fallback content element found: false
Strapi content available: true
✅ SUCCESS: Page /over-ons is correctly displaying dynamic content from Strapi
```

If you see these messages, it means that both pages are correctly fetching and displaying content from Strapi, and the feature grid component on the diensten page is displaying all 6 features.

## Test 2: Manual Content Dynamic Loading Test

### Step 1: Start the Development Server

Start the Next.js development server:

```bash
npm run dev
```

### Step 2: Test the Diensten Page

1. Open a browser and navigate to http://localhost:3000/diensten
2. Verify that the page displays content fetched from Strapi
3. Scroll down to the feature grid section
4. Verify that the feature grid displays all 6 features
5. Check the browser's developer console for the following logs:

```
[Feature Extraction] Raw component structure: {
  id: 53,
  type: 'page-blocks.feature-grid',
  hasFeatures: true,
  featuresType: 'object',
  isArray: true,
  hasData: false
}
[Feature Extraction] Found direct array with 6 items
[Feature Extraction] Extracted 6 features
```

These logs confirm that the feature grid component is correctly extracting features from the Strapi response.

### Step 3: Test the Over-ons Page

1. Navigate to http://localhost:3000/over-ons
2. Verify that the page displays content fetched from Strapi
3. Check the browser's developer console for logs indicating that content is being fetched from Strapi

### Step 4: Test Error Handling

To test error handling, you can temporarily modify the `.env` file to use an incorrect Strapi URL:

1. Open the `.env` file
2. Change the `STRAPI_URL` or `NEXT_PUBLIC_BACKEND_URL` to an invalid value (e.g., http://invalid-url)
3. Restart the development server
4. Navigate to the diensten and over-ons pages
5. Verify that both pages display a minimal error message instead of hardcoded content
6. Restore the correct Strapi URL in the `.env` file
7. Restart the development server

## Test 3: Content Update Test

This test verifies that changes made in Strapi are immediately reflected on the website.

### Step 1: Make Changes in Strapi

1. Log in to the Strapi admin panel
2. Navigate to the diensten page content
3. Make a change to one of the feature titles or descriptions
4. Save the changes

### Step 2: Verify Changes on the Website

1. Navigate to http://localhost:3000/diensten
2. Verify that the changes made in Strapi are reflected on the page
3. Check the browser's developer console for logs indicating that the updated content is being fetched from Strapi

## Test 4: Feature Grid Component Test

This test focuses specifically on the feature grid component to ensure it's displaying correctly.

### Step 1: Use the Test Endpoint

The test endpoint provides detailed information about the feature grid component:

1. Navigate to http://localhost:3000/api/test-feature-grid
2. Verify that the response includes the feature grid component with all 6 features
3. Check the `featureGridComponents` array in the response to see the raw feature grid data

### Step 2: Analyze the Feature Grid Structure

The feature grid component should have the following structure:

```json
{
  "__component": "page-blocks.feature-grid",
  "id": 53,
  "features": [
    {
      "id": 224,
      "title": "ISO 27001 Informatiebeveiliging",
      "description": "Bescherm uw kritieke gegevens en waarborg de continuïteit van uw bedrijf met onze expertise in risicobeoordeling, beleidsontwikkeling, implementatie van beveiligingscontroles en continuïteitsplanning.",
      "link": null
    },
    // ... 5 more features
  ]
}
```

Verify that the features array contains 6 items, each with an id, title, and description.

### Step 3: Visual Inspection

1. Navigate to http://localhost:3000/diensten
2. Scroll down to the feature grid section
3. Verify that all 6 features are displayed
4. Check that each feature card includes:
   - A title
   - A description
   - An icon (if available)
   - A "Meer informatie" link that appears on hover

## Test 5: API Request Inspection

This test examines the API requests made to Strapi to ensure they use the correct populate parameters.

### Step 1: Open the Network Tab

1. Open the browser's developer tools
2. Navigate to the Network tab
3. Filter for XHR requests

### Step 2: Navigate to the Diensten Page

1. Navigate to http://localhost:3000/diensten
2. Look for requests to the Strapi API in the Network tab
3. Find the request to `/api/pages` with the `filters[slug][$eq]=diensten` parameter
4. Verify that the request includes the `populate[layout][populate]=*` parameter
5. Examine the response to confirm it includes the feature grid component with all 6 features

## Troubleshooting

If any of the tests fail, consider the following troubleshooting steps:

### Issue: Feature Grid Not Displaying

1. Check the browser's developer console for error messages
2. Verify that the `getPage` function in `src/lib/api.ts` is using the correct populate parameter:
   ```typescript
   const simplePopulate = 'populate[layout][populate]=*';
   ```
3. Check the Strapi API response to ensure it includes the feature grid component with features
4. Verify that the `extractFeatures` function in `src/lib/featureExtractor.ts` is correctly extracting features from the response

### Issue: Content Not Updating

1. Verify that the pages are using dynamic rendering:
   ```typescript
   export const dynamic = 'force-dynamic';
   export const revalidate = 0;
   ```
2. Check that the browser is not caching the API responses
3. Clear the browser cache and reload the page
4. Verify that the changes were successfully saved in Strapi

### Issue: Error Handling Not Working

1. Verify that the pages have proper error handling for cases when Strapi data cannot be fetched
2. Check that the fallback content is minimal and doesn't include hardcoded features
3. Ensure that the error is being properly caught and logged

## Conclusion

By following these tests, you can verify that the diensten and over-ons pages are correctly fetching and displaying content from Strapi, and that the feature grid component is displaying properly. If all tests pass, it means that the content dynamic loading functionality is working as expected.

Remember to restore any temporary changes made during testing, such as modifying the `.env` file or making changes in Strapi.