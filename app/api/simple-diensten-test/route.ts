import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        env: {
          strapiUrl: !!strapiUrl,
          token: !!token
        }
      }, { status: 500 });
    }

    // Try with the simplest possible populate parameter first
    const simplePopulate = 'populate=*';
    const cacheBuster = `_=${Date.now()}`;
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&${simplePopulate}&${cacheBuster}`;
    
    console.log(`[Simple Diensten Test] Fetching from URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Simple Diensten Test] Strapi API returned ${response.status} ${response.statusText}: ${errorText}`);
      
      // Try a different approach - get all pages first
      console.log(`[Simple Diensten Test] Trying alternative approach - get all pages`);
      const allPagesUrl = `${strapiUrl}/api/pages?${cacheBuster}`;
      
      const allPagesResponse = await fetch(allPagesUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!allPagesResponse.ok) {
        return NextResponse.json({
          status: 'error',
          message: `Both API approaches failed. Strapi API returned ${allPagesResponse.status} ${allPagesResponse.statusText}`,
          details: await allPagesResponse.text()
        }, { status: allPagesResponse.status });
      }
      
      const allPagesData = await allPagesResponse.json();
      
      // Find the diensten page in the results
      const dienstenPage = allPagesData.data?.find((page: any) => 
        page.attributes?.slug === 'diensten'
      );
      
      if (!dienstenPage) {
        return NextResponse.json({
          status: 'error',
          message: 'Diensten page not found in all pages response',
          allPages: allPagesData.data?.map((page: any) => ({
            id: page.id,
            slug: page.attributes?.slug
          }))
        }, { status: 404 });
      }
      
      return NextResponse.json({
        status: 'partial_success',
        message: 'Retrieved diensten page with limited data (no deep populate)',
        pageId: dienstenPage.id,
        pageData: dienstenPage.attributes,
        allPagesCount: allPagesData.data?.length || 0
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Diensten page data retrieved successfully',
      pageData: data.data?.[0]?.attributes,
      meta: data.meta
    });
  } catch (error) {
    console.error('Simple diensten test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}