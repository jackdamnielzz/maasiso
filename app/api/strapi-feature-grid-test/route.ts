import { NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.STRAPI_TOKEN;

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

    // Use indexed populate parameters instead of nested populate
    // This approach is more compatible with Strapi and less likely to cause 500 errors
    const populateParams = [
      'populate[0]=layout',
      'populate[1]=layout.features',
      'populate[2]=layout.features.icon',
      'populate[3]=layout.backgroundImage',
      'populate[4]=layout.ctaButton'
    ].join('&');
    
    // Add a cache buster to ensure we get fresh data
    const cacheBuster = `&_=${Date.now()}`;
    
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&${populateParams}${cacheBuster}`;
    
    console.log('Feature Grid Test Request:', { url });
    
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
    
    // Extract feature grid components for analysis
    const layout = data?.data?.[0]?.attributes?.layout || [];
    const featureGrids = layout.filter((component: any) => 
      component.__component === 'page-blocks.feature-grid'
    );

    return NextResponse.json({
      status: 'success',
      message: 'Feature grid data retrieved using indexed populate parameters',
      timestamp: new Date().toISOString(),
      strapiUrl,
      featureGridCount: featureGrids?.length || 0,
      featureGrids: featureGrids.map((grid: any) => ({
        id: grid.id,
        title: grid.title,
        subtitle: grid.subtitle,
        featuresCount: grid.features?.length || 0,
        features: grid.features?.map((feature: any) => ({
          id: feature.id,
          title: feature.title,
          description: feature.description,
          hasIcon: !!feature.icon
        }))
      })),
      requestDetails: {
        url,
        populateParams
      }
    });
  } catch (error) {
    console.error('Strapi feature grid test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
