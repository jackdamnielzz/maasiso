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
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 4.5h7.5L19 9v10.5H7V4.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M14.5 4.5V9H19" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path
          d="m9.5 13.5 1.8 1.8 3.2-3.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Informatiebeveiliging",
    description:
      "Kaders en normen voor het beschermen van informatie, risico’s beheersen en aantoonbaar grip houden.",
    href: "/informatiebeveiliging",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3.5 5.5 6v5.5c0 4.3 2.8 8.3 6.5 9.5 3.7-1.2 6.5-5.2 6.5-9.5V6L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m9.2 12 1.9 1.9 3.7-3.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "AVG & Wetgeving",
    description:
      "Privacy en compliance: wat organisaties moeten organiseren om aan wet- en regelgeving te voldoen.",
    href: "/avg-wetgeving",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 4v16m0-16-6 3v4.5c0 3 2.1 5.7 5 6.4m1-14 6 3v4.5c0 3-2.1 5.7-5 6.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8.2 10.5h7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Kennis & Resources",
    description:
      "Artikelen en whitepapers om keuzes te onderbouwen en uw organisatie slimmer te maken.",
    href: "/kennis",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 5.5c0-.8.7-1.5 1.5-1.5h9A2.5 2.5 0 0 1 18 6.5V18a2 2 0 0 0-2-2H6.5A1.5 1.5 0 0 1 5 14.5v-9Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8 8.5h6M8 11.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export default function Home() {
  // TODO: Homepage migreren naar Strapi – deze sectie moet content-gedreven worden
  return (
    <div className="bg-white">
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
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-[37.5rem] mx-auto">
            Pragmatische begeleiding bij ISO-certificering, informatiebeveiliging en compliance voor
            organisaties in Nederland en België.
          </p>
          <div className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="primary-button w-full sm:w-auto sm:min-w-[220px] text-center hover:bg-[#FF9B20] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Plan een kennismaking
            </Link>
            <Link
              href="/iso-selector"
              className="primary-button w-full sm:w-auto sm:min-w-[220px] text-center border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#091E42] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Doe de ISO-Selector
            </Link>
          </div>
        </div>
      </section>

      <section className="!py-12 lg:!py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <figure className="w-full">
              <img
                src="/images/maasisohome.png"
                alt="ISO-consultant bespreekt implementatie met MKB-management tijdens adviesgesprek"
                loading="lazy"
                className="w-full h-auto rounded-[8px] shadow-[0_12px_28px_rgba(9,30,66,0.16)]"
              />
            </figure>
            <div className="flex h-full items-center">
              <div className="flex items-start gap-4 lg:gap-5">
                <span
                  aria-hidden="true"
                  className="mt-1 h-16 lg:h-20 w-[3px] rounded-full bg-[#FF8B00]"
                />
                <p className="text-xl md:text-2xl text-[#172B4D] leading-relaxed">
                  Praktisch advies, afgestemd op de dagelijkse realiteit van MKB-organisaties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="!py-12 lg:!py-20 bg-[#f8f9fa]">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 h-px w-24 bg-gray-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-[#091E42]">
            ISO-consultant voor MKB
          </h2>
          <p className="text-lg text-center text-gray-700 max-w-[43.75rem] mx-auto leading-relaxed">
            MaasISO is een ISO-consultant (geen certificeerder). Wij begeleiden; de certificerende
            instelling toetst.
          </p>
        </div>
      </section>

      <section className="!py-12 lg:!py-20 bg-white">
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
                className="group flex h-full flex-col rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-0.5"
              >
                <div className="h-2 bg-gradient-to-r from-[#00875A] to-[#FF8B00]" />
                <div className="p-6 md:p-7 flex h-full flex-col">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFF4E6] text-[#FF8B00]">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#091E42] group-hover:text-[#00875A] transition-colors duration-300 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-5">{card.description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 text-[#0057b8] font-medium group-hover:text-[#00875A] transition-colors duration-300">
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

      <section className="!py-12 lg:!py-20 bg-[#f8f9fa]">
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#091E42] mb-6 text-center">
            Waarom kiezen voor MaasISO
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-lg text-gray-700 mb-10">
            <li className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4E6] text-[#FF8B00] font-semibold">
                ✓
              </span>
              <span>Pragmatisch, geen papieren tijgers</span>
            </li>
            <li className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4E6] text-[#FF8B00] font-semibold">
                ✓
              </span>
              <span>Focus op MKB</span>
            </li>
            <li className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4E6] text-[#FF8B00] font-semibold">
                ✓
              </span>
              <span>Consultant, geen certificeerder</span>
            </li>
            <li className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4E6] text-[#FF8B00] font-semibold">
                ✓
              </span>
              <span>Transparante kosten</span>
            </li>
          </ul>
          <div className="flex justify-center">
            <Link
              href="/waarom-maasiso"
              className="inline-flex items-center gap-2 text-[#0057B8] font-semibold hover:text-[#00875A] transition-colors duration-300"
            >
              Meer over onze aanpak
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#091E42] text-white !py-12 lg:!py-20 relative overflow-hidden">
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
