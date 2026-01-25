import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  // Force WWW to non-WWW in a single hop if possible
  if (hostname === 'www.maasiso.nl') {
    return NextResponse.redirect(
      `https://maasiso.nl${request.nextUrl.pathname}${request.nextUrl.search}`,
      308
    );
  }

  // Redirect /home to / to prevent duplicate content
  if (request.nextUrl.pathname === '/home') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  // Handle sitemap cache headers
  if (request.nextUrl.pathname === '/sitemap.xml') {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
