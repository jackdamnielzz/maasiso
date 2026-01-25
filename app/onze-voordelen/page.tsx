import { Metadata } from 'next';
import OnzeVoordelenContent from '@/components/features/OnzeVoordelenContent';

export const metadata: Metadata = {
  title: 'Onze Voordelen | MaasISO - ISO-certificering & Informatiebeveiliging',
  description: 'Ontdek de voordelen van MaasISO: ✓ Praktisch advies ✓ Ervaren consultant ✓ Maatwerk voor MKB ✓ Resultaatgericht. Neem contact op!',
  keywords: 'ISO 9001, ISO 27001, ISO 27002, ISO 14001, ISO 16175, informatiebeveiliging, AVG, GDPR, privacy consultancy, BIO',
};

export default function OnzeVoordelenPage() {
  return <OnzeVoordelenContent />;
}
