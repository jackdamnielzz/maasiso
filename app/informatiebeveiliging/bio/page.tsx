import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';

export const metadata: Metadata = {
  title: 'BIO Certificering | MaasISO',
  description: 'BIO certificering en informatiebeveiliging met MaasISO. Professionele begeleiding voor uw organisatie naar BIO certificering.',
  alternates: {
    canonical: "/informatiebeveiliging/bio",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BioPage() {
  return (
    <CoreDetailPageTemplate
      title="BIO"
      strapiSlug="bio"
      hub={{ title: 'Informatiebeveiliging', href: '/informatiebeveiliging' }}
      dataTopic="informatiebeveiliging"
    />
  );
}
