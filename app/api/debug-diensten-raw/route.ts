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

    // Zeer eenvoudige aanvraag alleen om de rauwe paginastructuur te zien
    const cacheBuster = `_=${Date.now()}`;
    const url = `${strapiUrl}/api/pages?filters[slug][$eq]=diensten&populate=*&${cacheBuster}`;
    
    console.log('Debug Diensten Raw: Making request to Strapi:', { url });
    
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

    // Volledige ruwe data teruggeven voor inspectie
    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      message: 'Diensten Page Raw Debug',
      timestamp: new Date().toISOString(),
      page: data.data[0],
      layoutBeschikbaar: !!data.data[0]?.attributes?.layout,
      featureGridComponentInfo: data.data[0]?.attributes?.layout?.find((item: any) => 
        item.__component === 'page-blocks.feature-grid'
      ) || 'Geen feature-grid component gevonden'
    });
  } catch (error) {
    console.error('Diensten raw debug error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
