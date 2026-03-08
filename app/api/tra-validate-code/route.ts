import { NextRequest, NextResponse } from 'next/server';
import { validateDiscountCode } from '@/lib/tools/discount-codes';

const PRICE_EXCL_BTW = 19.0;
const BTW_RATE = 0.21;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Voer een kortingscode in' });
    }

    const discount = validateDiscountCode(code);
    if (!discount) {
      return NextResponse.json({ valid: false, error: 'Ongeldige kortingscode' });
    }

    const discountedExcl = PRICE_EXCL_BTW * (1 - discount.percentOff / 100);
    const discountedIncl = Math.round(discountedExcl * (1 + BTW_RATE) * 100) / 100;

    return NextResponse.json({
      valid: true,
      percentOff: discount.percentOff,
      label: discount.label,
      priceInclBtw: discountedIncl,
    });
  } catch {
    return NextResponse.json({ valid: false, error: 'Er ging iets mis' }, { status: 500 });
  }
}
