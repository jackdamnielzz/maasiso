import { NextResponse } from 'next/server';
import { getPage } from '@/lib/api';
import { guardDebugEndpoint } from '@/lib/admin/apiAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = guardDebugEndpoint(request);
  if (guard) return guard;

  try {
    console.log('Testing Over Ons page with deep populate...');
    // Test het ophalen van de Over Ons pagina
    const overOnsPage = await getPage('over-ons');
    
    if (!overOnsPage) {
      return NextResponse.json({
        status: 'error',
        message: 'Over Ons pagina niet gevonden in Strapi'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Over Ons pagina succesvol opgehaald',
      page: overOnsPage
    });
  } catch (error) {
    console.error('Fout bij het ophalen van Over Ons pagina:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Onbekende fout',
      },
      { status: 500 }
    );
  }
}
