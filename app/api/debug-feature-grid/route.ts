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

    // Specifically target the diensten page with advanced populate parameters
    const cacheBuster = `_=${Date.now()}`;
    
    // Try different populate approaches to make sure we get everything
    const populateParams = [
      'populate=*',
      'populate[layout][populate]=*',
      'populate[layout][populate][features][populate]=*',
      'populate[layout][populate][features][populate][icon][populate]=*'
    ].join('&');
    
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&${populateParams}&${cacheBuster}`;
    
    console.log('Debug Feature Grid: Making request to Strapi:', { url });
    
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
    
    // Extract just the feature grid components from the layout
    const pageData = data?.data?.[0]?.attributes || {};
    const layout = pageData?.layout || [];
    
    // Find all feature grid components
    const featureGridComponents = layout.filter((item: any) => 
      item.__component === 'page-blocks.feature-grid'
    );
    
    // Generate a detailed report on the feature grid structure
    return NextResponse.json({
      status: 'success',
      message: 'Diensten Page Feature Grid Debug',
      timestamp: new Date().toISOString(),
      requestInfo: {
        url,
        strapiUrl,
      },
      overview: {
        hasData: !!data?.data,
        dataItems: data?.data?.length || 0,
        pageId: data?.data?.[0]?.id,
        hasLayout: !!pageData.layout,
        layoutItems: layout.length,
        featureGridComponents: featureGridComponents.length
      },
      // Send the raw feature grid components data
      featureGridComponents: featureGridComponents.map((component: any) => ({
        id: component.id,
        componentType: component.__component,
        allKeys: Object.keys(component),
        hasFeatures: component.features !== undefined,
        featuresIsArray: Array.isArray(component.features),
        featuresCount: Array.isArray(component.features) ? component.features.length : 'not an array',
        featuresValue: component.features, // Return the raw value to see its structure
        // Also check alternative data structures
        hasDataProperty: component.data !== undefined,
        dataPropertyKeys: component.data ? Object.keys(component.data) : [],
        dataPropertyFeatures: component.data?.features
      })),
      // Include the complete page data for reference
      rawPageData: data.data?.[0]?.attributes
    });
  } catch (error) {
    console.error('Feature grid debug error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
