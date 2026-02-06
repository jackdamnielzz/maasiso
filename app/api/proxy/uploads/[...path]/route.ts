import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CACHE_MAX_AGE = 31_536_000;
const MAX_PATH_LENGTH = 512;
const SAFE_PATH_PATTERN = /^[A-Za-z0-9/_\-.]+$/;
const MEDIA_EXTENSION_PATTERN = /\.(avif|bmp|gif|ico|jpe?g|pdf|png|svg|webm|webp)$/i;

type RouteSegment = {
  path: string[];
};

function sanitizeUploadPath(pathSegments: string[]): string | null {
  if (pathSegments.length === 0) {
    return null;
  }

  const rawPath = pathSegments.join('/');
  const normalizedPath = rawPath
    .replace(/^\/+/, '')
    .replace(/^uploads\//, '')
    .replace(/\/{2,}/g, '/')
    .replace(/^api\//, '');

  if (!normalizedPath || normalizedPath.length > MAX_PATH_LENGTH) {
    return null;
  }

  if (
    normalizedPath.includes('..') ||
    normalizedPath.includes('\\') ||
    normalizedPath.includes('?') ||
    normalizedPath.includes('#') ||
    !SAFE_PATH_PATTERN.test(normalizedPath) ||
    !MEDIA_EXTENSION_PATTERN.test(normalizedPath)
  ) {
    return null;
  }

  return normalizedPath;
}

function copyHeaderIfPresent(target: Headers, source: Headers, headerName: string): void {
  const value = source.get(headerName);
  if (value) {
    target.set(headerName, value);
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<RouteSegment> }
): Promise<Response> {
  const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!strapiUrl) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const params = await context.params;
  const mediaPath = sanitizeUploadPath(params.path);
  if (!mediaPath) {
    return NextResponse.json({ error: 'Invalid media path' }, { status: 400 });
  }

  const upstreamUrl = `${strapiUrl.replace(/\/+$/, '')}/uploads/${mediaPath}`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Accept: '*/*',
      },
      next: {
        revalidate: CACHE_MAX_AGE,
      },
    });

    if (!upstreamResponse.ok) {
      if (upstreamResponse.status === 404) {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 });
      }

      return NextResponse.json({ error: 'Upstream media request failed' }, { status: 502 });
    }

    const responseHeaders = new Headers({
      'Content-Type': upstreamResponse.headers.get('content-type') || 'application/octet-stream',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
      'X-Content-Type-Options': 'nosniff',
    });

    copyHeaderIfPresent(responseHeaders, upstreamResponse.headers, 'content-length');
    copyHeaderIfPresent(responseHeaders, upstreamResponse.headers, 'etag');
    copyHeaderIfPresent(responseHeaders, upstreamResponse.headers, 'last-modified');
    copyHeaderIfPresent(responseHeaders, upstreamResponse.headers, 'accept-ranges');

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Media Upload Proxy] Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
