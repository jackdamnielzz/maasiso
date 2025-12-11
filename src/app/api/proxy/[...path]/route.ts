import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://153.92.223.23:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    
    // Build the full URL with query params
    const url = new URL(request.url);
    const strapiUrl = `${STRAPI_URL}/${pathString}${url.search}`;
    
    console.log('[API Proxy] GET:', {
      originalPath: pathString,
      strapiUrl: strapiUrl.substring(0, 200) + '...',
      hasToken: !!API_TOKEN
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const response = await fetch(strapiUrl, {
      method: 'GET',
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error('[API Proxy] Strapi error:', {
        status: response.status,
        statusText: response.statusText,
        url: strapiUrl.substring(0, 200)
      });
      
      const errorBody = await response.text();
      return NextResponse.json(
        { 
          error: 'The requested resource was not found.',
          details: { message: response.statusText, details: {} }
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const strapiUrl = `${STRAPI_URL}/${pathString}${url.search}`;
    
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const response = await fetch(strapiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Proxy] POST Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}