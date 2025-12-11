import { NextRequest, NextResponse } from 'next/server';

// Use the real Strapi backend URL here, NOT the proxy URL.
// STRAPI_URL/NEXT_PUBLIC_BACKEND_URL should point to https://peaceful-insight-production.up.railway.app
const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://peaceful-insight-production.up.railway.app';

// Prefer the server-side token, fall back to the public one if needed
const API_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const assetPath = path.join('/');
    
    // Construct the full Strapi URL for the asset
    const strapiAssetUrl = `${STRAPI_URL}/${assetPath}`;
    
    console.log('[Asset Proxy] Fetching:', {
      originalPath: assetPath,
      strapiUrl: strapiAssetUrl
    });

    // Fetch the asset from Strapi
    const headers: HeadersInit = {};
    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const response = await fetch(strapiAssetUrl, {
      headers,
      // Cache for 1 day
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      console.error('[Asset Proxy] Failed to fetch asset:', {
        status: response.status,
        statusText: response.statusText,
        url: strapiAssetUrl
      });
      return new NextResponse('Asset not found', { status: 404 });
    }

    // Get the content type from Strapi response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Get the asset data as array buffer
    const assetData = await response.arrayBuffer();

    // Return the asset with appropriate headers
    return new NextResponse(assetData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('[Asset Proxy] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}