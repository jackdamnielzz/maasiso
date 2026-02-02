import React from "react";

// Service Icons as React components
function Iso9001Icon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#00875A]" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#00875A" strokeWidth="2" fill="#E6F4EA"/>
      <path d="M10 17l4 4 8-8" stroke="#00875A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function Iso27001Icon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#0057b8]" fill="none">
      <rect x="7" y="13" width="18" height="10" rx="2" stroke="#0057b8" strokeWidth="2" fill="#E6F0FA"/>
      <path d="M16 13V10a4 4 0 1 1 8 0v3" stroke="#0057b8" strokeWidth="2" fill="none"/>
      <circle cx="16" cy="19" r="2" fill="#0057b8"/>
    </svg>
  );
}
function BioIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#FF8B00]" fill="none">
      <rect x="8" y="12" width="16" height="12" rx="2" stroke="#FF8B00" strokeWidth="2" fill="#FFF4E6"/>
      <path d="M16 8v4" stroke="#FF8B00" strokeWidth="2"/>
      <circle cx="16" cy="8" r="2" fill="#FF8B00"/>
    </svg>
  );
}
function AvgIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#00875A]" fill="none">
      <rect x="8" y="14" width="16" height="10" rx="2" stroke="#00875A" strokeWidth="2" fill="#E6F4EA"/>
      <circle cx="16" cy="19" r="3" stroke="#00875A" strokeWidth="2" fill="#fff"/>
      <path d="M16 16v2" stroke="#00875A" strokeWidth="2"/>
    </svg>
  );
}
function Iso14001Icon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#00875A]" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#00875A" strokeWidth="2" fill="#E6F4EA"/>
      <path d="M16 22c-3-2-6-6-6-10a6 6 0 0 1 12 0c0 4-3 8-6 10z" fill="#00875A" fillOpacity="0.5"/>
      <path d="M16 22c-3-2-6-6-6-10a6 6 0 0 1 12 0c0 4-3 8-6 10z" stroke="#00875A" strokeWidth="2"/>
    </svg>
  );
}
function Iso16175Icon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#0057b8]" fill="none">
      <rect x="8" y="8" width="16" height="16" rx="2" stroke="#0057b8" strokeWidth="2" fill="#E6F0FA"/>
      <rect x="12" y="12" width="8" height="8" rx="1" fill="#0057b8"/>
    </svg>
  );
}

// Benefit Icons as React components
function PragmatischIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#00875A]" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#00875A" strokeWidth="2" fill="#E6F4EA"/>
      <path d="M10 17l4 4 8-8" stroke="#00875A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ErvaringIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#0057b8]" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#0057b8" strokeWidth="2" fill="#E6F0FA"/>
      <path d="M16 10v8l6 3" stroke="#0057b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function MaatwerkIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#FF8B00]" fill="none">
      <rect x="8" y="8" width="16" height="16" rx="4" stroke="#FF8B00" strokeWidth="2" fill="#FFF4E6"/>
      <path d="M16 12v8M12 16h8" stroke="#FF8B00" strokeWidth="2"/>
    </svg>
  );
}
function ResultaatIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#00875A]" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#00875A" strokeWidth="2" fill="#E6F4EA"/>
      <path d="M16 22v-8M16 14l-4 4M16 14l4 4" stroke="#00875A" strokeWidth="2"/>
    </svg>
  );
}
function MkbIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-16 h-16 text-[#0057b8]" fill="none">
      <rect x="8" y="12" width="16" height="8" rx="2" stroke="#0057b8" strokeWidth="2" fill="#E6F0FA"/>
      <circle cx="16" cy="16" r="2" fill="#0057b8"/>
    </svg>
  );
}

export const metadata = {
  title: "MaasISO | Consultancy ISO 9001, ISO 27001 & AVG | MKB Advies",
  description:
    "MaasISO: uw pragmatische partner voor ISO consultancy (9001, 27001), AVG/privacy en management advies in Nederland. Ontdek onze diensten voor het MKB.",
  keywords:
    "MaasISO, iso 9001 consultant, iso 9001 adviesbureau, iso 27001 consultant, avg consulting, privacy consultant, management consulting",
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: "MaasISO | Consultancy ISO 9001, ISO 27001 & AVG | MKB Advies",
    description: "MaasISO: uw pragmatische partner voor ISO consultancy (9001, 27001), AVG/privacy en management advies in Nederland. Ontdek onze diensten voor het MKB.",
    url: '/',
    siteName: 'MaasISO',
    type: 'website'
  }
};

