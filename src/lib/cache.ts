/**
 * Direct API fetch options without caching
 * This file replaces the previous caching system to ensure all content is fetched directly from Strapi
 */

/**
 * Get fetch options for content types - always uses no-store to ensure fresh content
 */
export function getContentFetchOptions(
  options: { priority?: 'high' | 'medium' | 'low' } = {}
) {
  return {
    cache: 'no-store' as const,
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      'Cache-Control': 'no-store, must-revalidate',
    },
  };
}

/**
 * Get fetch options for assets - always uses no-store to ensure fresh content
 */
export function getAssetFetchOptions(
  options: { priority?: 'high' | 'medium' | 'low' } = {}
) {
  return {
    cache: 'no-store' as const,
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      'Cache-Control': 'no-store, must-revalidate',
    },
  };
}

/**
 * Get fetch options for dynamic content - always uses no-store
 */
export function getDynamicFetchOptions() {
  return {
    cache: 'no-store' as const,
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      'Cache-Control': 'no-store, must-revalidate',
    },
  };
}

