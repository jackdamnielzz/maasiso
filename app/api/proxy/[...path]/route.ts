import { NextRequest } from 'next/server';

// Route segment config
export const dynamic = 'force-dynamic';

// Token validation utility
function validateToken(token: string | undefined): boolean {
  return token !== undefined && token.length > 0;
}

// Enhanced error logging utility
function logError(context: string, error: any, details?: any) {
  console.error(`[Proxy Error][${new Date().toISOString()}] ${context}:`, {
    message: error.message || error,
    stack: error.stack,
    details,
    timestamp: new Date().toISOString()
  });
}

// Request logging utility
function logRequest(method: string, url: string, path: string, searchParams: string) {
  console.log(`[Proxy Request][${new Date().toISOString()}]`, {
    url,
    method,
    path,
    searchParams,
    timestamp: new Date().toISOString()
  });
}

// Route segment type
type RouteSegment = {
  path: string[];
};

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

    // Get token directly from environment variables
    const token = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    if (!token) {
      logError('Authentication', 'Invalid or missing token');
      return new Response(
        JSON.stringify({
          error: 'Authentication configuration error',
          message: 'The API token is not properly configured.'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const params = await context.params;
    const path = params.path.join('/');
    
    // Use URLSearchParams to handle parameter manipulation
    // Forward all query parameters as-is
    const searchParams = request.nextUrl.searchParams;

    // Construct URL after parameter manipulation
    const url = `${strapiUrl}/api/${path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    logRequest(request.method, url, path, searchParams.toString());

    const response = await fetch(url, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      logError('Strapi Response', {
        status: response.status,
        data: errorData,
        url
      });

      const errorMessage = response.status === 401
        ? 'Authentication failed. Please verify your token configuration.'
        : response.status === 403
        ? 'Access forbidden. Please check your permissions.'
        : response.status === 404
        ? 'The requested resource was not found.'
        : 'An error occurred while processing your request.';

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: errorData,
          status: response.status
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();

    // Speciale mapping voor blog-posts endpoint
    if (path === 'blog-posts' && Array.isArray(data.data)) {
      data.data = data.data.map((post: any) => {
        // Werkt voor zowel {id, attributes} als vlakke objecten
        const base = post.attributes ? { ...post.attributes, id: post.id } : post;
        let featuredImage = base.featuredImage;
        if (featuredImage && featuredImage.data && featuredImage.data.attributes) {
          featuredImage = { id: featuredImage.data.id, ...featuredImage.data.attributes };
        }
        return {
          ...base,
          featuredImage: featuredImage || undefined
        };
      });
      // Log de uiteindelijke data
      console.log('[Proxy blog-posts] Response data:', JSON.stringify(data.data[0]));
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    logError('Unhandled Error', error);
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
