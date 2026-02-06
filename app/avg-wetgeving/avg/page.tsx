import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const AVG_CANONICAL_PATH = '/avg-wetgeving/avg';
const DEFAULT_TITLE = 'AVG & Privacy | MaasISO';
const DEFAULT_DESCRIPTION =
  'AVG en privacy compliance met MaasISO. Professionele begeleiding voor uw organisatie bij het implementeren van AVG-richtlijnen en privacybeleid.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('avg');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: AVG_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

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
