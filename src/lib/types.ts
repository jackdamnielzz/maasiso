/**
 * Type definitions for the MaasISO website
 */

/**
 * Base interfaces for normalized content types
 */

/**
 * Common fields shared across all content types
 */
export interface BaseContent {
  id: string;
  documentId?: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publicationDate?: string;
}

/**
 * Category content type - normalized structure
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tag content type - normalized structure
 */
export interface Tag {
  id: string;
  name: string;
}

/**
 * Image content type - normalized structure
 */
export interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path?: string;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface Image {
  id: string;
  documentId?: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    small?: ImageFormat;
    thumbnail?: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

/**
 * Blog Post type
 */
export interface BlogPost extends BaseContent {
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  featuredImage?: Image;
  categories: Category[];
  tags?: Tag[];
  author?: string;
}

/**
 * News Article type
 */
export interface NewsArticle extends BaseContent {
  content: string;
  summary?: string;
  author?: string;
  categories?: Category[];
  featuredImage?: Image;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

/**
 * Search types
 */
export interface SearchParams {
  query: string;
  filters?: {
    categories?: string[];
    contentType?: ('blog' | 'news')[];
    dateFrom?: string;
    dateTo?: string;
  };
  sort?: {
    field: 'date' | 'relevance' | 'title';
    direction: 'asc' | 'desc';
  };
  page?: number;
  pageSize?: number;
}

/**
 * SEO fields interface
 */
export interface SEOFields {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

/**
 * Page Builder Component Types
 */

export type RawPageComponentType = 'page-blocks.hero' | 'page-blocks.text-block' | 'page-blocks.gallery' | 'page-blocks.feature-grid' | 'page-blocks.button';
export type NormalizedPageComponentType = 'page-blocks.hero' | 'page-blocks.text-block' | 'page-blocks.gallery' | 'page-blocks.feature-grid' | 'page-blocks.button';
export type PageComponentType = RawPageComponentType;

export interface PageComponent {
  id: string;
  __component: PageComponentType;
}

export interface CTAButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

export interface HeroComponent extends PageComponent {
  __component: 'page-blocks.hero';
  title: string;
  subtitle?: string;
  backgroundImage?: Image;
  ctaButton?: CTAButton;
}

export interface TextBlockComponent extends PageComponent {
  __component: 'page-blocks.text-block';
  content: string;
  alignment: 'left' | 'center' | 'right';
}

export interface ImageGalleryComponent extends PageComponent {
  __component: 'page-blocks.gallery';
  images: Image[];
  layout: 'grid' | 'carousel' | 'masonry';
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: Image;
  link?: string;
}

export interface FeatureGridComponent extends PageComponent {
  __component: 'page-blocks.feature-grid';
  features: Feature[];
}

export interface ButtonComponent extends PageComponent {
  __component: 'page-blocks.button';
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

/**
 * Page types
 */

export interface SEOMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: Image;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  seoMetadata?: SEOMetadata;
  layout?: (HeroComponent | TextBlockComponent | ImageGalleryComponent | FeatureGridComponent | ButtonComponent)[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
