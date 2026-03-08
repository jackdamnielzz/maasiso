import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, getBearerToken, verifyAdminToken } from '@/lib/admin/auth';

// Simple admin authentication endpoint
// The password is stored in environment variable ADMIN_PASSWORD

export const runtime = 'nodejs';

// Rate limiting for login attempts (brute force protection)
const LOGIN_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const LOGIN_RATE_LIMIT_MAX = 5; // max 5 attempts per hour per IP
const loginRateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginRateLimitStore.get(ip);

  // Clean up old entries periodically
  if (loginRateLimitStore.size > 1000) {
    for (const [key, val] of loginRateLimitStore) {
      if (val.resetAt <= now) loginRateLimitStore.delete(key);
    }
  }

  if (!entry || entry.resetAt <= now) {
    loginRateLimitStore.set(ip, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= LOGIN_RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

const MAX_BODY_SIZE = 1024; // 1 KB max for login payload

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isLoginRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Te veel inlogpogingen. Probeer het over een uur opnieuw.' },
      { status: 429 }
    );
  }

  try {
    // Enforce body size limit
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Request te groot.' },
        { status: 413 }
      );
    }

    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      const sessionToken = createAdminToken();

      return NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        token: sessionToken
      });
    } else {
      // Generic error message to prevent user enumeration
      return NextResponse.json(
        { success: false, error: 'Ongeldige inloggegevens' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Verify token endpoint
export async function GET(request: NextRequest) {
  const token = getBearerToken(request.headers.get('Authorization'));
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'No token provided' },
      { status: 401 }
    );
  }
  
  const result = verifyAdminToken(token);

  if (result.ok) {
    return NextResponse.json({ success: true, message: 'Token valid' });
  }

  if (result.error === 'misconfigured') {
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const status = result.error === 'expired' ? 401 : 403;
  return NextResponse.json(
    { success: false, error: result.error },
    { status }
  );
}
