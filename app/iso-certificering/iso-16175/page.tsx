import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';

export const metadata: Metadata = {
  title: 'ISO 16175 Certificering | MaasISO',
  description: 'ISO 16175 certificering en documentbeheer met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 16175 certificering.',
  alternates: {
    canonical: "/iso-certificering/iso-16175",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso16175Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 16175"
      strapiSlug="iso-16175"
      hub={{ title: 'ISO-certificering', href: '/iso-certificering' }}
      dataTopic="iso-certificering"
    />
  );
}
