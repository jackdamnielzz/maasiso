import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { sendTraConfirmationEmail } from '@/lib/tools/send-tra-confirmation';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

type TraMetadata = {
  email?: string;
  projectName?: string;
  confirmationEmailSentAt?: string;
};

export async function POST(request: NextRequest) {
  let paymentId: string | null = null;
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    paymentId = params.get('id');

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
    }

    const payment = await mollieClient.payments.get(paymentId);

    if (payment.status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    const metadata = (payment.metadata ?? {}) as TraMetadata;

    // Al verstuurd (eerdere webhook-poging of de bedankt-pagina was eerder)
    if (metadata.confirmationEmailSentAt) {
      return NextResponse.json({ received: true });
    }

    if (!metadata.email) {
      console.error(`[TRA-ALERT] Payment ${paymentId} is paid maar metadata bevat geen e-mailadres — kan bevestiging niet versturen`);
      return NextResponse.json({ received: true });
    }

    await sendTraConfirmationEmail({
      email: metadata.email,
      paymentId,
      projectName: metadata.projectName,
      amountInclBtw: payment.amount?.value ? parseFloat(payment.amount.value) : undefined,
    });
    console.log(`[TRA] Bevestigingsmail + factuur verstuurd via webhook voor ${paymentId} naar ${metadata.email}`);

    // Markeer als verstuurd zodat de bedankt-pagina niet dubbel mailt (best effort)
    try {
      await mollieClient.payments.update(paymentId, {
        metadata: { ...metadata, confirmationEmailSentAt: new Date().toISOString() },
      });
    } catch (updateError) {
      console.error(`[TRA] Metadata-update mislukt voor ${paymentId} (e-mail is wel verstuurd):`, updateError);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Niet-200 laat Mollie de webhook opnieuw proberen (tot ~26 uur) — gratis retry-vangnet
    console.error(`[TRA-ALERT] Webhook-verwerking mislukt voor ${paymentId ?? 'onbekend'}:`, error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
