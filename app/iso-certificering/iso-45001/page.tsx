import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';

export const metadata: Metadata = {
  title: 'ISO 45001 | MaasISO',
  description: 'ISO 45001 advies en begeleiding voor gezond en veilig werken. MaasISO helpt u pragmatisch op weg.',
  alternates: {
    canonical: '/iso-certificering/iso-45001',
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso45001Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 45001"
      strapiSlug="iso-45001"
      hub={{ title: 'ISO-certificering', href: '/iso-certificering' }}
      dataTopic="iso-certificering"
    />
  );
}
