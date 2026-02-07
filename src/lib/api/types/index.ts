export * from './strapi';
export * from './components';

export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  seoMetadata: SEOMetadata;
  primaryKeyword?: string;
  schemaType?: 'Article' | 'WebPage' | 'Service';
  serviceName?: string;
  serviceDescription?: string;
  serviceType?: string;
  areaServed?: string;
  providerOverride?: boolean;
  layout: Array<{
    id: number;
    __component: string;
    title?: string;
    subtitle?: string;
    content?: string;
    alignment?: string;
    backgroundImage?: any;
    ctaButton?: {
      text: string;
      link: string;
    };
    features?: Array<{
      id: string;
      title: string;
      description: string;
      link: string | null;
      icon?: any;
    }>;
    images?: any[];
    text?: string;
    link?: string;
    style?: string;
    items?: Array<{
      id?: string | number;
      question?: string;
      answer?: string;
      title?: string;
      value?: string;
    }>;
    label?: string;
    value?: string;
    source?: string | string[];
  }>;
  publicationDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageData {
  id: number;
  title?: string;
  Title?: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  primaryKeyword?: string;
  schemaType?: 'Article' | 'WebPage' | 'Service' | string;
  serviceName?: string;
  serviceDescription?: string;
  serviceType?: string;
  areaServed?: string;
  providerOverride?: boolean;
  layout?: any[];
  publicationDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  author: string;
  tags: Array<{
    id: string;
    name: string;
  }>;
  featuredImage?: any;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author?: string;
  tags: Array<{
    id: string;
    name: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }>;
  featuredImage?: any;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface SearchParams {
  query: string;
  page: number;
  pageSize: number;
  filters?: {
    contentType?: string[];
    dateFrom?: string;
    dateTo?: string;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}
