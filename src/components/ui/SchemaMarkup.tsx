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
  const schemas = [];

  // Add Service schema if provided
  if (service) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'Organization',
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
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.headline,
      description: article.description,
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      author: {
        '@type': 'Person',
        name: article.author.name
      },
      publisher: {
        '@id': article.publisherId
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.mainEntityOfPage
      },
      image: article.image
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
