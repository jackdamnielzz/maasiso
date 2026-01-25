import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRemovedUrl } from '@/config/removed-urls';

export function middleware(request: NextRequest) {
  // Check for permanently removed URLs FIRST (410 Gone)
  // This ensures 410 is returned before any redirect logic
  if (isRemovedUrl(request.nextUrl.pathname)) {
    return new NextResponse('Gone', {
      status: 410,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Type': 'text/plain',
      }
    });
  }

  // Redirect /home to / to prevent duplicate content
  if (request.nextUrl.pathname === '/home') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  if (request.nextUrl.pathname === '/index.html') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  if (request.nextUrl.pathname === '/$') {
    return new NextResponse('Not Found', { status: 404 });
  }

  const redirectMap: Record<string, string> = {
    '/diensten/iso-9001-consultancy': '/iso-9001',
    '/diensten/iso-9001': '/iso-9001',
    '/diensten/iso-14001': '/iso-14001',
    '/diensten/iso-27001': '/iso-27001',
    '/diensten/iso-45001': '/iso-45001',
    '/diensten/gdpr-avg': '/avg',
    '/diensten/bio': '/bio',
    '/algemene-voorwaarden': '/terms-and-conditions',
  };

  const redirectTarget = redirectMap[request.nextUrl.pathname];
  if (redirectTarget) {
    return NextResponse.redirect(new URL(redirectTarget, request.url), 301);
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
    '/sitemap.xml',
    '/home',
    '/index.html',
    '/algemene-voorwaarden',
    '/$',
    '/diensten/:path*',
    '/blog/:path*',
    '/news/:path*',
    '/test-deploy',
  ],
};