const services = [
  {
    id: "iso9001",
    title: "ISO 9001 – Kwaliteitsmanagement",
    description:
      "Wilt u processen verbeteren, uw kwaliteit verhogen en klanten tevreden maken? Als ervaren ISO 9001 consultant ondersteunt MaasISO u bij elke stap: van analyse tot implementatie en certificering.",
    link: "/iso-certificering/iso-9001",
    linkText: "Meer over onze ISO 9001 diensten",
    icon: <img src="/icons/quality.svg" alt="ISO 9001" className="w-16 h-16" />,
  },
  {
    id: "iso27001",
    title: "ISO 27001 – Informatiebeveiliging",
    description:
      "Heeft u behoefte aan structurele beveiliging van gevoelige bedrijfsinformatie? Onze ISO 27001 consultants begeleiden u bij risicoanalyse, implementatie van controles en voorbereiding op certificering.",
    link: "/informatiebeveiliging/iso-27001",
    linkText: "Ontdek onze ISO 27001 aanpak",
    icon: <img src="/icons/shield.svg" alt="ISO 27001" className="w-16 h-16" />,
  },
  {
    id: "bio",
    title: "BIO – Baseline Informatiebeveiliging Overheid",
    description:
      "Voor overheidsinstanties en toeleveranciers ondersteunen wij bij de implementatie van de BIO. Wij helpen u voldoen aan de Baseline Informatiebeveiliging Overheid met praktisch advies.",
    link: "/informatiebeveiliging/bio",
    linkText: "Lees meer over BIO ondersteuning",
    icon: <img src="/icons/compliance.svg" alt="BIO" className="w-16 h-16" />,
  },
  {
    id: "avg",
    title: "AVG/GDPR – Privacy compliance",
    description:
      "MaasISO helpt als privacy consultant bij alle aspecten van privacywetgeving – van AVG quickscan tot beleid, DPIA’s en awareness. Wij zorgen voor duidelijke implementatie en blijvende privacy-compliance.",
    link: "/avg-wetgeving/avg",
    linkText: "Bekijk onze AVG diensten",
    icon: <img src="/icons/privacy.svg" alt="AVG" className="w-16 h-16" />,
  },
  {
    id: "iso14001",
    title: "ISO 14001 – Milieumanagement",
    description:
      "Wilt u milieukansen benutten en risico’s managen? Met ISO 14001 advies van MaasISO zet u een effectief milieumanagementsysteem op, afgestemd op uw organisatie.",
    link: "/iso-certificering/iso-14001",
    linkText: "Lees meer over ISO 14001 ondersteuning",
    icon: <img src="/icons/consulting.svg" alt="ISO 14001" className="w-16 h-16" />,
  },
  {
    id: "iso16175",
    title: "ISO 16175 – Digitaal Informatiebeheer",
    description:
      "Grip op uw digitale documenten en archieven met onze adviesdiensten rond ISO 16175 en informatiebeheer. Wij helpen structuur, compliance en vindbaarheid duurzaam te verbeteren.",
    link: "/iso-certificering/iso-16175",
    linkText: "Advies over informatiebeheer en ISO 16175",
    icon: <img src="/icons/certificate.svg" alt="ISO 16175" className="w-16 h-16" />,
  },
];

