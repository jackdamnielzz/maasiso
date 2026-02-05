import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';

export const metadata: Metadata = {
  title: 'ISO 14001 Certificering | MaasISO',
  description: 'ISO 14001 certificering en milieumanagement met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 14001 certificering.',
  alternates: {
    canonical: "/iso-certificering/iso-14001",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso14001Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 14001"
      strapiSlug="iso-14001"
      hub={{ title: 'ISO-certificering', href: '/iso-certificering' }}
      dataTopic="iso-certificering"
    />
  );
}
