"use client";

import React, { Suspense } from 'react';
import CookiePreferencesButton from './CookiePreferencesButton';
import MarkdownContent from '@/components/features/MarkdownContent';
import TableOfContents from '@/components/features/TableOfContents';

const cookieContent = `
## Cookie Beleid

Op deze website maken wij gebruik van cookies. Een cookie is een eenvoudig klein bestandje dat met pagina's van deze website wordt meegestuurd en door uw browser op uw harde schrijf van uw computer wordt opgeslagen.

## Soorten Cookies

### Functionele cookies

Deze cookies zijn noodzakelijk voor het functioneren van de website.

* Het onthouden van uw voorkeuren
* Het beveiligen van uw bezoek
* Het goed functioneren van formulieren

### Analytische cookies

Met deze cookies kunnen we het gebruik van onze website analyseren.

* Hoe bezoekers onze website gebruiken
* Hoe lang bezoekers op onze pagina's blijven
* Welke pagina's het meest worden bezocht

## Uw Cookie Voorkeuren

U kunt uw cookievoorkeuren op elk moment aanpassen. Bij uw eerste bezoek aan onze website vragen wij u om toestemming voor het plaatsen van cookies. U kunt deze toestemming later altijd weer intrekken of aanpassen via de cookie-instellingen onderaan onze website.

## Contact

### Neem contact met ons op

* Email: privacy@maasiso.com
* Telefoon: +31 (0)6 2357 8344
`;

export default function CookiePolicyContent() {
  return (
    <>
      <section className="text-center mt-6 mb-4 break-words">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Cookie <span className="text-[#FF8B00]">Policy</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-800/90 max-w-2xl mx-auto">
          Wij zijn transparant over het gebruik van cookies op onze website
        </p>
      </section>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <TableOfContents content={cookieContent} />
        <MarkdownContent content={cookieContent} />
        <section className="bg-gray-50 rounded-xl p-8 border border-gray-200 mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookie Instellingen</h2>
          <Suspense fallback={
            <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          }>
            <CookiePreferencesButton />
          </Suspense>
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
    </>
  );
}