import React from 'react';

type ServiceSchema = {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  serviceType: string;
  url: string;
};

type FAQSchema = {
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
const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ service, faq, howTo, article, breadcrumbs }) => {
  const schemas: Array<Record<string, unknown>> = [];

  // Add Service schema if provided
  if (service) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'ProfessionalService',
        '@id': 'https://maasiso.nl/#professionalservice',
        name: service.provider.name,
        url: service.provider.url
      },
      serviceType: service.serviceType,
      url: service.url
    });
  }

  // Add FAQ schema if provided
  if (faq && faq.questions.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.questions.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
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
          url: 'https://maasiso.nl/logo.png',
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

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};

export default SchemaMarkup;
