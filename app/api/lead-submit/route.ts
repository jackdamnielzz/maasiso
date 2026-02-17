import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type LeadSource = 'exit_intent' | 'sticky_panel' | 'sticky_bottom' | 'iso9001-exit-intent';
type CompanySize = '1-10' | '10-50' | '50+';

interface LeadSubmitPayload {
  name?: string;
  email: string;
  phone?: string;
  company_size?: CompanySize | string;
  company_name?: string;
  source: LeadSource;
  page: string;
  timestamp: string;
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const DEFAULT_SMTP_HOST = 'smtp.hostinger.com';
const DEFAULT_SMTP_PORT = 465;
const DEFAULT_EMAIL_USER = 'info@maasiso.nl';

const validSources = new Set<LeadSource>([
  'exit_intent',
  'sticky_panel',
  'sticky_bottom',
  'iso9001-exit-intent',
]);
const validCompanySizes = new Set<CompanySize>(['1-10', '10-50', '50+']);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return false;
}

function validatePayload(body: LeadSubmitPayload): string | null {
  if (!body?.email || !body?.source || !body?.page || !body?.timestamp) {
    return 'Alle verplichte velden zijn verplicht.';
  }

  const isQuickscanLead = body.source === 'iso9001-exit-intent';
  const trimmedName = String(body.name || '').trim();
  const trimmedEmail = String(body.email).trim();
  const trimmedPhone = String(body.phone || '').trim();

  if (!validSources.has(body.source as LeadSource)) {
    return 'Ongeldige bron voor dit leadformulier.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return 'Ongeldig e-mailadres.';
  }

  if (isQuickscanLead) {
    const trimmedCompanyName = String(body.company_name || '').trim();
    if (trimmedCompanyName.length > 180) {
      return 'Bedrijfsnaam is te lang.';
    }
  } else {
    if (!trimmedName || trimmedName.length > 120) {
      return 'Ongeldige naam.';
    }

    if (!trimmedPhone || trimmedPhone.length > 40) {
      return 'Ongeldig telefoonnummer.';
    }

    if (body.company_size && !validCompanySizes.has(body.company_size as CompanySize)) {
      return 'Ongeldige waarde voor aantal FTE.';
    }
  }

  if (Number.isNaN(Date.parse(body.timestamp))) {
    return 'Ongeldige timestamp.';
  }

  if (body.page.length > 500 || body.page.indexOf('..') !== -1) {
    return 'Ongeldige paginareferentie.';
  }

  return null;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Te veel aanvragen. Probeer het later opnieuw.' },
      { status: 429 }
    );
  }

  let body: LeadSubmitPayload;

  try {
    body = (await request.json()) as LeadSubmitPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Ongeldige aanvraag.' },
      { status: 400 }
    );
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  const emailUser = String(
    process.env.EMAIL_USER || process.env.SMTP_USER || DEFAULT_EMAIL_USER
  ).trim();
  const emailPassword = String(
    process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || ''
  ).trim();
  const smtpHost = String(
    process.env.EMAIL_SMTP_HOST || process.env.SMTP_HOST || DEFAULT_SMTP_HOST
  ).trim();
  const smtpPortRaw = Number(
    process.env.EMAIL_SMTP_PORT || process.env.SMTP_PORT || DEFAULT_SMTP_PORT
  );
  const smtpPort = Number.isFinite(smtpPortRaw) ? smtpPortRaw : DEFAULT_SMTP_PORT;
  const leadRecipient = String(
    process.env.LEADS_EMAIL_TO || process.env.LEAD_EMAIL_TO || process.env.LEAD_TO || emailUser
  ).trim();

  if (!emailPassword) {
    console.error('[Lead Submit] EMAIL_PASSWORD ontbreekt');
    return NextResponse.json(
      { success: false, error: 'Lead kon niet worden verwerkt. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }

  const isQuickscanLead = body.source === 'iso9001-exit-intent';
  const sanitizedName = String(body.name || '').trim();
  const sanitizedEmail = String(body.email).trim();
  const sanitizedPhone = String(body.phone || '').trim();
  const sanitizedCompanySize = body.company_size ? String(body.company_size).trim() : '';
  const sanitizedCompanyName = body.company_name ? String(body.company_name).trim() : '';

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    debug: false,
    logger: false,
  });

  const subject = isQuickscanLead
    ? 'Nieuwe lead van website (ISO 9001 quickscan)'
    : 'Nieuwe lead van website (ISO 9001 exit intent)';

  const textBody = isQuickscanLead
    ? `E-mail: ${sanitizedEmail}\nBedrijfsnaam: ${sanitizedCompanyName || 'Niet opgegeven'}\nBron: ${body.source}\nPagina: ${body.page}\nTijd: ${body.timestamp}`
    : `Naam: ${sanitizedName}\nE-mail: ${sanitizedEmail}\nTelefoon: ${sanitizedPhone}\nAantal FTE: ${sanitizedCompanySize || 'Niet opgegeven'}\nBron: ${body.source}\nPagina: ${body.page}\nTijd: ${body.timestamp}`;

  const htmlRows = isQuickscanLead
    ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; width: 130px;"><strong>E-mail</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Bedrijfsnaam</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${sanitizedCompanyName || 'Niet opgegeven'}</td>
          </tr>
      `
    : `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; width: 130px;"><strong>Naam</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${sanitizedName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>E-mail</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Telefoon</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${sanitizedPhone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Aantal FTE</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${sanitizedCompanySize || 'Niet opgegeven'}</td>
          </tr>
      `;

  const mailOptions = {
    from: `"MaasISO Website" <${emailUser}>`,
    to: leadRecipient,
    replyTo: sanitizedEmail,
    subject,
    text: textBody,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #091E42;">
        <h2 style="color: #091E42;">Nieuwe lead via website formulier</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${htmlRows}
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Bron</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.source}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pagina</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.page}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tijdstip</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.timestamp}</td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Lead ontvangen' }, { status: 200 });
  } catch (error) {
    console.error('[Lead Submit] Versturen mislukt', {
      emailUser,
      smtpHost,
      smtpPort,
      recipient: leadRecipient,
      source: body.source,
      error,
    });
    return NextResponse.json(
      { success: false, error: 'Lead kon niet worden verzonden. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
