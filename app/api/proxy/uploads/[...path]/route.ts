import { NextRequest } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';

// Enhanced error logging utility
function logError(context: string, error: any, details?: any) {
  console.error(`[Media Proxy Error][${new Date().toISOString()}] ${context}:`, {
    message: error.message || error,
    stack: error.stack,
    details,
    timestamp: new Date().toISOString()
  });
}

// Request logging utility
function logRequest(method: string, url: string, path: string) {
  console.log(`[Media Proxy Request][${new Date().toISOString()}]`, {
    url,
    method,
    path,
    timestamp: new Date().toISOString()
  });
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
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const params = await context.params;
    const path = params.path.join('/');
    
    // Remove any 'api' prefix from the path and ensure proper uploads path
    const cleanPath = path.replace(/^api\//, '');
    const url = `${strapiUrl}/uploads/${cleanPath}`;
    logRequest(request.method, url, cleanPath);

    try {
      const response = await fetch(url, {
        method: request.method,
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'public, max-age=31536000, immutable'
        },
        next: {
          revalidate: 31536000 // Cache for 1 year
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      }

      // Get all relevant headers from the response
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = response.headers.get('content-length');
      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');

      // Create a new response with the streamed body and headers
      const newResponse = new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Accept-Ranges': 'bytes',
          ...(contentLength && { 'Content-Length': contentLength }),
          ...(etag && { 'ETag': etag }),
          ...(lastModified && { 'Last-Modified': lastModified })
        }
      });

      return newResponse;
    } catch (error) {
      const mediaError = error as MediaFetchError;
      logError('Media Fetch Error', mediaError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch media',
          message: mediaError.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    const serverError = error as Error;
    logError('Unhandled Error', serverError);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing your request.',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}