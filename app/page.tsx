
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { FactBlock } from '@/components/features/FactBlock';
import { KeyTakeaways } from '@/components/features/KeyTakeaways';

export const metadata: Metadata = {
  title: "ISO-certificering & informatiebeveiliging voor MKB | MaasISO",
  description:
    "MaasISO is de ISO-consultant voor MKB-bedrijven in Nederland. Pragmatische begeleiding bij ISO 9001, ISO 27001, ISO 14001, AVG compliance en NIS2. Transparante kosten, bewezen resultaten.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ISO-certificering & informatiebeveiliging voor MKB | MaasISO",
    description:
      "MaasISO is de ISO-consultant voor MKB-bedrijven in Nederland. Pragmatische begeleiding bij ISO 9001, ISO 27001, ISO 14001, AVG compliance en NIS2.",
    url: "/",
    siteName: "MaasISO",
    type: "website",
  },
};

const keyTakeaways = [
  {
    onderwerp: "ISO 9001 certificering",
    waarde: "Gemiddeld 3-6 maanden doorlooptijd, investering vanaf EUR 5.000 voor MKB",
  },
  {
    onderwerp: "ISO 27001 certificering",
    waarde: "93 beheersmaatregelen, 96.709 certificaten wereldwijd in 2024 (+99% groei)",
  },
  {
    onderwerp: "AVG compliance",
    waarde: "Boetes tot EUR 20 miljoen of 4% jaaromzet bij niet-naleving",
  },
  {
    onderwerp: "NIS2/Cyberbeveiligingswet",
    waarde: "ISO 27001 dekt circa 70-80% van de NIS2 Artikel 21-verplichtingen",
  },
  {
    onderwerp: "Slagingspercentage MaasISO",
    waarde: "100% succesgarantie op certificeringsaudits",
  },
] as const;

const kernfeiten = [
  {
    kernfeit: "ISO 9001 certificaten wereldwijd",
    waarde: "1,1+ miljoen",
    bron: "ISO Survey 2023 - International Organization for Standardization",
  },
  {
    kernfeit: "ISO 27001 certificaten wereldwijd (2024)",
    waarde: "96.709 (+99% groei)",
    bron: "ISO Survey 2024 via IAF CertSearch",
  },
  {
    kernfeit: "ISO 27001 certificaten in Nederland",
    waarde: "1.568 organisaties, 3.345 locaties",
    bron: "ISO Survey 2024",
  },
  {
    kernfeit: "Maximale AVG-boete",
    waarde: "EUR 20 miljoen of 4% wereldwijde jaaromzet",
    bron: "Autoriteit Persoonsgegevens, art. 83 GDPR",
  },
  {
    kernfeit: "NIS2 dekking door ISO 27001",
    waarde: "70-80% van Artikel 21-maatregelen",
    bron: "Mapping ISO 27001 Annex A op NIS2 Art. 21",
  },
  {
    kernfeit: "Gemiddelde implementatietijd ISO 9001 (MKB)",
    waarde: "3-6 maanden",
    bron: "MaasISO praktijkervaring",
  },
  {
    kernfeit: "Gemiddelde kosten ISO 9001 (MKB)",
    waarde: "EUR 5.000-EUR 15.000",
    bron: "MaasISO marktanalyse 2026",
  },
] as const;

