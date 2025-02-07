'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="mb-6">
                Verbeter Uw Bedrijf met{' '}
                <span className="text-[#FF8B00]">MaasISO</span>
              </h1>
              <p className="hero-text mb-8">
                Expert in ISO-normen en kwaliteitsmanagement. Snel, efficiënt en op maat
                gemaakt voor het MKB.
              </p>
              <Link href="/contact" className="cta-button">
                Neem Contact Op
              </Link>
            </div>
            <div className="relative h-[400px] hidden md:block">
              <Image
                src="/globe.svg"
                alt="Global Quality Management"
                fill
                className="object-contain animate-float"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-4xl font-medium text-center mb-16">Onze Diensten</h2>
          <div className="grid md:grid-cols-3 gap-8">
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
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 mb-6 relative">
                  <Image
                    src={service.icon}
                    alt={service.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-2xl font-medium mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium mb-4">Waarom MaasISO?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Wij onderscheiden ons door onze efficiënte werkwijze en persoonlijke aanpak
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
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
              <div
                key={index}
                className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[#FF8B00] rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                  <h3 className="text-xl font-medium mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#091E42] text-white py-20">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-medium mb-6">
            Klaar om uw bedrijf naar het volgende niveau te tillen?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Neem contact met ons op voor een vrijblijvend gesprek over de mogelijkheden
            voor uw organisatie.
          </p>
          <Link href="/contact" className="cta-button">
            Start Vandaag Nog
          </Link>
        </div>
      </section>
    </main>
  )
}
