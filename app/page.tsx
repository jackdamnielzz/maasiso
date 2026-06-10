import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { HeroV2 } from "@/components/home-v2/HeroV2";
import { NormenMarquee } from "@/components/home-v2/NormenMarquee";
import { OverV2 } from "@/components/home-v2/OverV2";
import { StatsV2 } from "@/components/home-v2/StatsV2";
import { DienstenV2 } from "@/components/home-v2/DienstenV2";
import { WaaromV2 } from "@/components/home-v2/WaaromV2";
import { AanpakV2 } from "@/components/home-v2/AanpakV2";
import { KostenV2 } from "@/components/home-v2/KostenV2";
import { ToolsV2 } from "@/components/home-v2/ToolsV2";
import { KennisV2 } from "@/components/home-v2/KennisV2";
import { FaqV2 } from "@/components/home-v2/FaqV2";
import { CtaV2 } from "@/components/home-v2/CtaV2";
import "./home-v2.css";

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
      "MaasISO is de ISO-consultant voor MKB-bedrijven in Nederland. Pragmatische begeleiding bij ISO 9001, ISO 27001, ISO 14001, AVG compliance en NIS2. Transparante kosten, bewezen resultaten.",
    url: "/",
    siteName: "MaasISO",
    type: "website",
    locale: "nl_NL",
    images: [
      {
        url: "/images/maasisohome.png",
        width: 1200,
        height: 630,
        alt: "MaasISO - ISO Certificering en Informatiebeveiliging voor MKB",
      },
    ],
  },
};

const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://www.maasiso.nl/#organization",
  name: "MaasISO",
  description: "Onafhankelijk ISO-consultancybureau gespecialiseerd in ISO 9001, ISO 27001, ISO 14001, AVG compliance en NIS2 begeleiding voor MKB-bedrijven in Nederland en Belgie.",
  url: "https://www.maasiso.nl/",
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

export default function Home() {
  return (
    <div className="bg-white text-[#172B4D]">
      <JsonLd data={[professionalServiceSchema, faqSchema]} />
      <HeroV2 />
      <NormenMarquee />
      <OverV2 />
      <StatsV2 />
      <DienstenV2 />
      <WaaromV2 />
      <AanpakV2 />
      <KostenV2 />
      <ToolsV2 />
      <KennisV2 />
      <FaqV2 />
      <CtaV2 />
    </div>
  );
}
