import { NextRequest, NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        env: {
          strapiUrl: !!strapiUrl,
          token: !!token
        }
      }, { status: 500 });
    }

    // Use the same detailed populate parameters as in the refresh endpoint
    // Add a cache buster to ensure we get fresh data
    const cacheBuster = `&_=${Date.now()}`;
    
    // Request specifically for the diensten page
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate=*${cacheBuster}`;
    
    console.log('Diensten Debug: Making request to Strapi:', { url });
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Strapi response: ${response.status} ${response.statusText}`,
        url
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract and format page data structure for debugging
    const pageItem = data?.data?.[0];
    const pageData = pageItem?.attributes || {};
    const layout = pageData?.layout || [];
    
    // Generate a detailed report on the structure
    return NextResponse.json({
      status: 'success',
      message: 'Diensten Page Debug',
      timestamp: new Date().toISOString(),
      requestInfo: {
        url,
        strapiUrl,
      },
      dataStructure: {
        hasData: !!data?.data,
        dataItems: data?.data?.length || 0,
        pageId: pageItem?.id,
        hasAttributes: !!pageData,
        hasLayout: !!pageData.layout,
        layoutItems: layout.length,
        rootKeys: pageData ? Object.keys(pageData) : []
      },
      layoutInfo: layout.length > 0 ? layout.map((item: any) => ({
        id: item.id,
        componentType: item.__component,
        keys: Object.keys(item),
        hasFeatures: Array.isArray(item.features),
        featuresCount: Array.isArray(item.features) ? item.features.length : 0,
        preview: item.content ? item.content.substring(0, 100) + '...' : '[No content field]'
      })) : 'No layout items found',
      rawPageData: pageData,
      // Provide the first few layout items for inspection
      firstLayoutItems: layout.slice(0, 2),
    });
  } catch (error) {
    console.error('Diensten debug error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
