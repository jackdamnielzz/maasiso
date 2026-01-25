import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home | MaasISO - ISO Consultancy & Informatiebeveiliging voor MKB',
  description: 'MaasISO: uw pragmatische partner voor ISO consultancy (9001, 27001), AVG/privacy en management advies in Nederland. Ontdek onze diensten voor het MKB.',
  keywords: 'ISO consultancy, ISO 9001, ISO 27001, AVG advies, GDPR compliance, MKB advies, kwaliteitsmanagement, informatiebeveiliging, privacy compliance',
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-blue-50 to-white relative">
        <div className="absolute inset-0 bg-opacity-10 bg-pattern"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Praktisch Advies voor Kwaliteit, Security & Privacy
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Met pragmatische ISO-consultancy helpt MaasISO het MKB om processen efficiënter, veiliger en compliant te maken. Geen gedoe, wél resultaten.
            </p>
            <div className="mt-8">
              <a
                href="/diensten"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                Ontdek onze Diensten
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="w-full py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Uw Deskundige Partner voor het MKB</h2>
            <p className="text-lg text-gray-600">
              MaasISO biedt praktische en doelgerichte consultancy rondom kwaliteitsmanagement, informatiebeveiliging en privacy voor organisaties in het MKB. Onze specialisten combineren jarenlange ervaring met een flexibele, no-nonsense aanpak die écht bij uw onderneming past.
            </p>
            <a href="/over-ons" className="text-blue-600 hover:text-blue-700 mt-4 inline-block font-semibold">
              Lees meer over MaasISO en onze aanpak →
            </a>
          </div>
        </div>
      </section>

      {/* Expertise Areas Section */}
      <section className="w-full py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Onze Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">✅</span>
                <h3 className="text-xl font-semibold">ISO 9001 – Kwaliteitsmanagement</h3>
              </div>
              <p className="text-gray-600">
                Wilt u processen verbeteren, uw kwaliteit verhogen en klanten tevreden maken? Als ervaren <strong>ISO 9001 consultant</strong> ondersteunt MaasISO pragmatisch bij certificatie en implementatie.
              </p>
              <a href="/iso-9001" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                Meer over ISO 9001 →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🔒</span>
                <h3 className="text-xl font-semibold">ISO 27001 & BIO – Informatiebeveiliging</h3>
              </div>
              <p className="text-gray-600">
                Bescherm uw organisatie tegen digitale risico's en voldoe aan normen met praktische begeleiding richting ISO 27001 of BIO. Onze ervaren <strong>ISO 27001 consultants</strong> helpen u concrete stappen zetten.
              </p>
              <a href="/iso-27001" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                Meer over ISO 27001 →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🛡️</span>
                <h3 className="text-xl font-semibold">AVG/GDPR – Privacy compliance</h3>
              </div>
              <p className="text-gray-600">
                Als <strong>privacy consultant</strong> maakt MaasISO uw AVG-compliance begrijpelijk en effectief. Van policy tot praktische implementatie: wij helpen u snel voldoen aan privacyregels.
              </p>
              <a href="/avg" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                Meer over AVG →
              </a>
            </div>
          </div>
          <div className="text-center mt-8">
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/iso-14001" className="text-blue-600 hover:text-blue-700">ISO 14001</a>
              <span className="text-gray-400">|</span>
              <a href="/iso-16175" className="text-blue-600 hover:text-blue-700">ISO 16175</a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">De Voordelen van Samenwerken met MaasISO</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">Pragmatische oplossingen</h3>
              <p className="text-gray-600">Geen bureaucratie, wel werkbare processen</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Bewezen ervaring</h3>
              <p className="text-gray-600">Onze consultants begrijpen uw praktijk door en door</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-lg font-semibold mb-2">Persoonlijk maatwerk</h3>
              <p className="text-gray-600">Advies passend bij úw organisatie en úw doelen</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Resultaatgericht</h3>
              <p className="text-gray-600">Concrete verbeteringen en merkbare vooruitgang</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-lg font-semibold mb-2">Specifiek voor MKB</h3>
              <p className="text-gray-600">Gericht op de schaal, cultuur en uitdagingen van het midden- en kleinbedrijf</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="w-full py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Voor Wie Werken Wij?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Wij zijn gespecialiseerd in het ondersteunen van het MKB. Als MKB-ondernemer heeft u behoefte aan praktische oplossingen die direct resultaat opleveren. Onze aanpak is specifiek ontwikkeld voor organisaties zoals die van u, waarbij we rekening houden met uw unieke uitdagingen en beschikbare middelen.
            </p>
            <a 
              href="/over-ons"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Lees meer over onze aanpak →
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Wat Onze Klanten Zeggen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonial placeholders - to be filled with actual content */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 italic mb-4">
                "Placeholder voor klantervaring 1"
              </p>
              <p className="font-semibold">Naam Klant</p>
              <p className="text-sm text-gray-500">Functie, Bedrijf</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 italic mb-4">
                "Placeholder voor klantervaring 2"
              </p>
              <p className="font-semibold">Naam Klant</p>
              <p className="text-sm text-gray-500">Functie, Bedrijf</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="w-full py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Klaar om uw organisatie écht te verbeteren?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Neem vrijblijvend contact op en ontdek hoe MaasISO u concreet verder helpt met kwaliteitsmanagement, informatiebeveiliging en privacy-compliance.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Neem Contact Op
            </a>
            <a
              href="/diensten"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors duration-300 shadow-md hover:shadow-lg border border-blue-200"
            >
              Bekijk Alle Diensten
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
