import { NextRequest, NextResponse } from 'next/server';
import { getPage } from '@/lib/api';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Clear any cached data and fetch fresh page data
    console.log('Refreshing diensten page data...');
    const pageData = await getPage('diensten');
    
    // Find and analyze the feature grid component
    const featureGridComponent = pageData?.layout?.find(component => 
      component.__component === 'page-blocks.feature-grid'
    );
    
    const featureGridAnalysis = featureGridComponent ? {
      present: true,
      featureCount: featureGridComponent.features ? featureGridComponent.features.length : 0,
      firstFeature: featureGridComponent.features && featureGridComponent.features.length > 0 
        ? {
          title: featureGridComponent.features[0].title,
          descriptionLength: featureGridComponent.features[0].description?.length || 0
        } : null
    } : {
      present: false,
      reason: "No feature grid component found in the layout"
    };
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Diensten page cache refreshed',
      pageInfo: {
        id: pageData?.id,
        title: pageData?.title,
        layoutComponents: pageData?.layout?.length || 0
      },
      featureGridAnalysis
    });
  } catch (error) {
    console.error('Error refreshing diensten page:', error);
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