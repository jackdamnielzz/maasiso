import { NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    const strapiUrl = process.env.STRAPI_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      throw new Error('Missing required environment variables');
    }

    // Test direct blog posts endpoint
    const response = await fetch(`${strapiUrl}/api/blogs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    // Log the full response for debugging
    console.log('Blog API Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: data
    });

    // Also try the alternative endpoint name
    const altResponse = await fetch(`${strapiUrl}/api/blog-posts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const altData = await altResponse.json();
    
    console.log('Alternative Blog API Response:', {
      status: altResponse.status,
      headers: Object.fromEntries(altResponse.headers.entries()),
      data: altData
    });

    return NextResponse.json({
      status: 'success',
      blogs: data,
      blogPosts: altData
    });
  } catch (error) {
    console.error('Blog test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