const dienstentabel = [
  {
    norm: "ISO 9001",
    focus: "Kwaliteitsmanagement",
    duur: "3-6 maanden",
    kosten: "EUR 5.000-EUR 15.000",
  },
  {
    norm: "ISO 27001",
    focus: "Informatiebeveiliging",
    duur: "3-9 maanden",
    kosten: "EUR 18.000-EUR 25.000",
  },
  {
    norm: "ISO 14001",
    focus: "Milieumanagement",
    duur: "3-6 maanden",
    kosten: "EUR 4.000-EUR 10.000",
  },
  {
    norm: "ISO 45001",
    focus: "Gezond & veilig werken",
    duur: "3-6 maanden",
    kosten: "Op aanvraag",
  },
  {
    norm: "ISO 16175",
    focus: "Digitaal informatiebeheer",
    duur: "Op aanvraag",
    kosten: "Op aanvraag",
  },
] as const;
const waaromMaasIso = [
  {
    kenmerk: "Pragmatische aanpak",
    betekenis:
      "Geen dikke rapporten die stof verzamelen, maar direct toepasbare oplossingen die werken in de dagelijkse praktijk.",
  },
  {
    kenmerk: "MKB-focus",
    betekenis: "Oplossingen afgestemd op de schaal, het budget en de cultuur van MKB-organisaties.",
  },
  {
    kenmerk: "Consultant, geen certificeerder",
    betekenis:
      "Onafhankelijk advies zonder belangenverstrengeling; de certificerende instelling toetst.",
  },
  {
    kenmerk: "Integrale benadering",
    betekenis:
      "Meerdere normen combineren in een traject bespaart tijd, geld en voorkomt dubbel werk.",
  },
  {
    kenmerk: "Transparante kosten",
    betekenis: "Vooraf duidelijkheid over investering, doorlooptijd en deliverables.",
  },
  {
    kenmerk: "100% slagingspercentage",
    betekenis: "Bewezen track record op certificeringsaudits.",
  },
  {
    kenmerk: "15+ jaar ervaring",
    betekenis:
      "Breed trackrecord in publieke en private sector: ISO 9001, ISO 27001, ISO 14001, BIO en AVG.",
  },
] as const;

const kostenTabel = [
  {
    traject: "ISO 9001",
    grootte: "1-10 FTE",
    investering: "EUR 5.000-EUR 8.000",
    duur: "3-4 maanden",
  },
  {
    traject: "ISO 9001",
    grootte: "10-50 FTE",
    investering: "EUR 8.000-EUR 15.000",
    duur: "4-6 maanden",
  },
  {
    traject: "ISO 27001",
    grootte: "1-10 FTE",
    investering: "EUR 10.000-EUR 18.000",
    duur: "3-6 maanden",
  },
  {
    traject: "ISO 27001",
    grootte: "10-50 FTE",
    investering: "EUR 18.000-EUR 25.000",
    duur: "6-9 maanden",
  },
  {
    traject: "ISO 14001",
    grootte: "MKB",
    investering: "EUR 4.000-EUR 10.000",
    duur: "3-6 maanden",
  },
  {
    traject: "AVG compliance",
    grootte: "MKB",
    investering: "EUR 3.000-EUR 10.000",
    duur: "4-12 weken",
  },
] as const;

