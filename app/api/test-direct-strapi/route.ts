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

    // Make a direct request to the Strapi API
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate[0]=layout&populate[1]=layout.features&populate[2]=layout.features.icon&cacheBust=${Date.now()}`;
    
    console.log('Direct Strapi API request:', { url });
    
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
    
    // Check if we have any layout components
    const pageData = data?.data?.[0]?.attributes;
    const layout = pageData?.layout || [];

    return NextResponse.json({
      status: 'success',
      message: 'Direct Strapi API result',
      strapiUrl,
      timestamp: new Date().toISOString(),
      pageInfo: {
        id: data?.data?.[0]?.id,
        slug: pageData?.slug,
        title: pageData?.title,
        hasLayout: layout.length > 0,
        layoutCount: layout.length,
        textBlocks: layout
          .filter((block: any) => block.__component === 'page-blocks.text-block')
          .map((block: any) => ({
            id: block.id,
            content: block.content?.substring(0, 150) + '...' // Truncate for readability
          }))
      },
      rawData: data
    });
  } catch (error) {
    console.error('Direct Strapi API error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
