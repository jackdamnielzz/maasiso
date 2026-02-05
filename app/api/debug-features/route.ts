import { NextRequest, NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type FeatureGridComponent = {
  id?: number | string;
  __component?: string;
  features?: unknown;
  [key: string]: unknown;
};

type PageLayoutResponse = {
  data?: Array<{
    attributes?: {
      layout?: unknown;
    };
  }>;
};

export async function GET(request: NextRequest) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    // Get direct access to Strapi
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing Strapi configuration',
        error: {
          strapiUrl: !!strapiUrl,
          token: !!token
        }
      }, { status: 500 });
    }
    
    // Test first approach - Use direct API request for features
    console.log("Making direct API request to Strapi for feature data...");
    // Try direct feature collection endpoint
    const featuresEndpoint = `${strapiUrl}/api/features?populate=*`;
    
    console.log(`Testing features collection: ${featuresEndpoint}`);
    
    const featuresResponse = await fetch(featuresEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
    });
    
    // Capture feature collection data
    let featuresData: unknown = null;
    let featuresError: string | null = null;
    
    if (featuresResponse.ok) {
      featuresData = await featuresResponse.json();
    } else {
      try {
        featuresError = await featuresResponse.text();
      } catch (e) {
        featuresError = 'Could not extract error details';
      }
    }
    
    // Test second approach - Get page and attempt to extract feature component
    const pageEndpoint = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate[layout][populate]=*`;
    console.log(`Testing page approach: ${pageEndpoint}`);
    
    const pageResponse = await fetch(pageEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
    });
    
    let pageData: PageLayoutResponse | null = null;
    let pageError: string | null = null;
    
    if (pageResponse.ok) {
      pageData = await pageResponse.json();
    } else {
      try {
        pageError = await pageResponse.text();
      } catch (e) {
        pageError = 'Could not extract error details';
      }
    }
    
    // Analyze page structure
    let layoutAnalysis: {
      hasLayout: boolean;
      layoutCount: number;
      componentTypes: string[];
    } | null = null;
    let featureGridComponent: FeatureGridComponent | null = null;
    
    if (pageData?.data?.[0]?.attributes?.layout) {
      const layout = pageData.data[0].attributes.layout;
      layoutAnalysis = {
        hasLayout: Array.isArray(layout),
        layoutCount: Array.isArray(layout) ? layout.length : 0,
        componentTypes: Array.isArray(layout)
          ? layout.map((item: any) => String(item?.__component ?? 'unknown'))
          : []
      };
      
      // Find feature grid component
      if (Array.isArray(layout)) {
        for (const component of layout as FeatureGridComponent[]) {
          if (component.__component === 'page-blocks.feature-grid') {
            featureGridComponent = component;
            break;
          }
        }
      }
    }
    
    // Test third approach - Try a component-specific query
    const componentsEndpoint = `${strapiUrl}/api/components/page-blocks.feature-grid?populate=*`;
    console.log(`Testing components approach: ${componentsEndpoint}`);
    
    const componentsResponse = await fetch(componentsEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
    });
    
    let componentsData: unknown = null;
    let componentsError: string | null = null;
    
    if (componentsResponse.ok) {
      componentsData = await componentsResponse.json();
    } else {
      try {
        componentsError = await componentsResponse.text();
      } catch (e) {
        componentsError = 'Could not extract error details';
      }
    }
    
    // Return all results for comprehensive analysis
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      featuresCollection: {
        status: featuresResponse.ok ? 'success' : 'error',
        statusCode: featuresResponse.status,
        data: featuresData,
        error: featuresError
      },
      pageApproach: {
        status: pageResponse.ok ? 'success' : 'error',
        statusCode: pageResponse.status,
        layoutAnalysis,
        featureGridComponent: featureGridComponent ? {
          id: featureGridComponent.id,
          componentType: featureGridComponent.__component,
          availableKeys: Object.keys(featureGridComponent),
          featuresData: featureGridComponent.features,
          featuresType: featureGridComponent.features ? typeof featureGridComponent.features : 'undefined',
          isArray: Array.isArray(featureGridComponent.features)
        } : 'Not found'
      },
      componentsApproach: {
        status: componentsResponse.ok ? 'success' : 'error',
        statusCode: componentsResponse.status,
        data: componentsData,
        error: componentsError
      },
      // Include raw response data for detailed inspection
      rawPageSample: pageData ? JSON.stringify(pageData).substring(0, 1000) + '...' : 'No data'
    });
  } catch (error) {
    console.error('Feature debug error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack available'
      },
      { status: 500 }
    );
  }
}
