import { isAbsoluteUrl } from 'next/dist/shared/lib/utils';
import { Image } from '@/lib/types';

/**
 * Strapi media format types
 */
export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  mime: string;
  name: string;
}

export interface StrapiMedia {
  id?: number | string;
  url: string;
  width?: number;
  height?: number;
  alternativeText?: string;
  caption?: string;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
}

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
  const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (isAbsoluteUrl(url) && !strapiUrl?.includes(new URL(url).hostname)) {
    return url;
  }

  // If it's already a proxy path, return as is
  if (url.startsWith('/api/proxy/')) {
    return url;
  }

  // Extract the path from Strapi URL if present
  if (strapiUrl && url.startsWith(strapiUrl)) {
    url = url.replace(strapiUrl, '');
  }

  // Clean up the path and ensure it starts with /
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  // Return the proxied URL
  return `/api/proxy/assets${cleanPath}`;
}

type ImageFormat = 'thumbnail' | 'small' | 'medium' | 'large';

function getFormatUrl(image: Image | StrapiMedia, format: ImageFormat): string | undefined {
  if ('hash' in image) {
    // It's our normalized Image type
    return image.formats?.[format as keyof typeof image.formats]?.url;
  } else {
    // It's the StrapiMedia type
    return image.formats?.[format]?.url;
  }
}

/**
 * Gets the appropriate image URL based on the format and fallback preferences
 * @param image The image object (can be StrapiMedia, Image, or string)
 * @param preferredFormat The preferred image format
 * @returns The transformed image URL
 */
export function getImageUrl(
  image: StrapiMedia | Image | string | null | undefined,
  preferredFormat: ImageFormat = 'small'
): string {
  if (!image) {
    return '/placeholder-blog.jpg';
  }

  // Handle string URLs directly
  if (typeof image === 'string') {
    return transformImageUrl(image);
  }

  // Handle both Image and StrapiMedia types
  if ('url' in image) {
    const formatUrl = getFormatUrl(image, preferredFormat);
    return transformImageUrl(formatUrl || image.url);
  }

  return '/placeholder-blog.jpg';
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