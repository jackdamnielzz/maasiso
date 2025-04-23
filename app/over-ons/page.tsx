import Link from "next/link";
import RolesGrid from "./RolesGrid";

// Placeholder icons (replace with your own SVGs or icon components)
const icons = {
  expertise: (
    <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  maatwerk: (
    <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8 12h8" />
    </svg>
  ),
  praktisch: (
    <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  verbeteren: (
    <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 17l6-6 4 4 8-8" />
    </svg>
  ),
  communicatie: (
    <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
    </svg>
  ),
  resultaat: (
    <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
};

export const metadata = {
  title: "Over MaasISO | Experts in ISO-normering & Informatiebeveiliging",
  description:
    "MaasISO is uw betrouwbare partner voor ISO 9001, 27001, 14001 certificeringen en professioneel advies op het gebied van informatiebeveiliging, AVG en privacywetgeving.",
  keywords:
    "ISO 9001, ISO 27001, ISO 27002, ISO 14001, ISO 16175, informatiebeveiliging, AVG, GDPR, privacy consultancy, BIO",
};

export default function OverOnsPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden py-20 md:py-28 bg-[#091E42]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-6">
            Over MaasISO
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-normal">
            Praktisch advies en resultaatgerichte ondersteuning voor kwaliteit, informatiebeveiliging en privacy.
          </p>
          <Link
            href="/contact"
            className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
          >
            Neem contact op
          </Link>
          {/* Hero visual accent */}
          {/* Removed hero visual accent (clock image) as requested */}
        </div>
      </section>

      {/* Wie is MaasISO? */}
      <section className="py-20 md:py-28 bg-transparent">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-14 max-w-4xl mx-auto border border-gray-100 relative hover:shadow-2xl transition-all duration-300">
            <div className="h-2 bg-gradient-to-r from-[#00875A] to-[#FF8B00]"></div>
            <div className="p-10 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-5 text-center">Wie is MaasISO?</h2>
              <p className="text-lg text-gray-700 leading-relaxed text-left">
                MaasISO is een onafhankelijk consultancybureau gespecialiseerd in <span className="font-semibold text-[#00875A]">kwaliteitsmanagement</span>, <span className="font-semibold text-[#00875A]">informatiebeveiliging</span>, <span className="font-semibold text-[#00875A]">privacy</span> en <span className="font-semibold text-[#00875A]">compliance</span>. Wij helpen organisaties in Nederland en Vlaanderen aan praktische, werkbare managementsystemen op basis van internationale normen als <strong className="text-[#FF8B00]">ISO 9001</strong>, <strong className="text-[#FF8B00]">ISO 27001</strong>, <strong className="text-[#FF8B00]">ISO 14001</strong>, <strong className="text-[#FF8B00]">ISO 16175</strong> en <strong className="text-[#FF8B00]">BIO</strong>.<br /><br />
                Onze werkwijze is <span className="font-semibold text-[#00875A]">pragmatisch</span> en onze communicatie helder: dát maakt MaasISO dé partner voor het MKB+ en semi-overheid die échte waarde willen halen uit hun managementsystemen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wie staat er achter MaasISO? */}
      <section className="py-12 md:py-16 bg-transparent">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-14 max-w-3xl mx-auto border border-gray-100 relative hover:shadow-2xl transition-all duration-300">
            <div className="h-2 bg-gradient-to-r from-[#00875A] to-[#FF8B00]"></div>
            <div className="p-10 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-5 text-center">Wie staat er achter MaasISO?</h2>
              <p className="text-lg text-gray-700 leading-relaxed text-left">
                Achter MaasISO staat een ervaren consultant met een brede achtergrond in zowel publieke als private sectoren.<br /><br />
                Door de combinatie van juridische kennis, praktijkervaring als consultant en jarenlange rollen – onder meer als specialist in kwaliteitsmanagement, informatiebeveiliging, privacy, compliance en diverse leidinggevende functies – biedt MaasISO altijd directe, toepasbare waarde.<br /><br />
                Ervaring met uiteenlopende audits versterkt deze expertise en zorgt voor blijvende meerwaarde voor opdrachtgevers.
              </p>
              <ul className="list-disc pl-6 mt-4 text-gray-700 space-y-1 text-base md:text-lg">
                {/* Interactieve rollen cards */}
                {/* Interactieve rollen cards met meer info popup */}
                {/* Replaced inline roles grid with client component for correct open/close behavior */}
                <RolesGrid />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mijn Drijfveer */}
      <section className="py-20 md:py-28 bg-transparent">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-14 max-w-4xl mx-auto border border-gray-100 relative hover:shadow-2xl transition-all duration-300">
            <div className="h-2 bg-gradient-to-r from-[#00875A] to-[#FF8B00]"></div>
            <div className="p-10 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-5 text-center">Mijn Drijfveer</h2>
              <p className="text-lg text-gray-700 leading-relaxed text-left">
                De aanleiding voor MaasISO is mijn wens om zoveel mogelijk organisaties te helpen échte stappen te maken. Te veel managementsystemen zijn papieren tijgers. MaasISO richt zich op pragmatische, resultaatgerichte consultancy waarmee bedrijven en (semi-)overheden hun processen en prestaties blijvend kunnen verbeteren.

                <br /><br />
              </p>
              <div className="text-center mt-8">
                <Link
                  href="/diensten"
                  className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
                >
                  Bekijk onze diensten
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise en Ervaring section removed as requested */}

      {/* Waarom MaasISO? – Aanpak en Filosofie section removed as requested */}

      {/* Vertrouwen & Netwerk */}
      <section className="py-20 md:py-28 bg-transparent">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-14 max-w-4xl mx-auto border border-gray-100 relative hover:shadow-2xl transition-all duration-300">
            <div className="h-2 bg-gradient-to-r from-[#00875A] to-[#FF8B00]"></div>
            <div className="p-10 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-5 text-center">Vertrouwen &amp; Netwerk</h2>
              <p className="text-lg text-gray-700 leading-relaxed text-left">
                MaasISO wordt gewaardeerd om transparantie, betrouwbaarheid en kennis van zaken. Opdrachtgevers profiteren van ervaring als (externe) FG, auditor en compliance-expert.
              </p>
              <div className="mt-8 text-center">
                <a
                  href="https://www.linkedin.com/company/maasiso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button inline-block bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300"
                >
                  Kijk op LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Klaar om kennis te maken? */}
      <section className="bg-[#091E42] text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-10 leading-tight">
            Klaar om kennis te maken?
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Benieuwd wat MaasISO voor jouw organisatie kan betekenen? Neem vrijblijvend contact op en maak kennis!
          </p>
          <Link
            href="/contact"
            className="primary-button bg-[#FF8B00] text-white font-bold px-10 py-4 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300"
          >
            Neem contact op
          </Link>
        </div>
      </section>
    </main>
  );
}
