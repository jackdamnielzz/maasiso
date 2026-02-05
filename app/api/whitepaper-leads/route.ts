import { NextRequest, NextResponse } from 'next/server';

interface WhitepaperLeadPayload {
  name: string;
  email: string;
  company?: string;
  subscribeNewsletter?: boolean;
  whitepaperTitle: string;
}

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(value: string): string {
  return value.trim();
}

function validatePayload(body: WhitepaperLeadPayload): string | null {
  if (!body.name || !body.email || !body.whitepaperTitle) {
    return 'Naam, e-mailadres en whitepaper zijn verplicht.';
  }

  if (!isValidEmail(body.email)) {
    return 'Ongeldig e-mailadres.';
  }

  if (body.name.length > 120 || (body.company && body.company.length > 120) || body.whitepaperTitle.length > 200) {
    return 'Ingevoerde gegevens zijn te lang.';
  }

  return null;
}

function getStrapiBaseUrl(): string | null {
  const baseUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) return null;
  return baseUrl.replace(/\/+$/g, '');
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Te veel aanvragen. Probeer het later opnieuw.' },
      { status: 429 }
    );
  }

  let body: WhitepaperLeadPayload;
  try {
    body = (await request.json()) as WhitepaperLeadPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Ongeldige aanvraag.' },
      { status: 400 }
    );
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 }
    );
  }

  const strapiBaseUrl = getStrapiBaseUrl();
  const strapiToken = process.env.STRAPI_TOKEN;

  if (!strapiBaseUrl || !strapiToken) {
    console.error('[Whitepaper Leads API] Ontbrekende serverconfiguratie');
    return NextResponse.json(
      { success: false, error: 'Serverconfiguratie ontbreekt.' },
      { status: 500 }
    );
  }

  const leadBody = {
    data: {
      name: sanitize(body.name),
      email: sanitize(body.email),
      company: body.company ? sanitize(body.company) : '',
      subscribeNewsletter: Boolean(body.subscribeNewsletter),
      whitepaperTitle: sanitize(body.whitepaperTitle),
      downloadDate: new Date().toISOString(),
    },
  };

  try {
    const leadResponse = await fetch(`${strapiBaseUrl}/api/whitepaper-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${strapiToken}`,
      },
      body: JSON.stringify(leadBody),
      cache: 'no-store',
    });

    if (!leadResponse.ok) {
      console.error('[Whitepaper Leads API] Strapi whitepaper-leads request failed', {
        status: leadResponse.status,
      });
      return NextResponse.json(
        { success: false, error: 'Aanvraag kon niet worden verwerkt.' },
        { status: 502 }
      );
    }

    if (body.subscribeNewsletter) {
      const newsletterResponse = await fetch(`${strapiBaseUrl}/api/newsletter-subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${strapiToken}`,
        },
        body: JSON.stringify({
          data: {
            email: sanitize(body.email),
            name: sanitize(body.name),
            company: body.company ? sanitize(body.company) : '',
            source: 'whitepaper_download',
            subscriptionDate: new Date().toISOString(),
          },
        }),
        cache: 'no-store',
      });

      if (!newsletterResponse.ok) {
        console.error('[Whitepaper Leads API] Newsletter subscription failed', {
          status: newsletterResponse.status,
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Whitepaper Leads API] Onverwachte fout', {
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { success: false, error: 'Aanvraag kon niet worden verwerkt.' },
      { status: 500 }
    );
  }
}
