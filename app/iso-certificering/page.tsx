import { Metadata } from 'next';
import CoreHubPageTemplate from '@/components/templates/core/CoreHubPageTemplate';

export const metadata: Metadata = {
  title: 'ISO-certificering | Overzicht en begeleiding | MaasISO',
  description:
    'Overzicht van ISO-certificering bij MaasISO. Ontdek ISO 9001, ISO 14001, ISO 45001 en ISO 16175 en kies de norm die bij uw organisatie past.',
  alternates: {
    canonical: '/iso-certificering',
  },
};

const isoPages = [
  {
    title: 'ISO 9001 - Kwaliteitsmanagement',
    description:
      'Optimaliseer processen, verhoog klanttevredenheid en werk structureel aan continue verbetering.',
    href: '/iso-certificering/iso-9001',
    linkLabel: 'ISO 9001'
  },
  {
    title: 'ISO 14001 - Milieumanagement',
    description:
      'Beheers milieurisico\'s, benut duurzaamheidskansen en toon aantoonbare milieuprestaties.',
    href: '/iso-certificering/iso-14001',
    linkLabel: 'ISO 14001'
  },
  {
    title: 'ISO 45001 - Gezond & veilig werken',
    description:
      'Verbeter arbeidsveiligheid en pak risico\'s pragmatisch aan binnen uw organisatie.',
    href: '/iso-certificering/iso-45001',
    linkLabel: 'ISO 45001'
  },
  {
    title: 'ISO 16175 - Digitaal informatiebeheer',
    description:
      'Creëer grip op digitale documenten, archivering en vindbaarheid met duidelijke richtlijnen.',
    href: '/iso-certificering/iso-16175',
    linkLabel: 'ISO 16175'
  }
];

export default function IsoCertificeringHubPage() {
  return (
    <CoreHubPageTemplate
      visualVariant="iso-premium"
      title="ISO-certificering"
      intro="Overzicht van onderwerpen binnen ISO-certificering. Klik door naar een normpagina voor de volledige uitleg."
      definition="ISO-certificering is een formele bevestiging door een onafhankelijke certificerende instelling dat het managementsysteem van een organisatie voldoet aan de eisen van een ISO-norm. Het gaat om aantoonbaar beheersen en verbeteren van processen, risico’s en afspraken. Certificering helpt vertrouwen richting klanten en ketenpartners te vergroten en kan eisen uit aanbestedingen ondersteunen. De certificerende instelling beoordeelt periodiek of de organisatie nog voldoet."
      scope="ISO-certificering draait om het inrichten en aantonen van een managementsysteem en de toetsing daarop. Dit is iets anders dan juridische naleving (zoals privacywetgeving) of technische beveiligingsmaatregelen; die hebben een eigen invalshoek en pagina’s op deze site."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'ISO-certificering', href: '/iso-certificering' },
      ]}
      cards={isoPages}
      ctas={[
        { label: 'Plan een kennismaking', href: '/contact', variant: 'primary' },
        { label: 'Doe de ISO-Selector', href: '/iso-selector', variant: 'secondary' },
      ]}
      cardsHeading="Onderwerpen binnen ISO-certificering"
      dataTopic="iso-certificering"
    />
  );
}
