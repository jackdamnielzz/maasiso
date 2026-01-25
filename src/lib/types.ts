/**
 * Type definitions for the MaasISO website
 */

/**
 * Strapi Response Types
 */
export interface StrapiResponse<T> {
  data: StrapiData<T> | StrapiData<T>[];
  meta: StrapiMeta;
}

export interface StrapiData<T> {
  id: number;
  attributes: T;
}

export interface StrapiCollectionResponse<T> {
  data: StrapiData<T>[];
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: StrapiData<T>;
  meta: StrapiMeta;
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: any;
}

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
 * Category content type - normalized structure
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Whitepaper type
 */
export interface Whitepaper extends BaseContent {
  description: string;
  version: string;
  author?: string;
  downloadLink?: string;
  file?: any;
  publishedAt?: string;
}

/**
 * Content metadata for analytics
 */
export interface ContentMetadata {
  tags?: string[];
  author?: string;
  publishedAt?: string;
  readingTime?: number;
  categories?: string[];
}

export interface BlogPost extends BaseContent {
  content: string;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  featuredImage?: Image;
  tags?: Tag[];
  categories?: Category[];
  author?: string;
}

/**
 * News Article type
 */
export interface NewsArticle extends BaseContent {
  content: string;
  summary?: string;
  articledescription?: string;
  author?: string;
  tags?: Tag[];
  categories?: Category[];
  featuredImage?: Image;
  readingTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

// Raw Strapi types
export interface StrapiRawBlogPost {
  id: string;
  title: string;
  Content?: string;
  content?: string;
  slug: string;
  Author?: string;
  author?: string;
  categories?: any[];
  tags?: any[];
  featuredImage?: any;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishedAt?: string;
  publicationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiRawNewsArticle {
  id: string;
  documentId?: string;
  title: string;
  content: string;
  slug: string;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publicationDate?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  readingTime?: number;
  articledescription?: string;
  categories: Array<{
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }>;
  tags: Array<{
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }>;
  featuredImage?: {
    id: number;
    documentId: string;
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
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
  };
}

/**
 * Search types
 */
export interface SearchParams {
  query: string;
  filters?: {
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

// Search scope types
export type SearchScope = 'all' | 'title' | 'title-summary' | 'content';

export interface SearchParamsV2 extends Omit<SearchParams, 'filters'> {
  /**
   * Field scope filter.
   * Defaults to 'all'.
   */
  scope?: SearchScope;

  /**
   * Content type filter.
   * Defaults to 'all'.
   */
  contentType?: 'blog' | 'news' | 'all';

  /**
   * Optional date filters (ISO strings)
   */
  dateFrom?: string;
  dateTo?: string;
}

export interface ScoredSearchResult {
  type: 'blog' | 'news';
  item: BlogPost | NewsArticle;
  relevanceScore: number;
  scoreBreakdown?: {
    titleScore: number;
    summaryScore: number;
    contentScore: number;
  };
}

export interface SearchResultsV2 {
  blog: ScoredSearchResult[];
  news: ScoredSearchResult[];
  meta: {
    totalResults: number;
    query: string;
    scope: SearchScope;
  };
}

export interface SearchResults {
  items: (BlogPost | NewsArticle)[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface PaginatedBlogPosts {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface PaginatedNewsArticles {
  articles: NewsArticle[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
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
export type PageComponentType = 'page-blocks.hero' | 'page-blocks.text-block' | 'page-blocks.gallery' | 'page-blocks.feature-grid' | 'page-blocks.button';

// Raw component types (before normalization)
export type {
  StrapiRawHeroComponent as RawHeroComponent,
  StrapiRawTextBlockComponent as RawTextBlockComponent,
  StrapiRawImageGalleryComponent as RawGalleryComponent,
  StrapiRawFeatureGridComponent as RawFeatureGridComponent,
  StrapiRawFeature as RawFeature,
  StrapiRawButtonComponent as RawButtonComponent
};

/**
 * Raw Component Validation Types
 */
export interface RawStrapiComponent {
  __component: string;
  id?: string;
  [key: string]: any;
}

export interface StrapiRawCTAButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

export interface StrapiRawHeroComponent extends RawStrapiComponent {
  title?: string;
  subtitle?: string;
  backgroundImage?: { data?: any };
  ctaButton?: StrapiRawCTAButton;
}

export interface StrapiRawFeature {
  id?: string;
  title?: string;
  description?: string;
  icon?: { 
    data?: any 
  };
  link?: string;
}

export interface StrapiRawFeatureGridComponent extends RawStrapiComponent {
  features?: StrapiRawFeature[] | { 
    data?: Array<{id: number|string, attributes?: any}> 
  };
  data?: {
    features?: StrapiRawFeature[];
  };
}

export interface StrapiRawTextBlockComponent extends RawStrapiComponent {
  content?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface StrapiRawButtonComponent extends RawStrapiComponent {
  text?: string;
  link?: string;
  style?: string;
}

export interface StrapiRawImageGalleryComponent extends RawStrapiComponent {
  images?: { data?: any[] };
  layout?: 'grid' | 'carousel' | 'masonry';
}

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

export interface StrapiRawPageAttributes {
  Title?: string;
  title?: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  layout?: any[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiRawPage {
  id: string;
  attributes?: StrapiRawPageAttributes;
}

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  type?: 'internal' | 'external';
  children?: MenuItem[];
  parent?: MenuItem;
  menu?: Menu;
  settings: {
    order: number;
    className?: string;
    openInNewTab?: boolean;
    highlight?: boolean;
    icon?: {
      data?: {
        attributes?: {
          url: string;
          width: number;
          height: number;
          alternativeText?: string;
        };
      };
    };
  };
}

export interface Menu {
  id: string;
  title: string;
  handle: string;
  type: string;
  position: MenuPosition;
  items: MenuItem[];
}

export interface MenuPosition {
  location: string;
  order: number;
  style: string;
  className?: string;
}

export interface MenuItemSettings {
  order: number;
  icon?: {
    data?: {
      id: string;
      attributes?: {
        url: string;
        width: number;
        height: number;
        alternativeText?: string;
        formats?: Record<string, unknown>;
        hash?: string;
        ext?: string;
        mime?: string;
        size?: number;
        provider?: string;
      };
    };
  };
  openInNewTab?: boolean;
  highlight?: boolean;
  className?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
  order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: Image;
  order: number;
}

export interface StrapiRawMenu {
  id: string;
  attributes: {
    title: string;
    handle: string;
    type: string;
    position: {
      location: string;
      order: number;
      style: string;
      className?: string;
    };
    items: {
      data: StrapiRawMenuItem[];
    };
  };
}

export interface StrapiRawMenuItem {
  id: string;
  attributes: {
    title: string;
    type: 'internal' | 'external';
    path: string;
    menu: {
      data: {
        id: string;
        attributes: StrapiRawMenu['attributes'];
      };
    };
    parent?: {
      data: StrapiRawMenuItem;
    };
    children?: {
      data: StrapiRawMenuItem[];
    };
    settings: {
      order: number;
      icon?: {
        data?: any;
      };
      openInNewTab?: boolean;
      highlight?: boolean;
      className?: string;
    };
  };
}

export interface StrapiRawMenuSection {
  id: string;
  attributes: {
    title: string;
    items: {
      data: StrapiRawMenuItem[];
    };
    order: number;
  };
}

export interface StrapiRawSocialLink {
  id: string;
  attributes: {
    platform: string;
    url: string;
    icon?: {
      data?: any;
    };
    order: number;
  };
}
