import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const paymentId = params.get('id');

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
    }

    const payment = await mollieClient.payments.get(paymentId);

    if (payment.status === 'paid') {
      const metadata = payment.metadata as { email?: string };
      console.log(`[TRA] Payment ${paymentId} is paid. Email: ${metadata?.email}`);

      // TODO: Send email with PDF via Resend when server-side PDF generation is added
      // For now, the client generates and downloads the PDF after payment verification
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
