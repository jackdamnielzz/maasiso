import { Metadata } from 'next';
import CoreHubPageTemplate from '@/components/templates/core/CoreHubPageTemplate';

export const metadata: Metadata = {
  title: 'Informatiebeveiliging: ISO 27001, NIS2 & BIO Begeleiding | MaasISO',
  description:
    'Informatiebeveiliging voor uw organisatie. Vergelijk ISO 27001, NIS2 en BIO op kosten, eisen en aanpak. Van nulmeting tot certificering met pragmatische begeleiding.',
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
    title: 'NIS2 – Cyberbeveiligingswet',
    description:
      'Europese richtlijn met verplichte cyberbeveiligingsmaatregelen voor essentiële en belangrijke entiteiten. Vanaf 2026 verankerd in de Nederlandse Cyberbeveiligingswet.',
    href: '/informatiebeveiliging/nis2',
    linkLabel: 'NIS2',
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
      visualVariant="iso-premium"
      title="Informatiebeveiliging"
      intro="Overzicht van onderwerpen binnen informatiebeveiliging. Klik door naar een normpagina voor de volledige uitleg."
      definition="Informatiebeveiliging gaat over het beschermen van vertrouwelijkheid, integriteit en beschikbaarheid van informatie binnen organisaties. Het omvat beleid, processen, rollen en technische maatregelen die samen zorgen dat informatie betrouwbaar blijft en risico’s beheersbaar zijn. Het doel is aantoonbaar grip op informatie en continu verbeteren van beveiligingsmaatregelen. Dit gebeurt vaak binnen een formeel managementsysteem."
      scope="Informatiebeveiliging richt zich op het beveiligen van informatie en systemen. Dat is iets anders dan juridische compliance (zoals AVG) of het certificeren van brede managementprocessen; die vallen onder aparte domeinen op deze site."
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Informatiebeveiliging', href: '/informatiebeveiliging' },
      ]}
      cards={cards}
      ctas={[{ label: 'Plan een kennismaking', href: '/contact', variant: 'primary' }]}
      dataTopic="informatiebeveiliging"
    />
  );
}
