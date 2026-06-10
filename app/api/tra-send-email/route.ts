import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { verifyFreeToken } from '@/lib/tools/tra-free-token';
import { sendTraConfirmationEmail } from '@/lib/tools/send-tra-confirmation';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
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

type TraMetadata = {
  email?: string;
  projectName?: string;
  confirmationEmailSentAt?: string;
};

// Fallback-levering vanaf de bedankt-pagina. De Mollie-webhook is het primaire pad;
// deze route dekt de gratis kortingsflow (geen Mollie-betaling, dus geen webhook) en
// gevallen waarin de webhook nog niet gedraaid heeft. De paymentId wordt altijd
// server-side geverifieerd; het ontvangstadres komt uit de betaling zelf, nooit uit de body.
export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json(
        { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
        { status: 429 }
      );
    }

    const { paymentId, projectName } = await request.json();

    if (!paymentId || typeof paymentId !== 'string') {
      return NextResponse.json({ error: 'paymentId is verplicht' }, { status: 400 });
    }

    const projectNameSafe = typeof projectName === 'string' ? projectName.slice(0, 120) : undefined;

    // Gratis kortingsflow: ondertekend token bevat het e-mailadres
    if (paymentId.startsWith('free_')) {
      const token = verifyFreeToken(paymentId);
      if (!token.valid || !token.email) {
        return NextResponse.json({ error: 'Ongeldig betalingskenmerk' }, { status: 403 });
      }
      await sendTraConfirmationEmail({
        email: token.email,
        paymentId,
        projectName: projectNameSafe,
        amountInclBtw: 0,
      });
      console.log(`[TRA] Bevestigingsmail verstuurd (gratis flow) voor ${paymentId}`);
      return NextResponse.json({ sent: true });
    }

    // Mollie-betaling: status én e-mailadres server-side verifiëren
    const payment = await mollieClient.payments.get(paymentId);

    if (payment.status !== 'paid') {
      return NextResponse.json({ error: 'Betaling is niet voltooid' }, { status: 403 });
    }

    const metadata = (payment.metadata ?? {}) as TraMetadata;

    if (metadata.confirmationEmailSentAt) {
      // Webhook was eerder — niet dubbel mailen
      return NextResponse.json({ sent: true, alreadySent: true });
    }

    if (!metadata.email) {
      return NextResponse.json({ error: 'Geen e-mailadres bekend bij deze betaling' }, { status: 422 });
    }

    await sendTraConfirmationEmail({
      email: metadata.email,
      paymentId,
      projectName: metadata.projectName ?? projectNameSafe,
      amountInclBtw: payment.amount?.value ? parseFloat(payment.amount.value) : undefined,
    });
    console.log(`[TRA] Bevestigingsmail + factuur verstuurd voor ${paymentId} naar ${metadata.email}`);

    try {
      await mollieClient.payments.update(paymentId, {
        metadata: { ...metadata, confirmationEmailSentAt: new Date().toISOString() },
      });
    } catch (updateError) {
      console.error(`[TRA] Metadata-update mislukt voor ${paymentId} (e-mail is wel verstuurd):`, updateError);
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('[TRA-ALERT] Email sending failed:', error);
    return NextResponse.json({ error: 'E-mail verzenden mislukt' }, { status: 500 });
  }
}
