import { Metadata } from 'next';
import Iso9001Client from './Iso9001Client';
import Link from 'next/link';
import RelatedServices from '@/components/ui/RelatedServices';
import { getRelatedServices } from '@/lib/utils/serviceRelations';

export const metadata: Metadata = {
  title: 'ISO 9001 Certificering - Direct Starten | MaasISO Adviseurs',
  description: 'ISO 9001 certificaat nodig? ✓ 100% Slagingsgarantie ✓ Binnen 3-6 maanden gecertificeerd ✓ Vaste prijs ✓ MKB specialist. Vraag direct advies aan!',
  keywords: 'ISO 9001 certificering, ISO 9001 certificaat, kwaliteitsmanagement, ISO 9001 adviseur, ISO 9001 begeleiding'
};

// Icons als componenten
function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-[#00875A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default async function Iso9001Page() {
  const relatedServices = getRelatedServices('iso-9001');
  
  return (
    <Iso9001Client>
      <main className="flex-1">
        {/* Hero Section - Sterke opening voor Google Ads */}
        <section className="hero-section relative overflow-hidden bg-gradient-to-br from-[#091E42] via-[#0A2540] to-[#091E42] py-12 sm:py-16 md:py-20 lg:py-28">
          {/* Decoratieve elementen */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
            <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
          </div>
          
          <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 sm:mb-8">
                <span className="w-2 h-2 bg-[#00875A] rounded-full animate-pulse"></span>
                <span className="text-white/90 text-xs sm:text-sm font-medium">✓ MKB specialist</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                ISO 9001 Certificaat Nodig?<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00875A] to-[#00C853]">
                  Binnen 3-6 Maanden Gecertificeerd
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
                Pragmatische ISO 9001 begeleiding voor het MKB. 
                Geen overbodige procedures, wel direct resultaat.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF8B00] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-[#FF9B20] hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Direct Starten
                  <ArrowRightIcon />
                </Link>
                <a
                  href="#voordelen"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Bekijk de Voordelen
                </a>
              </div>
              
              {/* Trust indicators - Responsive aanpassing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8 max-w-2xl mx-auto px-4">
                <div className="text-center bg-white/5 rounded-lg py-3 sm:py-0 sm:bg-transparent">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#00875A]">100%</div>
                  <div className="text-xs sm:text-sm text-white/80">Slagingsgarantie</div>
                </div>
                <div className="text-center bg-white/5 rounded-lg py-3 sm:py-0 sm:bg-transparent">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FF8B00]">Scherpe</div>
                  <div className="text-xs sm:text-sm text-white/80">Marktconforme prijzen</div>
                </div>
                <div className="text-center bg-white/5 rounded-lg py-3 sm:py-0 sm:bg-transparent">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#00875A]">10+</div>
                  <div className="text-xs sm:text-sm text-white/80">Jaar ervaring</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Direct Value Proposition */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 sm:mb-4">
                    Waarom Kiezen Ondernemers voor ISO 9001?
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                    ISO 9001 is dé internationale standaard voor kwaliteitsmanagement. 
                    Het helpt u processen te optimaliseren en klantvertrouwen te winnen.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#091E42] mb-3 sm:mb-4">Directe voordelen:</h3>
                    {[
                      'Meer opdrachten: Voldoe aan aanbestedingseisen',
                      'Hogere klanttevredenheid door betere processen',
                      'Kostenbesparingen door efficiëntere werkwijzen',
                      'Minder fouten en klachten',
                      'Professionele uitstraling naar klanten'
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-[#00875A]/10 rounded-lg flex items-center justify-center">
                          <CheckIcon />
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{benefit}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#f8fafb] to-white rounded-xl p-6 sm:p-8 border border-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00875A] to-[#006C48] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold text-[#091E42] mb-3">
                        Onze Garantie
                      </h4>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                        Wij garanderen dat u uw ISO 9001 certificaat behaalt. 
                        Geen certificaat? Dan betaalt u niets voor onze extra begeleiding tot u wel slaagt.
                      </p>
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-[#00875A] font-semibold hover:text-[#006C48] transition-colors text-sm sm:text-base"
                      >
                        Meer over onze garantie
                        <ArrowRightIcon />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Probleem/Oplossing Sectie */}
        <section id="voordelen" className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 sm:mb-4">
                  Herkenbaar? Wij Hebben de Oplossing
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
                {/* Problemen */}
                <div className="bg-red-50 rounded-2xl p-6 sm:p-8 border border-red-100">
                  <h3 className="text-xl sm:text-2xl font-bold text-red-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Zonder ISO 9001
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    {[
                      'Mist u grote opdrachten omdat ISO 9001 vereist is?',
                      'Werken processen niet efficiënt genoeg?',
                      'Ontbreekt overzicht in uw kwaliteitssysteem?',
                      'Zijn klanten ontevreden over inconsistente kwaliteit?',
                      'Verliest u tijd aan het steeds opnieuw uitvinden van processen?'
                    ].map((problem, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-red-500 font-bold text-base sm:text-lg">✗</span>
                        <span className="text-sm sm:text-base text-gray-700">{problem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Oplossingen */}
                <div className="bg-green-50 rounded-2xl p-6 sm:p-8 border border-green-100">
                  <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Met ISO 9001
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    {[
                      'Toegang tot grote opdrachten en aanbestedingen',
                      'Gestroomlijnde, efficiënte bedrijfsprocessen',
                      'Volledig inzicht in uw kwaliteitssysteem',
                      'Tevreden klanten door consistente kwaliteit',
                      'Tijd- en kostenbesparing door gestandaardiseerde processen'
                    ].map((solution, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold text-base sm:text-lg">✓</span>
                        <span className="text-sm sm:text-base text-gray-700">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="text-center px-4">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00875A] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-[#006C48] hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Ja, Ik Wil ISO 9001 Gecertificeerd Worden
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Onze Aanpak */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 sm:mb-4">
                  In 5 Stappen naar uw ISO 9001 Certificaat
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                  Onze beproefde aanpak zorgt voor een soepel certificeringstraject zonder onnodige complexiteit
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Gratis Kennismakingsgesprek',
                    description: 'We bespreken uw situatie en bepalen samen de beste aanpak voor uw organisatie.',
                    duration: '30 minuten'
                  },
                  {
                    step: '2',
                    title: 'Quick Scan & Plan van Aanpak',
                    description: 'We analyseren uw huidige processen en maken een helder stappenplan met realistische planning.',
                    duration: '1 week'
                  },
                  {
                    step: '3',
                    title: 'Implementatie & Begeleiding',
                    description: 'Samen bouwen we aan uw kwaliteitssysteem. Pragmatisch, praktisch en passend bij uw bedrijf.',
                    duration: '2-4 maanden'
                  },
                  {
                    step: '4',
                    title: 'Interne Audit & Optimalisatie',
                    description: 'We testen uw systeem, identificeren verbeterpunten en zorgen dat alles klaar is voor certificering.',
                    duration: '2 weken'
                  },
                  {
                    step: '5',
                    title: 'Certificeringsaudit & Certificaat',
                    description: 'De externe auditor komt langs. Wij zijn erbij voor ondersteuning. U ontvangt uw ISO 9001 certificaat!',
                    duration: '1 dag'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex gap-4 sm:gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00875A] to-[#006C48] rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-[#091E42] mb-2">{item.title}</h3>
                            <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {item.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {idx < 4 && (
                      <div className="ml-5 sm:ml-6 h-4 sm:h-6 w-px bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Waarom MaasISO */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 sm:mb-4">
                  Waarom Ondernemers Kiezen voor MaasISO
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                  Wij maken ISO 9001 certificering toegankelijk voor het MKB
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {[
                  {
                    icon: (
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    color: 'from-[#00875A] to-[#006C48]',
                    title: 'Marktconforme Prijzen',
                    description: 'Scherpe, transparante tarieven zonder verrassingen achteraf. U weet vooraf waar u aan toe bent.'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ),
                    color: 'from-[#FF8B00] to-[#FF6B00]',
                    title: 'MKB Specialist',
                    description: 'Wij begrijpen het MKB. Geen overbodige procedures, maar praktische oplossingen die werken.'
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                    color: 'from-[#00875A] to-[#006C48]',
                    title: '100% Slagingsgarantie',
                    description: 'Wij staan achter onze aanpak. U behaalt gegarandeerd uw ISO 9001 certificaat.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="text-center sm:col-span-1 md:col-span-1">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#091E42] mb-2 sm:mb-3">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 sm:mt-12 bg-gradient-to-br from-[#f8fafb] to-white rounded-2xl p-6 sm:p-8 md:p-10 border border-gray-100">
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#091E42] mb-3 sm:mb-4">
                      Direct persoonlijk contact?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Heeft u vragen of wilt u direct sparren over ISO 9001 voor uw organisatie? 
                      Neem contact op met onze senior consultant voor een vrijblijvend gesprek.
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      <a href="tel:+31623578344" className="flex items-center gap-3 text-[#00875A] font-semibold hover:text-[#006C48] transition-colors text-sm sm:text-base">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Bel direct: +31 (0)6 2357 8344
                      </a>
                      <a href="mailto:info@maasiso.nl" className="flex items-center gap-3 text-[#00875A] font-semibold hover:text-[#006C48] transition-colors text-sm sm:text-base">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Mail: info@maasiso.nl
                      </a>
                    </div>
                  </div>
                  <div className="text-center order-first md:order-last">
                    <div className="inline-block bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00875A] to-[#006C48] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 font-semibold">Vele klanten waren uiterst tevreden met onze service</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Sectie */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#091E42] mb-3 sm:mb-4">
                  Veelgestelde Vragen over ISO 9001
                </h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {[
                  {
                    question: 'Wat kost ISO 9001 certificering bij MaasISO?',
                    answer: 'Wij hanteren marktconforme, scherpe tarieven voor onze ISO 9001 begeleiding. Dit omvat alle begeleiding, documentatie, interne audit en ondersteuning tijdens de certificeringsaudit. Voor een vrijblijvende offerte kunt u contact met ons opnemen. De kosten voor de externe certificeringsinstelling komen hier nog bij.'
                  },
                  {
                    question: 'Hoe lang duurt het traject naar ISO 9001?',
                    answer: 'Gemiddeld duurt het traject 3-6 maanden, afhankelijk van de grootte van uw organisatie en de huidige staat van uw processen. Wij maken een realistische planning die past bij uw situatie.'
                  },
                  {
                    question: 'Is ISO 9001 geschikt voor kleine bedrijven?',
                    answer: 'Absoluut! ISO 9001 is juist zeer geschikt voor het MKB. Wij zorgen voor een pragmatische invulling zonder onnodige bureaucratie. Het systeem moet uw bedrijf helpen, niet hinderen.'
                  },
                  {
                    question: 'Wat gebeurt er na certificering?',
                    answer: 'Na certificering blijven wij beschikbaar voor vragen en ondersteuning. Jaarlijks komt de auditor terug voor een controle-audit. Wij kunnen u hierbij blijven ondersteunen tegen een aantrekkelijk tarief.'
                  },
                  {
                    question: 'Kunnen we direct starten?',
                    answer: 'Ja! Na een kort kennismakingsgesprek kunnen we vaak binnen een week starten met de quick scan en het implementatietraject.'
                  }
                ].map((faq, idx) => (
                  <details key={idx} className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer">
                      <h3 className="text-base sm:text-lg font-semibold text-[#091E42] pr-4">{faq.question}</h3>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-open:rotate-180 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm sm:text-base text-gray-600">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sterke CTA Sectie */}
        <section className="bg-gradient-to-br from-[#091E42] via-[#0A2540] to-[#091E42] text-white py-16 sm:py-20 md:py-28 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          </div>
          
          <div className="container-custom text-center relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                Start Vandaag met uw<br />
                ISO 9001 Certificeringstraject
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 leading-relaxed">
                Vraag een vrijblijvend gesprek aan en ontdek hoe snel en eenvoudig 
                ISO 9001 certificering kan zijn met de juiste begeleiding.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 sm:mb-10 max-w-xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="bg-white/5 rounded-lg py-3 sm:py-0 sm:bg-transparent">
                    <div className="text-2xl sm:text-3xl font-bold text-[#00875A]">✓</div>
                    <div className="text-xs sm:text-sm text-white/80 mt-1">Gratis advies</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-3 sm:py-0 sm:bg-transparent">
                    <div className="text-2xl sm:text-3xl font-bold text-[#FF8B00]">✓</div>
                    <div className="text-xs sm:text-sm text-white/80 mt-1">Binnen 24u reactie</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-3 sm:py-0 sm:bg-transparent">
                    <div className="text-2xl sm:text-3xl font-bold text-[#00875A]">✓</div>
                    <div className="text-xs sm:text-sm text-white/80 mt-1">Vrijblijvend</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF8B00] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold hover:bg-[#FF9B20] hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="hidden sm:inline">Ja, Ik Wil ISO 9001 Gecertificeerd Worden</span>
                  <span className="sm:hidden">Start ISO 9001 Certificering</span>
                  <ArrowRightIcon />
                </Link>
              </div>
              
              <p className="text-white/60 text-xs sm:text-sm mt-4 sm:mt-6">
                Of bel direct: <a href="tel:+31623578344" className="text-white/80 hover:text-white transition-colors">+31 (0)6 2357 8344</a>
              </p>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <RelatedServices services={relatedServices} />
      </main>
    </Iso9001Client>
  );
}