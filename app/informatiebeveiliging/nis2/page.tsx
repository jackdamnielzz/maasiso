import { Metadata } from 'next';
import CoreDetailPageTemplate from '@/components/templates/core/CoreDetailPageTemplate';
import { getPage } from '@/lib/api';
import { buildDetailPageMetadata } from '@/lib/seo/pageMetadata';

const NIS2_CANONICAL_PATH = '/informatiebeveiliging/nis2';
const DEFAULT_TITLE = 'NIS2-richtlijn (Cyberbeveiligingswet): Verplichtingen & Begeleiding voor MKB | MaasISO';
const DEFAULT_DESCRIPTION =
  'Valt uw organisatie onder de NIS2-richtlijn? Overzicht van verplichtingen, Artikel 21 maatregelen, kosten en de relatie met ISO 27001. Praktische begeleiding voor MKB-bedrijven bij NIS2-compliance.';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPage('nis2');
  return buildDetailPageMetadata({
    page: pageData,
    canonicalPath: NIS2_CANONICAL_PATH,
    fallbackTitle: DEFAULT_TITLE,
    fallbackDescription: DEFAULT_DESCRIPTION,
  });
}

// ISR: revalidate every 24 hours
export const revalidate = 86400;

export default async function Nis2Page() {
  return (
    <CoreDetailPageTemplate
      title="NIS2"
      strapiSlug="nis2"
      hub={{ title: 'Informatiebeveiliging', href: '/informatiebeveiliging' }}
      dataTopic="informatiebeveiliging"
    />
  );
}