const faqItems = [
  {
    vraag: "Wat doet een ISO-consultant?",
    antwoord:
      "Een ISO-consultant begeleidt organisaties bij het implementeren van een managementsysteem dat voldoet aan een ISO-norm. De consultant helpt bij de nulmeting, documentatie, implementatie en auditvoorbereiding. Een consultant geeft zelf geen certificaat af; dat doet de onafhankelijke certificerende instelling.",
  },
  {
    vraag: "Wat kost ISO-certificering voor een klein bedrijf?",
    antwoord:
      "Voor MKB-bedrijven met 1-10 medewerkers liggen de kosten voor ISO 9001 certificering gemiddeld tussen EUR 5.000 en EUR 8.000. Voor ISO 27001 tussen EUR 10.000 en EUR 18.000. Deze bedragen zijn inclusief consultancy en certificatie-audit.",
  },
  {
    vraag: "Hoe lang duurt een ISO-certificeringstraject?",
    antwoord:
      "De gemiddelde doorlooptijd voor MKB-organisaties ligt tussen 3 en 9 maanden, afhankelijk van de norm, de organisatiegrootte en de mate waarin processen al zijn vastgelegd.",
  },
  {
    vraag: "Wat is het verschil tussen een consultant en een certificeerder?",
    antwoord:
      "Een consultant begeleidt de implementatie van het managementsysteem. Een certificerende instelling (zoals Kiwa, TUV, DNV of LRQA) voert de onafhankelijke audit uit en verleent het certificaat. MaasISO is een consultant: wij begeleiden, maar certificeren niet zelf.",
  },
  {
    vraag: "Is ISO-certificering verplicht?",
    antwoord:
      "ISO-certificering is in Nederland niet wettelijk verplicht. Wel wordt certificering steeds vaker gevraagd door klanten, ketenpartners en in aanbestedingen. Met de invoering van de NIS2-richtlijn (Cyberbeveiligingswet) wordt aantoonbare informatiebeveiliging voor bepaalde sectoren wel een wettelijke verplichting.",
  },
  {
    vraag: "Welke ISO-norm past bij mijn organisatie?",
    antwoord:
      "Dat hangt af van uw sector, klanten en doelstellingen. ISO 9001 is de meest universele norm (kwaliteitsmanagement). ISO 27001 richt zich op informatiebeveiliging. ISO 14001 op milieumanagement. Gebruik onze gratis ISO Norm Selector voor een persoonlijk advies.",
  },
  {
    vraag: "Kan ik meerdere ISO-normen combineren?",
    antwoord:
      "Ja. ISO-normen zijn gebaseerd op dezelfde Harmonized Structure, waardoor ze goed integreerbaar zijn in een managementsysteem. Dit bespaart dubbel werk, vereenvoudigt audits en verlaagt kosten. MaasISO heeft ruime ervaring met integrale trajecten.",
  },
  {
    vraag: "Wat is NIS2 en hoe verhoudt het zich tot ISO 27001?",
    antwoord:
      "NIS2 (de Cyberbeveiligingswet) stelt beveiligingseisen voor essentiele en belangrijke entiteiten in de EU. ISO 27001 gecertificeerde organisaties hebben circa 70-80% van de NIS2 Artikel 21-maatregelen al aantoonbaar geimplementeerd. ISO 27001 is daarmee het meest directe pad naar NIS2 compliance.",
  },
  {
    vraag: "Werkt MaasISO ook buiten Nederland?",
    antwoord: "MaasISO bedient organisaties in Nederland en Belgie/Vlaanderen.",
  },
  {
    vraag: "Hoe neem ik contact op?",
    antwoord:
      "Neem contact op via info@maasiso.nl of bel +31 (0)6 2357 8344 voor een vrijblijvend kennismakingsgesprek. U kunt ook direct een afspraak inplannen via onze contactpagina.",
  },
] as const;
const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "MaasISO",
  description:
    "Onafhankelijk ISO-consultancybureau gespecialiseerd in ISO 9001, ISO 27001, ISO 14001, AVG compliance en NIS2 begeleiding voor MKB-bedrijven in Nederland en Belgie.",
  url: "https://www.maasiso.nl",
  telephone: "+31-6-23578344",
  email: "info@maasiso.nl",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jol 11-41",
    addressLocality: "Lelystad",
    postalCode: "8243 EE",
    addressCountry: "NL",
  },
  areaServed: [
    { "@type": "Country", name: "Netherlands" },
    { "@type": "Country", name: "Belgium" },
  ],
  serviceType: [
    "ISO Certification Consulting",
    "Information Security Consulting",
    "GDPR Compliance Consulting",
  ],
  founder: {
    "@type": "Person",
    name: "Niels Maas",
    jobTitle: "Senior Consultant & Oprichter",
  },
  knowsAbout: [
    "ISO 9001",
    "ISO 27001",
    "ISO 14001",
    "ISO 45001",
    "ISO 16175",
    "GDPR",
    "AVG",
    "NIS2",
    "BIO",
  ],
  sameAs: [
    "https://linkedin.com/company/maasiso",
    "https://twitter.com/maasiso",
    "https://facebook.com/maasiso",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wat doet een ISO-consultant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Een ISO-consultant begeleidt organisaties bij het implementeren van een managementsysteem dat voldoet aan een ISO-norm. De consultant helpt bij de nulmeting, documentatie, implementatie en auditvoorbereiding. Een consultant geeft zelf geen certificaat af; dat doet de onafhankelijke certificerende instelling.",
      },
    },
    {
      "@type": "Question",
      name: "Wat kost ISO-certificering voor een klein bedrijf?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Voor MKB-bedrijven met 1-10 medewerkers liggen de kosten voor ISO 9001 certificering gemiddeld tussen EUR 5.000 en EUR 8.000. Voor ISO 27001 tussen EUR 10.000 en EUR 18.000. Deze bedragen zijn inclusief consultancy en certificatie-audit.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe lang duurt een ISO-certificeringstraject?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De gemiddelde doorlooptijd voor MKB-organisaties ligt tussen 3 en 9 maanden, afhankelijk van de norm, de organisatiegrootte en de mate waarin processen al zijn vastgelegd.",
      },
    },
    {
      "@type": "Question",
      name: "Is ISO-certificering verplicht?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ISO-certificering is in Nederland niet wettelijk verplicht. Wel wordt certificering steeds vaker gevraagd door klanten, ketenpartners en in aanbestedingen. Met de invoering van de NIS2-richtlijn wordt aantoonbare informatiebeveiliging voor bepaalde sectoren wel een wettelijke verplichting.",
      },
    },
    {
      "@type": "Question",
      name: "Wat is NIS2 en hoe verhoudt het zich tot ISO 27001?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NIS2 (de Cyberbeveiligingswet) stelt beveiligingseisen voor essentiele en belangrijke entiteiten in de EU. ISO 27001 gecertificeerde organisaties hebben circa 70-80% van de NIS2 Artikel 21-maatregelen al aantoonbaar geimplementeerd.",
      },
    },
  ],
};

