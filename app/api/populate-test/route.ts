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

    // Test different populate approaches for the diensten page
    const testResults: Record<string, any> = {};

    // Test 1: Simple populate=* approach
    const url1 = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate=*`;
    console.log(`Test 1: ${url1}`);
    const response1 = await fetch(url1, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    const data1 = await response1.json();
    testResults['simple-populate'] = {
      url: url1,
      success: response1.ok,
      hasData: !!data1?.data,
      dataCount: data1?.data?.length,
      pageId: data1?.data?.[0]?.id,
      hasLayout: !!data1?.data?.[0]?.attributes?.layout,
      dataStructure: data1?.data?.[0] 
    };

    // Test 2: Deep populate approach
    const populateParams = [
      'populate[0]=layout',
      'populate[1]=layout.features',
      'populate[2]=layout.features.icon',
      'populate[3]=layout.backgroundImage',
      'populate[4]=seoMetadata',
      'populate[5]=seoMetadata.ogImage'
    ].join('&');
    const url2 = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&${populateParams}`;
    console.log(`Test 2: ${url2}`);
    const response2 = await fetch(url2, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    const data2 = await response2.json();
    testResults['deep-populate'] = {
      url: url2,
      success: response2.ok,
      hasData: !!data2?.data,
      dataCount: data2?.data?.length,
      pageId: data2?.data?.[0]?.id,
      hasLayout: !!data2?.data?.[0]?.attributes?.layout,
      dataStructure: data2?.data?.[0]
    };

    // Test 3: Populate with fields 
    const url3 = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate[layout][populate][features][populate]=*`;
    console.log(`Test 3: ${url3}`);
    const response3 = await fetch(url3, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    const data3 = await response3.json();
    testResults['field-populate'] = {
      url: url3,
      success: response3.ok,
      hasData: !!data3?.data,
      dataCount: data3?.data?.length,
      pageId: data3?.data?.[0]?.id,
      hasLayout: !!data3?.data?.[0]?.attributes?.layout,
      dataStructure: data3?.data?.[0]
    };

    // Test 4: Different syntax for Strapi v4
    const url4 = `${strapiUrl}/api/pages?filters[slug]=diensten&populate[0]=layout&populate[1]=layout.components`;
    console.log(`Test 4: ${url4}`);
    const response4 = await fetch(url4, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    const data4 = await response4.json();
    testResults['strapi-v4'] = {
      url: url4,
      success: response4.ok,
      hasData: !!data4?.data,
      dataCount: data4?.data?.length,
      pageId: data4?.data?.[0]?.id,
      hasLayout: !!data4?.data?.[0]?.attributes?.layout,
      dataStructure: data4?.data?.[0]
    };

    return NextResponse.json({
      status: 'success',
      message: 'Populate strategy test results',
      timestamp: new Date().toISOString(),
      testResults
    });
  } catch (error) {
    console.error('Populate test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
