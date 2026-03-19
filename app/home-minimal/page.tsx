import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { HeroMinimal } from "@/components/home-minimal/HeroMinimal";
import { StatsMinimal } from "@/components/home-minimal/StatsMinimal";
import { DienstenMinimal } from "@/components/home-minimal/DienstenMinimal";
import { WaaromMinimal } from "@/components/home-minimal/WaaromMinimal";
import { AanpakMinimal } from "@/components/home-minimal/AanpakMinimal";
import { KostenMinimal } from "@/components/home-minimal/KostenMinimal";
import { TestimonialsMinimal } from "@/components/home-minimal/TestimonialsMinimal";
import { KennisMinimal } from "@/components/home-minimal/KennisMinimal";
import { FaqMinimal } from "@/components/home-minimal/FaqMinimal";
import { CtaMinimal } from "@/components/home-minimal/CtaMinimal";

export const metadata: Metadata = {
  title: "ISO-certificering & informatiebeveiliging voor MKB | MaasISO",
  description:
    "MaasISO is de ISO-consultant voor MKB-bedrijven in Nederland. Pragmatische begeleiding bij ISO 9001, ISO 27001, ISO 14001, AVG compliance en NIS2. Transparante kosten, bewezen resultaten.",
  alternates: {
    canonical: "/home-minimal",
  },
  robots: {
    index: false,
    follow: false,
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
    accent: "",
    bg: "",
    text: "",
  },
  {
    kernfeit: "ISO 27001 certificaten wereldwijd",
    highlight: "96.709",
    eenheid: "+99% groei in 2024",
    bron: "ISO Survey 2024 via IAF CertSearch",
    accent: "",
    bg: "",
    text: "",
  },
  {
    kernfeit: "ISO 27001 in Nederland",
    highlight: "1.568",
    eenheid: "organisaties",
    bron: "ISO Survey 2024",
    accent: "",
    bg: "",
    text: "",
  },
  {
    kernfeit: "Maximale AVG-boete",
    highlight: "\u20AC20M",
    eenheid: "of 4% jaaromzet",
    bron: "Autoriteit Persoonsgegevens, art. 83 GDPR",
    accent: "",
    bg: "",
    text: "",
  },
  {
    kernfeit: "NIS2 dekking door ISO 27001",
    highlight: "70-80%",
    eenheid: "Art. 21 gedekt",
    bron: "Mapping ISO 27001 Annex A op NIS2 Art. 21",
    accent: "",
    bg: "",
    text: "",
  },
  {
    kernfeit: "Implementatietijd ISO 9001",
    highlight: "3-6",
    eenheid: "maanden",
    bron: "MaasISO praktijkervaring",
    accent: "",
    bg: "",
    text: "",
  },
] as const;

const testimonials = [
  {
    quote: "Dankzij MaasISO hebben we in 5 maanden onze ISO 9001 certificering behaald. De pragmatische aanpak en duidelijke communicatie maakten het hele proces een stuk minder spannend dan verwacht.",
    author: "Jan de Vries",
    role: "Directeur",
    company: "TechFlow B.V.",
    location: "Amsterdam",
  },
  {
    quote: "De overstap naar ISO 27001 leek ontmoedigend, maar met Niels aan onze zijde ging het verrassend soepel. Het team voelde zich betrokken en de audit verliep vlekkeloos.",
    author: "Maria Janssen",
    role: "CISO",
    company: "SecureNet Solutions",
    location: "Utrecht",
  },
  {
    quote: "Wat me het meest opviel was de praktische insteek. Geen overbodige documentatie, maar direct bruikbare templates en heldere richtlijnen. Absoluut aan te raden voor elk MKB.",
    author: "Peter Bakker",
    role: "Operationeel Manager",
    company: "LogiStack",
    location: "Rotterdam",
  },
] as const;

const dienstentabel = [
  { norm: "ISO 9001", focus: "Kwaliteitsmanagement", duur: "3-6 maanden", kosten: "EUR 5.000-EUR 15.000" },
  { norm: "ISO 27001", focus: "Informatiebeveiliging", duur: "3-9 maanden", kosten: "EUR 18.000-EUR 25.000" },
  { norm: "ISO 14001", focus: "Milieumanagement", duur: "3-6 maanden", kosten: "EUR 4.000-EUR 10.000" },
  { norm: "ISO 45001", focus: "Gezond & veilig werken", duur: "3-6 maanden", kosten: "Op aanvraag" },
  { norm: "ISO 16175", focus: "Digitaal informatiebeheer", duur: "Op aanvraag", kosten: "Op aanvraag" },
] as const;

