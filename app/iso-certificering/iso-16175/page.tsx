import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const ISO16175_CANONICAL_PATH = '/iso-certificering/iso-16175';
const DEFAULT_TITLE = 'ISO 16175: Informatiebeheer & Documentmanagement | MaasISO';
const DEFAULT_DESCRIPTION =
  'ISO 16175 voor informatiebeheer en documentmanagement. Begeleiding bij implementatie voor overheidsorganisaties en bedrijven die grip willen op hun informatiehuishouding.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('iso-16175');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: ISO16175_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// ISR: revalidate every 24 hours
export const revalidate = 86400;

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
