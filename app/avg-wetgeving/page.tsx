import { Metadata } from 'next';
import CoreHubPageTemplate from '@/components/templates/core/CoreHubPageTemplate';

export const metadata: Metadata = {
  title: 'AVG & Wetgeving | Overzicht en begeleiding | MaasISO',
  description:
    'Overzicht van AVG & privacywetgeving bij MaasISO. Ontdek onze AVG aanpak, inclusief definitie, kosten, stappen en veelgestelde vragen.',
  alternates: {
    canonical: '/avg-wetgeving',
  },
};

const cards = [
  {
    title: 'AVG/GDPR – Privacy compliance',
    description:
      'Overzicht van verplichtingen en maatregelen om te voldoen aan de AVG/GDPR, inclusief beleid, DPIA’s en awareness.',
    href: '/avg-wetgeving/avg',
    linkLabel: 'AVG',
  },
];

export default function AvgWetgevingHubPage() {
  return (
    <CoreHubPageTemplate
      visualVariant="iso-premium"
      title="AVG & Wetgeving"
      intro="Overzicht van onderwerpen binnen AVG & wetgeving. Klik door naar de detailpagina voor de volledige uitleg."
      definition="AVG & wetgeving gaat over het naleven van privacyregels en andere wettelijke eisen rond persoonsgegevens. Het omvat het vastleggen van beleid, rollen en processen, het borgen van rechten van betrokkenen en het aantoonbaar beheersen van risico’s. Organisaties moeten kunnen laten zien dat zij compliant handelen en passende maatregelen treffen. Dit domein richt zich op de juridische en organisatorische kant van privacy."
      scope="AVG & wetgeving draait om juridische compliance en verantwoord omgaan met persoonsgegevens. Dat is iets anders dan informatiebeveiliging of het certificeren van managementsystemen; die hebben eigen normen en pagina’s."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'AVG & Wetgeving', href: '/avg-wetgeving' },
      ]}
      cards={cards}
      ctas={[{ label: 'Plan een kennismaking', href: '/contact', variant: 'primary' }]}
      dataTopic="avg-wetgeving"
    />
  );
}
