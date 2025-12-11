import React from 'react';

export const metadata = {
  title: 'Onze Voordelen | MaasISO - ISO-certificering & Informatiebeveiliging',
  description: 'Ontdek de voordelen van MaasISO: ✓ Praktisch advies ✓ Ervaren consultant ✓ Maatwerk voor MKB ✓ Resultaatgericht. Neem contact op!',
  keywords: 'ISO 9001, ISO 27001, ISO 27002, ISO 14001, ISO 16175, informatiebeveiliging, AVG, GDPR, privacy consultancy, BIO',
};

export default function OnzeVoordelenPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* Top Hero Section */}
      <section className="hero-section relative overflow-hidden py-20 md:py-28 bg-[#091E42]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
            Ontdek de Voordelen van MaasISO
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-normal">
            Voor uw organisatie, praktisch en resultaatgericht.
          </p>
          <a
            href="/contact"
            className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
          >
            Neem Contact Op
          </a>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-10 md:p-12 relative border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="h-2 bg-gradient-to-r from-[#00875A] via-[#00875A] to-[#FF8B00] mb-8"></div>

            <h2 className="text-3xl font-bold mb-8 text-[#00875A]">
              De Voordelen van Samenwerken met MaasISO
            </h2>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Waarom kiezen voor MaasISO als uw consultant? Het kiezen van een consultancy-partner heeft direct invloed op het succes van uw traject. MaasISO maakt het verschil door unieke voordelen waarvan organisaties in het MKB en de (semi-)overheid dagelijks profiteren. Lees hieronder waarom MaasISO voor u de beste keuze is als het gaat om ISO 9001 consultancy, informatiebeveiliging, privacy of integrale managementvraagstukken.
            </p>

            {/* Pragmatische & Praktische Aanpak */}
            <section className="mb-10">
              <h3 className="text-3xl font-bold mb-4 text-[#00875A]">
                Pragmatische & Praktische Aanpak
              </h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Wij geloven in praktisch advies: geen dikke rapporten om te verzamelen stof, maar direct toepasbare oplossingen. MaasISO vertaalt complexe ISO-normen en wetgeving naar werkbare processen voor uw organisatie, altijd gericht op implementatie in de dagelijkse praktijk.
              </p>
              <h4 className="font-semibold text-[#091E42] mb-2">Klantvoordeel:</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Sneller resultaat, minder administratieve last</li>
                <li>Systeem dat leeft: medewerkers gaan er daadwerkelijk mee aan de slag</li>
              </ul>
              <p>
                Meer weten over onze aanpak?{' '}
                <a href="/over-ons" className="text-[#00875A] font-semibold hover:underline">
                  Bekijk de werkwijze op de Over Ons pagina.
                </a>
              </p>
            </section>

            {/* Diepgaande Ervaring & Expertise */}
            <section className="mb-10">
              <h3 className="text-3xl font-bold mb-4 text-[#00875A]">
                Diepgaande Ervaring & Expertise
              </h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Achter MaasISO staat een ervaren consultant met een breed en stevig trackrecord in het begeleiden van MKB en (semi-)overheid op het gebied van ISO 9001, ISO 27001, AVG, BIO, ISO 14001 en meer. De combinatie van technische, organisatorische en juridische kennis, met praktijkervaring als FG, QHSE-consultant en manager, zorgt voor snel inzicht in knelpunten én kansen.
              </p>
              <h4 className="font-semibold text-[#091E42] mb-2">Klantvoordeel:</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Direct schakelen met een specialist die het speelveld door en door kent</li>
                <li>Snel de kern van een probleem vinden en passende oplossingen bieden</li>
                <li>Voorkomt kostbare valkuilen</li>
              </ul>
              <p>
                Zie meer over ervaring en expertise op de{' '}
                <a href="/over-ons" className="text-[#00875A] font-semibold hover:underline">
                  Over Ons pagina.
                </a>
              </p>
            </section>

            {/* Maatwerk & MKB Focus */}
            <section className="mb-10">
              <h3 className="text-3xl font-bold mb-4 text-[#00875A]">
                Maatwerk & MKB Focus
              </h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                MaasISO levert consultancy én implementatie die helemaal is afgestemd op uw situatie. Dankzij de schaal en flexibiliteit van een kleiner bureau worden oplossingen nauwgezet toegespitst op de bedrijfsvoering, cultuur en wensen van MKB-bedrijven of compacte (semi-)overheden.
              </p>
              <h4 className="font-semibold text-[#091E42] mb-2">Klantvoordeel:</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Geen standaardplan, maar oplossingen die écht passen</li>
                <li>Maatwerk zorgt voor efficiënte inzet van middelen</li>
              </ul>
              <p>
                <a href="/diensten" className="text-[#00875A] font-semibold hover:underline">
                  Bekijk voorbeelden van maatwerk bij onze diensten.
                </a>
              </p>
            </section>

            {/* Resultaatgericht & Waardecreatie */}
            <section className="mb-10">
              <h3 className="text-3xl font-bold mb-4 text-[#00875A]">
                Resultaatgericht & Waardecreatie
              </h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Ons werk draait om echte resultaten, niet slechts om het behalen van een certificaat. MaasISO focust zich op doelen als compliance, kostenreductie, klanttevredenheid en efficiency. U ziet het verschil terug in aantoonbare verbeteringen en duurzame borging.
              </p>
              <h4 className="font-semibold text-[#091E42] mb-2">Klantvoordeel:</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Investering in consultancy betaalt zich terug</li>
                <li>Verbeterde processen, lager risico, meer klanttevredenheid</li>
              </ul>
              <p>
                <a href="/diensten" className="text-[#00875A] font-semibold hover:underline">
                  Ontdek resultaatgerichte aanpak per dienst.
                </a>
              </p>
            </section>

            {/* (Optioneel) Integrale Benadering */}
            <section className="mb-10">
              <h3 className="text-3xl font-bold mb-4 text-[#00875A]">
                (Optioneel) Integrale Benadering
              </h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Meerdere normen of thema’s combineren? MaasISO bekijkt vraagstukken integraal en kan bijvoorbeeld kwaliteitsmanagement (ISO 9001) en informatiebeveiliging (ISO 27001 of BIO) in één samenhangende aanpak verbinden. Dit bespaart tijd, voorkomt dubbel werk en creëert synergie.
              </p>
              <h4 className="font-semibold text-[#091E42] mb-2">Klantvoordeel:</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Minder overlap, efficiënter traject</li>
                <li>Alles in samenhang geregeld binnen uw organisatie</li>
              </ul>
              <p>
                <a href="/diensten" className="text-[#00875A] font-semibold hover:underline">
                  Lees over integrale consultancy en managementadvies.
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>

      {/* Highlighted Bottom Text */}
      <section className="container-custom max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <p className="text-lg text-gray-700 leading-relaxed font-semibold italic border-l-4 border-[#FF8B00] pl-4">
          U investeert niet in rapporten die in de la verdwijnen, maar in een partner die zich inzet voor werkelijke vooruitgang.
        </p>
      </section>

      {/* Bottom Hero Section */}
      <section className="hero-section relative overflow-hidden py-20 md:py-28 bg-[#091E42] mt-12">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-6">
            Ervaar Zelf de Voordelen
          </h2>
          <p className="text-white text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Wilt u persoonlijk ontdekken wat MaasISO voor uw organisatie kan betekenen? Neem direct contact op voor een vrijblijvend kennismakingsgesprek of bekijk onze diensten in detail.
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="/contact"
              className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
            >
              Neem Contact Op
            </a>
            <a
              href="/diensten"
              className="primary-button bg-[#FF8B00] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#ffb347] transition-all duration-300 inline-block"
            >
              Bekijk Onze Diensten
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
