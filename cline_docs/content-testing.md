# Content Testing and Analysis: MaasISO

## Introduction

This document presents a comprehensive analysis of the discrepancy between Strapi content and its rendering on the MaasISO website. The focus is specifically on two key issues:

1. Feature display issues (only 3 of 5 features showing on both diensten and over-ons pages)
2. Text content discrepancies between Strapi and frontend rendering

## 1. Data Flow Analysis

### 1.1 Content Flow Architecture

The content flows through the following path:

```
[Strapi CMS (VPS1: 153.92.223.23:1337)] 
           ↓
[Next.js API Proxy Layer (VPS2)]
           ↓ 
[Next.js Page Components]
           ↓
[Client Rendering]
```

### 1.2 Key API Endpoints

- `/api/pages?filters[slug][$eq]={pageName}` - Strapi endpoint for retrieving page data
- `/api/proxy/[...path]` - Next.js proxy endpoint that forwards requests to Strapi
- `/api/debug-*` - Diagnostic endpoints for testing content retrieval

## 2. Feature Display Issues

### 2.1 Expected Behavior

- Both the "diensten" and "over-ons" pages should display 5 features in their feature grid components
- Features should be correctly populated with:
  - Title
  - Description
  - Icon (if available)

### 2.2 Actual Behavior

- Only 3 of 5 features are displayed
- Debug endpoint tests reveal issues in the extraction and mapping process

### 2.3 Root Causes

#### 2.3.1 Strapi API Response Issues

Current diagnostics reveal:
- The Strapi endpoint is returning 500 Internal Server Error responses:
  ```
  [getPage] Strapi direct request failed: 500 Internal Server Error
  [getPage] Error details: {"data":null,"error":{"status":500,"name":"InternalServerError","message":"Internal Server Error"}}
  ```
- The failed API responses prevent proper feature data retrieval

#### 2.3.2 Data Structure Inconsistencies

The application attempts to handle multiple potential data structures that might come from Strapi:

1. In types.ts, `RawFeatureGridComponent` is defined to handle various data formats:
   ```typescript
   export interface RawFeatureGridComponent extends RawStrapiComponent {
     // Support for different data structures that might come from Strapi
     features?: RawFeature[] | { 
       data?: Array<{id: number|string, attributes?: any}> 
     };
     data?: {
       features?: RawFeature[];
     };
   }
   ```

2. In api.ts, the `mapPage` function has complex feature extraction logic to handle these multiple formats:
   ```typescript
   if (Array.isArray(component.features)) {
     // Direct array structure
     extractedFeatures = component.features;
   } else if (component.features?.data && Array.isArray(component.features.data)) {
     // Nested data property structure (common in Strapi responses)
     extractedFeatures = component.features.data.map((item: any) => {
       // Check if the item has attributes that need extraction
       if (item.attributes) {
         return { id: item.id, ...item.attributes };
       }
       return item;
     });
   } else if (component.data?.features && Array.isArray(component.data.features)) {
     // Alternative nested structure
     extractedFeatures = component.data.features;
   }
   ```

#### 2.3.3 Populate Parameter Issues

The query string used to fetch page data attempts deep population but may not be correctly formatting the request:

```typescript
const enhancedPopulate = [
  'populate=*', // Base populate for most components
  'populate[layout][populate]=*', // Populate all fields within layout
  'populate[layout][populate][features][populate]=*', // Deep populate features
  'populate[layout][populate][features][populate][icon]=*' // Include feature icons
].join('&');
```

## 3. Text Content Discrepancies

### 3.1 Hero Section Text Differences

There are inconsistencies in how Hero section text content appears in Strapi versus the website:

- The frontend maps the hero component with:
  ```typescript
  return {
    ...baseComponent,
    title: component.title || '',
    subtitle: component.subtitle || '',
    backgroundImage: component.backgroundImage?.data ? mapImage(component.backgroundImage.data) : undefined,
    ctaButton: component.ctaButton
  };
  ```

- The rendering in page components uses direct property access:
  ```jsx
  <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
    {block.title}
  </h1>
  {block.subtitle && (
    <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
      {block.subtitle}
    </p>
  )}
  ```

### 3.2 Content Block Text Differences

Similar issues affect the text-block components, where content may be transformed or lost:

