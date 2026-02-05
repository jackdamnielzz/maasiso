import crypto from 'crypto';

type AdminTokenPayloadV1 = {
  v: 1;
  sub: 'admin';
  iat: number;
  exp: number;
};

type VerifyOk = {
  ok: true;
  issuedAt: number;
  expiresAt: number;
};

type VerifyError =
  | { ok: false; error: 'missing' }
  | { ok: false; error: 'misconfigured' }
  | { ok: false; error: 'malformed' }
  | { ok: false; error: 'invalid' }
  | { ok: false; error: 'expired' };

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

function getAdminTokenSecret(): string | null {
  const secret = (process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || '').trim();
  if (!secret) return null;
  return secret;
}

function base64UrlEncode(input: Buffer | string): string {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64');
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminToken(nowMs: number = Date.now()): string {
  const secret = getAdminTokenSecret();
  if (!secret) {
    throw new Error('Admin token secret not configured (set ADMIN_PASSWORD or ADMIN_TOKEN_SECRET)');
  }

  const payload: AdminTokenPayloadV1 = {
    v: 1,
    sub: 'admin',
    iat: nowMs,
    exp: nowMs + TOKEN_TTL_MS,
  };

  const payloadJson = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(payloadJson).digest();

  return `${base64UrlEncode(payloadJson)}.${base64UrlEncode(sig)}`;
}

export function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)\s*$/i);
  if (!match) return null;
  return match[1] ?? null;
}

export function verifyAdminToken(token: string | null, nowMs: number = Date.now()): VerifyOk | VerifyError {
  if (!token) return { ok: false, error: 'missing' };

  const secret = getAdminTokenSecret();
  if (!secret) return { ok: false, error: 'misconfigured' };

  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, error: 'malformed' };

  const [payloadB64, sigB64] = parts;

  try {
    const payloadJson = base64UrlDecode(payloadB64).toString('utf8');
    const providedSig = base64UrlDecode(sigB64);
    const expectedSig = crypto.createHmac('sha256', secret).update(payloadJson).digest();

    if (!timingSafeEqual(providedSig, expectedSig)) {
      return { ok: false, error: 'invalid' };
    }

    const payload = JSON.parse(payloadJson) as Partial<AdminTokenPayloadV1>;
    if (payload.v !== 1 || payload.sub !== 'admin') return { ok: false, error: 'invalid' };
    if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return { ok: false, error: 'invalid' };

    if (payload.iat > nowMs + MAX_CLOCK_SKEW_MS) return { ok: false, error: 'invalid' };
    if (payload.exp <= nowMs) return { ok: false, error: 'expired' };

    return { ok: true, issuedAt: payload.iat, expiresAt: payload.exp };
  } catch {
    return { ok: false, error: 'invalid' };
  }
}

