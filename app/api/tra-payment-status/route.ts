import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { verifyFreeToken } from '@/lib/tools/tra-free-token';

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

    // Free discount codes generate a signed local token (not a Mollie payment)
    if (paymentId.startsWith('free_')) {
      const token = verifyFreeToken(paymentId);
      if (!token.valid) {
        return NextResponse.json(
          { error: 'Ongeldig betalingskenmerk' },
          { status: 403 }
        );
      }
      return NextResponse.json({
        status: 'paid',
        paid: true,
        email: token.email,
        amount: '0.00',
      });
    }

    const payment = await mollieClient.payments.get(paymentId);

    return NextResponse.json({
      status: payment.status,
      paid: payment.status === 'paid',
      email: (payment.metadata as { email?: string })?.email || null,
      amount: payment.amount?.value ?? null,
    });
  } catch (error) {
    console.error('Payment status check failed:', error);
    return NextResponse.json(
      { error: 'Betaalstatus ophalen mislukt' },
      { status: 500 }
    );
  }
}
