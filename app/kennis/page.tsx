import type { Metadata } from 'next';
import Link from 'next/link';
import CoreBreadcrumbBar from '@/components/templates/core/CoreBreadcrumbBar';

export const metadata: Metadata = {
  title: 'Kennis & Resources | MaasISO',
  description:
    'Verdiep je in ISO-certificering, informatiebeveiliging en privacy via onze artikelen, whitepapers en trainingen.',
  alternates: {
    canonical: '/kennis',
  },
};

const knowledgeCards = [
  {
    title: 'Blog',
    description: 'Artikelen over actuele onderwerpen en praktische inzichten.',
    href: '/kennis/blog',
  },
  {
    title: 'Whitepapers',
    description: 'Diepgaande gidsen en downloads om keuzes te onderbouwen.',
    href: '/kennis/whitepapers',
  },
  {
    title: 'E-learning',
    description: 'Online trainingen en cursussen (binnenkort beschikbaar).',
    href: '/kennis/e-learning',
  },
];

export default function KennisHubPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <CoreBreadcrumbBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Kennis', href: '/kennis' },
        ]}
      />

      <section className="hero-section relative overflow-hidden bg-[#091E42]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            Kennisportaal
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Kennis & Resources
          </h1>
          <p className="mt-5 text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Verdiep je in ISO-certificering, informatiebeveiliging en compliance via onze artikelen,
            whitepapers en trainingen.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42]">
              Ontdek onze kennis
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {knowledgeCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg md:text-xl font-semibold text-[#091E42] mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-600">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#F8FAFC]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42]">Uitgelicht</h2>
            <p className="mt-3 text-gray-600">
              Een selectie die helpt om snel de juiste richting te kiezen.
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/kennis/blog"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-[#091E42] mb-2">Laatste artikelen</h3>
              <p className="text-gray-600">Praktische inzichten en actuele onderwerpen.</p>
            </Link>
            <Link
              href="/kennis/whitepapers"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-[#091E42] mb-2">Whitepapers</h3>
              <p className="text-gray-600">Diepgaande gidsen en downloads.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
