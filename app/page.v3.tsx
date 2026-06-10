import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { KeyTakeaways } from '@/components/features/KeyTakeaways';
import { HeroSectionV3 } from '@/components/home-v3/HeroSectionV3';
import { DienstenSectionV3 } from '@/components/home-v3/DienstenSectionV3';
import { WaaromSectionV3 } from '@/components/home-v3/WaaromSectionV3';
import { AanpakSectionV3 } from '@/components/home-v3/AanpakSectionV3';
import { KostenSectionV3 } from '@/components/home-v3/KostenSectionV3';
import { FaqSectionV3 } from '@/components/home-v3/FaqSectionV3';
import { CtaSectionV3 } from '@/components/home-v3/CtaSectionV3';
import { StatsSectionV3 } from '@/components/home-v3/StatsSectionV3';
import { KennisSectionV3 } from '@/components/home-v3/KennisSectionV3';
import { TestimonialsSectionV3 } from '@/components/home-v3/TestimonialsSectionV3';

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
    highlight: "1,1+",
    eenheid: "miljoen",
    bron: "ISO Survey 2023",
    accent: "from-blue-500 to-blue-600",
    bg: "bg-blue-500/10",
    text: "text-blue-600",
  },
  {
    kernfeit: "ISO 27001 certificaten wereldwijd",
    highlight: "96.709",
    eenheid: "+99% groei in 2024",
    bron: "ISO Survey 2024 via IAF CertSearch",
    accent: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    text: "text-violet-600",
  },
  {
    kernfeit: "ISO 27001 in Nederland",
    highlight: "1.568",
    eenheid: "organisaties",
    bron: "ISO Survey 2024",
    accent: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-500/10",
    text: "text-cyan-600",
  },
  {
    kernfeit: "Maximale AVG-boete",
    highlight: "€20M",
    eenheid: "of 4% jaaromzet",
    bron: "Autoriteit Persoonsgegevens, art. 83 GDPR",
    accent: "from-rose-500 to-red-500",
    bg: "bg-rose-500/10",
    text: "text-rose-600",
  },
  {
    kernfeit: "NIS2 dekking door ISO 27001",
    highlight: "70-80%",
    eenheid: "Art. 21 gedekt",
    bron: "Mapping ISO 27001 Annex A op NIS2 Art. 21",
    accent: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
  },
  {
    kernfeit: "Implementatietijd ISO 9001",
    highlight: "3-6",
    eenheid: "maanden",
    bron: "MaasISO praktijkervaring",
    accent: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
  },
  {
    kernfeit: "Kosten ISO 9001 (MKB)",
    highlight: "€5k-€15k",
    eenheid: "investering",
    bron: "MaasISO marktanalyse 2026",
    accent: "from-[#0057B8] to-[#00875A]",
    bg: "bg-[#0057B8]/10",
    text: "text-[#0057B8]",
  },
] as const;

