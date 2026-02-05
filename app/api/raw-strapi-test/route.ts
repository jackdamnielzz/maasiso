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
        message: 'Missing environment variables'
      }, { status: 500 });
    }

    // Make the simplest possible request to Strapi
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate=*`;
    console.log(`Making direct request to: ${url}`);
    
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
        message: `Failed to fetch from Strapi: ${response.status} ${response.statusText}`
      }, { status: response.status });
    }

    // Get the raw data
    const rawData = await response.json();
    
    // Extract only the essential structure for easier inspection
    const simplified = {
      responseStatus: response.status,
      hasData: !!rawData.data,
      dataCount: rawData.data?.length || 0,
      firstItemId: rawData.data?.[0]?.id,
      firstItemType: typeof rawData.data?.[0],
      firstItemKeys: rawData.data?.[0] ? Object.keys(rawData.data[0]) : [],
      hasAttributes: !!rawData.data?.[0]?.attributes,
      hasLayout: !!rawData.data?.[0]?.layout || !!rawData.data?.[0]?.attributes?.layout,
    };
    
    // Return both the simplified structure and the raw data for inspection
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      simplified,
      rawData
    });
  } catch (error) {
    console.error('Raw Strapi test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
