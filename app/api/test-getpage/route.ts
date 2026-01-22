import { NextRequest, NextResponse } from 'next/server';
import { getPage } from '@/lib/api';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug') || 'diensten';
    
    console.log(`Testing getPage function for slug: ${slug}`);
    
    // Use our fixed getPage function
    const pageData = await getPage(slug);
    
    return NextResponse.json({
      status: 'success',
      message: `Testing getPage for ${slug}`,
      timestamp: new Date().toISOString(),
      result: {
        success: !!pageData,
        pageDetails: pageData ? {
          id: pageData.id,
          title: pageData.title,
          slug: pageData.slug,
          hasLayout: Array.isArray(pageData.layout),
          layoutCount: pageData.layout?.length || 0,
          layoutTypes: pageData.layout?.map(item => item.__component) || []
        } : null,
        firstLayoutItem: pageData?.layout?.[0] || null,
        // Show a sample of feature blocks if they exist
        featureBlock: pageData?.layout?.find(item => item.__component === 'page-blocks.feature-grid') || null,
        // Complete data for debugging
        pageData: pageData
      }
    });
  } catch (error) {
    console.error('getPage test error:', error);
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