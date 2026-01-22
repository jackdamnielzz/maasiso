import { NextRequest, NextResponse } from 'next/server';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing feature grid ID parameter',
      }, { status: 400 });
    }

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

    // Make a direct request to the Strapi API to get the feature grid component
    // Use a more specific populate parameter to ensure we get all nested data
    const populateParams = [
      'populate=*',
      'populate[features]=*',
      'populate[features][populate]=*',
      'populate[features][populate][icon]=*'
    ].join('&');
    
    // Add a cache buster to ensure we get fresh data
    const cacheBuster = `_=${Date.now()}`;
    
    const url = `${strapiUrl}/api/feature-grids/${id}?${populateParams}&${cacheBuster}`;
    
    console.log('Feature Grid Request:', { url });
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      // Try an alternative URL format
      const alternativeUrl = `${strapiUrl}/api/components/page-blocks.feature-grid/${id}?${populateParams}&${cacheBuster}`;
      console.log('Trying alternative URL:', { alternativeUrl });
      
      const alternativeResponse = await fetch(alternativeUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!alternativeResponse.ok) {
        return NextResponse.json({
          status: 'error',
          message: `Strapi response: ${response.status} ${response.statusText} / Alternative: ${alternativeResponse.status} ${alternativeResponse.statusText}`,
          url,
          alternativeUrl
        }, { status: response.status });
      }
      
      const alternativeData = await alternativeResponse.json();
      return NextResponse.json({
        status: 'success',
        message: 'Feature Grid Data (Alternative)',
        timestamp: new Date().toISOString(),
        data: alternativeData
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      message: 'Feature Grid Data',
      timestamp: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error('Feature grid error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}