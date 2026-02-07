import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MaasISO – ISO-consultancy voor MKB",
  description:
    "Pragmatische begeleiding bij ISO-certificering, informatiebeveiliging en compliance voor organisaties in Nederland en België.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MaasISO – ISO-consultancy voor MKB",
    description:
      "Pragmatische begeleiding bij ISO-certificering, informatiebeveiliging en compliance voor organisaties in Nederland en België.",
    url: "/",
    siteName: "MaasISO",
    type: "website",
  },
};

const domainCards = [
  {
    title: "ISO-certificering",
    description:
      "Overzicht van relevante ISO-normen en wat certificering betekent voor kwaliteit en bedrijfsvoering.",
    href: "/iso-certificering",
  },
  {
    title: "Informatiebeveiliging",
    description:
      "Kaders en normen voor het beschermen van informatie, risico’s beheersen en aantoonbaar grip houden.",
    href: "/informatiebeveiliging",
  },
  {
    title: "AVG & Wetgeving",
    description:
      "Privacy en compliance: wat organisaties moeten organiseren om aan wet- en regelgeving te voldoen.",
    href: "/avg-wetgeving",
  },
  {
    title: "Kennis & Resources",
    description:
      "Artikelen en whitepapers om keuzes te onderbouwen en uw organisatie slimmer te maken.",
    href: "/kennis",
  },
] as const;

export default function Home() {
  // TODO: Homepage migreren naar Strapi – deze sectie moet content-gedreven worden
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      <section className="hero-section relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center py-20 md:py-28">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
            MaasISO – ISO-consultancy voor MKB
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Pragmatische begeleiding bij ISO-certificering, informatiebeveiliging en compliance voor
            organisaties in Nederland en België.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Plan een kennismaking
            </Link>
            <Link
              href="/iso-selector"
              className="primary-button bg-white text-[#091E42] hover:bg-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Doe de ISO-Selector
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <figure className="lg:col-span-8">
              <img
                src="/images/pexels-qmicertification-design-243125480-12324202.jpg"
                alt="ISO-consultant bespreekt implementatie met MKB-management tijdens adviesgesprek"
                loading="lazy"
                className="w-full h-auto rounded-xl"
              />
            </figure>
            <div className="lg:col-span-4">
              <p className="text-gray-700 leading-relaxed">
                Praktisch advies, afgestemd op de dagelijkse realiteit van MKB-organisaties.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-custom max-w-content px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-[#091E42]">
            ISO-consultant voor MKB
          </h2>
          <p className="text-lg text-center text-gray-700 max-w-3xl mx-auto leading-relaxed">
            MaasISO is een ISO-consultant (geen certificeerder). Wij begeleiden; de certificerende
            instelling toetst.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#091E42] mb-4">
              Waar helpen wij mee
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {domainCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="h-2 bg-gradient-to-r from-[#00875A] to-[#FF8B00]" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#091E42] group-hover:text-[#00875A] transition-colors duration-300 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-5">{card.description}</p>
                  <span className="inline-flex items-center gap-2 text-[#0057b8] font-medium group-hover:text-[#00875A] transition-colors duration-300">
                    Bekijk
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#091E42] mb-6 text-center">
            Waarom kiezen voor MaasISO
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg text-gray-700 mb-8">
            <li>Pragmatisch, geen papieren tijgers</li>
            <li>Focus op MKB</li>
            <li>Consultant, geen certificeerder</li>
            <li>Transparante kosten</li>
          </ul>
          <div className="flex justify-center">
            <Link href="/waarom-maasiso" className="text-primary font-medium underline">
              Meer over onze aanpak
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#091E42] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A] rounded-full opacity-10 -mr-20 -mt-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF8B00] rounded-full opacity-10 -ml-20 -mb-20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white rounded-full opacity-5 transform -translate-y-1/2"></div>
        </div>
        <div className="container-custom text-center relative z-10 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
            Klaar om te beginnen?
          </h2>
          <Link
            href="/contact"
            className="primary-button hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Plan een kennismaking
          </Link>
        </div>
      </section>
    </div>
  );
}