const benefits = [
  {
    id: "pragmatisch",
    title: "Pragmatische oplossingen",
    description: "Geen bureaucratie, wel werkbare processen.",
    icon: <img src="/icons/consulting.svg" alt="Pragmatische oplossingen" className="w-16 h-16" />,
  },
  {
    id: "ervaring",
    title: "Bewezen ervaring",
    description: "Onze consultants begrijpen uw praktijk grondig.",
    icon: <img src="/icons/certificate.svg" alt="Bewezen ervaring" className="w-16 h-16" />,
  },
  {
    id: "maatwerk",
    title: "Persoonlijk maatwerk",
    description: "Advies afgestemd op uw organisatie en doelen.",
    icon: <img src="/icons/compliance.svg" alt="Persoonlijk maatwerk" className="w-16 h-16" />,
  },
  {
    id: "resultaat",
    title: "Resultaatgericht",
    description: "Concrete verbeteringen en merkbare vooruitgang.",
    icon: <img src="/icons/risk.svg" alt="Resultaatgericht" className="w-16 h-16" />,
  },
  {
    id: "mkb",
    title: "Toegespitst op het MKB",
    description: "Oog voor schaal, cultuur en uitdagingen binnen het MKB.",
    icon: <img src="/icons/training.svg" alt="Toegespitst op het MKB" className="w-16 h-16" />,
  },
];

