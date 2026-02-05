import { NextRequest, NextResponse } from 'next/server';
import { getPage } from '@/lib/api';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

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

    console.log(`Debug mapping for ${slug}...`);
    
    // 1. Get mapped data from getPage function
    const mappedData = await getPage(slug);
    
    // 2. Get raw data directly from Strapi for comparison
    // Use the same populate parameters as getPage function
    const populateParams = [
      'populate[0]=layout',
      'populate[1]=layout.features',
      'populate[2]=layout.features.icon',
      'populate[3]=layout.backgroundImage',
      'populate[4]=seoMetadata',
      'populate[5]=seoMetadata.ogImage'
    ].join('&');
    
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}&${populateParams}&_=${Date.now()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Strapi response: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    
    // Extract important structure information
    const pageAttributes = rawData?.data?.[0]?.attributes || {};
    const rawLayout = pageAttributes.layout || [];
    
    // Compare structures
    return NextResponse.json({
      status: 'success',
      message: `Mapping debug for page ${slug}`,
      timestamp: new Date().toISOString(),
      comparison: {
        rawData: {
          hasData: !!rawData?.data,
          pageCount: rawData?.data?.length || 0,
          hasLayout: !!pageAttributes.layout,
          layoutCount: rawLayout.length,
          layoutTypes: rawLayout.map((comp: any) => comp.__component)
        },
        mappedData: {
          success: !!mappedData,
          hasLayout: !!mappedData?.layout,
          layoutCount: mappedData?.layout?.length || 0,
          layoutTypes: mappedData?.layout?.map((comp: any) => comp.__component)
        }
      },
      // Sample the first component for comparison
      samples: {
        rawFirstComponent: rawLayout[0] || null,
        mappedFirstComponent: mappedData?.layout?.[0] || null
      },
      // Feature blocks comparison
      featureBlocks: {
        raw: rawLayout.filter((comp: any) => comp.__component === 'page-blocks.feature-grid').map((block: any) => ({
          componentId: block.id,
          featuresCount: block.features?.length || 0,
          firstFeature: block.features?.[0] || null
        })),
        mapped: mappedData?.layout
          ?.filter((comp: any) => comp.__component === 'page-blocks.feature-grid')
          .map((block: any) => ({
            componentId: block.id,
            featuresCount: block.features?.length || 0,
            firstFeature: block.features?.[0] || null
          }))
      }
    });
  } catch (error) {
    console.error('Mapping debug error:', error);
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
