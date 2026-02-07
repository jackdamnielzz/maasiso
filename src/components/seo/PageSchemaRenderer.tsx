import SchemaMarkup from '@/components/ui/SchemaMarkup';
import type { Page } from '@/lib/types';
import { buildPagePrimarySchema } from '@/lib/utils/pageSchema';

type FaqQuestion = {
  question: string;
  answer: string;
};

type PageSchemaRendererProps = {
  page: Pick<
    Page,
    | 'schemaType'
    | 'title'
    | 'seoMetadata'
    | 'serviceName'
    | 'serviceDescription'
    | 'serviceType'
    | 'areaServed'
    | 'providerOverride'
    | 'publicationDate'
    | 'publishedAt'
    | 'createdAt'
    | 'updatedAt'
  > | null | undefined;
  canonicalUrl: string;
  faqQuestions?: FaqQuestion[];
};

export default function PageSchemaRenderer({ page, canonicalUrl, faqQuestions = [] }: PageSchemaRendererProps) {
  const primarySchema = buildPagePrimarySchema(page, canonicalUrl);
  const faq =
    faqQuestions.length > 0
      ? {
          id: `${canonicalUrl}#faq`,
          questions: faqQuestions,
        }
      : undefined;

  if (!primarySchema && !faq) {
    return null;
  }

  return <SchemaMarkup primary={primarySchema} faq={faq} />;
}