const waaromMaasIso = [
  { kenmerk: "Pragmatische aanpak", betekenis: "Geen dikke rapporten die stof verzamelen, maar direct toepasbare oplossingen die werken in de dagelijkse praktijk." },
  { kenmerk: "MKB-focus", betekenis: "Oplossingen afgestemd op de schaal, het budget en de cultuur van MKB-organisaties." },
  { kenmerk: "Consultant, geen certificeerder", betekenis: "Onafhankelijk advies zonder belangenverstrengeling; de certificerende instelling toetst." },
  { kenmerk: "Integrale benadering", betekenis: "Meerdere normen combineren in een traject bespaart tijd, geld en voorkomt dubbel werk." },
  { kenmerk: "Transparante kosten", betekenis: "Vooraf duidelijkheid over investering, doorlooptijd en deliverables." },
  { kenmerk: "100% slagingspercentage", betekenis: "Bewezen track record op certificeringsaudits." },
  { kenmerk: "15+ jaar ervaring", betekenis: "Breed trackrecord in publieke en private sector: ISO 9001, ISO 27001, ISO 14001, BIO en AVG." },
] as const;

const kostenTabel = [
  { traject: "ISO 9001", grootte: "1-10 FTE", investering: "EUR 5.000-EUR 8.000", duur: "3-4 maanden" },
  { traject: "ISO 9001", grootte: "10-50 FTE", investering: "EUR 8.000-EUR 15.000", duur: "4-6 maanden" },
  { traject: "ISO 27001", grootte: "1-10 FTE", investering: "EUR 10.000-EUR 18.000", duur: "3-6 maanden" },
  { traject: "ISO 27001", grootte: "10-50 FTE", investering: "EUR 18.000-EUR 25.000", duur: "6-9 maanden" },
  { traject: "ISO 14001", grootte: "MKB", investering: "EUR 4.000-EUR 10.000", duur: "3-6 maanden" },
  { traject: "AVG compliance", grootte: "MKB", investering: "EUR 3.000-EUR 10.000", duur: "4-12 weken" },
] as const;

const faqItems = [
  { vraag: "Wat doet een ISO-consultant?", antwoord: "Een ISO-consultant begeleidt organisaties bij het implementeren van een managementsysteem dat voldoet aan een ISO-norm. De consultant helpt bij de nulmeting, documentatie, implementatie en auditvoorbereiding. Een consultant geeft zelf geen certificaat af; dat doet de onafhankelijke certificerende instelling." },
  { vraag: "Wat kost ISO-certificering voor een klein bedrijf?", antwoord: "Voor MKB-bedrijven met 1-10 medewerkers liggen de kosten voor ISO 9001 certificering gemiddeld tussen EUR 5.000 en EUR 8.000. Voor ISO 27001 tussen EUR 10.000 en EUR 18.000. Deze bedragen zijn inclusief consultancy en certificatie-audit." },
  { vraag: "Hoe lang duurt een ISO-certificeringstraject?", antwoord: "De gemiddelde doorlooptijd voor MKB-organisaties ligt tussen 3 en 9 maanden, afhankelijk van de norm, de organisatiegrootte en de mate waarin processen al zijn vastgelegd." },
  { vraag: "Wat is het verschil tussen een consultant en een certificeerder?", antwoord: "Een consultant begeleidt de implementatie van het managementsysteem. Een certificerende instelling (zoals Kiwa, TUV, DNV of LRQA) voert de onafhankelijke audit uit en verleent het certificaat. MaasISO is een consultant: wij begeleiden, maar certificeren niet zelf." },
  { vraag: "Is ISO-certificering verplicht?", antwoord: "ISO-certificering is in Nederland niet wettelijk verplicht. Wel wordt certificering steeds vaker gevraagd door klanten, ketenpartners en in aanbestedingen. Met de invoering van de NIS2-richtlijn (Cyberbeveiligingswet) wordt aantoonbare informatiebeveiliging voor bepaalde sectoren wel een wettelijke verplichting." },
  { vraag: "Welke ISO-norm past bij mijn organisatie?", antwoord: "Dat hangt af van uw sector, klanten en doelstellingen. ISO 9001 is de meest universele norm (kwaliteitsmanagement). ISO 27001 richt zich op informatiebeveiliging. ISO 14001 op milieumanagement. Gebruik onze gratis ISO Norm Selector voor een persoonlijk advies." },
  { vraag: "Kan ik meerdere ISO-normen combineren?", antwoord: "Ja. ISO-normen zijn gebaseerd op dezelfde Harmonized Structure, waardoor ze goed integreerbaar zijn in een managementsysteem. Dit bespaart dubbel werk, vereenvoudigt audits en verlaagt kosten. MaasISO heeft ruime ervaring met integrale trajecten." },
  { vraag: "Wat is NIS2 en hoe verhoudt het zich tot ISO 27001?", antwoord: "NIS2 (de Cyberbeveiligingswet) stelt beveiligingseisen voor essentiele en belangrijke entiteiten in de EU. ISO 27001 gecertificeerde organisaties hebben circa 70-80% van de NIS2 Artikel 21-maatregelen al aantoonbaar geimplementeerd. ISO 27001 is daarmee het meest directe pad naar NIS2 compliance." },
  { vraag: "Werkt MaasISO ook buiten Nederland?", antwoord: "MaasISO bedient organisaties in Nederland en Belgie/Vlaanderen." },
  { vraag: "Hoe neem ik contact op?", antwoord: "Neem contact op via info@maasiso.nl of bel +31 (0)6 2357 8344 voor een vrijblijvend kennismakingsgesprek. U kunt ook direct een afspraak inplannen via onze contactpagina." },
] as const;

