'use client';

import React from 'react';
import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';

// Define the advantages data
const advantages = [
  {
    id: 1,
    title: 'Pragmatische & Praktische Aanpak',
    description: 'Wij geloven in praktisch advies: geen dikke rapporten om te verzamelen stof, maar direct toepasbare oplossingen. MaasISO vertaalt complexe ISO-normen en wetgeving naar werkbare processen voor uw organisatie, altijd gericht op implementatie in de dagelijkse praktijk.',
    benefits: [
      'Sneller resultaat, minder administratieve last',
      'Systeem dat leeft: medewerkers gaan er daadwerkelijk mee aan de slag'
    ],
    linkText: 'Bekijk de werkwijze op de Over Ons pagina',
    linkHref: '/over-ons',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Diepgaande Ervaring & Expertise',
    description: 'Achter MaasISO staat een ervaren consultant met een breed en stevig trackrecord in het begeleiden van MKB en (semi-)overheid op het gebied van ISO 9001, ISO 27001, AVG, BIO, ISO 14001 en meer. De combinatie van technische, organisatorische en juridische kennis, met praktijkervaring als FG, QHSE-consultant en manager, zorgt voor snel inzicht in knelpunten én kansen.',
    benefits: [
      'Direct schakelen met een specialist die het speelveld door en door kent',
      'Snel de kern van een probleem vinden en passende oplossingen bieden',
      'Voorkomt kostbare valkuilen'
    ],
    linkText: 'Zie meer over ervaring en expertise',
    linkHref: '/over-ons',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'Maatwerk & MKB Focus',
    description: 'MaasISO levert consultancy én implementatie die helemaal is afgestemd op uw situatie. Dankzij de schaal en flexibiliteit van een kleiner bureau worden oplossingen nauwgezet toegespitst op de bedrijfsvoering, cultuur en wensen van MKB-bedrijven of compacte (semi-)overheden.',
    benefits: [
      'Geen standaardplan, maar oplossingen die écht passen',
      'Maatwerk zorgt voor efficiënte inzet van middelen'
    ],
    linkText: 'Bekijk voorbeelden van maatwerk bij onze diensten',
    linkHref: '/iso-certificering',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'Resultaatgericht & Waardecreatie',
    description: 'Ons werk draait om echte resultaten, niet slechts om het behalen van een certificaat. MaasISO focust zich op doelen als compliance, kostenreductie, klanttevredenheid en efficiency. U ziet het verschil terug in aantoonbare verbeteringen en duurzame borging.',
    benefits: [
      'Investering in consultancy betaalt zich terug',
      'Verbeterde processen, lager risico, meer klanttevredenheid'
    ],
    linkText: 'Ontdek resultaatgerichte aanpak per dienst',
    linkHref: '/iso-certificering',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: 5,
    title: 'Integrale Benadering',
    description: 'Meerdere normen of thema\'s combineren? MaasISO bekijkt vraagstukken integraal en kan bijvoorbeeld kwaliteitsmanagement (ISO 9001) en informatiebeveiliging (ISO 27001 of BIO) in één samenhangende aanpak verbinden. Dit bespaart tijd, voorkomt dubbel werk en creëert synergie.',
    benefits: [
      'Minder overlap, efficiënter traject',
      'Alles in samenhang geregeld binnen uw organisatie'
    ],
    linkText: 'Lees over integrale consultancy en managementadvies',
    linkHref: '/iso-certificering',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  }
];

// Card style variations matching DienstenContent
const cardStyles = [
  { border: 'border-[#00875A]', iconBg: 'bg-[#00875A]/10', iconColor: 'text-[#00875A]', hover: 'hover:border-[#00875A] hover:shadow-[0_20px_40px_rgba(0,135,90,0.1)]' },
  { border: 'border-[#FF8B00]', iconBg: 'bg-[#FF8B00]/10', iconColor: 'text-[#FF8B00]', hover: 'hover:border-[#FF8B00] hover:shadow-[0_20px_40px_rgba(255,139,0,0.1)]' },
  { border: 'border-[#091E42]', iconBg: 'bg-[#091E42]/10', iconColor: 'text-[#091E42]', hover: 'hover:border-[#091E42] hover:shadow-[0_20px_40px_rgba(9,30,66,0.1)]' },
];

