import React from 'react';

type ServiceSchema = {
  name: string;
  description: string;
  provider?: {
    name: string;
    url: string;
  };
  serviceType?: string;
  areaServed?: string;
  url: string;
};

type FAQSchema = {
  id?: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
};

type HowToSchema = {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    url?: string;
    image?: string;
  }>;
};

type ArticleSchema = {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: {
    name: string;
    id?: string;
    jobTitle?: string;
    image?: string;
    sameAs?: string[];
  };
  publisherId: string;
  mainEntityOfPage: string;
  image: string;
};

type BreadcrumbSchema = {
  items: Array<{
    name: string;
    item: string;
  }>;
};

type SchemaMarkupProps = {
  primary?: Record<string, unknown>;
  service?: ServiceSchema;
  faq?: FAQSchema;
  howTo?: HowToSchema;
  article?: ArticleSchema;
  breadcrumbs?: BreadcrumbSchema;
};

/**
 * SchemaMarkup component adds structured data for SEO
 * It supports Service, FAQ, HowTo, Article, and Breadcrumb schemas
 */
const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ primary, service, faq, howTo, article, breadcrumbs }) => {
  const schemas: Array<Record<string, unknown>> = [];
  const toPlainText = (value: string): string =>
    value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/[*_~`>#-]+/g, ' ')
      .replace(/\s+([?.!,:;])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

  // Add primary page schema when provided (Article/WebPage/Service).
  if (primary) {
    schemas.push(primary);
  }

  // Add Service schema if provided
  if (!primary && service) {
    const serviceSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      url: service.url
    };

    if (service.provider?.name && service.provider?.url) {
      serviceSchema.provider = {
        '@type': 'Organization',
        name: service.provider.name,
        url: service.provider.url
      };
    }

    if (service.serviceType) {
      serviceSchema.serviceType = service.serviceType;
    }

    if (service.areaServed) {
      serviceSchema.areaServed = service.areaServed;
    }

    schemas.push(serviceSchema);
  }

  // Add FAQ schema if provided
  if (faq && faq.questions.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      ...(faq.id ? { '@id': faq.id } : {}),
      mainEntity: faq.questions.map(item => ({
        '@type': 'Question',
        name: toPlainText(item.question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: toPlainText(item.answer)
        }
      }))
    });
  }

  // Add HowTo schema if provided
  if (howTo) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: howTo.name,
      description: howTo.description,
      step: howTo.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        url: step.url,
        image: step.image
      }))
    });
  }

  // Add Article schema if provided
  if (article) {
    // Build author object with optional fields
    const authorSchema: any = {
      '@type': 'Person',
      '@id': article.author.id,
      name: article.author.name
    };

    // Add optional author fields if provided
    if (article.author.jobTitle) {
      authorSchema.jobTitle = article.author.jobTitle;
    }
    if (article.author.image) {
      authorSchema.image = article.author.image;
    }
    if (article.author.sameAs && article.author.sameAs.length > 0) {
      authorSchema.sameAs = article.author.sameAs;
    }

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.headline,
      description: article.description,
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      author: authorSchema,
      publisher: {
        '@type': 'Organization',
        '@id': article.publisherId,
        name: 'Maas ISO',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.maasiso.nl/logo.png',
          width: 600,
          height: 60
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.mainEntityOfPage
      },
      image: {
        '@type': 'ImageObject',
        url: article.image
      }
    });
  }

  // Add Breadcrumb schema if provided
  if (breadcrumbs) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.item
      }))
    });
  }

  if (schemas.length === 0) {
    return null;
  }

  const payload =
    schemas.length === 1
      ? schemas[0]
      : {
          '@context': 'https://schema.org',
          '@graph': schemas.map((schema) => {
            const { ['@context']: _context, ...node } = schema;
            return node;
          }),
        };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
};

export default SchemaMarkup;
