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

  // Admin tooling lives under /_admin; /admin should not exist.
  if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (request.nextUrl.pathname === '/_admin') {
    return NextResponse.redirect(new URL('/_admin/related-posts', request.url), 301);
  }

  // Redirect /home to / to prevent duplicate content
  if (request.nextUrl.pathname === '/home') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  if (request.nextUrl.pathname === '/diensten') {
    return NextResponse.redirect(new URL('/iso-certificering', request.url), 301);
  }

  if (request.nextUrl.pathname === '/onze-voordelen') {
    return NextResponse.redirect(new URL('/waarom-maasiso', request.url), 301);
  }

  if (request.nextUrl.pathname === '/news') {
    return NextResponse.redirect(new URL('/blog', request.url), 301);
  }

  if (request.nextUrl.pathname.startsWith('/news/')) {
    const slug = request.nextUrl.pathname.replace('/news/', '');
    return NextResponse.redirect(new URL(`/blog/${slug}`, request.url), 301);
  }

  if (request.nextUrl.pathname.startsWith('/blog-posts/')) {
    const slug = request.nextUrl.pathname.replace('/blog-posts/', '');
    return NextResponse.redirect(new URL(`/blog/${slug}`, request.url), 301);
  }

  if (request.nextUrl.pathname === '/index.html') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  if (request.nextUrl.pathname === '/$') {
    return new NextResponse('Not Found', { status: 404 });
  }

  const redirectMap: Record<string, string> = {
    '/iso-9001': '/iso-certificering/iso-9001',
    '/iso-14001': '/iso-certificering/iso-14001',
    '/iso-45001': '/iso-certificering/iso-45001',
    '/iso-16175': '/iso-certificering/iso-16175',
    '/iso-27001': '/informatiebeveiliging/iso-27001',
    '/avg': '/avg-wetgeving/avg',
    '/bio': '/informatiebeveiliging/bio',
    '/diensten/iso-9001-consultancy': '/iso-certificering/iso-9001',
    '/diensten/iso-9001': '/iso-certificering/iso-9001',
    '/diensten/iso-14001': '/iso-certificering/iso-14001',
    '/diensten/iso-27001': '/informatiebeveiliging/iso-27001',
    '/diensten/iso-45001': '/iso-certificering/iso-45001',
    '/diensten/gdpr-avg': '/avg-wetgeving/avg',
    '/diensten/bio': '/informatiebeveiliging/bio',
    '/algemene-voorwaarden': '/terms-and-conditions',
    '/contact.html': '/contact',
    '/blog/iso-27001-checklist': '/blog/iso-27001-checklist-augustus-2025',
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
    '/diensten',
    '/onze-voordelen',
    '/news/:path*',
    '/blog-posts/:path*',
    '/admin',
    '/admin/:path*',
    '/_admin',
    '/_admin/:path*',
    '/iso-9001',
    '/iso-14001',
    '/iso-45001',
    '/iso-16175',
    '/iso-27001',
    '/avg',
    '/bio',
    '/index.html',
    '/contact.html',
    '/algemene-voorwaarden',
    '/$',
    '/diensten/:path*',
    '/blog/:path*',
    '/test-deploy',
  ],
};
