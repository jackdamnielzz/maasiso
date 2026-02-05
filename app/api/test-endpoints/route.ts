import { NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    const strapiUrl = process.env.STRAPI_URL;
    const token = process.env.STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      throw new Error('Missing required environment variables');
    }

    // Try different potential endpoints
    const endpoints = [
      '/api',
      '/api/blogs',
      '/api/blog-posts',
      '/api/blog-post',
      '/api/articles',
      '/api/posts'
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${strapiUrl}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const status = response.status;
          let data = null;
          
          try {
            data = await response.json();
          } catch (e) {
            // Ignore JSON parse errors
          }

          return {
            endpoint,
            status,
            exists: response.ok,
            data: data
          };
        } catch (error) {
          return {
            endpoint,
            status: 'error',
            exists: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    console.log('API Endpoint Test Results:', JSON.stringify(results, null, 2));

    return NextResponse.json({
      status: 'success',
      results
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
