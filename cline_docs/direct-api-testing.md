# Direct API Testing Documentation

## Overview

This document outlines the testing approach for the MaasISO website after removing the caching system. The website now uses direct API calls to Strapi without any caching, ensuring that all content changes in the CMS are immediately reflected on the website.

## Testing Script

A new testing script has been created to verify the direct API call approach:

- **Script**: `scripts/test-content-fetching.js`
- **Purpose**: Tests the direct API call approach for all pages
- **Features**:
  - Tests each page individually
  - Verifies direct API calls to Strapi
  - Measures response times
  - Provides a summary of test results

## How to Run the Tests

To run the tests, execute the following command:

```bash
node scripts/test-content-fetching.js
```

## Test Methodology

The testing script performs the following tests:

1. **Functionality Tests**:
   - For each page (diensten, over-ons, blog, news, contact), the script makes a request to the `/api/test-strapi` endpoint with the page slug
   - The endpoint fetches the page content directly from Strapi
   - The script verifies that the API call is successful

2. **Performance Tests**:
   - For a subset of pages (diensten, over-ons), the script measures the response time
   - Multiple iterations are performed to get an average response time
   - The results are displayed in a summary

## Expected Results

When running the tests, you should see:

1. All pages successfully fetching content directly from Strapi
2. Response times that reflect direct API calls (typically 300-800ms depending on network conditions)
3. No caching-related operations or errors

## Troubleshooting

If you encounter issues during testing:

1. **API Connection Errors**:
   - Verify that the Strapi API is running and accessible
   - Check the API token in the `.env` file
   - Ensure the API endpoints are correctly configured

2. **Slow Response Times**:
   - This is expected with direct API calls compared to cached responses
   - If response times are consistently over 1 second, investigate potential network or API performance issues

3. **Missing Content**:
   - Verify that the content exists in the Strapi CMS
   - Check the API response for error messages
   - Ensure the page slug is correct

## Verifying Real-time Updates

To verify that content changes are immediately reflected on the website:

1. Make a change to content in the Strapi CMS
2. Immediately visit the corresponding page on the website
3. Verify that the change is visible without any delay or manual intervention

This confirms that the direct API call approach is working correctly.