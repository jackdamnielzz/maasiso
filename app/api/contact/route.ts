import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot
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

  const sanitizedName = body.name.trim();
  const sanitizedEmail = body.email.trim();
  const sanitizedSubject = body.subject.trim();
  const sanitizedMessage = body.message.trim();

  const emailFrom = process.env.EMAIL_FROM || 'info@maasiso.nl';
  const contactRecipient = process.env.CONTACT_EMAIL_TO || 'info@maasiso.nl';

  const htmlBody = `
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
  `;

  const textBody = `Naam: ${sanitizedName}\nE-mail: ${sanitizedEmail}\nOnderwerp: ${sanitizedSubject}\n\nBericht:\n${sanitizedMessage}`;

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey === '__SET_ME__') {
    console.error('[Contact API] RESEND_API_KEY is not configured.');
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden bij het versturen. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }

  const resend = new Resend(resendApiKey);

  let sendError: unknown = null;
  try {
    const { error } = await resend.emails.send({
      from: `MaasISO Website <${emailFrom}>`,
      to: [contactRecipient],
      replyTo: sanitizedEmail,
      subject: `Contactformulier: ${sanitizedSubject} - van ${sanitizedName}`,
      html: htmlBody,
      text: textBody,
    });
    sendError = error ?? null;
  } catch (err) {
    console.error('[Contact API] Resend threw an exception:', err);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden bij het versturen. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }

  if (sendError) {
    console.error('[Contact API] Resend error:', sendError);
    return NextResponse.json(
      { success: false, message: 'Er is een fout opgetreden bij het versturen. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Uw bericht is succesvol verzonden. We nemen zo snel mogelijk contact met u op.',
    },
    { status: 200 }
  );
}
