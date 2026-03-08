import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is verplicht' },
        { status: 400 }
      );
    }

    const payment = await mollieClient.payments.get(paymentId);

    return NextResponse.json({
      status: payment.status,
      paid: payment.status === 'paid',
      email: (payment.metadata as { email?: string })?.email || null,
    });
  } catch (error) {
    console.error('Payment status check failed:', error);
    return NextResponse.json(
      { error: 'Betaalstatus ophalen mislukt' },
      { status: 500 }
    );
  }
}
