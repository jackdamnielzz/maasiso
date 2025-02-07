import React from 'react';
import CookiePreferencesButton from '@/components/cookies/CookiePreferencesButton';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy & Cookie Beleid
          </h1>
          <p className="text-xl text-blue-100">
            Hoe wij uw privacy beschermen en omgaan met uw gegevens
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookie Beleid</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Op deze website maken wij gebruik van cookies. Een cookie is een eenvoudig klein bestandje dat met pagina's van deze website wordt meegestuurd en door uw browser op uw harde schrijf van uw computer wordt opgeslagen.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Soorten Cookies</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">Functionele cookies</h3>
                </div>
                <p className="text-gray-700">Deze cookies zijn noodzakelijk voor het functioneren van de website.</p>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    Het onthouden van uw voorkeuren
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    Het beveiligen van uw bezoek
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    Het goed functioneren van formulieren
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">Analytische cookies</h3>
                </div>
                <p className="text-gray-700">Met deze cookies kunnen we het gebruik van onze website analyseren.</p>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    Hoe bezoekers onze website gebruiken
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    Hoe lang bezoekers op onze pagina's blijven
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    Welke pagina's het meest worden bezocht
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Uw Cookie Voorkeuren</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              U kunt uw cookievoorkeuren op elk moment aanpassen. Bij uw eerste bezoek aan onze website vragen wij u om toestemming voor het plaatsen van cookies. U kunt deze toestemming later altijd weer intrekken of aanpassen via de cookie-instellingen onderaan onze website.
            </p>
            <CookiePreferencesButton />
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Neem contact met ons op</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    privacy@maasiso.com
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +31 (0)10 123 4567
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Postbus 1234, 3000 AB Rotterdam
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Laatste update: {new Date().toLocaleDateString('nl-NL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}