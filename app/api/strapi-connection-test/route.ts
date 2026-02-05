import { NextRequest, NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    // Get Strapi connection details
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    // Check environment variables
    if (!strapiUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'STRAPI_URL environment variable is missing',
        env: process.env.STRAPI_URL,
        altEnv: process.env.NEXT_PUBLIC_BACKEND_URL
      }, { status: 500 });
    }

    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'NEXT_PUBLIC_STRAPI_TOKEN environment variable is missing'
      }, { status: 500 });
    }

    // Test basic connection to Strapi without complex query parameters
    const testUrl = `${strapiUrl}/api/pages`;
    console.log(`Testing basic Strapi connection to: ${testUrl}`);

    // Make a simple request to check connection
    const basicResponse = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    // If we can't connect at all
    if (!basicResponse.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Strapi API',
        details: {
          url: testUrl,
          statusCode: basicResponse.status,
          statusText: basicResponse.statusText
        }
      }, { status: 500 });
    }

    // Get the basic page data
    const basicData = await basicResponse.json();

    // Now test with the specific diensten page query
    const dienestenUrl = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten`;
    console.log(`Testing diensten page query: ${dienestenUrl}`);

    const pageResponse = await fetch(dienestenUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const pageData = await pageResponse.json();

    // Return all the test results
    return NextResponse.json({
      status: 'success',
      message: 'Strapi connection test',
      timestamp: new Date().toISOString(),
      environmentInfo: {
        strapiUrl,
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 10) + '...' : null
      },
      connectionTest: {
        basicConnection: {
          url: testUrl,
          status: basicResponse.status,
          success: basicResponse.ok,
          dataItems: basicData?.data?.length || 0,
          meta: basicData?.meta
        },
        dienestenPage: {
          url: dienestenUrl,
          status: pageResponse.status,
          success: pageResponse.ok,
          dataItems: pageData?.data?.length || 0,
          hasPage: pageData?.data?.length > 0,
          pageId: pageData?.data?.[0]?.id || null,
          pageSlug: pageData?.data?.[0]?.attributes?.slug || null,
          hasAttributes: !!pageData?.data?.[0]?.attributes,
          attributeKeys: pageData?.data?.[0]?.attributes
            ? Object.keys(pageData.data[0].attributes)
            : [],
          rawPageData: pageData?.data?.[0] // Include the raw page data for inspection
        }
      }
    });
  } catch (error) {
    console.error('Strapi connection test error:', error);
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
