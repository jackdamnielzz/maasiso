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

    // Specifically target the diensten page with simpler populate parameter
    const cacheBuster = `_=${Date.now()}`;
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate=*&${cacheBuster}`;
    
    console.log('Debug Feature Grid Simple: Making request to Strapi:', { url });
    
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
    
    // Format the response to clearly show the structure
    return NextResponse.json({
      status: 'success',
      message: 'Diensten Page Feature Grid Debug',
      timestamp: new Date().toISOString(),
      pageInfo: {
        id: data?.data?.[0]?.id,
        title: pageData.Title || pageData.title,
        slug: pageData.slug
      },
      featureGridComponents: featureGridComponents.map((component: any) => ({
        id: component.id,
        componentType: component.__component,
        availableKeys: Object.keys(component),
        directFeatures: component.features, // Exactly what comes from Strapi for the features field
        rawComponent: component // Full raw component for detailed inspection
      }))
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