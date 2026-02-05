import { NextResponse } from 'next/server';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    if (!strapiUrl || !token) {
      throw new Error('Missing required environment variables');
    }

    // Test the connection and list available collections
    const response = await fetch(`${strapiUrl}/api/content-type-builder/content-types`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('Available Strapi collections:', data);

    return NextResponse.json({
      status: 'success',
      message: 'Connected to Strapi successfully',
      collections: data
    });
  } catch (error) {
    console.error('Strapi test connection error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
