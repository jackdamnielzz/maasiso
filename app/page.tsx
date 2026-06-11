import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { dienstentabel, faqItems } from "@/components/home-v2/data";
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
  description: "Onafhankelijk ISO-consultancybureau gespecialiseerd in ISO 9001, ISO 27001, ISO 14001, AVG compliance en NIS2 begeleiding voor MKB-bedrijven in Nederland en België.",
  url: "https://www.maasiso.nl/",
  logo: "https://www.maasiso.nl/apple-touch-icon.png",
  image: "https://www.maasiso.nl/images/maasisohome.png",
  telephone: "+31-6-23578344",
  email: "info@maasiso.nl",
  priceRange: "€3.000 - €25.000",
  address: { "@type": "PostalAddress", streetAddress: "Jol 11-41", addressLocality: "Lelystad", postalCode: "8243 EE", addressCountry: "NL" },
  areaServed: [{ "@type": "Country", name: "Netherlands" }, { "@type": "Country", name: "Belgium" }],
  serviceType: ["ISO Certification Consulting", "Information Security Consulting", "GDPR Compliance Consulting"],
  founder: { "@type": "Person", name: "Niels Maas", jobTitle: "Senior Consultant & Oprichter" },
  knowsAbout: ["ISO 9001", "ISO 27001", "ISO 14001", "ISO 45001", "ISO 16175", "GDPR", "AVG", "NIS2", "BIO"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "ISO-certificeringstrajecten voor MKB",
    itemListElement: dienstentabel.map((dienst) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: `${dienst.norm} certificeringsbegeleiding`,
        description: `Begeleiding bij ${dienst.norm} (${dienst.focus.toLowerCase()}) voor MKB-organisaties. Doorlooptijd: ${dienst.duur}.`,
        url: `https://www.maasiso.nl${dienst.href}`,
        provider: { "@id": "https://www.maasiso.nl/#organization" },
        areaServed: ["NL", "BE"],
      },
      ...(dienst.prijsMin && dienst.prijsMax
        ? {
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: dienst.prijsMin,
              maxPrice: dienst.prijsMax,
              priceCurrency: "EUR",
            },
          }
        : {}),
    })),
  },
};

// FAQ-schema wordt gegenereerd uit dezelfde bron als de zichtbare FAQ-sectie
// (data.ts), zodat schema en pagina-inhoud nooit uit elkaar lopen.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.vraag,
    acceptedAnswer: { "@type": "Answer", text: item.antwoord },
  })),
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
