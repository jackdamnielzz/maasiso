import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';

export const metadata: Metadata = {
  title: 'AVG & Privacy | MaasISO',
  description: 'AVG en privacy compliance met MaasISO. Professionele begeleiding voor uw organisatie bij het implementeren van AVG-richtlijnen en privacybeleid.',
  alternates: {
    canonical: "/avg-wetgeving/avg",
  },
};

// Force dynamic rendering to ensure fresh content from Strapi
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AvgPage() {
  return (
    <CoreDetailPageTemplate
      title="AVG"
      strapiSlug="avg"
      hub={{ title: 'AVG & Wetgeving', href: '/avg-wetgeving' }}
      dataTopic="avg-wetgeving"
    />
  );
}
