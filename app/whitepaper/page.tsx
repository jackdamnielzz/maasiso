import { Metadata } from 'next';
import WhitepaperClientWrapper from '@/components/features/WhitepaperClientWrapper';

export const metadata: Metadata = {
  title: 'Gratis Whitepaper | MaasISO - ISO Certificering Gids',
  description: 'Download onze gratis whitepaper over ISO certificering en informatiebeveiliging. Praktische tips en inzichten voor uw organisatie.',
  keywords: 'whitepaper, ISO certificering, informatiebeveiliging, gratis download, MaasISO',
  alternates: {
    canonical: "/whitepaper",
  },
};

export default function WhitepaperPage() {
  return <WhitepaperClientWrapper />;
}