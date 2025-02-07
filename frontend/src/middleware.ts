import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

// Store for rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.timestamp > RATE_LIMIT_WINDOW) {
      rateLimit.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Get IP from headers or fallback to forwarded-for or remote address
  const ip = request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             'anonymous';
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  // Get current rate limit data
  const rateLimitData = rateLimit.get(key) ?? { count: 0, timestamp: now };

  // Reset if outside window
  if (now - rateLimitData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitData.count = 0;
    rateLimitData.timestamp = now;
  }

  // Increment request count
  rateLimitData.count++;

  // Update rate limit data
  rateLimit.set(key, rateLimitData);

  // Create response
  const response = NextResponse.next();

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - rateLimitData.count).toString());
  response.headers.set('X-RateLimit-Reset', (rateLimitData.timestamp + RATE_LIMIT_WINDOW).toString());

  // Check if rate limit exceeded
  if (rateLimitData.count > MAX_REQUESTS) {
    // Return rate limit response
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitData.timestamp + RATE_LIMIT_WINDOW - now) / 1000).toString(),
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (rateLimitData.timestamp + RATE_LIMIT_WINDOW).toString(),
        },
      }
    );
  }

  return response;
}

// Configure which paths the middleware applies to
export const config = {
  matcher: '/api/:path*',
};
