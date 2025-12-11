# Feature Grid Implementation Details

## Overview

This document provides detailed technical information about the implementation of the feature grid component fix in the MaasISO website. The feature grid component was not displaying properly because the features data was not being correctly fetched from Strapi due to incorrect populate parameters in the API requests.

## Technical Background

### Component Structure

The feature grid component is defined in Strapi as a component with the following structure:

```json
{
  "uid": "page-blocks.feature-grid",
  "category": "page-blocks",
  "apiId": "feature-grid",
  "schema": {
    "displayName": "feature-grid",
    "description": "",
    "collectionName": "components_page_blocks_feature_grids",
    "attributes": {
      "features": {
        "type": "component",
        "repeatable": true,
        "component": "shared.feature"
      }
    }
  }
}
```

The `features` field is a repeatable component of type `shared.feature`, which has the following structure:

```json
{
  "id": 212,
  "title": "ISO 27001 Informatiebeveiliging",
  "description": "Bescherm uw kritieke gegevens en waarborg de continuïteit van uw bedrijf met onze expertise in risicobeoordeling, beleidsontwikkeling, implementatie van beveiligingscontroles en continuïteitsplanning.",
  "link": null
}
```

### Data Fetching Process

The data fetching process for pages in the MaasISO website follows these steps:

1. The page component calls the `getPage` function from `src/lib/api.ts` with the page slug
2. The `getPage` function constructs a URL with the appropriate populate parameters and fetches the data from Strapi
3. The response is processed by the `mapPage` function, which extracts the layout components
4. For feature grid components, the `extractFeatures` function from `src/lib/featureExtractor.ts` is called to extract the features
5. The extracted features are then rendered in the page component

## Issue Identification

### Symptoms

The feature grid component on the diensten page was not displaying properly. The console logs showed that the feature grid component was being found in the Strapi response, but it didn't have any features data:

```
[Feature Extraction] Raw component structure: {
  id: 51,
  type: 'page-blocks.feature-grid',
  hasFeatures: false,
  featuresType: 'undefined',
  isArray: false,
  hasData: false
}
[Feature Extraction] No valid features structure found, returning empty array
```

### Root Cause Analysis

The issue was in the `getPage` function in `src/lib/api.ts`. The function was using a simple populate parameter (`populate=*`) which doesn't deeply populate nested relationships like the features in a feature grid component:

```typescript
const simplePopulate = 'populate=*';
const directUrl = `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}&${simplePopulate}&${cacheBuster}`;
```

In contrast, the test endpoint (`app/api/test-feature-grid/route.ts`) was using a more specific populate parameter that correctly fetched the nested features:

```typescript
const response = await fetch(`${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate[layout][populate]=*`, {
```

This difference in populate parameters was causing the feature grid component to be fetched without its features.

## Implementation Details

### Code Changes

#### 1. Updated Populate Parameter in getPage Function

The `getPage` function in `src/lib/api.ts` was modified to use a more appropriate populate parameter that correctly fetches nested relationships:

```typescript
// Before
const simplePopulate = 'populate=*';
const directUrl = `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}&${simplePopulate}&${cacheBuster}`;

// After
const simplePopulate = 'populate[layout][populate]=*';
const directUrl = `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}&${simplePopulate}&${cacheBuster}`;
```

#### 2. Updated Indexed Populate Parameters

The indexed populate parameters were also updated to include the features.link field:

```typescript
const indexedPopulate = [
  'populate[0]=layout',
  'populate[1]=layout.features',
  'populate[2]=layout.features.icon',
  'populate[5]=layout.features.link', // Added this line
  'populate[3]=layout.backgroundImage',
  'populate[4]=layout.ctaButton'
].join('&');
```

### Feature Extraction Logic

The feature extraction logic in `src/lib/featureExtractor.ts` was already correctly implemented to handle various data structures that might come from Strapi:

```typescript
export function extractFeatures(component: any): Feature[] {
  // Log the raw component structure for debugging
  console.log(`[Feature Extraction] Raw component structure:`, {
    id: component.id,
    type: component.__component,
    hasFeatures: 'features' in component,
    featuresType: 'features' in component ? typeof component.features : 'undefined',
    isArray: 'features' in component ? Array.isArray(component.features) : false,
    hasData: 'features' in component ? (component.features && 'data' in component.features) : false,
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
      extractedFeatures = component.features.data.map((item: any) => {
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
```

This function is designed to handle various data structures that might come from Strapi, including direct arrays, nested data properties, and alternative nested structures. The issue was not with this function, but with the populate parameters used to fetch the data from Strapi.

## Verification

After making these changes, we verified that the feature grid component was now correctly displaying on the diensten page. The console logs confirmed that the features were being properly extracted:

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
[Feature Extraction] First feature: {
  id: '224',
  title: 'ISO 27001 Informatiebeveiliging',
  description: 'Bescherm uw kritieke gegevens en waarborg de continuïteit van uw bedrijf met onze expertise in risicobeoordeling, beleidsontwikkeling, implementatie van beveiligingscontroles en continuïteitsplanning.',
  icon: undefined,
  link: ''
}
```

We also visually confirmed that the feature grid was displaying on the page by launching a browser and navigating to the diensten page.

## Technical Lessons Learned

1. **Strapi Populate Parameters**: When working with Strapi, it's important to use the correct populate parameters to fetch nested relationships. The `populate=*` parameter doesn't deeply populate nested relationships, so more specific populate parameters are needed for complex data structures.

2. **Data Structure Handling**: The feature extraction logic needs to be robust enough to handle various data structures that might come from Strapi. This includes direct arrays, nested data properties, and alternative nested structures.

3. **Testing and Debugging**: Testing endpoints can be a valuable resource for understanding how to correctly fetch data from Strapi. By comparing the data fetched by the test endpoint with the data fetched by the page component, we were able to identify the issue with the populate parameters.

4. **Console Logging**: Detailed console logging is essential for debugging issues with data fetching and processing. By logging the raw component structure and the extraction results, we were able to identify the issue and verify the fix.

## Future Considerations

1. **Schema Normalization**: Consider implementing a schema normalization layer to standardize the data structure returned by Strapi. This would make it easier to handle various data structures and reduce the need for complex extraction logic.

2. **Type Safety**: Enhance type safety by defining more specific types for the data structures returned by Strapi. This would help catch issues with data structure changes at compile time rather than runtime.

3. **Testing**: Implement comprehensive testing for the feature extraction logic to ensure it handles all possible data structures correctly. This would help catch issues with data structure changes before they affect the production environment.

4. **Documentation**: Document the expected data structures and populate parameters for each component type. This would make it easier for developers to understand how to correctly fetch and process data from Strapi.

## Conclusion

The feature grid component issue was successfully resolved by updating the populate parameters in the API request to correctly fetch nested relationships. This ensures that all components, including complex ones with nested data, are properly populated from Strapi.

This fix highlights the importance of understanding how to correctly fetch nested relationships from Strapi and the need for robust data structure handling in the frontend. By addressing these issues, we've improved the reliability and maintainability of the MaasISO website.