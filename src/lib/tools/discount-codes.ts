export interface DiscountCode {
  code: string;
  percentOff: number; // 100 = gratis
  label: string;
}

// Server-side only — niet importeren in client components
const DISCOUNT_CODES: DiscountCode[] = [
  { code: 'MAASISO100', percentOff: 100, label: 'Gratis (intern testen)' },
];

export function validateDiscountCode(input: string): DiscountCode | null {
  const normalized = input.trim().toUpperCase();
  return DISCOUNT_CODES.find((d) => d.code === normalized) ?? null;
}
