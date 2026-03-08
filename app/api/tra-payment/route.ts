import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

const PRICE = '19.00';
const CURRENCY = 'EUR';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Geldig e-mailadres is verplicht' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const isLocalhost = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');

    // First create payment with a temporary redirect URL
    const paymentData: Parameters<typeof mollieClient.payments.create>[0] = {
      amount: {
        currency: CURRENCY,
        value: PRICE,
      },
      description: 'TRA Risicoscore Rapport - MaasISO',
      // Use a placeholder — we'll set the real redirect from the client side
      redirectUrl: `${siteUrl}/tools/risicoscore-calculator/bedankt`,
      metadata: {
        email,
        product: 'tra-report',
      },
    };

    // Mollie rejects localhost webhook URLs — only set in production
    if (!isLocalhost) {
      paymentData.webhookUrl = `${siteUrl}/api/tra-webhook`;
    }

    const payment = await mollieClient.payments.create(paymentData);

    // Update the redirect URL with the actual payment ID
    await mollieClient.payments.update(payment.id, {
      redirectUrl: `${siteUrl}/tools/risicoscore-calculator/bedankt?id=${payment.id}`,
    });

    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(),
    });
  } catch (error) {
    console.error('Mollie payment creation failed:', error);
    return NextResponse.json(
      { error: 'Betaling aanmaken mislukt. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
