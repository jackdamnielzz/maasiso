'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';

// Custom spectacular icons
const icons = {
  mission: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  vision: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  values: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  experience: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
};

const roles = [
  {
    title: "ISO 9001",
    desc: "Kwaliteitsmanagement",
    info: "Heeft organisaties begeleid bij het opzetten, implementeren en optimaliseren van kwaliteitsmanagementsystemen volgens ISO 9001, met focus op praktische verbetering en continue optimalisatie.",
    color: "from-emerald-400 to-emerald-600"
  },
  {
    title: "ISO 27001",
    desc: "Informatiebeveiliging",
    info: "Heeft informatiebeveiligingssystemen opgezet en geïmplementeerd volgens ISO 27001, en organisaties geadviseerd over risicogestuurde beveiliging en certificering.",
    color: "from-blue-400 to-blue-600"
  },
  {
    title: "ISO 14001",
    desc: "Milieumanagement",
    info: "Heeft milieumanagementsystemen ontwikkeld en onderhouden, en organisaties ondersteund bij duurzaamheid, naleving en praktische milieuprestaties.",
    color: "from-green-400 to-green-600"
  },
  {
    title: "ISO 16175",
    desc: "Informatiebeheer",
    info: "Heeft advies gegeven over slim, compliant en efficiënt document- en informatiebeheer op basis van ISO 16175.",
    color: "from-cyan-400 to-cyan-600"
  },
  {
    title: "BIO",
    desc: "Baseline Informatiebeveiliging Overheid",
    info: "Heeft de BIO-norm geïmplementeerd en getoetst bij overheidsorganisaties en leveranciers, en bijgedragen aan structurele compliance en praktische toepassing.",
    color: "from-indigo-400 to-indigo-600"
  },
  {
    title: "Functionaris Gegevensbescherming",
    desc: "Privacy & gegevensbescherming",
    info: "Heeft als (externe) FG toezicht gehouden op naleving van de AVG, privacybeleid, DPIA’s en bewustwording.",
    color: "from-purple-400 to-purple-600"
  }
];

