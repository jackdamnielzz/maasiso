import { isAbsoluteUrl } from 'next/dist/shared/lib/utils';
import { Image } from '@/lib/types';

/**
 * Cloudinary cloud name for this project
 */
const CLOUDINARY_CLOUD_NAME = 'dseckqnba';

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
 * Extended interface for Strapi image data with provider metadata
 * Used when Strapi uses Cloudinary as the upload provider
 */
export interface StrapiImageWithProvider extends StrapiMedia {
  provider?: string;
  provider_metadata?: {
    public_id?: string;
    resource_type?: string;
    [key: string]: any;
  };
  ext?: string;
  attributes?: {
    url: string;
    provider?: string;
    provider_metadata?: {
      public_id?: string;
      resource_type?: string;
      [key: string]: any;
    };
    ext?: string;
    [key: string]: any;
  };
}

/**
 * Constructs a Cloudinary URL from Strapi image data with provider metadata.
 *
 * When Strapi uses Cloudinary as the upload provider, it stores:
 * - url: Local path like "/uploads/image_abc123.jpg" (which doesn't work)
 * - provider: "cloudinary"
 * - provider_metadata: { public_id: "maasiso/image_abc123", ... }
 *
 * This function extracts the public_id and constructs the correct Cloudinary URL.
 *
 * @param imageData The Strapi image data object (can have nested attributes)
 * @returns The full Cloudinary URL, or null if not a Cloudinary image
 */
