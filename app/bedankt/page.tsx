import type { Metadata } from 'next';
import Link from 'next/link';
import BedanktTracking from './BedanktTracking';

interface BedanktPageProps {
  searchParams: {
    source?: string;
    norm?: string;
  };
}

export const metadata: Metadata = {
  title: 'Bedankt | MaasISO',
  description: 'Bedankt voor je aanvraag bij MaasISO.',
  alternates: {
    canonical: '/bedankt',
  },
};

export default function BedanktPage({ searchParams }: BedanktPageProps) {
  const source = typeof searchParams?.source === 'string' ? searchParams.source : undefined;
  const norm = typeof searchParams?.norm === 'string' ? searchParams.norm : undefined;
  const isCalendlyIso9001 = source === 'calendly' && norm === 'iso9001';

  return (
    <main className="flex-1 bg-gradient-to-b from-[#f5faff] via-white to-[#f7fcfa] py-16 md:py-24">
      <BedanktTracking source={source} norm={norm} />
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(9,30,66,0.08)]">
          <div className="h-2 bg-gradient-to-r from-[#00875A] via-[#14a271] to-[#FF8B00]"></div>
          <div className="p-8 text-center md:p-12">
            <h1 className="text-3xl font-bold text-[#091E42] md:text-4xl">Bedankt voor je aanvraag</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-lg">
              {isCalendlyIso9001
                ? 'Je afspraak is ontvangen. We zien je snel in het kennismakingsgesprek.'
                : 'We hebben je aanvraag goed ontvangen en nemen zo snel mogelijk contact op.'}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/iso-certificering/iso-9001/" className="primary-button text-center sm:min-w-[220px]">
                Terug naar ISO 9001
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-[#091E42]/30 bg-white px-5 py-3 text-sm font-semibold text-[#091E42] transition hover:bg-slate-50 sm:min-w-[220px]"
              >
                Naar contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
