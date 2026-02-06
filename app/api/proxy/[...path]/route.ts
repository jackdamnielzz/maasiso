import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteSegment = {
  path: string[];
};

const ALLOWED_ENDPOINTS = new Set([
  'pages',
  'blog-posts',
  'news-articles',
  'authors',
  'tags',
  'categories',
  'whitepapers',
  'over-ons',
]);

const ALLOWED_QUERY_PREFIXES = new Set([
  'filters',
  'populate',
  'pagination',
  'sort',
  'fields',
  'locale',
  'publicationState',
  'status',
  'cacheBust',
]);

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.PROXY_RATE_LIMIT_MAX || 120);
const RATE_LIMIT_MAX_TRACKED_KEYS = Number(process.env.PROXY_RATE_LIMIT_MAX_KEYS || 5000);
const MAX_QUERY_LENGTH = Number(process.env.PROXY_MAX_QUERY_LENGTH || 2048);
const MAX_PATH_DEPTH = Number(process.env.PROXY_MAX_PATH_DEPTH || 6);
const MAX_PATH_SEGMENT_LENGTH = Number(process.env.PROXY_MAX_SEGMENT_LENGTH || 64);
const SAFE_PATH_SEGMENT_PATTERN = /^[A-Za-z0-9_-]+$/;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const PLACEHOLDER_TOKENS = new Set(['__set_me__', 'changeme', 'your_token_here']);

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

function enforceRateLimit(key: string): boolean {
  const now = Date.now();
  cleanupRateLimitStore(now);
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return true;
}

function cleanupRateLimitStore(now: number): void {
  if (rateLimitStore.size < RATE_LIMIT_MAX_TRACKED_KEYS) {
    return;
  }

  for (const [entryKey, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(entryKey);
    }
  }

  if (rateLimitStore.size <= RATE_LIMIT_MAX_TRACKED_KEYS) {
    return;
  }

  const overflow = rateLimitStore.size - RATE_LIMIT_MAX_TRACKED_KEYS;
  let removed = 0;
  for (const entryKey of rateLimitStore.keys()) {
    rateLimitStore.delete(entryKey);
    removed += 1;
    if (removed >= overflow) {
      break;
    }
  }
}

function isAllowedQuery(searchParams: URLSearchParams): boolean {
  for (const key of searchParams.keys()) {
    const prefix = key.split('[')[0];
    if (!ALLOWED_QUERY_PREFIXES.has(prefix)) {
      return false;
    }
  }

  return true;
}

function sanitizePath(pathSegments: string[]): string | null {
  if (pathSegments.length === 0 || pathSegments.length > MAX_PATH_DEPTH) return null;

  if (
    pathSegments.some(
      (segment) =>
        segment.length === 0 ||
        segment.length > MAX_PATH_SEGMENT_LENGTH ||
        segment.includes('..') ||
        segment.includes('\\') ||
        !SAFE_PATH_SEGMENT_PATTERN.test(segment)
    )
  ) {
    return null;
  }

  const endpoint = pathSegments[0];
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return null;
  }

  return pathSegments.join('/');
}

function isAuthorized(request: NextRequest): boolean {
  const requiredToken = process.env.PROXY_AUTH_TOKEN?.trim();
  if (!requiredToken) return true;

  const providedToken = request.headers.get('x-proxy-auth')?.trim();
  return !!providedToken && providedToken === requiredToken;
}

function getUsableStrapiToken(): string | null {
  const rawToken = process.env.STRAPI_TOKEN?.trim();
  if (!rawToken) return null;

  if (PLACEHOLDER_TOKENS.has(rawToken.toLowerCase())) {
    return null;
  }

  return rawToken;
}

function flattenBlogPostData(data: unknown): unknown {
  if (!Array.isArray(data)) return data;

  return data.map((post: any) => {
    const base = post?.attributes ? { ...post.attributes, id: post.id } : post;
    const featuredImage = base?.featuredImage?.data?.attributes
      ? { id: base.featuredImage.data.id, ...base.featuredImage.data.attributes }
      : base?.featuredImage;

    return {
      ...base,
      featuredImage,
    };
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteSegment> }
): Promise<Response> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  if (!enforceRateLimit(clientIp)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = getUsableStrapiToken();

  if (!strapiUrl) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const params = await context.params;
  const sanitizedPath = sanitizePath(params.path);
  if (!sanitizedPath) {
    return NextResponse.json({ error: 'Unsupported endpoint' }, { status: 403 });
  }

  if (!isAllowedQuery(request.nextUrl.searchParams)) {
    return NextResponse.json({ error: 'Unsupported query parameter' }, { status: 400 });
  }

  if (request.nextUrl.search.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'Query string too long' }, { status: 400 });
  }

  const targetUrl = `${strapiUrl}/api/${sanitizedPath}${request.nextUrl.search ? request.nextUrl.search : ''}`;

  try {
    const baseHeaders: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    let response = await fetch(targetUrl, {
      method: 'GET',
      headers: token
        ? {
            ...baseHeaders,
            Authorization: `Bearer ${token}`,
          }
        : baseHeaders,
      cache: 'no-store',
    });

    // Graceful recovery for public Strapi endpoints when a stale token is configured.
    if (response.status === 401 && token) {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: baseHeaders,
        cache: 'no-store',
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const responseBody = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Upstream request failed',
          status: response.status,
        },
        { status: response.status }
      );
    }

    if (isJson && sanitizedPath.startsWith('blog-posts')) {
      const data = responseBody as Record<string, unknown>;
      return NextResponse.json(
        {
          ...data,
          data: flattenBlogPostData(data.data),
        },
        { status: 200 }
      );
    }

    if (isJson) {
      return NextResponse.json(responseBody, { status: 200 });
    }

    return new NextResponse(String(responseBody), {
      status: 200,
      headers: { 'Content-Type': contentType || 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('[Proxy] Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
