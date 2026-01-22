# Content Testing Solutions: MaasISO

## Introduction

This document outlines specific solutions to address the content discrepancy issues identified in the MaasISO website. Based on the comprehensive analysis in `content-testing.md`, we've developed targeted solutions to fix the problems with feature display and text content rendering.

## 1. Fixing Strapi API 500 Errors

### 1.1 Strapi Server Investigation

```bash
# SSH into VPS1 (Strapi server)
ssh admin@153.92.223.23

# Check Strapi logs
cd /path/to/strapi
pm2 logs strapi

# Check system resources
htop
free -m
df -h

# Check database connection
cd /path/to/strapi
node -e "const knex = require('knex')({client: 'mysql', connection: require('./config/database').connections.default.settings}); knex.raw('SELECT 1').then(() => console.log('Database connection successful')).catch(err => console.error('Database connection failed:', err)).finally(() => knex.destroy())"
```

### 1.2 Strapi Configuration Fix

If the issue is related to Strapi configuration:

```javascript
// config/server.js - Increase timeout and body limit
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

## 2. Improving Feature Extraction Logic

### 2.1 Simplified Feature Extraction

Replace the complex conditional logic in `src/lib/api.ts` with a more robust approach:

```typescript
// Enhanced feature extraction function
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
      extractedFeatures = component.features.map(normalizeFeature);
    }
    // Case 2: Nested data property (common in Strapi v4 responses)
    else if (component.features?.data && Array.isArray(component.features.data)) {
      console.log(`[Feature Extraction] Found nested data array with ${component.features.data.length} items`);
      extractedFeatures = component.features.data.map(item => {
        // Handle Strapi's data/attributes structure
        if (item.attributes) {
          return normalizeFeature({ id: item.id, ...item.attributes });
        }
        return normalizeFeature(item);
      });
    }
    // Case 3: Alternative nested structure
    else if (component.data?.features && Array.isArray(component.data.features)) {
      console.log(`[Feature Extraction] Found alternative nested structure with ${component.data.features.length} items`);
      extractedFeatures = component.data.features.map(normalizeFeature);
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

// Helper function to normalize feature structure
function normalizeFeature(feature: any): Feature {
  return {
    id: feature.id || `feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: feature.title || 'Untitled Feature',
    description: feature.description || '',
    icon: feature.icon ? normalizeIcon(feature.icon) : undefined,
    link: feature.link || '',
  };
}

// Helper function to normalize icon structure
function normalizeIcon(icon: any): Image | undefined {
  if (!icon) return undefined;
  
  // Handle Strapi's data/attributes structure for media
  if (icon.data && icon.data.attributes) {
    const { id, attributes } = icon.data;
    return {
      id: String(id),
      url: attributes.url,
      alternativeText: attributes.alternativeText || '',
      // Add other required Image properties
    };
  }
  
  // Direct icon object
  return {
    id: String(icon.id || '0'),
    url: icon.url || '',
    alternativeText: icon.alternativeText || '',
    // Add other required Image properties
  };
}
```

### 2.2 Enhanced Populate Parameters

Update the populate parameters in `getPage` function to properly handle nested relationships:

```typescript
// Enhanced populate parameters for Strapi v4
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
```

## 3. Implementing Robust Caching

### 3.1 Cache Service Implementation

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

### 3.2 Integrate Cache with API

Update the `getPage` function in `src/lib/api.ts` to use the cache:

```typescript
import { cachePageData, getCachedPageData } from './cacheService';

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
    
    // ... existing Strapi fetch code ...
    
    // If successful, cache the result
    if (mappedPage) {
      cachePageData(slug, mappedPage);
    }
    
    return mappedPage;
  } catch (error) {
    console.error('Error fetching page:', error);
    
    // On error, try to use cache even if expired
    console.log(`[getPage] Error fetching from Strapi, trying to use any available cache`);
    const cachedData = getCachedPageData(slug);
    if (cachedData) {
      console.log(`[getPage] Using expired cache as fallback for ${slug}`);
      return cachedData;
    }
    
    return null;
  }
}
```

## 4. Improved Validation System

### 4.1 Stricter Component Validation

Update the `validatePageComponent` function in `src/lib/api.ts`:

```typescript
function validatePageComponent(component: RawStrapiComponent, index: number): boolean {
  if (!component || !component.__component) {
    console.warn(`[API Validation] Invalid component at index ${index}: Missing __component property`);
    return false;
  }

  let isValid = true;
  const componentType = component.__component.split('.')[1]; // e.g., extract "hero" from "page-blocks.hero"
  
  // Define expected properties for each component type
  switch (componentType) {
    case 'hero':
      const heroComponent = component as RawHeroComponent;
      if (!heroComponent.title) {
        console.warn(`[API Validation] Hero component missing title at index ${index}`);
        isValid = false;
      }
      // Check for ctaButton if it should be present
      if (heroComponent.ctaButton && (!heroComponent.ctaButton.text || !heroComponent.ctaButton.link)) {
        console.warn(`[API Validation] Hero component has incomplete ctaButton at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'feature-grid':
      // Change: Make feature-grid validation stricter
      const featureGridComponent = component as RawFeatureGridComponent;
      
      // Check if features exist in any of the expected formats
      const hasDirectFeatures = Array.isArray(featureGridComponent.features) && featureGridComponent.features.length > 0;
      const hasNestedFeatures = featureGridComponent.features?.data && 
                               Array.isArray(featureGridComponent.features.data) && 
                               featureGridComponent.features.data.length > 0;
      const hasAlternativeFeatures = featureGridComponent.data?.features && 
                                    Array.isArray(featureGridComponent.data.features) && 
                                    featureGridComponent.data.features.length > 0;
      
      if (!hasDirectFeatures && !hasNestedFeatures && !hasAlternativeFeatures) {
        console.warn(`[API Validation] Feature grid component missing features at index ${index}`);
        // Still return true to allow fallback rendering, but log the warning
        console.log('[API Validation] Feature grid component has no features, will use fallback rendering');
      }
      
      return true;
      
    case 'text-block':
      const textBlockComponent = component as RawTextBlockComponent;
      if (!textBlockComponent.content) {
        console.warn(`[API Validation] Text block missing content at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'button':
      const buttonComponent = component as RawButtonComponent;
      if (!buttonComponent.text || !buttonComponent.link) {
        console.warn(`[API Validation] Button component missing text or link at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'gallery':
      const galleryComponent = component as RawGalleryComponent;
      if (!galleryComponent.images?.data || galleryComponent.images.data.length === 0) {
        console.warn(`[API Validation] Gallery component missing images at index ${index}`);
        isValid = false;
      }
      break;
  }
  
  return isValid;
}
```

## 5. Enhanced Error Handling and Logging

### 5.1 Comprehensive Logging Service

Create a new file `src/lib/logService.ts`:

```typescript
// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Current log level (can be set via environment variable)
const currentLogLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase() as keyof typeof LogLevel;

// Log level priority
const logLevelPriority: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

// Check if a log level should be displayed
const shouldLog = (level: LogLevel): boolean => {
  return logLevelPriority[level] >= logLevelPriority[LogLevel[currentLogLevel]];
};

// Format log message
const formatLogMessage = (level: LogLevel, module: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] [${module}] ${message}`;
};

// Log functions
export const logDebug = (module: string, message: string, data?: any): void => {
  if (!shouldLog(LogLevel.DEBUG)) return;
  console.log(formatLogMessage(LogLevel.DEBUG, module, message));
  if (data !== undefined) console.log(data);
};

export const logInfo = (module: string, message: string, data?: any): void => {
  if (!shouldLog(LogLevel.INFO)) return;
  console.log(formatLogMessage(LogLevel.INFO, module, message));
  if (data !== undefined) console.log(data);
};

export const logWarn = (module: string, message: string, data?: any): void => {
  if (!shouldLog(LogLevel.WARN)) return;
  console.warn(formatLogMessage(LogLevel.WARN, module, message));
  if (data !== undefined) console.warn(data);
};

export const logError = (module: string, message: string, error?: any): void => {
  if (!shouldLog(LogLevel.ERROR)) return;
  console.error(formatLogMessage(LogLevel.ERROR, module, message));
  if (error !== undefined) {
    if (error instanceof Error) {
      console.error(`${error.name}: ${error.message}`);
      console.error(error.stack);
    } else {
      console.error(error);
    }
  }
};

// Log API response for debugging
export const logApiResponse = (module: string, url: string, response: any): void => {
  logDebug(module, `API Response for ${url}:`, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries([...response.headers.entries()]),
    data: response.data,
  });
};
```

### 5.2 Integrate Logging with API

Update the API functions to use the new logging service:

```typescript
import { logDebug, logInfo, logWarn, logError, logApiResponse } from './logService';

// In getPage function
export async function getPage(slug: string): Promise<Page | null> {
  try {
    logInfo('API', `Starting getPage for slug: ${slug}`);
    
    // Try to get data from cache first
    const cachedData = getCachedPageData(slug);
    if (cachedData) {
      logInfo('API', `Using cached data for ${slug}`);
      return cachedData;
    }
    
    // Cache miss, fetch from Strapi
    logInfo('API', `Cache miss for ${slug}, fetching from Strapi`);
    
    // ... existing Strapi fetch code ...
    
    // Log the response
    logDebug('API', `Strapi response for ${slug}:`, {
      dataExists: !!data,
      hasData: !!data?.data,
      dataCount: data?.data?.length || 0,
      meta: data?.meta,
      firstItemId: data?.data?.[0]?.id || 'none',
    });
    
    // ... rest of the function ...
  } catch (error) {
    logError('API', `Error fetching page ${slug}:`, error);
    // ... error handling ...
  }
}
```

## 6. Implementation Plan

1. **Phase 1: Fix Strapi Server Issues**
   - SSH into VPS1 and check logs
   - Update Strapi configuration if needed
   - Restart Strapi service

2. **Phase 2: Implement Caching System**
   - Create cache service
   - Integrate with API functions
   - Test cache functionality

3. **Phase 3: Improve Feature Extraction**
   - Update feature extraction logic
   - Enhance populate parameters
   - Test with various data structures

4. **Phase 4: Enhance Validation and Logging**
   - Implement logging service
   - Update validation functions
   - Add comprehensive logging throughout the codebase

5. **Phase 5: Testing and Verification**
   - Test all pages with the new implementation
   - Verify feature display
   - Confirm text content rendering