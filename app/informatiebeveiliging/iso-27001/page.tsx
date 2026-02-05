import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';

export const metadata: Metadata = {
  title: 'ISO 27001 Certificering | MaasISO',
  description: 'ISO 27001 certificering en informatiebeveiliging met MaasISO. Professionele begeleiding voor uw organisatie naar ISO 27001 certificering.',
  alternates: {
    canonical: "/informatiebeveiliging/iso-27001",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Iso27001Page() {
  return (
    <CoreDetailPageTemplate
      title="ISO 27001"
      strapiSlug="iso-27001"
      hub={{ title: 'Informatiebeveiliging', href: '/informatiebeveiliging' }}
      dataTopic="informatiebeveiliging"
    />
  );
}
