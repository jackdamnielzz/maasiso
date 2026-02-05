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
    // 1. Test the getPage function
    console.log('Testing getPage function for diensten...');
    const pageData = await getPage('diensten');
    
    // 2. Test the direct refresh endpoint
    console.log('Testing refresh-page endpoint for diensten...');
    const refreshResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/refresh-page?slug=diensten&t=${Date.now()}`, 
      { cache: 'no-store', next: { revalidate: 0 } }
    );
    
    const refreshResult = await refreshResponse.json();
    
    // 3. Also test the new debug endpoint
    console.log('Testing debug-diensten endpoint...');
    const debugResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/debug-diensten`,
      { cache: 'no-store', next: { revalidate: 0 } }
    );
    
    const debugResult = await debugResponse.json();
    
    // Compare the results
    const pageInfo = pageData ? {
      id: pageData.id,
      hasLayout: Array.isArray(pageData.layout),
      layoutCount: pageData.layout?.length || 0,
      layoutComponents: pageData.layout?.map((comp: any) => comp.__component)
    } : null;
    
    // Extract page data from refresh-page response
    const refreshPageData = refreshResult.data?.data?.[0]?.attributes;
    const refreshLayout = refreshPageData?.layout || [];
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      comparison: {
        usingGetPage: {
          success: !!pageData,
          pageInfo,
        },
        usingRefreshPage: {
          success: !!refreshResult.data,
          hasAttributes: !!refreshPageData,
          hasLayout: Array.isArray(refreshPageData?.layout),
          layoutCount: refreshLayout.length,
          layoutComponents: refreshLayout.map((comp: any) => comp.__component)
        },
        usingDebugEndpoint: {
          success: !!debugResult.dataStructure,
          hasLayout: debugResult.dataStructure?.hasLayout || false,
          layoutCount: debugResult.dataStructure?.layoutItems || 0
        }
      },
      // Include first layout component from each method for comparison
      sampleComponents: {
        getPageFirst: pageData?.layout?.[0] || null,
        refreshPageFirst: refreshLayout[0] || null,
        debugEndpointFirst: debugResult.firstLayoutItems?.[0] || null
      }
    });
  } catch (error) {
    console.error('Diensten structure test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
