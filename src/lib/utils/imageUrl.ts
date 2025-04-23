import { isAbsoluteUrl } from 'next/dist/shared/lib/utils';

/**
 * Transforms a Strapi image URL to use our proxy route
 * @param url The original image URL
 * @returns The transformed URL that goes through our proxy
 */
export function transformImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '/placeholder-blog.jpg';
  }

  // If it's a data URL or blob URL, return as is
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // If it's already an absolute URL (not Strapi), return as is
  if (isAbsoluteUrl(url) && !url.includes(process.env.NEXT_PUBLIC_BACKEND_URL || '')) {
    return url;
  }

  // If it's a relative URL starting with /, assume it's already a proxy path
  if (url.startsWith('/api/proxy/')) {
    return url;
  }

  // Extract the path from Strapi URL if present
  const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (strapiUrl && url.startsWith(strapiUrl)) {
    url = url.replace(strapiUrl, '');
  }

  // Clean up the path and ensure it starts with /
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  // Return the proxied URL
  return `/api/proxy/assets${cleanPath}`;
}

/**
 * Validates if a URL is a valid image URL
 * @param url The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  // Allow data URLs and blob URLs
  if (url.startsWith('data:image/') || url.startsWith('blob:')) {
    return true;
  }

  // Check if it's a valid URL
  try {
    new URL(url);
    return true;
  } catch {
    // If it's not a valid URL, check if it's a valid path
    return url.startsWith('/');
  }
}