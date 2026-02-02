'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DeploymentTimestamp } from './DeploymentTimestamp';

export default function HomeContent() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Verbeter Uw Bedrijf met <span className="text-white">MaasISO</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Expert in ISO-normen en kwaliteitsmanagement. Snel, efficiënt en op maat
              gemaakt voor het MKB.
            </p>
            <Link 
              href="/contact" 
              className="primary-button"
            >
              Vraag Een Gratis Consult Aan
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Onze Diensten
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-sm md:max-w-5xl mx-auto">
            {[
              {
                icon: '/file.svg',
                title: 'ISO Certificering',
                description: 'Begeleiding bij het behalen van ISO 9001, 27001 en 14001 certificeringen'
              },
              {
                icon: '/window.svg',
                title: 'Procesoptimalisatie',
                description: 'Stroomlijn uw bedrijfsprocessen voor maximale efficiëntie'
              },
              {
                icon: '/globe.svg',
                title: 'Kwaliteitsmanagement',
                description: 'Implementatie en verbetering van kwaliteitsmanagementsystemen'
              }
            ].map((service, index) => (
              <div key={index} className="service-card w-full">
                <div className="icon-wrapper">
                  <Image
                    src={service.icon}
                    alt={service.title}
                    width={40}
                    height={40}
                    sizes="40px"
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <Link 
                  href="/iso-certificering" 
                  className="text-[#00875A] font-medium hover:text-[#006C48]"
                >
                  Lees meer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Waarom MaasISO?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Wij onderscheiden ons door onze efficiënte werkwijze en persoonlijke aanpak
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-sm md:max-w-4xl mx-auto">
            {[
              {
                title: 'Snelle Implementatie',
                description: 'Projecten in ongeveer een derde van de gebruikelijke tijd'
              },
              {
                title: 'Expertise & Ervaring',
                description: 'Specialisten in ISO-normen en kwaliteitsmanagement'
              },
              {
                title: 'Op Maat Gemaakt',
                description: 'Oplossingen specifiek afgestemd op uw bedrijf'
              },
              {
                title: 'Kennisoverdracht',
                description: 'Focus op zelfredzaamheid na implementatie'
              }
            ].map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="check-icon">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#091E42] text-white py-16 md:py-24">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klaar om uw organisatie naar een hoger niveau te tillen?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Wilt u weten hoe we u kunnen helpen? Neem contact op voor een gratis gesprek over kwaliteit en veiligheid.
          </p>
          <Link href="/contact" className="primary-button">
            Neem Contact Op
          </Link>
        </div>
      </section>

      {/* Deployment Timestamp */}
      <DeploymentTimestamp />
    </main>
  );
}
