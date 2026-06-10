import { createHmac, timingSafeEqual } from 'crypto';

// Ondertekende tokens voor de 100%-kortingsflow. Een free_-id is geen Mollie-betaling,
// dus zonder handtekening zou iedereen via ?id=free_x de betaalmuur omzeilen.
// Formaat: free_<timestamp36>.<email-base64url>.<hmac16>

const TOKEN_VALIDITY_MS = 48 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.TRA_TOKEN_SECRET || process.env.MOLLIE_API_KEY;
  if (!secret) {
    throw new Error('TRA_TOKEN_SECRET of MOLLIE_API_KEY is niet geconfigureerd');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex').slice(0, 16);
}

export function createFreeToken(email: string): string {
  const ts = Date.now().toString(36);
  const emailEncoded = Buffer.from(email, 'utf8').toString('base64url');
  const payload = `free_${ts}.${emailEncoded}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyFreeToken(token: string): { valid: boolean; email: string | null } {
  const match = /^(free_([a-z0-9]+)\.([A-Za-z0-9_-]+))\.([a-f0-9]{16})$/.exec(token);
  if (!match) return { valid: false, email: null };

  const [, payload, ts, emailEncoded, sig] = match;

  const issuedAt = parseInt(ts, 36);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > TOKEN_VALIDITY_MS) {
    return { valid: false, email: null };
  }

  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
      return { valid: false, email: null };
    }
  } catch {
    return { valid: false, email: null };
  }

  return { valid: true, email: Buffer.from(emailEncoded, 'base64url').toString('utf8') };
}
