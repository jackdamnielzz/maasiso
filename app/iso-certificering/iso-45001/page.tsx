import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const ISO45001_CANONICAL_PATH = '/iso-certificering/iso-45001';
const DEFAULT_TITLE = 'ISO 45001 | MaasISO';
const DEFAULT_DESCRIPTION =
  'ISO 45001 advies en begeleiding voor gezond en veilig werken. MaasISO helpt u pragmatisch op weg.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('iso-45001');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: ISO45001_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

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
      visualVariant="home-premium"
    />
  );
}
