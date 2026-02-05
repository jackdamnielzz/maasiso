import { Metadata } from 'next';
import CoreHubPageTemplate from '@/components/templates/core/CoreHubPageTemplate';

export const metadata: Metadata = {
  title: 'Informatiebeveiliging | ISO 27001 & BIO | MaasISO',
  description:
    'Overzicht van informatiebeveiliging bij MaasISO. Ontdek ISO 27001 en BIO en kies de norm die bij uw organisatie past.',
  alternates: {
    canonical: '/informatiebeveiliging',
  },
};

const cards = [
  {
    title: 'ISO 27001 – Informatiebeveiliging',
    description:
      'Norm voor het inrichten en verbeteren van een managementsysteem voor informatiebeveiliging met duidelijke eisen en auditcriteria.',
    href: '/informatiebeveiliging/iso-27001',
    linkLabel: 'ISO 27001',
  },
  {
    title: 'BIO – Baseline Informatiebeveiliging Overheid',
    description:
      'Overheidskader voor informatiebeveiliging met verplichte maatregelen en toetsbare normen voor overheid en ketenpartners.',
    href: '/informatiebeveiliging/bio',
    linkLabel: 'BIO',
  },
];

export default function InformatiebeveiligingHubPage() {
  return (
    <CoreHubPageTemplate
      title="Informatiebeveiliging"
      intro="Overzicht van onderwerpen binnen informatiebeveiliging. Klik door naar een normpagina voor de volledige uitleg."
      definition="Informatiebeveiliging gaat over het beschermen van vertrouwelijkheid, integriteit en beschikbaarheid van informatie binnen organisaties. Het omvat beleid, processen, rollen en technische maatregelen die samen zorgen dat informatie betrouwbaar blijft en risico’s beheersbaar zijn. Het doel is aantoonbaar grip op informatie en continu verbeteren van beveiligingsmaatregelen. Dit gebeurt vaak binnen een formeel managementsysteem."
      scope="Informatiebeveiliging richt zich op het beveiligen van informatie en systemen. Dat is iets anders dan juridische compliance (zoals AVG) of het certificeren van brede managementprocessen; die vallen onder aparte domeinen op deze site."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Informatiebeveiliging', href: '/informatiebeveiliging' },
      ]}
      cards={cards}
      dataTopic="informatiebeveiliging"
    />
  );
}
