import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('🔍 Testing Direct Proxy Response...');
    
    // First, let's test direct Strapi connection
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    
    if (!strapiUrl || !token) {
      throw new Error('Missing Strapi config');
    }

    const directResponse = await fetch(`${strapiUrl}/api/blog-posts?pagination[limit]=1&populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const directData = await directResponse.json();
    
    console.log('📊 Direct Strapi Response:', {
      status: directResponse.status,
      dataExists: !!directData.data,
      itemCount: directData.data?.length || 0,
      firstPostStructure: directData.data?.[0] ? {
        id: directData.data[0].id,
        hasAttributes: !!directData.data[0].attributes,
        tagsStructure: directData.data[0].attributes?.tags ? typeof directData.data[0].attributes.tags : 'No tags',
        categoriesStructure: directData.data[0].attributes?.categories ? typeof directData.data[0].attributes.categories : 'No categories'
      } : null
    });

    // Now test our proxy
    const proxyResponse = await fetch('https://maasiso.nl/api/proxy/blog-posts?pagination[limit]=1&populate=*', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const proxyData = await proxyResponse.json();
    
    console.log('🔄 Proxy Response:', {
      status: proxyResponse.status,
      dataExists: !!proxyData.data,
      itemCount: proxyData.data?.length || 0,
      firstPostStructure: proxyData.data?.[0] ? {
        id: proxyData.data[0].id,
        title: proxyData.data[0].title,
        tagsType: typeof proxyData.data[0].tags,
        tagsIsArray: Array.isArray(proxyData.data[0].tags),
        tagsValue: proxyData.data[0].tags,
        categoriesType: typeof proxyData.data[0].categories,
        categoriesIsArray: Array.isArray(proxyData.data[0].categories),
        categoriesValue: proxyData.data[0].categories
      } : null
    });

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      test: 'Direct Proxy Comparison',
      directStrapi: {
        status: directResponse.status,
        firstPost: directData.data?.[0] || null
      },
      proxyNormalized: {
        status: proxyResponse.status,
        firstPost: proxyData.data?.[0] || null
      }
    });
  } catch (error) {
    console.error('❌ Direct Proxy Test Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 