import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRemovedUrl } from '@/config/removed-urls';

const ISO9001_CANONICAL_PATH = '/iso-certificering/iso-9001/';
const ISO9001_NON_CANONICAL_PATH = '/iso-certificering/iso-9001';
const CANONICAL_HOST = 'www.maasiso.nl';
const APEX_HOST = 'maasiso.nl';
const CRAWL_CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/+$/g, '');
  const requestHost =
    (
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      request.nextUrl.hostname ||
      ''
    )
      .split(',')[0]
      .trim()
      .toLowerCase()
      .replace(/\.$/, '')
      .replace(/:\d+$/, '');

  // Check for permanently removed URLs FIRST (410 Gone)
  // This ensures 410 is returned before any redirect logic
  if (isRemovedUrl(normalizedPathname)) {
    return new NextResponse('Gone', {
      status: 410,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Type': 'text/plain',
      }
    });
  }

  // Admin tooling lives under /_admin; /admin should not exist.
  if (normalizedPathname === '/admin' || normalizedPathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (normalizedPathname === '/_admin') {
    return NextResponse.redirect(new URL('/_admin/related-posts', request.url), 301);
  }

  // Redirect /home to / to prevent duplicate content
  if (normalizedPathname === '/home') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  if (normalizedPathname === '/diensten') {
    return NextResponse.redirect(new URL('/iso-certificering', request.url), 301);
  }

  if (normalizedPathname === '/onze-voordelen') {
    return NextResponse.redirect(new URL('/waarom-maasiso', request.url), 301);
  }

  if (normalizedPathname === '/news') {
    return NextResponse.redirect(new URL('/blog', request.url), 301);
  }

  if (normalizedPathname.startsWith('/news/')) {
    const slug = normalizedPathname.replace('/news/', '');
    return NextResponse.redirect(new URL(`/blog/${slug}`, request.url), 301);
  }

  if (normalizedPathname.startsWith('/blog-posts/')) {
    const slug = normalizedPathname.replace('/blog-posts/', '');
    return NextResponse.redirect(new URL(`/blog/${slug}`, request.url), 301);
  }

  if (normalizedPathname === '/index.html') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  if (normalizedPathname === '/$') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // If apex reaches the app, canonicalize host + slash in a single hop.
  if (requestHost === APEX_HOST && normalizedPathname === ISO9001_NON_CANONICAL_PATH) {
    return NextResponse.redirect(
      `https://${CANONICAL_HOST}${ISO9001_CANONICAL_PATH}${request.nextUrl.search || ''}`,
      301
    );
  }

  if (normalizedPathname === ISO9001_NON_CANONICAL_PATH && pathname !== ISO9001_CANONICAL_PATH) {
    return NextResponse.redirect(new URL(ISO9001_CANONICAL_PATH, request.url), 301);
  }

  const redirectMap: Record<string, string> = {
    '/iso-9001': '/iso-certificering/iso-9001/',
    '/iso-14001': '/iso-certificering/iso-14001',
    '/iso-45001': '/iso-certificering/iso-45001',
    '/iso-16175': '/iso-certificering/iso-16175',
    '/iso-27001': '/informatiebeveiliging/iso-27001',
    '/avg': '/avg-wetgeving/avg',
    '/bio': '/informatiebeveiliging/bio',
    '/diensten/iso-9001-consultancy': '/iso-certificering/iso-9001/',
    '/diensten/iso-9001': '/iso-certificering/iso-9001/',
    '/diensten/iso-14001': '/iso-certificering/iso-14001',
    '/diensten/iso-27001': '/informatiebeveiliging/iso-27001',
    '/diensten/iso-45001': '/iso-certificering/iso-45001',
    '/diensten/gdpr-avg': '/avg-wetgeving/avg',
    '/diensten/bio': '/informatiebeveiliging/bio',
    '/algemene-voorwaarden': '/terms-and-conditions',
    '/contact.html': '/contact',
    '/blog/iso-27001-checklist': '/blog/iso-27001-checklist-augustus-2025',
  };

  const redirectTarget = redirectMap[normalizedPathname];
  if (redirectTarget) {
    return NextResponse.redirect(new URL(redirectTarget, request.url), 301);
  }

  if (pathname !== '/' && pathname.endsWith('/') && pathname !== ISO9001_CANONICAL_PATH) {
    return NextResponse.redirect(new URL(normalizedPathname, request.url), 301);
  }

  // Handle crawl endpoint cache headers
  if (
    normalizedPathname === '/sitemap.xml' ||
    normalizedPathname === '/robots.txt' ||
    normalizedPathname === '/llms.txt'
  ) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', CRAWL_CACHE_CONTROL);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude Next.js internals and immutable static assets.
    '/((?!_next/static|_next/image|favicon.ico|favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|safari-pinned-tab.svg|browserconfig.xml|site.webmanifest).*)',
  ],
};
