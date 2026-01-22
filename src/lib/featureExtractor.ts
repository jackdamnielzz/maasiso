/**
 * Feature Extractor Utility
 * 
 * This utility provides robust feature extraction from Strapi responses,
 * handling various data structures that might come from the API.
 */

import { Feature, RawFeature, Image } from './types';

/**
 * Maps an image from Strapi's data structure to our normalized Image type
 */
function mapImage(imageData: any): Image | undefined {
  if (!imageData) {
    return undefined;
  }

  // Handle Strapi's data/attributes structure for media
  if (imageData.data && imageData.data.attributes) {
    const { id, attributes } = imageData.data;
    return {
      id: String(id),
      name: attributes.name || '',
      alternativeText: attributes.alternativeText || '',
      caption: attributes.caption || '',
      width: attributes.width || 0,
      height: attributes.height || 0,
      formats: attributes.formats || {},
      hash: attributes.hash || '',
      ext: attributes.ext || '',
      mime: attributes.mime || '',
      size: attributes.size || 0,
      url: attributes.url || '',
      previewUrl: attributes.previewUrl,
      provider: attributes.provider || '',
      provider_metadata: attributes.provider_metadata,
      createdAt: attributes.createdAt || new Date().toISOString(),
      updatedAt: attributes.updatedAt || new Date().toISOString(),
      publishedAt: attributes.publishedAt || new Date().toISOString()
    };
  }

  // Direct icon object
  return {
    id: String(imageData.id || '0'),
    name: imageData.name || '',
    alternativeText: imageData.alternativeText || '',
    caption: imageData.caption || '',
    width: imageData.width || 0,
    height: imageData.height || 0,
    formats: imageData.formats || {},
    hash: imageData.hash || '',
    ext: imageData.ext || '',
    mime: imageData.mime || '',
    size: imageData.size || 0,
    url: imageData.url || '',
    previewUrl: imageData.previewUrl,
    provider: imageData.provider || '',
    provider_metadata: imageData.provider_metadata,
    createdAt: imageData.createdAt || new Date().toISOString(),
    updatedAt: imageData.updatedAt || new Date().toISOString(),
    publishedAt: imageData.publishedAt || new Date().toISOString()
  };
}

/**
 * Normalizes a feature object to ensure it has all required fields
 */
function normalizeFeature(feature: any): Feature {
  // Generate a unique ID if none exists
  const id = feature.id || `feature-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Handle icon which might be in different formats
  let icon;
  if (feature.icon) {
    icon = mapImage(feature.icon);
  }

  return {
    id: String(id),
    title: feature.title || 'Untitled Feature',
    description: feature.description || '',
    icon,
    link: feature.link || ''
  };
}

/**
 * Extracts features from a component, handling various data structures
 * that might come from Strapi
 */
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