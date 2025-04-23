import { NextRequest, NextResponse } from 'next/server';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

    // Make a direct request to the Strapi API
    // Use more specific populate parameters to ensure we get all nested data
    const populateParams = [
      'populate[0]=layout',
      'populate[1]=layout.features',
      'populate[2]=layout.features.icon',
      'populate[3]=layout.backgroundImage',
      'populate[4]=seoMetadata',
      'populate[5]=seoMetadata.ogImage'
    ].join('&');
    
    // Add a cache buster to ensure we get fresh data
    const cacheBuster = `&_=${Date.now()}`;
    
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&${populateParams}${cacheBuster}`;
    
    console.log('Detailed Strapi Debug Request:', { url });
    
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
    
    // Check for layout data
    const pageData = data?.data?.[0]?.attributes;
    const layout = pageData?.layout || [];
    
    // Extract text blocks
    const textBlocks = layout
      .filter((block: any) => block.__component === 'page-blocks.text-block')
      .map((block: any) => ({
        id: block.id,
        content: block.content
      }));

    return NextResponse.json({
      status: 'success',
      message: 'Strapi Detailed Debug',
      timestamp: new Date().toISOString(),
      strapiUrl,
      pageInfo: {
        id: data?.data?.[0]?.id,
        slug: pageData?.slug,
        title: pageData?.title,
        hasLayout: layout.length > 0,
        layoutCount: layout.length,
        layoutComponents: layout.map((comp: any) => comp.__component),
      },
      textBlocks,
      raw: {
        dataInfo: {
          hasData: !!data?.data,
          dataLength: data?.data?.length || 0
        },
        debugData: JSON.stringify(data).substring(0, 1000) + '...[truncated]'
      }
    });
  } catch (error) {
    console.error('Strapi debug error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}