const sectieNavigatie = [
  { href: "#key-takeaways", label: "Key Takeaways" },
  { href: "#kernfeiten", label: "Kernfeiten" },
  { href: "#diensten", label: "Diensten" },
  { href: "#aanpak", label: "Aanpak" },
  { href: "#kosten", label: "Kosten" },
  { href: "#faq", label: "FAQ" },
] as const;

const keyTakeawayItems = keyTakeaways.map((item, index) => ({
  id: index,
  title: item.onderwerp,
  value: item.waarde,
}));

const kernfeitItems = kernfeiten.map((item) => ({
  id: item.kernfeit,
  label: item.kernfeit,
  value: item.waarde,
  source: item.bron,
}));

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-[#f3f6fb] text-[#091E42]">
      <Script
        id="homepage-professionalservice-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
      <Script
        id="homepage-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#0057B8]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-[32rem] h-[24rem] w-[24rem] rounded-full bg-[#FF8B00]/20 blur-3xl" />
      </div>

      <section className="hero-section relative overflow-hidden bg-gradient-to-br from-[#071631] via-[#0d2b5c] to-[#0f4177] text-white">
        <div className="container-custom px-4 py-24 md:py-32">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
            Onafhankelijke ISO-consultancy voor MKB
          </span>
          <h1 className="mt-6 max-w-5xl text-3xl font-bold leading-tight md:text-5xl">
            ISO-consultant voor MKB: certificering, informatiebeveiliging en compliance
          </h1>
          <p className="mt-6 max-w-5xl text-lg leading-relaxed text-white/90 md:text-xl">
            MaasISO begeleidt MKB-bedrijven in Nederland en Belgie bij ISO-certificering,
            informatiebeveiliging en AVG compliance. Als onafhankelijk consultant helpen wij
            organisaties van nulmeting tot succesvolle audit: pragmatisch, transparant en afgestemd
            op de dagelijkse praktijk. MaasISO is geen certificerende instelling: wij begeleiden, de
            certificerende instelling toetst.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/contact" className="primary-button text-center sm:min-w-[240px]">
              Plan een kennismaking
            </Link>
            <Link
              href="https://iso-selector.maasiso.nl/"
              className="primary-button text-center sm:min-w-[240px] border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#091E42]"
            >
              Doe de ISO Norm Selector
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {keyTakeaways.slice(0, 3).map((item) => (
              <div
                key={`hero-${item.onderwerp}`}
                className="rounded-xl border border-white/20 bg-white/10 p-5 md:p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/15"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
                  {item.onderwerp}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white">{item.waarde}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <nav
        aria-label="Sectienavigatie"
        className="sticky top-[80px] z-30 border-y border-[#d6deea] bg-white/90 backdrop-blur"
      >
        <div className="container-custom px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5a6e8f]">Snel naar</p>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {sectieNavigatie.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex whitespace-nowrap rounded-full border border-[#cfdae8] bg-white px-4 py-2 text-sm font-medium text-[#1a3763] transition hover:border-[#0057B8] hover:text-[#0057B8]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section id="key-takeaways" className="py-12 pb-10 md:py-16 md:pb-14 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <KeyTakeaways items={keyTakeawayItems} className="max-w-5xl mx-auto" />
        </div>
      </section>

      <section id="kernfeiten" className="py-14 md:py-24 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42]">Kernfeiten</h2>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 px-6 py-8 md:px-12 md:py-12 shadow-md">
            <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-[#00875A]/10 blur-3xl"></div>
            <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-[#FF8B00]/10 blur-3xl"></div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 min-w-0">
              {kernfeitItems.map((item, index) => (
                <div key={item.id} className="w-full min-w-0">
                  <FactBlock data={item} className="h-full" index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="!py-0 bg-white/70">
        <div className="container-custom space-y-12 md:space-y-16 px-4 py-16 md:py-24">
          <article className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Wat doet MaasISO?</h2>
            <p className="leading-relaxed text-lg text-gray-800">
              MaasISO is een onafhankelijk ISO-consultancybureau gevestigd in Lelystad,
              gespecialiseerd in het begeleiden van MKB-bedrijven bij certificeringstrajecten,
              informatiebeveiliging en privacy compliance.
            </p>
            <p className="leading-relaxed text-lg mt-4 text-gray-800">
              Wij zijn geen certificerende instelling. Het verschil is belangrijk: een consultant
              begeleidt de implementatie van het managementsysteem; een certificerende instelling
              (zoals Kiwa, TUV, DNV of LRQA) voert de onafhankelijke audit uit en kent het
              certificaat toe. Door deze scheiding garanderen wij objectief advies zonder
              belangenverstrengeling.
            </p>
            <p className="leading-relaxed text-lg mt-4 text-gray-800">
              Onze opdrachtgevers zijn MKB-bedrijven en (semi-)overheidsinstellingen in Nederland en
              Belgie die certificering niet als doel op zich zien, maar als middel om processen
              structureel te verbeteren, risico&apos;s te beheersen en het vertrouwen van klanten en
              ketenpartners te vergroten.
            </p>
          </article>

          <article
            id="diensten"
            className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12"
          >
            <h2 className="mb-8 text-2xl font-bold md:text-3xl">Onze diensten</h2>

            <h3 className="mb-3 text-xl font-semibold md:text-2xl">ISO-certificering</h3>
            <p className="mb-4 leading-relaxed text-gray-800">
              Begeleiding bij het implementeren en certificeren van managementsystemen volgens
              internationale ISO-normen. Van gap-analyse en documentatie tot interne audit en
              auditvoorbereiding.
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#dce5f1]">
              <table className="w-full bg-white text-left text-sm md:text-base">
                <thead className="bg-[#f8fbff]">
                  <tr>
                    <th className="p-4 font-semibold">Norm</th>
                    <th className="p-4 font-semibold">Focus</th>
                    <th className="p-4 font-semibold">Gemiddelde doorlooptijd MKB</th>
                    <th className="p-4 font-semibold">Indicatie kosten</th>
                  </tr>
                </thead>
                <tbody>
                  {dienstentabel.map((item) => (
                    <tr
                      key={item.norm}
                      className="border-t border-[#e3eaf4] transition-colors hover:bg-[#f8fbff]"
                    >
                      <td className="p-4 font-medium text-[#163663]">{item.norm}</td>
                      <td className="p-4 text-[#243f66]">{item.focus}</td>
                      <td className="p-4 text-[#243f66]">{item.duur}</td>
                      <td className="p-4 text-[#243f66]">{item.kosten}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              <Link
                href="/iso-certificering"
                className="inline-flex items-center text-[#0057B8] font-semibold hover:underline"
              >
                Bekijk alle ISO-certificeringen
              </Link>
            </p>

            <div className="mt-10 space-y-6">
              <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
                <h3 className="mb-3 text-xl font-semibold md:text-2xl">Informatiebeveiliging</h3>
                <p className="leading-relaxed text-gray-800">
                  Implementatie van informatiebeveiligingsmaatregelen op basis van ISO 27001 en de
                  Baseline Informatiebeveiliging Overheid (BIO). Inclusief risicoanalyse, Statement
                  of Applicability (SoA) en ISMS-inrichting.
                </p>
                <p className="mt-4 leading-relaxed text-gray-800">
                  Het aantal ISO 27001 certificaten wereldwijd is in 2024 verdubbeld naar 96.709
                  actieve certificaten (bron: ISO Survey 2024). In Nederland zijn inmiddels 1.568
                  organisaties gecertificeerd. Met de invoering van de NIS2-richtlijn
                  (Cyberbeveiligingswet) in 2025 stijgt de vraag naar aantoonbare
                  informatiebeveiliging verder.
                </p>
                <p className="mt-4">
                  <Link
                    href="/informatiebeveiliging"
                    className="inline-flex items-center font-semibold text-[#0057B8] hover:underline"
                  >
                    Bekijk informatiebeveiliging
                  </Link>
                </p>
              </div>

              <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
                <h3 className="mb-3 text-xl font-semibold md:text-2xl">AVG &amp; privacy compliance</h3>
                <p className="leading-relaxed text-gray-800">
                  Praktische begeleiding bij het naleven van de Algemene Verordening
                  Gegevensbescherming (AVG/GDPR). Van verwerkingsregister en privacybeleid tot
                  DPIA&apos;s, verwerkersovereenkomsten en de rol van externe Functionaris
                  Gegevensbescherming (FG).
                </p>
                <p className="mt-4 leading-relaxed text-gray-800">
                  De AVG kent boetes tot EUR 20 miljoen of 4% van de wereldwijde jaaromzet (art. 83
                  GDPR). In de praktijk zien wij dat MKB-bedrijven niet struikelen over kennis van de
                  wet, maar over de uitvoering: ontbrekende registers, onduidelijke rollen en geen
                  vast proces voor datalekken.
                </p>
                <p className="mt-4">
                  <Link
                    href="/avg-wetgeving"
                    className="inline-flex items-center font-semibold text-[#0057B8] hover:underline"
                  >
                    Bekijk AVG &amp; wetgeving
                  </Link>
                </p>
              </div>

              <div className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
                <h3 className="mb-3 text-xl font-semibold md:text-2xl">
                  NIS2 compliance (Cyberbeveiligingswet)
                </h3>
                <p className="leading-relaxed text-gray-800">
                  De NIS2-richtlijn stelt in Artikel 21 tien verplichte risicobeheersmaatregelen
                  voor essentiele en belangrijke entiteiten. Organisaties die al ISO 27001
                  gecertificeerd zijn, hebben circa 70-80% van deze maatregelen al aantoonbaar
                  geimplementeerd. MaasISO helpt bij het in kaart brengen van de resterende gaps en
                  het aantoonbaar voldoen aan de Cyberbeveiligingswet.
                </p>
                <p className="mt-4">
                  <Link
                    href="/informatiebeveiliging/iso-27001"
                    className="inline-flex items-center font-semibold text-[#0057B8] hover:underline"
                  >
                    Lees meer over NIS2 en ISO 27001
                  </Link>
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12">
            <h2 className="mb-8 text-2xl font-bold md:text-3xl">Waarom MaasISO?</h2>
            <div className="overflow-x-auto rounded-xl border border-[#dce5f1]">
              <table className="w-full bg-white text-left text-sm md:text-base">
                <thead className="bg-[#f8fbff]">
                  <tr>
                    <th className="p-4 font-semibold">Kenmerk</th>
                    <th className="p-4 font-semibold">Wat dit voor u betekent</th>
                  </tr>
                </thead>
                <tbody>
                  {waaromMaasIso.map((item) => (
                    <tr
                      key={item.kenmerk}
                      className="border-t border-[#e3eaf4] align-top transition-colors hover:bg-[#f8fbff]"
                    >
                      <td className="p-4 font-medium text-[#163663]">{item.kenmerk}</td>
                      <td className="p-4 text-[#243f66]">{item.betekenis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article id="aanpak" className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12">
            <h2 className="mb-8 text-2xl font-bold md:text-3xl">Onze aanpak in 5 stappen</h2>
            <ol className="grid gap-6 md:grid-cols-2">
              <li className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#091E42] text-sm font-semibold text-white">
                  1
                </span>
                <h3 className="mt-3 text-lg font-semibold">Stap 1 - Kennismaking en nulmeting</h3>
                <p className="mt-2 text-gray-800">
                  Wij starten met een vrijblijvend gesprek en een gap-analyse: waar staat de
                  organisatie nu ten opzichte van de norm? In deze fase brengen wij de huidige
                  processen, documentatie en risico&apos;s in kaart.
                </p>
              </li>
              <li className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#091E42] text-sm font-semibold text-white">
                  2
                </span>
                <h3 className="mt-3 text-lg font-semibold">Stap 2 - Plan van aanpak</h3>
                <p className="mt-2 text-gray-800">
                  Op basis van de nulmeting stellen wij een concreet plan op met scope, planning,
                  deliverables en kostenindicatie. Geen verrassingen achteraf.
                </p>
              </li>
              <li className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#091E42] text-sm font-semibold text-white">
                  3
                </span>
                <h3 className="mt-3 text-lg font-semibold">Stap 3 - Implementatie</h3>
                <p className="mt-2 text-gray-800">
                  Wij begeleiden de organisatie bij het inrichten van het managementsysteem: beleid,
                  procedures, rollen, risicoanalyse en beheersmaatregelen. Altijd afgestemd op wat al
                  aanwezig is.
                </p>
              </li>
              <li className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#091E42] text-sm font-semibold text-white">
                  4
                </span>
                <h3 className="mt-3 text-lg font-semibold">Stap 4 - Interne audit en management review</h3>
                <p className="mt-2 text-gray-800">
                  Voordat de certificerende instelling langskomt, toetsen wij intern of het systeem
                  werkt zoals bedoeld. Bevindingen worden opgelost voor de externe audit.
                </p>
              </li>
              <li className="rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-6 md:p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#0057B8]/40 md:col-span-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#091E42] text-sm font-semibold text-white">
                  5
                </span>
                <h3 className="mt-3 text-lg font-semibold">Stap 5 - Externe audit en certificering</h3>
                <p className="mt-2 text-gray-800">
                  De certificerende instelling voert de audit uit. MaasISO ondersteunt bij de
                  voorbereiding en is beschikbaar tijdens de auditdagen.
                </p>
              </li>
            </ol>
          </article>

          <article className="rounded-2xl border border-[#ffdcb9] bg-gradient-to-br from-white via-[#fffaf4] to-[#fff2e2] p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Expertquote</h2>
            <blockquote className="rounded-xl border-l-4 border-[#FF8B00] bg-white/80 p-8 text-lg leading-relaxed text-gray-800">
              "De meeste MKB-bedrijven onderschatten hoeveel ze al op orde hebben. Een goede
              nulmeting laat vaak zien dat 40-60% van de eisen al informeel is ingeregeld. Het
              traject gaat dan over structureren en aantoonbaar maken, niet over alles opnieuw
              uitvinden."
              <footer className="mt-4 font-semibold text-[#091E42]">
                Niels Maas, Senior consultant &amp; oprichter, MaasISO
              </footer>
            </blockquote>
          </article>
          <article id="kosten" className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12">
            <h2 className="mb-8 text-2xl font-bold md:text-3xl">
              Wat kost ISO-certificering? (indicatie voor MKB)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#dce5f1]">
              <table className="w-full bg-white text-left text-sm md:text-base">
                <thead className="bg-[#f8fbff]">
                  <tr>
                    <th className="p-4 font-semibold">Traject</th>
                    <th className="p-4 font-semibold">Bedrijfsgrootte</th>
                    <th className="p-4 font-semibold">Indicatie totale investering</th>
                    <th className="p-4 font-semibold">Gemiddelde doorlooptijd</th>
                  </tr>
                </thead>
                <tbody>
                  {kostenTabel.map((item, idx) => (
                    <tr
                      key={`${item.traject}-${idx}`}
                      className="border-t border-[#e3eaf4] transition-colors hover:bg-[#f8fbff]"
                    >
                      <td className="p-4 font-medium text-[#163663]">{item.traject}</td>
                      <td className="p-4 text-[#243f66]">{item.grootte}</td>
                      <td className="p-4 text-[#243f66]">{item.investering}</td>
                      <td className="p-4 text-[#243f66]">{item.duur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-gray-700">
              Alle bedragen zijn inclusief begeleiding. Kosten voor de certificerende instelling en
              eventuele tooling zijn apart vermeld op de betreffende normpagina&apos;s.
            </p>
            <p className="mt-3">
              <Link
                href="/iso-certificering"
                className="inline-flex items-center text-[#0057B8] font-semibold hover:underline"
              >
                Bekijk gedetailleerde kostenoverzichten per norm
              </Link>
            </p>
          </article>

          <article className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#091E42] via-[#0d2f65] to-[#134078] p-8 text-white shadow-sm md:p-12">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[#FF8B00]/20 blur-3xl" />
            <h2 className="relative mb-4 text-2xl font-bold md:text-3xl">ISO Norm Selector</h2>
            <p className="relative mb-6 leading-relaxed text-white/90">
              Weet u nog niet welke norm bij uw organisatie past? Gebruik onze gratis ISO Norm
              Selector. In enkele vragen krijgt u een onderbouwd advies over de normen die relevant
              zijn voor uw situatie, sector en doelstellingen.
            </p>
            <Link
              href="/iso-selector"
              className="relative inline-flex items-center font-semibold underline underline-offset-4"
            >
              Start de ISO Norm Selector
            </Link>
          </article>

          <article className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Kennis &amp; resources</h2>
            <p className="mb-4 leading-relaxed text-gray-800">
              MaasISO publiceert regelmatig artikelen, praktische gidsen en whitepapers over
              ISO-certificering, informatiebeveiliging en AVG compliance. Onze kennis is vrij
              beschikbaar en bedoeld om MKB-organisaties te helpen onderbouwde keuzes te maken.
            </p>
            <ul className="space-y-4 text-lg">
              <li>
                <Link
                  href="/kennis/blog"
                  className="group flex items-center justify-between rounded-lg border border-[#dce5f1] bg-[#f8fbff] px-5 py-4 font-semibold text-[#0057B8] transition hover:border-[#0057B8]/40"
                >
                  <span>ISO 9001 certificering: kosten, proces &amp; voordelen [2026]</span>
                  <span aria-hidden className="ml-3 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/kennis/blog"
                  className="group flex items-center justify-between rounded-lg border border-[#dce5f1] bg-[#f8fbff] px-5 py-4 font-semibold text-[#0057B8] transition hover:border-[#0057B8]/40"
                >
                  <span>ISO 27001 certificering: complete gids, kosten &amp; stappen (2026)</span>
                  <span aria-hidden className="ml-3 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/kennis/blog"
                  className="group flex items-center justify-between rounded-lg border border-[#dce5f1] bg-[#f8fbff] px-5 py-4 font-semibold text-[#0057B8] transition hover:border-[#0057B8]/40"
                >
                  <span>AVG wetgeving: praktisch advies &amp; implementatie voor MKB</span>
                  <span aria-hidden className="ml-3 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            </ul>
            <p className="mt-4">
              <Link
                href="/kennis/blog"
                className="inline-flex items-center text-[#0057B8] font-semibold hover:underline"
              >
                Bekijk alle artikelen op ons blog
              </Link>
            </p>
          </article>

          <article id="faq" className="rounded-2xl border border-[#d7e1ee] bg-white p-8 shadow-sm md:p-12">
            <h2 className="mb-8 text-2xl font-bold md:text-3xl">Veelgestelde vragen</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.vraag}
                  className="group rounded-xl border border-[#dce5f1] bg-white p-6 transition duration-300 hover:border-[#0057B8]/40 open:border-[#0057B8]/50 open:bg-[#f8fbff]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-lg">
                    <span>{item.vraag}</span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#b9c8dd] text-base text-[#24416a] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-gray-800">{item.antwoord}</p>
                </details>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="!py-0 bg-gradient-to-r from-[#0d2b5c] via-[#13407a] to-[#0d2b5c] text-white">
        <div className="container-custom px-4 py-16 text-center md:py-24">
          <h2 className="text-3xl font-bold md:text-4xl">Klaar om te beginnen?</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-white/90">
            Neem vrijblijvend contact op voor een kennismakingsgesprek. Wij vertellen u graag wat
            MaasISO voor uw organisatie kan betekenen.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="primary-button text-center sm:min-w-[240px]">
              Plan een kennismaking
            </Link>
            <Link
              href="/iso-selector"
              className="primary-button text-center sm:min-w-[240px] border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#091E42]"
            >
              Doe de ISO Norm Selector
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

