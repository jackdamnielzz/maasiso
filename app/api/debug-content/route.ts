import { NextRequest, NextResponse } from 'next/server';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface StrapiComponent {
  id: string | number;
  __component: string;
  [key: string]: any;
}

interface StrapiLayoutItem {
  attributes?: {
    layout?: StrapiComponent[];
    [key: string]: any;
  };
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug') || 'diensten';
    
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

    // Direct fetch from Strapi with simple populate and cache-busting query parameter
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}&populate=*&cacheBust=${Date.now()}`;
    
    console.log(`Testing page ${slug} content directly from Strapi:`, { url });
    
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
    
    // Extract useful debugging information
    const layoutInfo = data?.data?.map((item: StrapiLayoutItem) => {
      const layout = item?.attributes?.layout || [];
      
      return {
        pageId: item.id,
        componentCount: layout.length,
        componentTypes: layout.map((comp: StrapiComponent) => comp.__component),
        components: layout.map((comp: StrapiComponent) => ({
          id: comp.id,
          type: comp.__component,
          contentSample: comp.content ? comp.content.substring(0, 100) + '...' : '[No content field]',
          keys: Object.keys(comp)
        }))
      };
    }) || [];
    
    return NextResponse.json({
      status: 'success',
      message: `Content for page ${slug}`,
      timestamp: new Date().toISOString(),
      layoutInfo: layoutInfo,
      // Include the raw data from the API
      rawData: data?.data
    });
  } catch (error) {
    console.error('Content debugging error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}