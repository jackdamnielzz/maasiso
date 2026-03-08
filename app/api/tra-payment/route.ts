import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { validateDiscountCode } from '@/lib/tools/discount-codes';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});

const PRICE_EXCL_BTW = 0.01; // TEMP: test pricing — revert to 19.00
const BTW_RATE = 0.21;
const PRICE = (PRICE_EXCL_BTW * (1 + BTW_RATE)).toFixed(2); // 22.99 incl. BTW
const CURRENCY = 'EUR';

export async function POST(request: NextRequest) {
  try {
    const { email, discountCode } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Geldig e-mailadres is verplicht' },
        { status: 400 }
      );
    }

    // Check discount code
    const discount = discountCode ? validateDiscountCode(discountCode) : null;

    if (discount && discount.percentOff === 100) {
      // Free — skip Mollie entirely
      const freePaymentId = `free_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return NextResponse.json({
        paymentId: freePaymentId,
        free: true,
      });
    }

    // Calculate discounted price
    let finalPrice = PRICE;
    if (discount) {
      const discountedExcl = PRICE_EXCL_BTW * (1 - discount.percentOff / 100);
      finalPrice = (discountedExcl * (1 + BTW_RATE)).toFixed(2);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const isLocalhost = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');

    const description = discount
      ? `TRA Risicoscore Rapport - MaasISO (${discount.label})`
      : 'TRA Risicoscore Rapport - MaasISO';

    const paymentData: Parameters<typeof mollieClient.payments.create>[0] = {
      amount: {
        currency: CURRENCY,
        value: finalPrice,
      },
      description,
      redirectUrl: `${siteUrl}/tools/risicoscore-calculator/bedankt`,
      metadata: {
        email,
        product: 'tra-report',
        ...(discount ? { discountCode: discount.code, percentOff: discount.percentOff } : {}),
      },
    };

    if (!isLocalhost) {
      paymentData.webhookUrl = `${siteUrl}/api/tra-webhook`;
    }

    const payment = await mollieClient.payments.create(paymentData);

    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Mollie payment creation failed:', message, error);
    return NextResponse.json(
      { error: 'Betaling aanmaken mislukt. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
