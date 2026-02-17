import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot
}

interface EmailError {
  code?: string;
  name?: string;
  message?: string;
}

const validSubjects = new Set([
  'ISO 27001',
  'ISO 9001',
  'ISO 14001',
  'Informatiebeveiliging',
  'Compliance',
  'Privacy/AVG',
  'Advies',
  'Samenwerking',
  'Anders',
]);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const DEFAULT_SMTP_HOST = 'smtp.office365.com';
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_EMAIL_USER = 'NielsMaas@MaasISO.onmicrosoft.com';
const DEFAULT_EMAIL_FROM = 'info@maasiso.nl';

function normalizeEnvValue(raw: string | undefined): string {
  return String(raw || '')
    .replace(/\\r|\\n/g, '')
    .replace(/[\r\n]/g, '')
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

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

function validatePayload(body: ContactFormData): string | null {
  if (!body.name || !body.email || !body.subject || !body.message) {
    return 'Alle velden zijn verplicht.';
  }

  if (body.name.length > 120 || body.subject.length > 120 || body.message.length > 5000) {
    return 'Ingevoerde gegevens zijn te lang.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return 'Ongeldig e-mailadres.';
  }

  if (!validSubjects.has(body.subject)) {
    return 'Selecteer een geldig onderwerp.';
  }

  return null;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: 'Te veel aanvragen. Probeer het later opnieuw.' },
      { status: 429 }
    );
  }

  let body: ContactFormData;
  try {
    body = (await request.json()) as ContactFormData;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Ongeldige aanvraag.' },
      { status: 400 }
    );
  }

  // Honeypot field for simple bot filtering.
  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json(
      { success: true, message: 'Uw bericht is succesvol verzonden.' },
      { status: 200 }
    );
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return NextResponse.json(
      { success: false, message: validationError },
      { status: 400 }
    );
  }

  const emailUser = normalizeEnvValue(
    process.env.EMAIL_USER || process.env.SMTP_USER || DEFAULT_EMAIL_USER
  );
  const emailPassword = normalizeEnvValue(
    process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || ''
  );
  const smtpHost = normalizeEnvValue(
    process.env.EMAIL_SMTP_HOST || process.env.SMTP_HOST || DEFAULT_SMTP_HOST
  );
  const smtpPortRaw = Number(
    normalizeEnvValue(
      process.env.EMAIL_SMTP_PORT || process.env.SMTP_PORT || String(DEFAULT_SMTP_PORT)
    )
  );
  const smtpPort = Number.isFinite(smtpPortRaw) ? smtpPortRaw : DEFAULT_SMTP_PORT;
  const emailFrom = normalizeEnvValue(
    process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM
  );
  const contactRecipient = normalizeEnvValue(
    process.env.CONTACT_EMAIL_TO || process.env.CONTACT_TO || emailUser
  );

  if (!emailUser || !emailPassword || !smtpHost) {
    console.error('[Contact API] Ontbrekende SMTP-configuratie', {
      hasEmailUser: Boolean(emailUser),
      hasEmailPassword: Boolean(emailPassword),
      smtpHost,
      smtpPort,
    });
    return NextResponse.json(
      {
        success: false,
        message:
          'E-mailinstellingen niet compleet. Controleer EMAIL_USER, EMAIL_PASSWORD en SMTP instellingen.',
      },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    tls: {
      ciphers: 'SSLv3',
    },
    debug: false,
    logger: false,
  });

  const sanitizedName = body.name.trim();
  const sanitizedEmail = body.email.trim();
  const sanitizedSubject = body.subject.trim();
  const sanitizedMessage = body.message.trim();

  const mailOptions = {
    from: `"MaasISO Website" <${emailFrom}>`,
    to: contactRecipient,
    replyTo: sanitizedEmail,
    subject: `Contactformulier: ${sanitizedSubject}`,
    text: `Naam: ${sanitizedName}\nE-mail: ${sanitizedEmail}\nOnderwerp: ${sanitizedSubject}\n\nBericht:\n${sanitizedMessage}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #091E42;">Nieuw bericht via contactformulier</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; width: 120px;"><strong>Naam:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${sanitizedName}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>E-mail:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${sanitizedEmail}" style="color: #FF8B00;">${sanitizedEmail}</a></td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Onderwerp:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${sanitizedSubject}</td>
    </tr>
  </table>
  <div style="margin-top: 20px;">
    <strong>Bericht:</strong>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
      ${sanitizedMessage.replace(/\n/g, '<br>')}
    </div>
  </div>
</div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: 'Uw bericht is succesvol verzonden. We nemen zo snel mogelijk contact met u op.',
      },
      { status: 200 }
    );
  } catch (error) {
    const emailError = error as EmailError;
    const code = emailError.code;

    let message =
      'Er is een fout opgetreden bij het versturen van de e-mail. Probeer het later opnieuw.';

    if (code === 'EAUTH') {
      message =
        'SMTP-authenticatie mislukt (inloggegevens fout). Controleer USER en PASSWORD in TransIP/SMTP.';
    } else if (code === 'ENOTFOUND') {
      message = 'SMTP-host niet gevonden. Controleer SMTP_HOST instelling.';
    } else if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
      message = 'Kan geen verbinding maken met SMTP-server. Controleer host/poort en firewall.';
    }

    console.error('[Contact API] Verzenden mislukt', {
      emailUser,
      smtpHost,
      smtpPort,
      recipient: contactRecipient,
      code,
      name: emailError.name,
      errorMessage: emailError.message,
    });

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