function Home() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center py-20 md:py-28">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Praktisch Advies voor Kwaliteit, Security &amp; Privacy
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Met pragmatische ISO-consultancy helpt MaasISO het MKB om processen efficiënter, veiliger en compliant te maken. Geen gedoe, wél resultaten.
          </p>
          <a
            href="/iso-certificering"
            className="primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Ontdek onze Diensten
          </a>
        </div>
      </section>

      {/* ISO Selector Tool Promotion */}
      <section className="py-8 md:py-12 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-[#00875A] text-white rounded-full px-4 py-1 mb-4 text-sm font-medium">
              NIEUW
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
              ISO Norm Selector - Gratis Online Tool
            </h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Niet zeker welke ISO-certificering bij uw organisatie past? 
              Ontdek het in 5 minuten met onze gratis assessment tool.
            </p>
            <a
              href="https://iso-selector.maasiso.nl/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00875A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00764d] transition-colors duration-200"
            >
              Start Assessment
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Services Feature Grid */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00875A] rounded-full opacity-5 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-5 -ml-20 -mb-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 relative inline-block">
              <span>Onze Diensten</span>
              <span className="absolute -bottom-3 left-1/2 w-20 h-1 bg-[#00875A] transform -translate-x-1/2"></span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-10 w-full max-w-[95%] sm:max-w-[85%] md:max-w-6xl mx-auto mb-8">
            {services.map((service, idx) => (
              <div
                key={service.id}
                className="service-card bg-white p-5 sm:p-6 md:p-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group relative hover:-translate-y-2 flex flex-col h-full border border-gray-100 overflow-hidden max-w-sm mx-auto w-full"
              >
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#00875A] to-[#FF8B00]"></div>
                <div className="flex items-center justify-center mb-6 sm:mb-8">
                  <div className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-all duration-300 border border-blue-100 group-hover:border-blue-200 shadow-sm">
                    {React.cloneElement(service.icon, { className: "h-8 sm:h-10 w-8 sm:w-10" })}
                  </div>
                </div>
                <div className="text-center mb-6 min-w-0 h-[60px] flex items-center justify-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-[#00875A] transition-colors duration-300 break-words">
                    {service.title}
                  </h3>
                </div>
                <div className="bg-gray-50 p-4 sm:p-5 pt-6 rounded-lg flex-grow min-h-[180px] border border-gray-100 hover:border-[#00875A] transition-colors duration-300 shadow-sm flex flex-col">
                  <p className="text-left text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 flex-grow">
                    {service.description}
                  </p>
                  <div className="mt-6 flex justify-center">
                    <a
                      href={service.link}
                      className="text-sm text-[#00875A] font-medium underline"
                    >
                      Lees meer
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-10 w-full">
            <a
              href="/iso-certificering"
              className="mx-auto block max-w-xs w-full text-center primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Bekijk het volledige dienstenoverzicht
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12">
        <div className="container-custom max-w-content">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            Uw Deskundige Partner voor het MKB
          </h2>
          <p className="text-lg mb-4 text-center">
            MaasISO biedt praktische en doelgerichte consultancy rondom kwaliteitsmanagement, informatiebeveiliging en privacy voor organisaties in het MKB. Onze specialisten combineren jarenlange ervaring met een flexibele, no-nonsense aanpak die echt bij uw onderneming past.
          </p>
          <div className="flex justify-center">
            <a href="/over-ons" className="text-primary font-medium underline">
              Lees meer over MaasISO en onze aanpak
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Feature Grid */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00875A] rounded-full opacity-5 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-5 -ml-20 -mb-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 relative inline-block">
              De Voordelen van Samenwerken met MaasISO
              <span className="absolute -bottom-3 left-1/2 w-20 h-1 bg-[#00875A] transform -translate-x-1/2"></span>
            </h2>
          </div>
          {/* Pyramid/trapezoid layout: 3 cards on top, 2 centered below */}
          <div className="flex flex-col items-center gap-8 w-full max-w-[95%] sm:max-w-[85%] md:max-w-5xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row justify-center gap-8 w-full">
              {benefits.slice(0, 3).map((benefit) => (
                <div
                  key={benefit.id}
                  className="service-card bg-white p-5 sm:p-6 md:p-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group relative hover:-translate-y-2 flex flex-col h-full border border-gray-100 overflow-hidden max-w-sm w-full"
                >
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#00875A] to-[#FF8B00]"></div>
                  <div className="flex items-center justify-center mb-6 sm:mb-8">
                    <div className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-all duration-300 border border-blue-100 group-hover:border-blue-200 shadow-sm">
                      {React.cloneElement(benefit.icon, { className: "h-8 sm:h-10 w-8 sm:w-10" })}
                    </div>
                  </div>
                  <div className="text-center mb-6 min-w-0 h-[72px] flex items-center justify-center">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-[#00875A] transition-colors duration-300 break-words leading-tight">
                      {benefit.title}
                    </h3>
                  </div>
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-lg flex-grow flex flex-col border border-gray-100 hover:border-[#00875A] transition-colors duration-300 shadow-sm">
                    <p className="text-left text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-8 w-full md:w-2/3 mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
               {benefits.slice(3, 5).map((benefit) => (
                <div
                  key={benefit.id}
                  className="service-card bg-white p-5 sm:p-6 md:p-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group relative hover:-translate-y-2 flex flex-col h-full min-h-[24rem] border border-gray-100 overflow-hidden max-w-sm w-full"
                >
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#00875A] to-[#FF8B00]"></div>
                  <div className="flex items-center justify-center mb-6 sm:mb-8">
                    <div className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-all duration-300 border border-blue-100 group-hover:border-blue-200 shadow-sm">
                      {React.cloneElement(benefit.icon, { className: "h-8 sm:h-10 w-8 sm:w-10" })}
                    </div>
                  </div>
                  <div className="text-center mb-6 min-w-0 h-[72px] flex items-center justify-center">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-[#00875A] transition-colors duration-300 break-words leading-tight">
                      {benefit.title}
                    </h3>
                  </div>
                  <div className="bg-gray-50 p-4 sm:p-5 rounded-lg flex-grow flex flex-col justify-between border border-gray-100 hover:border-[#00875A] transition-colors duration-300 shadow-sm">
                    <p className="text-left text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
               </div>
            </div>
          </div>
          <div className="flex justify-center mt-10">
            <a
              href="/waarom-maasiso"
              className="text-primary font-medium underline"
            >
              Lees meer over onze voordelen
            </a>
          </div>
        </div>
      </section>

      {/* MKB Focus Section */}
      <section className="pt-12 pb-24">
        <div className="container-custom max-w-content">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            Volledig gericht op het MKB
          </h2>
          <p className="text-lg text-center">
            Onze diensten zijn specifiek gericht op ondernemers en managers in het midden- en kleinbedrijf in Nederland en Vlaanderen. Wij bieden praktische oplossingen die echt uitvoerbaar zijn in uw dagelijkse realiteit.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#091E42] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
            Klaar om uw organisatie echt te verbeteren?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Neem vrijblijvend contact op en ontdek hoe MaasISO u concreet verder helpt met kwaliteitsmanagement, informatiebeveiliging, privacy en meer.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <a
              href="/contact"
              className="primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Neem Contact Op
            </a>
            <a
              href="/iso-certificering"
              className="primary-button bg-white text-[#091E42] hover:bg-gray-200 hover:text-[#091E42] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Bekijk Alle Diensten
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
