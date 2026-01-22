# Content Testing Implementation Plan

## Overview

This document provides a step-by-step implementation plan to fix the content discrepancy issues identified in the MaasISO website. It outlines the specific code changes needed to address the problems with feature display and text content rendering.

## 1. Immediate Fixes

### 1.1 Create Debug Endpoint for Strapi Connection Testing

Create a new file `app/api/strapi-health-check/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        env: {
          strapiUrl: !!strapiUrl,
          token: !!token
        }
      }, { status: 500 });
    }

    // Test basic Strapi connectivity
    const healthCheckUrl = `${strapiUrl}/api/health`;
    console.log(`Testing Strapi health at: ${healthCheckUrl}`);
    
    const healthResponse = await fetch(healthCheckUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!healthResponse.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Strapi health check failed: ${healthResponse.status} ${healthResponse.statusText}`,
        details: await healthResponse.text()
      }, { status: healthResponse.status });
    }

    // Test pages endpoint with minimal query
    const pagesUrl = `${strapiUrl}/api/pages?pagination[limit]=1`;
    console.log(`Testing Strapi pages endpoint at: ${pagesUrl}`);
    
    const pagesResponse = await fetch(pagesUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!pagesResponse.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Strapi pages endpoint failed: ${pagesResponse.status} ${pagesResponse.statusText}`,
        details: await pagesResponse.text()
      }, { status: pagesResponse.status });
    }

    const pagesData = await pagesResponse.json();

    // Return comprehensive health check results
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      strapi: {
        url: strapiUrl,
        health: {
          status: healthResponse.status,
          statusText: healthResponse.statusText
        },
        pages: {
          status: pagesResponse.status,
          statusText: pagesResponse.statusText,
          dataCount: pagesData?.data?.length || 0,
          meta: pagesData?.meta
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextEnv: process.env.NEXT_PUBLIC_ENV
      }
    });
  } catch (error) {
    console.error('Strapi health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack available'
      },
      { status: 500 }
    );
  }
}
```

### 1.2 Create Cache Service

Create a new file `src/lib/cacheService.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import { Page } from './types';

// Cache directory
const CACHE_DIR = path.join(process.cwd(), '.cache');
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Cache key generator
const getCacheKey = (slug: string): string => {
  return path.join(CACHE_DIR, `page-${slug}.json`);
};

// Save page data to cache
export const cachePageData = (slug: string, data: Page): void => {
  try {
    const cacheKey = getCacheKey(slug);
    const cacheData = {
      timestamp: Date.now(),
      data,
    };
    fs.writeFileSync(cacheKey, JSON.stringify(cacheData, null, 2));
    console.log(`[Cache] Saved page data for "${slug}" to cache`);
  } catch (error) {
    console.error(`[Cache] Error saving page data for "${slug}" to cache:`, error);
  }
};

// Get page data from cache
export const getCachedPageData = (slug: string): Page | null => {
  try {
    const cacheKey = getCacheKey(slug);
    
    // Check if cache file exists
    if (!fs.existsSync(cacheKey)) {
      console.log(`[Cache] No cache found for "${slug}"`);
      return null;
    }
    
    // Read and parse cache file
    const cacheContent = fs.readFileSync(cacheKey, 'utf-8');
    const cacheData = JSON.parse(cacheContent);
    
    // Check if cache is still valid
    const cacheAge = Date.now() - cacheData.timestamp;
    if (cacheAge > MAX_CACHE_AGE) {
      console.log(`[Cache] Cache for "${slug}" is expired (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
      return null;
    }
    
    console.log(`[Cache] Using cached data for "${slug}" (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
    return cacheData.data;
  } catch (error) {
    console.error(`[Cache] Error reading cache for "${slug}":`, error);
    return null;
  }
};

// Clear cache for a specific slug
export const clearCache = (slug: string): void => {
  try {
    const cacheKey = getCacheKey(slug);
    if (fs.existsSync(cacheKey)) {
      fs.unlinkSync(cacheKey);
      console.log(`[Cache] Cleared cache for "${slug}"`);
    }
  } catch (error) {
    console.error(`[Cache] Error clearing cache for "${slug}":`, error);
  }
};

// Clear all cache
export const clearAllCache = (): void => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    });
    console.log(`[Cache] Cleared all cache files`);
  } catch (error) {
    console.error(`[Cache] Error clearing all cache:`, error);
  }
};
```

### 1.3 Update getPage Function

Modify `src/lib/api.ts` to integrate caching and improve feature extraction:

```typescript
import { cachePageData, getCachedPageData } from './cacheService';

// Add this helper function for feature extraction
function extractFeatures(component: any): Feature[] {
  // Log the raw component structure for debugging
  console.log(`[Feature Extraction] Raw component structure:`, {
    id: component.id,
    type: component.__component,
    hasFeatures: 'features' in component,
    featuresType: 'features' in component ? typeof component.features : 'undefined',
    isArray: 'features' in component ? Array.isArray(component.features) : false,
    hasData: 'features' in component ? 'data' in component.features : false,
  });

  // Initialize empty array for extracted features
  let extractedFeatures: Feature[] = [];

  try {
    // Case 1: Direct array of features
    if (Array.isArray(component.features)) {
      console.log(`[Feature Extraction] Found direct array with ${component.features.length} items`);
      extractedFeatures = component.features;
    }
    // Case 2: Nested data property (common in Strapi v4 responses)
    else if (component.features?.data && Array.isArray(component.features.data)) {
      console.log(`[Feature Extraction] Found nested data array with ${component.features.data.length} items`);
      extractedFeatures = component.features.data.map(item => {
        // Handle Strapi's data/attributes structure
        if (item.attributes) {
          return { id: item.id, ...item.attributes };
        }
        return item;
      });
    }
    // Case 3: Alternative nested structure
    else if (component.data?.features && Array.isArray(component.data.features)) {
      console.log(`[Feature Extraction] Found alternative nested structure with ${component.data.features.length} items`);
      extractedFeatures = component.data.features;
    }
    // Case 4: Handle empty or missing features
    else {
      console.log(`[Feature Extraction] No valid features structure found, returning empty array`);
      return [];
    }

    // Log the extraction results
    console.log(`[Feature Extraction] Extracted ${extractedFeatures.length} features`);
    if (extractedFeatures.length > 0) {
      console.log(`[Feature Extraction] First feature:`, extractedFeatures[0]);
    }

    return extractedFeatures;
  } catch (error) {
    console.error(`[Feature Extraction] Error extracting features:`, error);
    return [];
  }
}

// Update the mapPage function to use the new extractFeatures helper
function mapPage(data: any | null): Page | null {
  // ... existing code ...
  
  // When handling feature-grid components, replace the existing feature extraction logic with:
  case 'page-blocks.feature-grid':
    console.log('Feature grid component found:', {
      id: component.id,
      hasFeatures: !!component.features || !!component.features?.data || !!component.data?.features,
      componentKeys: Object.keys(component)
    });
    
    return {
      ...baseComponent,
      features: extractFeatures(component)
    };
  
  // ... rest of the function ...
}

// Update the getPage function to use caching
export async function getPage(slug: string): Promise<Page | null> {
  try {
    console.log(`[getPage] Starting getPage for slug: ${slug} at ${new Date().toISOString()}`);
    
    // Try to get data from cache first
    const cachedData = getCachedPageData(slug);
    if (cachedData) {
      return cachedData;
    }
    
    // Cache miss, fetch from Strapi
    console.log(`[getPage] Cache miss for ${slug}, fetching from Strapi`);
    
    // Try direct Strapi connection first
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      console.error('[getPage] Missing Strapi URL or token');
      return null;
    }

    // Go back to the simple approach that worked previously
    const cacheBuster = `_=${Date.now()}`;
    
    console.log(`[getPage] Making direct Strapi request for ${slug}`);
    
    // Enhanced populate to ensure deep population of nested components, especially for feature grids
    const enhancedPopulate = [
      // Base populate for top-level fields
      'populate[layout]=*',
      
      // Deep populate for feature grid components
      'populate[layout][populate][features]=*',
      'populate[layout][populate][features][populate][icon]=*',
      
      // Deep populate for hero components
      'populate[layout][populate][backgroundImage]=*',
      'populate[layout][populate][ctaButton]=*',
      
      // Deep populate for gallery components
      'populate[layout][populate][images]=*',
    ].join('&');
    
    const directUrl = `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}&${enhancedPopulate}&${cacheBuster}`;
    
    console.log(`[getPage] Full URL: ${directUrl}`);
    
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(directUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[getPage] Strapi direct request failed: ${response.status} ${response.statusText}`);
        
        // Attempt to get more detailed error information
        try {
          const errorData = await response.text();
          console.error(`[getPage] Error details: ${errorData}`);
        } catch (textError) {
          console.error('[getPage] Could not read error details');
        }
        
        // Try to use cache even if expired
        const expiredCache = getCachedPageData(slug);
        if (expiredCache) {
          console.log(`[getPage] Using expired cache as fallback for ${slug}`);
          return expiredCache;
        }
        
        return null;
      }

      console.log(`[getPage] Strapi request successful with status: ${response.status}`);
      const data = await response.json();
      
      console.log(`[getPage] Retrieved data for ${slug}:`, {
        dataExists: !!data,
        hasData: !!data?.data,
        dataCount: data?.data?.length || 0,
        meta: data?.meta,
        firstItemId: data?.data?.[0]?.id || 'none',
        hasLayout: Array.isArray(data?.data?.[0]?.attributes?.layout),
        layoutCount: Array.isArray(data?.data?.[0]?.attributes?.layout) ? data.data[0].attributes.layout.length : 0
      });
      
      if (!data.data || data.data.length === 0) {
        console.log(`[getPage] No data found for slug: ${slug}`);
        return null;
      }

      const mappedPage = mapPage(data.data[0]);
      console.log(`[getPage] Page mapped successfully:`, {
        id: mappedPage?.id,
        hasLayout: Array.isArray(mappedPage?.layout),
        layoutCount: mappedPage?.layout?.length || 0
      });
      
      // Cache the successful result
      if (mappedPage) {
        cachePageData(slug, mappedPage);
      }
      
      return mappedPage;
    } catch (fetchError) {
      console.error(`[getPage] Direct fetch error:`, fetchError);
      
      // Try to use cache even if expired
      const expiredCache = getCachedPageData(slug);
      if (expiredCache) {
        console.log(`[getPage] Using expired cache as fallback for ${slug}`);
        return expiredCache;
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error fetching page:', error);
    
    // Try to use cache even if expired
    const expiredCache = getCachedPageData(slug);
    if (expiredCache) {
      console.log(`[getPage] Using expired cache as fallback for ${slug}`);
      return expiredCache;
    }
    
    return null;
  }
}
```

### 1.4 Create Cache Management Endpoint

Create a new file `app/api/manage-cache/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { clearCache, clearAllCache } from '@/lib/cacheService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { action, slug } = await request.json();
    
    if (action === 'clear' && slug) {
      clearCache(slug);
      return NextResponse.json({
        status: 'success',
        message: `Cache cleared for slug: ${slug}`,
        timestamp: new Date().toISOString()
      });
    } else if (action === 'clear-all') {
      clearAllCache();
      return NextResponse.json({
        status: 'success',
        message: 'All cache cleared',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid action. Use "clear" with a slug parameter or "clear-all"',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Cache management error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

## 2. Strapi Server Fixes

### 2.1 Strapi Server Configuration

SSH into the Strapi server (VPS1: 153.92.223.23) and update the configuration:

1. Check Strapi logs:
```bash
cd /path/to/strapi
pm2 logs strapi
```

2. Update Strapi configuration to increase timeout and body limit:
```javascript
// config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://153.92.223.23:1337'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  // Add these lines to increase timeout and body limit
  http: {
    serverOptions: {
      timeout: 300000, // 5 minutes
    },
  },
  middleware: {
    settings: {
      body: {
        jsonLimit: '10mb',
      },
    },
  },
});
```

3. Restart Strapi:
```bash
pm2 restart strapi
```

## 3. Testing and Verification

### 3.1 Create Test Script

Create a new file `scripts/test-content-flow.js`:

```javascript
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const STRAPI_URL = process.env.STRAPI_URL || 'http://153.92.223.23:1337';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
const OUTPUT_DIR = path.join(process.cwd(), 'test-results');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to save test results
const saveResults = (filename, data) => {
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Results saved to ${filePath}`);
};

// Test Strapi direct connection
const testStrapiConnection = async () => {
  console.log('Testing Strapi connection...');
  
  try {
    const response = await fetch(`${STRAPI_URL}/api/health`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log(`Strapi health check: ${response.status} ${response.statusText}`);
    saveResults('strapi-health.json', {
      status: response.status,
      statusText: response.statusText,
      data
    });
    
    return response.ok;
  } catch (error) {
    console.error('Strapi connection error:', error);
    saveResults('strapi-health-error.json', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

// Test page content flow
const testPageContent = async (slug) => {
  console.log(`Testing content flow for page: ${slug}`);
  
  try {
    // 1. Get content directly from Strapi
    console.log(`Fetching content from Strapi for ${slug}...`);
    const strapiResponse = await fetch(`${STRAPI_URL}/api/pages?filters[slug][$eq]=${slug}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!strapiResponse.ok) {
      console.error(`Strapi request failed: ${strapiResponse.status} ${strapiResponse.statusText}`);
      saveResults(`${slug}-strapi-error.json`, {
        status: strapiResponse.status,
        statusText: strapiResponse.statusText,
        error: await strapiResponse.text()
      });
      return;
    }
    
    const strapiData = await strapiResponse.json();
    saveResults(`${slug}-strapi-data.json`, strapiData);
    
    // 2. Get content from frontend API
    console.log(`Fetching content from frontend API for ${slug}...`);
    const frontendResponse = await fetch(`${FRONTEND_URL}/api/test-getpage?slug=${slug}`);
    
    if (!frontendResponse.ok) {
      console.error(`Frontend API request failed: ${frontendResponse.status} ${frontendResponse.statusText}`);
      saveResults(`${slug}-frontend-error.json`, {
        status: frontendResponse.status,
        statusText: frontendResponse.statusText,
        error: await frontendResponse.text()
      });
      return;
    }
    
    const frontendData = await frontendResponse.json();
    saveResults(`${slug}-frontend-data.json`, frontendData);
    
    // 3. Compare the data
    console.log(`Comparing data for ${slug}...`);
    
    // Extract features from Strapi data
    const strapiFeatures = extractFeaturesFromStrapiData(strapiData);
    
    // Extract features from frontend data
    const frontendFeatures = frontendData.page?.layout?.find(block => 
      block.__component === 'page-blocks.feature-grid'
    )?.features || [];
    
    // Compare feature counts
    const comparison = {
      strapiFeatureCount: strapiFeatures.length,
      frontendFeatureCount: frontendFeatures.length,
      missingFeatures: strapiFeatures.length - frontendFeatures.length,
      strapiFeatureTitles: strapiFeatures.map(f => f.title || f.attributes?.title),
      frontendFeatureTitles: frontendFeatures.map(f => f.title)
    };
    
    console.log('Comparison results:', comparison);
    saveResults(`${slug}-comparison.json`, comparison);
    
  } catch (error) {
    console.error(`Error testing content flow for ${slug}:`, error);
    saveResults(`${slug}-error.json`, {
      error: error.message,
      stack: error.stack
    });
  }
};

// Helper function to extract features from Strapi data
const extractFeaturesFromStrapiData = (strapiData) => {
  try {
    const pageData = strapiData.data?.[0]?.attributes;
    if (!pageData || !pageData.layout) return [];
    
    const featureBlock = pageData.layout.find(block => 
      block.__component === 'page-blocks.feature-grid'
    );
    
    if (!featureBlock) return [];
    
    // Handle different possible feature structures
    if (Array.isArray(featureBlock.features)) {
      return featureBlock.features;
    } else if (featureBlock.features?.data && Array.isArray(featureBlock.features.data)) {
      return featureBlock.features.data;
    } else if (featureBlock.data?.features && Array.isArray(featureBlock.data.features)) {
      return featureBlock.data.features;
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting features from Strapi data:', error);
    return [];
  }
};

// Main function
const main = async () => {
  console.log('Starting content flow test...');
  
  // Test Strapi connection
  const strapiConnected = await testStrapiConnection();
  if (!strapiConnected) {
    console.error('Strapi connection failed. Aborting tests.');
    return;
  }
  
  // Test pages
  await testPageContent('diensten');
  await testPageContent('over-ons');
  
  console.log('Content flow test completed.');
};

// Run the tests
main().catch(console.error);
```

### 3.2 Run the Test Script

```bash
node scripts/test-content-flow.js
```

## 4. Implementation Steps

1. **Step 1: Create Cache Service**
   - Implement `src/lib/cacheService.ts`
   - Add cache directory to `.gitignore`

2. **Step 2: Update API Functions**
   - Modify `src/lib/api.ts` to use caching
   - Improve feature extraction logic
   - Update populate parameters

3. **Step 3: Create Management Endpoints**
   - Implement `app/api/strapi-health-check/route.ts`
   - Implement `app/api/manage-cache/route.ts`

4. **Step 4: Fix Strapi Server**
   - SSH into VPS1
   - Update Strapi configuration
   - Restart Strapi service

5. **Step 5: Test and Verify**
   - Create and run test script
   - Verify feature display
   - Confirm text content rendering