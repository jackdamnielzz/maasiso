import { NextResponse } from 'next/server';
import { extractFeatures } from '@/lib/featureExtractor';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'diensten';
    
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

    // Enhanced populate parameters for Strapi v4
    const enhancedPopulate = [
      // Base populate for top-level fields
      'populate[layout]=*',
      
      // Deep populate for feature grid components
      'populate[layout][populate][features]=*',
      'populate[layout][populate][features][populate][icon]=*',
      
      // Deep populate for hero components
      'populate[layout][populate][backgroundImage]=*',
      'populate[layout][populate][ctaButton]=*',
    ].join('&');
    
    const cacheBuster = `_=${Date.now()}`;
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=${slug}&${enhancedPopulate}&${cacheBuster}`;
    
    console.log(`[Debug Feature Extraction] Fetching from URL: ${url}`);
    
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
        message: `Strapi API returned ${response.status} ${response.statusText}`,
        details: await response.text()
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract feature grid components
    const featureGrids = data.data?.[0]?.attributes?.layout?.filter((component: any) => 
      component.__component === 'page-blocks.feature-grid'
    ) || [];
    
    // Test feature extraction on each feature grid
    const extractionResults = featureGrids.map((grid: any, index: number) => {
      try {
        const extractedFeatures = extractFeatures(grid);
        return {
          gridIndex: index,
          success: true,
          featureCount: extractedFeatures.length,
          features: extractedFeatures,
          rawGrid: grid
        };
      } catch (error) {
        return {
          gridIndex: index,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          rawGrid: grid
        };
      }
    });
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Feature extraction debug results',
      pageSlug: slug,
      featureGridCount: featureGrids.length,
      extractionResults,
      rawPageData: data.data?.[0]?.attributes
    });
  } catch (error) {
    console.error('Feature extraction debug error:', error);
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
