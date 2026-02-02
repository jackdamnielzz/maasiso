import { Metadata } from 'next';
import OnzeVoordelenContent from '@/components/features/OnzeVoordelenContent';

export const metadata: Metadata = {
  title: 'Waarom MaasISO | ISO-certificering & Informatiebeveiliging',
  description: 'Waarom MaasISO? Praktisch advies, ervaren begeleiding en maatwerk voor MKB. Ontdek onze aanpak en voordelen.',
  keywords: 'MaasISO, ISO certificering, informatiebeveiliging, AVG, pragmatisch, maatwerk, MKB',
  alternates: {
    canonical: "/waarom-maasiso",
  },
};

export default function OnzeVoordelenPage() {
  return <OnzeVoordelenContent />;
}