- Text blocks use dangerouslySetInnerHTML which may render HTML differently:
  ```jsx
  <div
    className={`space-y-6 relative z-10 prose prose-headings:text-[#091E42] prose-a:text-[#00875A] max-w-none`}
    dangerouslySetInnerHTML={{ __html: block.content }}
  />
  ```

## 4. Validation and Error Handling Issues

### 4.1 Component Validation

The application has a feature validation system in the validatePageComponent function, but it may not be catching all issues:

```typescript
function validatePageComponent(component: RawStrapiComponent, index: number): boolean {
  // ...
  case 'feature-grid':
    // Always consider feature-grid component valid even without features
    // This allows for fallback rendering pattern in frontend components
    console.log('[API Validation] Feature grid component found, considering valid for frontend fallback rendering');
    return true;
  // ...
}
```

This validation specifically allows feature-grid components to be considered valid even if they don't have features, which might contribute to the display issues.

### 4.2 Fallback Behavior

When API responses fail, pages fall back to static content which may not match the expected Strapi content:

```typescript
// No hardcoded fallback content - Only show a simple message that CMS content is not available
return (
  <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-3xl mx-auto relative">
          <div className="h-1.5 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00]"></div>
          <div className="p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#091E42]">
              MaasISO Diensten
            </h2>
            <p className="text-gray-600 mb-4">
              De inhoud van deze pagina wordt geladen vanuit het Content Management Systeem (Strapi).
            </p>
            <p className="text-gray-600">
              Neem contact op met de beheerder als deze melding blijft bestaan.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
);
```

## 5. API Response Analysis

The debug endpoints show that:

1. Feature extraction tests show empty or inconsistent results:
   ```
   {"status":"success","timestamp":"2025-02-27T22:12:06.265Z","message":"Feature grid extraction test","apiTest":null,"directTest":{"success":true,"hasRawFeatureGrid":false,"rawStructureKeys":[],"hasDirectFeatures":false,"hasNestedFeatures":false,"hasAlternativeFeatures":false},"directRawJson":null,"extractionResults":null}
   ```

2. Diensten page debug shows empty layout data:
   ```
   {"status":"success","message":"Diensten Page Debug","timestamp":"2025-02-27T22:12:34.202Z","requestInfo":{"url":"http://153.92.223.23:1337/api/pages?filters[slug][$eq]=diensten&populate=*&_=17406944354144","strapiUrl":"http://153.92.223.23:1337"},"dataStructure":{"hasData":true,"dataItems":1,"pageId":38,"hasAttributes":true,"hasLayout":false,"layoutItems":0,"rootKeys":[]},"layoutInfo":"No layout items found","rawPageData":{},"firstLayoutItems":[]}
   ```

3. Server logs show consistent Internal Server Error responses from Strapi:
   ```
   [getPage] Strapi direct request failed: 500 Internal Server Error
   [getPage] Error details: {"data":null,"error":{"status":500,"name":"InternalServerError","message":"Internal Server Error"}}
   ```

## 6. Identified Root Causes

Based on the complete analysis, the following root causes have been identified:

1. **Strapi API Instability**: The primary issue appears to be 500 Internal Server Errors from the Strapi API, preventing any content from being properly retrieved.

2. **Data Structure Mismatches**: The code attempts to handle multiple potential data structures, but may not correctly match what's actually coming from Strapi.

3. **Population Depth Issues**: The query parameters for populating nested relationships may not be correctly formatted for Strapi v4.

4. **Feature Extraction Logic**: Complex conditional logic in the feature extraction process may lead to some features being filtered out or not correctly mapped.

5. **Validation that's Too Permissive**: The validation system allows feature-grid components without actual features to pass validation.

## 7. Recommendations

1. **Fix Strapi Server Errors**: 
   - Investigate and resolve the 500 Internal Server Errors on the Strapi server (VPS1)
   - Check Strapi logs for specific error details
   - Ensure Strapi service is running with sufficient resources

2. **Implement Comprehensive Logging**:
   - Add more detailed logging to capture the exact raw response structure from Strapi
   - Log the before/after state of feature data during the mapping process

3. **Simplify Data Mapping**:
   - Reduce the complexity of the feature extraction logic
   - Create a more standardized approach to handling the Strapi response format

4. **Update Population Parameters**:
   - Review and update the populate parameters to match Strapi v4 requirements
   - Consider using a more targeted populate approach specific to each page type

5. **Implement Better Fallback Mechanisms**:
   - Create a more robust caching system to handle Strapi unavailability
   - Consider storing last successful responses for emergency fallback