const testimonials = [
  {
    quote: "Dankzij MaasISO hebben we in 5 maanden onze ISO 9001 certificering behaald. De pragmatische aanpak en duidelijke communicatie maakten het hele proces een stuk minder spannend dan verwacht.",
    author: "Jan de Vries",
    role: "Directeur",
    company: "TechFlow B.V.",
    location: "Amsterdam"
  },
  {
    quote: "De overstap naar ISO 27001 leek ontmoedigend, maar met Niels aan onze zijde ging het verrassend soepel. Het team voelde zich betrokken en de audit verliep vlekkeloos.",
    author: "Maria Janssen",
    role: "CISO",
    company: "SecureNet Solutions",
    location: "Utrecht"
  },
  {
    quote: "Wat me het meest opviel was de praktische insteek. Geen overbodige documentatie, maar direct bruikbare templates en heldere richtlijnen. Absoluut aan te raden voor elk MKB.",
    author: "Peter Bakker",
    role: "Operationeel Manager",
    company: "LogiStack",
    location: "Rotterdam"
  }
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

export default function HomeV3() {
  return (
    <div className="relative isolate overflow-hidden bg-[#f3f6fb] text-[#091E42]">
      <JsonLd data={[professionalServiceSchema, faqSchema]} />

      {/* Enhanced Hero Section */}
      <HeroSectionV3 keyTakeaways={keyTakeaways} />

      {/* Enhanced Sticky section nav */}
      <nav
        aria-label="Sectienavigatie"
        className="sticky top-[80px] z-30 border-b border-[#e2e8f0] bg-white/90 backdrop-blur-xl shadow-sm"
      >
        <div className="container-custom px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Snel naar</span>
            <div className="h-4 w-px bg-gray-200 shrink-0" />
            {sectieNavigatie.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-[#1a3763] transition-all duration-200 hover:bg-[#0057B8]/10 hover:text-[#0057B8] hover:shadow-sm"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Key Takeaways */}
      <section id="key-takeaways" className="py-16 md:py-20 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <KeyTakeaways items={keyTakeawayItems} className="max-w-5xl mx-auto" variant="iso9001" />
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <StatsSectionV3 stats={kernfeiten} />

      {/* Main content sections */}
      <section className="!py-0 bg-[#f3f6fb]">
        <div className="container-custom space-y-20 md:space-y-28 px-4 py-16 md:py-24">

          {/* Enhanced Wat doet MaasISO */}
          <article className="relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-8 md:p-14 shadow-sm">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#0057B8]/5 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0057B8]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0057B8]">
                Over ons
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-[#091E42] md:text-4xl">Wat doet MaasISO?</h2>
              <div className="mt-6 max-w-3xl space-y-5 text-lg leading-relaxed text-gray-600">
                <p>
                  MaasISO is een onafhankelijk ISO-consultancybureau gevestigd in Lelystad,
                  gespecialiseerd in het begeleiden van MKB-bedrijven bij certificeringstrajecten,
                  informatiebeveiliging en privacy compliance.
                </p>
                <p>
                  Wij zijn geen certificerende instelling. Het verschil is belangrijk: een consultant
                  begeleidt de implementatie van het managementsysteem; een certificerende instelling
                  (zoals Kiwa, TUV, DNV of LRQA) voert de onafhankelijke audit uit en kent het
                  certificaat toe. Door deze scheiding garanderen wij objectief advies zonder
                  belangenverstrengeling.
                </p>
                <p>
                  Onze opdrachtgevers zijn MKB-bedrijven en (semi-)overheidsinstellingen in Nederland en
                  Belgie die certificering niet als doel op zich zien, maar als middel om processen
                  structureel te verbeteren, risico's te beheersen en het vertrouwen van klanten en
                  ketenpartners te vergroten.
                </p>
              </div>
            </div>
          </article>

          {/* Enhanced Diensten */}
          <DienstenSectionV3 dienstentabel={dienstentabel} />

          {/* Enhanced Waarom MaasISO */}
          <WaaromSectionV3 items={waaromMaasIso} />

          {/* Enhanced Aanpak */}
          <AanpakSectionV3 />

          {/* Enhanced Expert quote */}
          <TestimonialsSectionV3 testimonials={testimonials} />

          {/* Enhanced Kosten */}
          <KostenSectionV3 kostenTabel={kostenTabel} />

          {/* Enhanced ISO Norm Selector */}
          <article className="relative overflow-hidden rounded-3xl border-2 border-[#0057B8]/20 bg-gradient-to-r from-[#f0f6ff] via-white to-[#f0f6ff] p-8 md:p-14">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#0057B8]/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-[#FF8B00]/10 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0057B8]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0057B8]">
                  Gratis tool
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-[#091E42] md:text-3xl">ISO Norm Selector</h2>
                <p className="mt-4 leading-relaxed text-gray-600">
                  Weet u nog niet welke norm bij uw organisatie past? Gebruik onze gratis ISO Norm
                  Selector. In enkele vragen krijgt u een onderbouwd advies over de normen die relevant
                  zijn voor uw situatie, sector en doelstellingen.
                </p>
              </div>
              <Link
                href="https://iso-selector.maasiso.nl/"
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-[#0057B8] px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#004a9e] hover:-translate-y-0.5 hover:shadow-xl shrink-0"
              >
                Start de Selector
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </article>

          {/* Enhanced Kennis & resources */}
          <KennisSectionV3 />

          {/* Enhanced FAQ */}
          <FaqSectionV3 faqItems={faqItems} />
        </div>
      </section>

      {/* Enhanced CTA */}
      <CtaSectionV3 />
    </div>
  );
}
