# Content Dynamic Loading Testing

This directory contains scripts for testing the dynamic content loading functionality of the MaasISO website, particularly focusing on the diensten and over-ons pages.

## Overview

The main goal of these tests is to verify that:

1. Pages are correctly fetching content from Strapi
2. Pages are displaying dynamic content when Strapi data is available
3. Pages are showing appropriate fallback content when Strapi data is unavailable
4. No hardcoded content remains in the pages (except for minimal fallbacks)

## Available Scripts

### test-content-dynamic.js

This script tests whether the diensten and over-ons pages are correctly fetching content from Strapi and displaying it dynamically.

#### Prerequisites

Before running the script, make sure you have the following dependencies installed:

```bash
npm install node-fetch jsdom
```

#### Environment Variables

The script uses the following environment variables:

- `NEXT_PUBLIC_SITE_URL`: The base URL of the website (defaults to http://localhost:3000)
- `STRAPI_URL`: The URL of the Strapi CMS (defaults to http://153.92.223.23:1337)
- `NEXT_PUBLIC_STRAPI_TOKEN`: The API token for accessing Strapi

You can set these variables in your `.env` file or provide them when running the script:

```bash
NEXT_PUBLIC_STRAPI_TOKEN=your-token node scripts/test-content-dynamic.js
```

#### Running the Script

To run the script:

```bash
node scripts/test-content-dynamic.js
```

#### Test Results

The script will output detailed information about each test, including:

- Whether dynamic content is rendered
- Whether fallback content is rendered
- Whether Strapi content is available
- Success or error messages for each test case

## Manual Testing

In addition to the automated tests, you can manually verify the content loading by:

1. Starting the development server:
   ```bash
   npm run dev
   ```

2. Visiting the following pages in your browser:
   - http://localhost:3000/diensten
   - http://localhost:3000/over-ons

3. Checking the browser's developer tools to see:
   - Network requests to Strapi
   - Console logs showing content loading
   - HTML structure with data-testid attributes

4. Testing error scenarios by:
   - Temporarily modifying the Strapi URL in .env to an invalid value
   - Checking that fallback content is displayed correctly

## Verification Checklist

Use this checklist to verify that the content loading is working correctly:

- [ ] Diensten page loads content from Strapi
- [ ] Diensten page shows fallback content when Strapi is unavailable
- [ ] Over-ons page loads content from Strapi
- [ ] Over-ons page shows fallback content when Strapi is unavailable
- [ ] No extensive hardcoded content remains in either page
- [ ] Feature grid components display correctly with data from Strapi
- [ ] Button components use title and description from Strapi

## Troubleshooting

If you encounter issues with the tests:

1. Check that the Strapi server is running and accessible
2. Verify that your API token is valid
3. Check the browser console for any error messages
4. Ensure that the data-testid attributes in the pages match those expected by the tests
5. Check that the page slugs in Strapi match those used in the tests

## Further Documentation

For more detailed information about the content audit and cleanup process, refer to:

- `cline_docs/content-audit-cleanup.md`: Documentation of the audit findings and changes made
- `cline_docs/content-testing.md`: General information about content testing
- `cline_docs/content-testing-solutions.md`: Solutions to common content testing issues