export function getCloudinaryUrl(imageData: any): string | null {
  if (!imageData) return null;
  
  // Handle nested attributes structure (Strapi v4/v5)
  const attrs = imageData.attributes || imageData;
  
  // Check if this is a Cloudinary image with provider metadata
  if (attrs.provider === 'cloudinary' && attrs.provider_metadata?.public_id) {
    const publicId = attrs.provider_metadata.public_id;
    const extension = attrs.ext || '';
    const cloudinaryUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}${extension}`;
    
    console.log('[getCloudinaryUrl] Constructed URL:', {
      originalUrl: attrs.url,
      publicId,
      extension,
      cloudinaryUrl
    });
    
    return cloudinaryUrl;
  }
  
  // Check if URL is already a Cloudinary URL
  const url = attrs.url;
  if (url && (url.includes('res.cloudinary.com') || url.includes('cloudinary.com'))) {
    console.log('[getCloudinaryUrl] Already a Cloudinary URL:', url);
    return url;
  }
  
  return null;
}

/**
 * Transforms a Strapi image URL to use our proxy route.
 * Now also handles Strapi image objects with provider metadata for Cloudinary support.
 *
 * @param imageOrUrl The original image URL string, or a Strapi image object
 * @param fallback Optional fallback URL if image is not provided
 * @returns The transformed URL (Cloudinary direct URL or proxied URL)
 */
export function transformImageUrl(imageOrUrl: string | StrapiImageWithProvider | null | undefined, fallback?: string): string {
  const defaultFallback = fallback || '/placeholder-blog.jpg';
  
  console.log('[transformImageUrl] Input:', {
    inputType: typeof imageOrUrl,
    imageOrUrl: typeof imageOrUrl === 'object' ? JSON.stringify(imageOrUrl, null, 2) : imageOrUrl,
    STRAPI_URL: process.env.STRAPI_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  });

  if (!imageOrUrl) {
    console.log('[transformImageUrl] No input provided, returning placeholder');
    return defaultFallback;
  }

  // Handle Strapi image object with provider metadata
  if (typeof imageOrUrl === 'object' && imageOrUrl !== null) {
    // First, try to get Cloudinary URL from provider metadata
    const cloudinaryUrl = getCloudinaryUrl(imageOrUrl);
    if (cloudinaryUrl) {
      console.log('[transformImageUrl] Using Cloudinary URL from object:', cloudinaryUrl);
      return cloudinaryUrl;
    }
    
    // Fall back to extracting the URL string from the object
    const attrs = (imageOrUrl as StrapiImageWithProvider).attributes || imageOrUrl;
    const url = attrs.url || (imageOrUrl as any).url;
    
    if (!url) {
      console.log('[transformImageUrl] No URL found in object, returning placeholder');
      return defaultFallback;
    }
    
    // Continue processing with the extracted URL string
    imageOrUrl = url;
  }

  // Now imageOrUrl should be a string
  let url: string = imageOrUrl as string;

  // If it's a data URL or blob URL, return as is
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    console.log('[transformImageUrl] Data/blob URL, returning as-is');
    return url;
  }

  // If it's a Cloudinary URL, return as is (no proxy needed)
  if (url.includes('res.cloudinary.com') || url.includes('cloudinary.com')) {
    console.log('[transformImageUrl] Cloudinary URL detected, returning as-is:', url);
    return url;
  }

  // If it's already an absolute URL (not Strapi), return as is
  const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (isAbsoluteUrl(url) && strapiUrl) {
    try {
      const urlHostname = new URL(url).hostname;
      const strapiHostname = new URL(strapiUrl).hostname;
      if (urlHostname !== strapiHostname) {
        console.log('[transformImageUrl] External absolute URL, returning as-is:', url);
        return url;
      }
    } catch (e) {
      console.log('[transformImageUrl] Error parsing URL:', e);
    }
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

  // If this is a Strapi uploads path, route through the dedicated uploads proxy:
  //   /uploads/filename.png  -->  /api/proxy/uploads/filename.png
  // The uploads proxy then maps to STRAPI_URL/uploads/filename.png
  if (cleanPath.startsWith('/uploads/')) {
    const uploadsPath = cleanPath.replace(/^\/uploads\//, '');
    const finalUploadsUrl = `/api/proxy/uploads/${uploadsPath}`;
    console.log('[transformImageUrl] Final proxied uploads URL:', finalUploadsUrl);
    return finalUploadsUrl;
  }

  // Fallback: use the generic assets proxy for any other asset paths
  const finalUrl = `/api/proxy/assets${cleanPath}`;
  console.log('[transformImageUrl] Final proxied URL:', finalUrl);
  return finalUrl;
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
 * Gets the appropriate image URL based on the format and fallback preferences.
 * Now also checks for Cloudinary URLs from provider metadata.
 *
 * @param image The image object (can be StrapiMedia, StrapiImageWithProvider, Image, or string)
 * @param preferredFormat The preferred image format
 * @returns The transformed image URL (Cloudinary direct URL or proxied URL)
 */
export function getImageUrl(
  image: StrapiMedia | StrapiImageWithProvider | Image | string | null | undefined,
  preferredFormat: ImageFormat = 'small'
): string {
  console.log('[getImageUrl] Input:', {
    imageType: typeof image,
    image: typeof image === 'object' ? JSON.stringify(image, null, 2) : image,
    preferredFormat
  });

  if (!image) {
    console.log('[getImageUrl] No image, returning placeholder');
    return '/placeholder-blog.jpg';
  }

  // Handle string URLs directly
  if (typeof image === 'string') {
    console.log('[getImageUrl] String URL:', image);
    return transformImageUrl(image);
  }

  // First, check if this is a Cloudinary image with provider metadata
  const cloudinaryUrl = getCloudinaryUrl(image);
  if (cloudinaryUrl) {
    console.log('[getImageUrl] Using Cloudinary URL from provider metadata:', cloudinaryUrl);
    return cloudinaryUrl;
  }

  // Handle both Image and StrapiMedia types
  if ('url' in image) {
    const formatUrl = getFormatUrl(image, preferredFormat);
    console.log('[getImageUrl] Object with URL:', {
      mainUrl: image.url,
      formatUrl,
      usingFormat: !!formatUrl
    });
    return transformImageUrl(formatUrl || image.url);
  }

  console.log('[getImageUrl] Unknown image type, returning placeholder');
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