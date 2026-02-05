import type { Metadata } from 'next';
import Link from 'next/link';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

export const metadata: Metadata = {
  title: 'ISO-Selector | MaasISO',
  description:
    'Gebruik de ISO-Selector om snel inzicht te krijgen in welke ISO-normen relevant zijn voor uw organisatie.',
  alternates: {
    canonical: '/iso-selector',
  },
};

export default function IsoSelectorPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'ISO-Selector', href: '/iso-selector' },
        ]}
      />

      <section className="py-16 md:py-24">
        <div className="container-custom max-w-3xl text-center">
          <p className="inline-flex items-center rounded-full bg-[#091E42]/10 px-4 py-1 text-sm font-medium text-[#091E42]">
            Tool
          </p>
          <h1 className="mt-4 text-4xl font-bold text-[#091E42] md:text-5xl">
            ISO-Selector
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#091E42]/80">
            Met de ISO-Selector bepaalt u in enkele stappen welke normen het beste aansluiten
            op uw organisatie, risico&apos;s en doelstellingen.
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              href="https://iso-selector.maasiso.nl/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-[#FF8B00] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#FF9B20]"
            >
              Open de ISO-Selector
            </Link>
          </div>

          <p className="mt-4 text-sm text-[#091E42]/60">
            De tool opent in een nieuw tabblad.
          </p>
        </div>
      </section>
    </main>
  );
}