export default function OverOnsContent() {
  const [activeRole, setActiveRole] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="flex-1 bg-white overflow-hidden">
      {/* Spectacular Hero Section with Parallax Effect */}
      {/* Use hero-section to pull the background up under the fixed navbar (avoid white gap). */}
      <section className="hero-section relative overflow-hidden flex items-center justify-center bg-[#091E42] text-white min-h-[80vh]">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#00875A] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF8B00] rounded-full blur-[100px]"></div>
        </div>
        
        <div className="container-custom relative z-10 text-center px-4">
          <ScrollReveal className="reveal-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Onze Passie voor <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00875A] to-[#FF8B00]">Perfectie</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal className="reveal-up" delay={200}>
            <p className="text-xl md:text-3xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              MaasISO verbindt complexe normen met de dagelijkse praktijk van ambitieuze organisaties.
            </p>
          </ScrollReveal>
          <ScrollReveal className="reveal-up" delay={400}>
            <div className="mt-12">
              <Link
                href="/contact"
                className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-[#FF8B00] rounded-full hover:bg-[#E67E00] shadow-[0_10px_40px_rgba(255,139,0,0.3)] hover:shadow-[0_20px_60px_rgba(255,139,0,0.4)] transform hover:-translate-y-1"
              >
                <span>Maak Kennis</span>
                <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Story Section - Modern Card Layout */}
      <section className="py-24 bg-white relative">
        <div className="container-custom px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2">
              <ScrollReveal className="reveal-left">
                <div className="relative">
                  <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#00875A]/10 rounded-full"></div>
                  <h2 className="text-4xl md:text-5xl font-bold text-[#091E42] mb-8 leading-tight">
                    Wie is <span className="text-[#00875A]">MaasISO</span>?
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-8">
                    MaasISO is een onafhankelijk consultancybureau dat gelooft in de kracht van eenvoud. Wij vertalen internationale normen naar werkbare systemen die écht bijdragen aan uw succes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-[#F4F7F9] rounded-2xl border-l-4 border-[#00875A]">
                      <h4 className="font-bold text-[#091E42] mb-2 text-lg">Pragmatisch</h4>
                      <p className="text-gray-600">Geen dikke rapporten, maar direct toepasbare oplossingen.</p>
                    </div>
                    <div className="p-6 bg-[#F4F7F9] rounded-2xl border-l-4 border-[#FF8B00]">
                      <h4 className="font-bold text-[#091E42] mb-2 text-lg">Helder</h4>
                      <p className="text-gray-600">Transparante communicatie en eerlijk advies op elk niveau.</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            
            <div className="w-full lg:w-1/2">
              <ScrollReveal className="reveal-right" delay={200}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#00875A] to-[#FF8B00] rounded-[3rem] rotate-3 scale-105 opacity-10 transition-transform duration-500 group-hover:rotate-1"></div>
                  <div className="relative bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_40px_100px_rgba(9,30,66,0.1)] border border-gray-100">
                    <h3 className="text-2xl font-bold text-[#091E42] mb-6">Onze Missie</h3>
                    <p className="text-lg text-gray-600 italic leading-relaxed mb-8">
                      "Zoveel mogelijk organisaties helpen om échte stappen te maken. Papieren tijgers vervangen door systemen die leven en waarde creëren."
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-1 bg-[#00875A] rounded-full"></div>
                      <div className="w-4 h-1 bg-[#FF8B00] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Over Niels Maas Section */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-gray-50">
        <div className="container-custom px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <ScrollReveal className="reveal-left">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#00875A] to-[#FF8B00] rounded-[2rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative aspect-[4/5] bg-[#091E42] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-12 h-12 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <h4 className="text-white text-2xl font-bold mb-2">Niels Maas</h4>
                    <p className="text-white/60 text-lg">Senior consultant & Oprichter</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            
            <div className="w-full lg:w-1/2">
              <ScrollReveal className="reveal-right" delay={200}>
                <div>
                  <span className="text-[#FF8B00] font-bold tracking-widest uppercase text-sm mb-4 block">De Persoon Achter MaasISO</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-[#091E42] mb-8 leading-tight">
                    Over <span className="text-[#00875A]">Niels Maas</span>
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-6">
                    Niels Maas is een doorgewinterde expert in ISO-normen (9001, 27001), AVG/GDPR en de BIO. Als oprichter en Senior consultant bij MaasISO helpt hij organisaties met het professionaliseren en beveiligen van hun bedrijfsvoering.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed mb-10">
                    Met een nuchtere en resultaatgerichte aanpak vertaalt hij complexe normen naar praktische meerwaarde. Zijn passie ligt in het creëren van systemen die écht werken voor de organisatie.
                  </p>
                  
                  <Link
                    href="/over-niels-maas"
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-[#00875A] rounded-full hover:bg-[#006644] shadow-lg transform hover:-translate-y-1"
                  >
                    <span>Lees meer over Niels</span>
                    <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Roles Section - espectacular effect */}
      <section className="py-24 bg-[#F4F7F9]">
        <div className="container-custom px-4">
          <div className="text-center mb-16">
            <ScrollReveal className="reveal-up">
              <span className="text-[#FF8B00] font-bold tracking-widest uppercase text-sm mb-4 block">Onze Expertise</span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#091E42] mb-6">Wie staat er achter MaasISO?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Een ervaren specialist met een diepe achtergrond in publieke en private sectoren.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {roles.map((role, idx) => (
              <ScrollReveal key={idx} className="reveal-up" delay={idx * 100}>
                <div 
                  className={`relative h-full p-8 rounded-3xl transition-all duration-500 cursor-pointer overflow-hidden group border border-white bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] ${activeRole === idx ? 'ring-2 ring-[#00875A]' : ''}`}
                  onClick={() => setActiveRole(activeRole === idx ? null : idx)}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-bl-[100px]`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-gradient-to-br ${role.color} text-white shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <span className="text-xs font-bold">{role.title.split(' ')[0]}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[#091E42] mb-3 group-hover:text-[#00875A] transition-colors">{role.title}</h3>
                    <p className="text-gray-500 mb-6 font-medium">{role.desc}</p>
                    
                    <div className={`overflow-hidden transition-all duration-500 ${activeRole === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-gray-600 leading-relaxed py-4 border-t border-gray-100">
                        {role.info}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center text-[#00875A] font-bold text-sm">
                      <span>{activeRole === idx ? 'Minder info' : 'Meer info'}</span>
                      <svg className={`w-4 h-4 ml-2 transition-transform duration-300 ${activeRole === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Values Section with JS interaction */}
      <section className="py-24 bg-white relative">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: icons.mission, label: "Onze Drijfveer", text: "Echte stappen maken, geen papieren tijgers." },
              { icon: icons.vision, label: "Transparantie", text: "Eerlijk advies en duidelijke communicatie." },
              { icon: icons.values, label: "Vertrouwen", text: "Een partner voor de lange termijn." },
              { icon: icons.experience, label: "Ervaring", text: "Brede expertise in publieke en private sectoren." }
            ].map((value, i) => (
              <ScrollReveal key={i} className="reveal-up" delay={i * 150}>
                <div className="group text-center">
                  <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-white shadow-[0_15px_35px_rgba(0,135,90,0.1)] text-[#00875A] transform transition-all duration-500 group-hover:scale-110 group-hover:bg-[#00875A] group-hover:text-white group-hover:rotate-6">
                    {value.icon}
                  </div>
                  <h4 className="text-xl font-bold text-[#091E42] mb-3">{value.label}</h4>
                  <p className="text-gray-600">{value.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA - Unified Style */}
      <section className="hero-section relative overflow-hidden !mt-0 !py-20 md:!py-28 bg-[#091E42]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <ScrollReveal className="reveal-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-6">
              Klaar om de volgende stap te zetten?
            </h2>
            <p className="text-white text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Laten we samen kijken hoe we uw organisatie sterker, veiliger en efficiënter kunnen maken. Neem contact op voor een vrijblijvend gesprek.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="/contact"
                className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
              >
                Neem Contact Op
              </Link>
              <a
                href="https://www.linkedin.com/company/maasiso"
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
              >
                Kijk op LinkedIn
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
