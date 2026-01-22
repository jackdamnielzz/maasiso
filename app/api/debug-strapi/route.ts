import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      return NextResponse.json({
        status: 'error',
        message: 'Missende omgevingsvariabelen',
        env: {
          strapiUrl: !!strapiUrl,
          token: !!token,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
          port: process.env.PORT
        }
      }, { status: 500 });
    }

    // Direct pagina ophalen van Strapi met simple populate
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=over-ons&populate=*`;
    
    console.log('Direct Strapi request:', { url });
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Strapi response: ${response.status} ${response.statusText}`,
        url
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      message: 'Strapi direct connection test',
      url,
      data,
      dataDetails: {
        hasData: !!data,
        dataLength: data?.data?.length || 0,
        dataStructure: data?.data?.[0] ? Object.keys(data.data[0]) : 'No data item found'
      }
    });
  } catch (error) {
    console.error('Strapi debugging error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Onbekende fout',
      },
      { status: 500 }
    );
  }
}