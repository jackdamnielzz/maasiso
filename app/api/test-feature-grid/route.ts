import { NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      throw new Error('Missing required environment variables');
    }

    // Try to get the feature grid component type definition first
    const componentResponse = await fetch(`${strapiUrl}/api/content-type-builder/components/page-blocks.feature-grid`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!componentResponse.ok) {
      const errorText = await componentResponse.text();
      console.log('Component definition error:', errorText);
    } else {
      const componentData = await componentResponse.json();
      console.log('Feature grid component definition:', JSON.stringify(componentData, null, 2));
    }

    // Then try to get the page with features
    const response = await fetch(`${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate[layout][populate]=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi responded with status: ${response.status}. Details: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract feature grid components for analysis
    const featureGrids = data.data?.[0]?.layout?.filter((component: any) => 
      component.__component === 'page-blocks.feature-grid'
    );

    // Log the raw structure
    console.log('Raw feature grid data:', JSON.stringify(featureGrids, null, 2));

    return NextResponse.json({
      status: 'success',
      message: 'Feature grid data retrieved',
      rawData: data,
      featureGridComponents: featureGrids,
      featureGridCount: featureGrids?.length || 0,
      firstFeatureGrid: featureGrids?.[0],
      layoutStructure: data.data?.[0]?.layout?.map((comp: any) => ({
        type: comp.__component,
        id: comp.id,
        allKeys: Object.keys(comp)
      }))
    });
  } catch (error) {
    console.error('Feature grid test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
