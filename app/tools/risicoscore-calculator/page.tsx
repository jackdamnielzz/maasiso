import type { Metadata } from 'next';
import TRACalculator from '@/components/tools/TRACalculator';

export const metadata: Metadata = {
  title: 'TRA Risicoscore Calculator: Gratis Kinney & Wiruth Tool | MaasISO',
  description:
    'Gratis online TRA-calculator met Kinney & Wiruth methode. Voeg werkstappen toe, beoordeel gevaren (E × B × W), selecteer maatregelen en bekijk uw risicomatrix.',
  alternates: {
    canonical: '/tools/risicoscore-calculator/',
  },
  openGraph: {
    title: 'TRA Risicoscore Calculator | MaasISO',
    description:
      'Gratis online Taak Risico Analyse tool. Bereken risicoscores met de Kinney & Wiruth methode en stel maatregelen vast.',
    url: '/tools/risicoscore-calculator/',
    type: 'website',
  },
};

export default function RisicoscoreCalculatorPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-2">
        <nav className="text-sm text-gray-500">
          <a href="/" className="hover:text-[#091E42] transition-colors">Home</a>
          <span className="mx-2">/</span>
          <span className="text-[#091E42]">TRA Risicoscore Calculator</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pb-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#091E42]/10 text-[#091E42] mb-4">
            Gratis tool
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#091E42] mb-3">
            TRA Risicoscore Calculator
          </h1>
          <p className="text-gray-600">
            Stel uw Taak Risico Analyse (TRA) op met de Kinney &amp; Wiruth methode.
            Voeg werkstappen toe, beoordeel gevaren en bekijk direct uw risicoscores
            met kleurcodes en maatregelen-suggesties.
          </p>
        </div>

        <TRACalculator />
      </div>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'TRA Risicoscore Calculator',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
            },
            description:
              'Gratis online TRA-calculator met Kinney & Wiruth methode voor taak risico analyse.',
            provider: {
              '@type': 'Organization',
              name: 'MaasISO',
              url: 'https://www.maasiso.nl',
            },
          }),
        }}
      />
    </main>
  );
}
