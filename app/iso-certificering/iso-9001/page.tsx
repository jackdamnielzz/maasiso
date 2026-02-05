import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';

export const metadata: Metadata = {
  title: 'ISO 9001 Certificering | MaasISO',
  description: 'ISO 9001 certificering en kwaliteitsmanagement met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 9001 certificering.',
  alternates: {
    canonical: "/iso-certificering/iso-9001",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso9001Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 9001"
      strapiSlug="iso-9001"
      hub={{ title: 'ISO-certificering', href: '/iso-certificering' }}
      dataTopic="iso-certificering"
    />
  );
}
