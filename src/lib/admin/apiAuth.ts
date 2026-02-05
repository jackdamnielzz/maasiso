import { NextResponse } from 'next/server';

import { getBearerToken, verifyAdminToken } from './auth';

export function requireAdminAuth(request: Request): NextResponse | null {
  const token = getBearerToken(request.headers.get('Authorization'));
  const result = verifyAdminToken(token);
  if (result.ok) return null;

  if (result.error === 'misconfigured') {
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const status = result.error === 'missing' ? 401 : 403;
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status });
}

export function guardDebugEndpoint(request: Request): NextResponse | null {
  const isProduction = process.env.NODE_ENV === 'production';
  const enabled = process.env.ENABLE_DEBUG_ENDPOINTS === 'true';

  if (isProduction && !enabled) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (isProduction) {
    return requireAdminAuth(request);
  }

  return null;
}
