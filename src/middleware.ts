import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
  matcher: ['/sitemap.xml', '/home'],
};
