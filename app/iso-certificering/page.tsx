import { Metadata } from 'next';
import SchemaMarkup from '@/components/ui/SchemaMarkup';

export const metadata: Metadata = {
  title: 'ISO-certificering | Overzicht en begeleiding | MaasISO',
  description:
    'Overzicht van ISO-certificeringen bij MaasISO. Ontdek ISO 9001, ISO 14001, ISO 27001, ISO 45001 en ISO 16175 en kies de norm die bij uw organisatie past.',
  alternates: {
    canonical: '/iso-certificering',
  },
};

const isoPages = [
  {
    title: 'ISO 9001 - Kwaliteitsmanagement',
    description:
      'Optimaliseer processen, verhoog klanttevredenheid en werk structureel aan continue verbetering.',
    href: '/iso-certificering/iso-9001',
    linkLabel: 'ISO 9001'
  },
  {
    title: 'ISO 14001 - Milieumanagement',
    description:
      'Beheers milieurisico\'s, benut duurzaamheidskansen en toon aantoonbare milieuprestaties.',
    href: '/iso-certificering/iso-14001',
    linkLabel: 'ISO 14001'
  },
  {
    title: 'ISO 27001 - Informatiebeveiliging',
    description:
      'Bescherm gevoelige data, reduceer risico\'s en versterk uw security-compliance.',
    href: '/informatiebeveiliging/iso-27001',
    linkLabel: 'ISO 27001'
  },
  {
    title: 'ISO 45001 - Gezond & veilig werken',
    description:
      'Verbeter arbeidsveiligheid en pak risico\'s pragmatisch aan binnen uw organisatie.',
    href: '/iso-certificering/iso-45001',
    linkLabel: 'ISO 45001'
  },
  {
    title: 'ISO 16175 - Digitaal informatiebeheer',
    description:
      'Creëer grip op digitale documenten, archivering en vindbaarheid met duidelijke richtlijnen.',
    href: '/iso-certificering/iso-16175',
    linkLabel: 'ISO 16175'
  }
];

export default function IsoCertificeringHubPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white" data-topic="iso-certificering">
      <SchemaMarkup
        breadcrumbs={{
          items: [
            { name: 'Home', item: 'https://maasiso.nl' },
            { name: 'ISO-certificering', item: 'https://maasiso.nl/iso-certificering' }
          ]
        }}
      />

      <section className="hero-section relative overflow-hidden bg-[#091E42]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            Overzicht
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            ISO-certificering
          </h1>
          <p className="mt-5 text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Kies de ISO-norm die past bij uw organisatie. Op deze hub vindt u alle ISO-certificeringen
            die MaasISO begeleidt, inclusief de voordelen, aanpak en vervolgstappen.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/contact"
              className="primary-button w-full sm:w-auto text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Plan een kennismaking
            </a>
            <a
              href="https://iso-selector.maasiso.nl/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center rounded-lg border border-white/40 px-6 py-3 text-white font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Doe de ISO-Selector
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42]">
              Alle ISO-certificeringen die wij begeleiden
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              Klik door naar de norm en ontdek welke stappen nodig zijn voor certificering.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isoPages.map((page) => (
              <div
                key={page.href}
                className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg md:text-xl font-semibold text-[#091E42] mb-3">
                  {page.title}
                </h3>
                <p className="text-gray-600 mb-5">
                  {page.description}
                </p>
                <a href={page.href} className="text-sm font-semibold text-[#00875A] underline">
                  Bekijk {page.linkLabel}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-[#F8FAFC]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42] mb-4">
                Hulp nodig bij de juiste ISO-keuze?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg mb-6">
                MaasISO helpt u bepalen welke norm het meeste rendement oplevert. We starten met een
                korte analyse van uw doelen, risico\'s en huidige processen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/contact"
                  className="primary-button w-full sm:w-auto text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  Vraag advies aan
                </a>
                <a
                  href="/iso-certificering"
                  className="w-full sm:w-auto text-center rounded-lg border border-[#00875A] px-6 py-3 text-[#00875A] font-semibold hover:bg-[#00875A]/10 transition-all duration-300"
                >
                  Bekijk alle ISO-certificeringen
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[#091E42] mb-4">
                Waarom ISO-certificeren?
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li>Meer grip op processen en prestaties.</li>
                <li>Aantoonbare compliance richting klanten en toezichthouders.</li>
                <li>Betere risicobeheersing en continu verbeteren.</li>
                <li>Meer vertrouwen bij partners en aanbestedingen.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
