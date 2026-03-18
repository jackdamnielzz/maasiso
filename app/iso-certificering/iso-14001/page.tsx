import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const ISO14001_CANONICAL_PATH = '/iso-certificering/iso-14001';
const DEFAULT_TITLE = 'ISO 14001 Certificering: Kosten, Checklist & Begeleiding | MaasISO';
const DEFAULT_DESCRIPTION =
  'ISO 14001 certificering voor milieumanagement. Wat zijn de kosten, eisen en stappen? Pragmatische begeleiding voor MKB-bedrijven van nulmeting tot certificaat.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('iso-14001');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: ISO14001_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// ISR: revalidate every 24 hours
export const revalidate = 86400;

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
