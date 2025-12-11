import { NextRequest, NextResponse } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';

// Cache duration (1 year in seconds)
const CACHE_MAX_AGE = 31536000;

// Common MIME types for images
const IMAGE_MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon'
};

// Enhanced error logging utility
function logError(context: string, error: any, details?: any) {
  console.error(`[Media Asset Proxy Error][${new Date().toISOString()}] ${context}:`, {
    message: error.message || error,
    stack: error.stack,
    details,
    timestamp: new Date().toISOString()
  });
}

// Request logging utility
function logRequest(method: string, url: string, path: string) {
  console.log(`[Media Asset Proxy Request][${new Date().toISOString()}]`, {
    url,
    method,
    path,
    timestamp: new Date().toISOString()
  });
}

// Get MIME type from file extension
function getMimeType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
  return extension ? IMAGE_MIME_TYPES[extension as keyof typeof IMAGE_MIME_TYPES] || 'application/octet-stream' : 'application/octet-stream';
}

// Route segment type
type RouteSegment = {
  path: string[];
};

// Custom error type
interface MediaFetchError extends Error {
  message: string;
}

// Route handler
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteSegment> }
): Promise<Response> {
  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!strapiUrl) {
      logError('Configuration', 'Strapi URL not configured');
      return new Response(null, { status: 500 });
    }

    console.log('[Media Asset Debug] context.params before await:', context.params);
    const params = await context.params;
    console.log('[Media Asset Debug] context.params after await:', params);
    const path = params.path.join('/');
    console.log('[Media Asset Debug] Extracted path:', path);
    
    // Clean up any api prefix but maintain the full path structure
    const cleanPath = path.replace(/^api\//, '');
    console.log('[Media Asset Debug] cleanPath:', cleanPath);
    const url = `${strapiUrl}/${cleanPath}`;
    logRequest(request.method, url, path);
    console.log('[Media Asset Debug] Final URL:', url);

    // Log the full URL for debugging
    console.log(`[Media Asset Debug] Requesting URL: ${url}`);

    try {
      // Fetch the image with proper headers
      const response = await fetch(url, {
        method: request.method,
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        },
        next: {
          revalidate: CACHE_MAX_AGE
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      }

      // Get the content type, preferring the actual file extension if available
      const contentType = getMimeType(path) || response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = response.headers.get('content-length');
      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');

      // Create a new response with the streamed body and enhanced headers
      return new NextResponse(response.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
          'Accept-Ranges': 'bytes',
          'X-Content-Type-Options': 'nosniff',
          'Access-Control-Allow-Origin': '*',
          ...(contentLength && { 'Content-Length': contentLength }),
          ...(etag && { 'ETag': etag }),
          ...(lastModified && { 'Last-Modified': lastModified })
        }
      });
    } catch (error) {
      const mediaError = error as MediaFetchError;
      logError('Media Fetch Error', mediaError);
      return NextResponse.json(
        { error: 'Failed to fetch media asset' },
        { status: 404 }
      );
    }
  } catch (error) {
    const serverError = error as Error;
    logError('Unhandled Error', serverError);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}