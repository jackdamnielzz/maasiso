import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const strapiUrl = process.env.STRAPI_URL;
    if (!strapiUrl) {
      throw new Error('STRAPI_URL environment variable is not set');
    }

    // Get the path parameters and search params
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${strapiUrl}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log('Proxying request to:', url);

    // Forward the request to Strapi
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error('Strapi error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`Strapi responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const strapiUrl = process.env.STRAPI_URL;
    if (!strapiUrl) {
      throw new Error('STRAPI_URL environment variable is not set');
    }

    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${strapiUrl}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log('Proxying POST request to:', url);

    const body = await request.json();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Strapi error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`Strapi responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}