export default function OnzeVoordelenContent() {
  return (
    <main className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden py-24 md:py-32 bg-[#091E42]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-5 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-5 -ml-20 -mb-20"></div>
        </div>

        <div className="container-custom relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <ScrollReveal className="reveal-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-tight">
                Ontdek de Voordelen van MaasISO
              </h1>
            </ScrollReveal>
            <ScrollReveal className="reveal-up" delay={100}>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Voor uw organisatie, praktisch en resultaatgericht.
              </p>
            </ScrollReveal>
            <ScrollReveal className="reveal-up" delay={200}>
              <Link
                href="/contact"
                className="primary-button inline-flex items-center"
              >
                Neem Contact Op
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal className="reveal-up">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#091E42] mb-6">
                  De Voordelen van Samenwerken met MaasISO
                </h2>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="w-12 h-1.5 bg-[#00875A] rounded-full"></div>
                  <div className="w-4 h-1.5 bg-[#FF8B00] rounded-full"></div>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Waarom kiezen voor MaasISO als uw consultant? Het kiezen van een consultancy-partner heeft direct invloed op het succes van uw traject. MaasISO maakt het verschil door unieke voordelen waarvan organisaties in het MKB en de (semi-)overheid dagelijks profiteren.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Advantages Grid Section */}
      <section className="py-20 md:py-32 bg-[#F4F7F9] relative z-20">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="reveal-up">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-[#091E42] mb-6 tracking-tight">
                Waarom MaasISO?
              </h2>
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-12 h-1.5 bg-[#00875A] rounded-full"></div>
                <div className="w-4 h-1.5 bg-[#FF8B00] rounded-full"></div>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Ontdek wat ons onderscheidt en hoe wij waarde toevoegen aan uw organisatie.
              </p>
            </div>
          </ScrollReveal>

          {/* Two-row grid layout: 3 items in first row, remaining in second row */}
          <div className="max-w-7xl mx-auto">
            {/* First row - 3 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {advantages.slice(0, 3).map((advantage, idx) => {
                const style = cardStyles[idx % cardStyles.length];
                
                return (
                  <ScrollReveal
                    key={advantage.id}
                    className="reveal-up h-full"
                    delay={idx * 100}
                  >
                    <div
                      className={`group relative block h-full bg-white rounded-2xl p-8 border-l-4 ${style.border} shadow-sm transition-all duration-500 ${style.hover} transform hover:-translate-y-2`}
                    >
                      <div className="relative z-10 h-full flex flex-col">
                        <div className={`w-14 h-14 ${style.iconBg} ${style.iconColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          {advantage.icon}
                        </div>
                        
                        <h3 className="text-xl font-bold text-[#091E42] mb-4 leading-tight group-hover:text-[#00875A] transition-colors duration-300">
                          {advantage.title}
                        </h3>
                        
                        <p className="text-gray-600 text-base leading-relaxed mb-6 flex-grow">
                          {advantage.description}
                        </p>

                        {/* Benefits list */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-[#091E42] mb-3 text-sm uppercase tracking-wider">Klantvoordeel:</h4>
                          <ul className="space-y-2">
                            {advantage.benefits.map((benefit, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-2 text-gray-600 text-sm">
                                <svg className="w-5 h-5 text-[#00875A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Link 
                          href={advantage.linkHref}
                          className="flex items-center text-[#091E42] font-semibold text-sm group-hover:text-[#FF8B00] transition-colors duration-300"
                        >
                          <span>{advantage.linkText}</span>
                          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
            
            {/* Second row - remaining items (centered) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {advantages.slice(3).map((advantage, idx) => {
                const style = cardStyles[(idx + 3) % cardStyles.length];
                
                return (
                  <ScrollReveal
                    key={advantage.id}
                    className="reveal-up h-full"
                    delay={(idx + 3) * 100}
                  >
                    <div
                      className={`group relative block h-full bg-white rounded-2xl p-8 border-l-4 ${style.border} shadow-sm transition-all duration-500 ${style.hover} transform hover:-translate-y-2`}
                    >
                      <div className="relative z-10 h-full flex flex-col">
                        <div className={`w-14 h-14 ${style.iconBg} ${style.iconColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          {advantage.icon}
                        </div>
                        
                        <h3 className="text-xl font-bold text-[#091E42] mb-4 leading-tight group-hover:text-[#00875A] transition-colors duration-300">
                          {advantage.title}
                        </h3>
                        
                        <p className="text-gray-600 text-base leading-relaxed mb-6 flex-grow">
                          {advantage.description}
                        </p>

                        {/* Benefits list */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-[#091E42] mb-3 text-sm uppercase tracking-wider">Klantvoordeel:</h4>
                          <ul className="space-y-2">
                            {advantage.benefits.map((benefit, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-2 text-gray-600 text-sm">
                                <svg className="w-5 h-5 text-[#00875A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Link 
                          href={advantage.linkHref}
                          className="flex items-center text-[#091E42] font-semibold text-sm group-hover:text-[#FF8B00] transition-colors duration-300"
                        >
                          <span>{advantage.linkText}</span>
                          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal className="reveal-up">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#00875A] to-[#FF8B00] rounded-full"></div>
                <blockquote className="pl-8 md:pl-12">
                  <p className="text-2xl md:text-3xl font-medium text-[#091E42] leading-relaxed italic">
                    "U investeert niet in rapporten die in de la verdwijnen, maar in een partner die zich inzet voor werkelijke vooruitgang."
                  </p>
                </blockquote>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-28 bg-[#F4F7F9]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal className="reveal-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-[#00875A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#00875A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-[#091E42] mb-2">100%</div>
                  <div className="text-gray-600">Succesgarantie op audits</div>
                </div>
                
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-[#FF8B00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#FF8B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-[#091E42] mb-2">15+</div>
                  <div className="text-gray-600">Jaar ervaring</div>
                </div>
                
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-[#091E42]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#091E42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-[#091E42] mb-2">MKB</div>
                  <div className="text-gray-600">Focus & maatwerk</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Width Hero Style */}
      <section className="hero-section relative overflow-hidden !mt-0 !py-20 md:!py-28 bg-[#091E42]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <ScrollReveal className="reveal-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-6">
              Ervaar Zelf de Voordelen
            </h2>
            <p className="text-white text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Wilt u persoonlijk ontdekken wat MaasISO voor uw organisatie kan betekenen? Neem direct contact op voor een vrijblijvend kennismakingsgesprek of bekijk onze diensten in detail.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
              >
                Neem Contact Op
              </Link>
              <Link
                href="/iso-certificering"
                className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
              >
                Bekijk Onze Diensten
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