const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "MaasISO",
  description: "Onafhankelijk ISO-consultancybureau gespecialiseerd in ISO 9001, ISO 27001, ISO 14001, AVG compliance en NIS2 begeleiding voor MKB-bedrijven in Nederland en Belgie.",
  url: "https://www.maasiso.nl",
  telephone: "+31-6-23578344",
  email: "info@maasiso.nl",
  address: { "@type": "PostalAddress", streetAddress: "Jol 11-41", addressLocality: "Lelystad", postalCode: "8243 EE", addressCountry: "NL" },
  areaServed: [{ "@type": "Country", name: "Netherlands" }, { "@type": "Country", name: "Belgium" }],
  serviceType: ["ISO Certification Consulting", "Information Security Consulting", "GDPR Compliance Consulting"],
  founder: { "@type": "Person", name: "Niels Maas", jobTitle: "Senior Consultant & Oprichter" },
  knowsAbout: ["ISO 9001", "ISO 27001", "ISO 14001", "ISO 45001", "ISO 16175", "GDPR", "AVG", "NIS2", "BIO"],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Wat doet een ISO-consultant?", acceptedAnswer: { "@type": "Answer", text: "Een ISO-consultant begeleidt organisaties bij het implementeren van een managementsysteem dat voldoet aan een ISO-norm." } },
    { "@type": "Question", name: "Wat kost ISO-certificering voor een klein bedrijf?", acceptedAnswer: { "@type": "Answer", text: "Voor MKB-bedrijven met 1-10 medewerkers liggen de kosten voor ISO 9001 certificering gemiddeld tussen EUR 5.000 en EUR 8.000." } },
    { "@type": "Question", name: "Hoe lang duurt een ISO-certificeringstraject?", acceptedAnswer: { "@type": "Answer", text: "De gemiddelde doorlooptijd voor MKB-organisaties ligt tussen 3 en 9 maanden." } },
    { "@type": "Question", name: "Is ISO-certificering verplicht?", acceptedAnswer: { "@type": "Answer", text: "ISO-certificering is in Nederland niet wettelijk verplicht. Wel wordt certificering steeds vaker gevraagd door klanten, ketenpartners en in aanbestedingen." } },
    { "@type": "Question", name: "Wat is NIS2 en hoe verhoudt het zich tot ISO 27001?", acceptedAnswer: { "@type": "Answer", text: "NIS2 stelt beveiligingseisen voor essentiele en belangrijke entiteiten in de EU. ISO 27001 gecertificeerde organisaties hebben circa 70-80% van de NIS2 Artikel 21-maatregelen al aantoonbaar geimplementeerd." } },
  ],
};

export default function HomeMinimal() {
  return (
    <div className="bg-white text-gray-900">
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

      {/* Hero */}
      <HeroMinimal keyTakeaways={keyTakeaways} />

      {/* Over ons */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
                Over ons
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
                Wat doet MaasISO?
              </h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-gray-500">
              <p>
                MaasISO is een onafhankelijk ISO-consultancybureau gevestigd in Lelystad,
                gespecialiseerd in het begeleiden van MKB-bedrijven bij certificeringstrajecten,
                informatiebeveiliging en privacy compliance.
              </p>
              <p>
                Wij zijn geen certificerende instelling. Een consultant begeleidt de implementatie
                van het managementsysteem; een certificerende instelling (zoals Kiwa, TUV, DNV of
                LRQA) voert de onafhankelijke audit uit en kent het certificaat toe. Door deze
                scheiding garanderen wij objectief advies zonder belangenverstrengeling.
              </p>
              <p>
                Onze opdrachtgevers zijn MKB-bedrijven en (semi-)overheidsinstellingen in Nederland
                en Belgie die certificering niet als doel op zich zien, maar als middel om processen
                structureel te verbeteren, risico&apos;s te beheersen en het vertrouwen van klanten en
                ketenpartners te vergroten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsMinimal stats={kernfeiten} />

      {/* Diensten */}
      <DienstenMinimal dienstentabel={dienstentabel} />

      {/* Waarom */}
      <WaaromMinimal items={waaromMaasIso} />

      {/* Aanpak */}
      <AanpakMinimal />

      {/* Testimonials */}
      <TestimonialsMinimal testimonials={testimonials} />

      {/* Kosten */}
      <KostenMinimal kostenTabel={kostenTabel} />

      {/* ISO Norm Selector */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-widest text-[#0057B8]">
                Gratis tool
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
                ISO Norm Selector
              </h2>
              <p className="mt-3 text-base text-gray-500">
                Weet u nog niet welke norm bij uw organisatie past? In enkele vragen
                krijgt u een onderbouwd advies over de normen die relevant zijn voor
                uw situatie, sector en doelstellingen.
              </p>
            </div>
            <Link
              href="https://iso-selector.maasiso.nl/"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Start de Selector
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Kennis */}
      <KennisMinimal />

      {/* FAQ */}
      <FaqMinimal faqItems={faqItems} />

      {/* CTA */}
      <CtaMinimal />
    </div>
  );
}
