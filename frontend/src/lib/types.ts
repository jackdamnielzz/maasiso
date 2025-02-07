import { ButtonComponent } from './types/components';

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
 * SEO fields interface
 */
export interface SEOFields {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

/**
 * Blog post content type - normalized structure
 */
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  slug: string;
  author?: string;
  categories: Category[];
  tags?: Tag[];
  featuredImage?: Image;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw blog post data structure from Strapi API
 * This matches the flat structure we receive from the API
 */
export interface StrapiRawBlogPost {
  id: string;
  documentId?: string;
  title: string;
  Content?: string;  // Capital C version from API
  content?: string;  // Lowercase version for compatibility
  summary?: string;
  articledescription?: string;
  slug: string;
  Author?: string;   // Capital A version from API
  author?: string;   // Lowercase version for compatibility
  categories?: Array<{
    id: string | number;
    name: string;
    description?: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  }>;
  tags?: Array<{
    id: string | number;
    name: string;
  }>;
  featuredImage?: {
    id: string;
    documentId?: string;
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes?: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes?: number;
      };
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
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publicationDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * News article content type - normalized structure
 */
export interface NewsArticle extends BaseContent {
  content?: string;
  Content?: string;  // Capital C version from API
  summary?: string;
  articledescription?: string;
  author?: string;
  Author?: string;   // Capital A version from API
  categories?: Category[];
  tags?: Tag[];
  featuredImage?: Image;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  readingTime?: number;
  isSeriesPart?: boolean;
  seriesTitle?: string;
  seriesOrder?: number;
}

/**
 * Raw Strapi response type for NewsArticle
 */
export interface StrapiRawNewsArticle {
  id: string;
  documentId?: string;
  title: string;
  Content?: string;  // Capital C version from API
  content?: string;  // Lowercase version for compatibility
  summary?: string;
  articledescription?: string;
  slug: string;
  Author?: string;   // Capital A version from API
  author?: string;   // Lowercase version for compatibility
  categories?: Array<{
    id: string | number;
    documentId?: string;
    name: string;
    description?: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  }>;
  tags?: Array<{
    id: string | number;
    documentId?: string;
    name: string;
    description?: string;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  }>;
  featuredImage?: {
    id: string | number;
    documentId?: string;
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes?: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes?: number;
      };
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
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publicationDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Search result types
 */
export interface SearchResult {
  type: 'blog' | 'news';
  id: string;
  title: string;
  description: string;
  url: string;
  date?: string;
  category?: string;
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  pagination: {
    total: number;
    pageSize: number;
    page: number;
    pageCount: number;
  };
}

/**
 * Generic Strapi paginated response interface
 */
export interface StrapiPaginatedResponse<T> {
  data: Array<{
    id: string;
    attributes: T;
  }>;
  meta: PaginationMeta;
}

/**
 * Paginated blog posts response
 */
export interface PaginatedBlogPosts {
  blogPosts: {
    data: BlogPost[];
    meta: PaginationMeta;
  };
}

/**
 * Paginated news articles response
 */
export interface PaginatedNewsArticles {
  newsArticles: {
    data: NewsArticle[];
    meta: PaginationMeta;
  };
}

/**
 * Search-specific normalized types
 */
export interface SearchBlogPost extends BlogPost {}
export interface SearchNewsArticle extends NewsArticle {}

/**
 * Search types
 */
export interface SearchFilters {
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  contentType?: ('blog' | 'news')[];
  tags?: string[];
}

export interface SearchSortOptions {
  field: 'date' | 'relevance' | 'title';
  direction: 'asc' | 'desc';
}

export interface SearchParams {
  query: string;
  filters?: SearchFilters;
  sort?: SearchSortOptions;
  page?: number;
  pageSize?: number;
}

export interface Whitepaper extends BaseContent {
  description: string;
  version: string;
  author: string;
  downloadLink: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface PaginatedWhitepapers {
  whitepapers: {
    data: Whitepaper[];
    meta: PaginationMeta;
  };
}

export interface SearchResults {
  blogPosts: {
    data: BlogPost[];
    meta: PaginationMeta;
  };
  newsArticles: {
    data: NewsArticle[];
    meta: PaginationMeta;
  };
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

/**
 * Raw Strapi response types for Page Builder components
 */

export interface StrapiRawCTAButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

export interface StrapiRawHeroComponent {
  id: string;
  __component: 'page-blocks.hero';
  title: string;
  subtitle?: string;
  backgroundImage?: {
    data?: {
      id: string;
      attributes: {
        url: string;
        alternativeText?: string;
      };
    };
  };
  ctaButton?: StrapiRawCTAButton;
}

export interface HeroComponent extends PageComponent {
  __component: 'page-blocks.hero';
  title: string;
  subtitle?: string;
  backgroundImage?: Image;
  ctaButton?: CTAButton;
}

export interface StrapiRawTextBlockComponent {
  id: string;
  __component: 'page-blocks.text-block';
  content: string;
  alignment: 'left' | 'center' | 'right';
}

export interface StrapiRawImageGalleryComponent {
  id: string;
  __component: 'page-blocks.gallery';
  images: {
    data: Array<{
      id: string;
      attributes: {
        url: string;
        alternativeText?: string;
      };
    }>;
  };
  layout: 'grid' | 'carousel' | 'masonry';
}

export interface StrapiRawFeature {
  id: string;
  title: string;
  description: string;
  icon?: {
    data?: {
      id: string;
      attributes: {
        url: string;
        alternativeText?: string;
      };
    };
  };
  link?: string;
}

export interface StrapiRawFeatureGridComponent {
  id: string;
  __component: 'page-blocks.feature-grid';
  features: Array<{
    id: string;
    title: string;
    description: string;
    link?: string;
    icon?: {
      data?: {
        id: string;
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
  }>;
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

export interface StrapiRawPage {
  id: string;
  attributes: {
    title?: string;
    Title?: string;
    slug: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    featuredImage?: {
      data?: {
        id: string;
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
    layout?: Array<{
      id: string;
      __component: string;
      title?: string;
      subtitle?: string;
      content?: string;
      alignment?: string;
      text?: string;
      link?: string;
      style?: string;
      features?: Array<{
        id: string;
        title: string;
        description: string;
        link?: string;
        icon?: {
          data?: {
            id: string;
            attributes: {
              url: string;
              alternativeText?: string;
            };
          };
        };
      }>;
    }>;
  };
}

/**
 * Navigation System Types
 */

export type MenuType = 'main' | 'footer' | 'legal' | 'social';
export type MenuLocation = 'header' | 'footer' | 'sidebar';
export type MenuStyle = 'default' | 'mega-menu' | 'dropdown' | 'horizontal' | 'vertical';
export type MenuItemType = 'internal' | 'external' | 'dropdown';

export interface MenuPosition {
  location: MenuLocation;
  order: number;
  style: MenuStyle;
  className?: string;
}

export interface MenuItemSettings {
  order: number;
  icon?: Image;
  openInNewTab: boolean;
  highlight: boolean;
  className?: string;
}

export interface MenuItem {
  id: string;
  title: string;
  type: MenuItemType;
  path: string;
  menu: Menu;
  parent?: MenuItem;
  children?: MenuItem[];
  settings: MenuItemSettings;
}

export interface Menu {
  id: string;
  title: string;
  handle: string;
  type: MenuType;
  items: MenuItem[];
  position: MenuPosition;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
  order: number;
}

export interface MenuVisibility {
  roles?: string[];
  devices: ('desktop' | 'tablet' | 'mobile')[];
  scheduling?: {
    startDate?: string;
    endDate?: string;
    isActive: boolean;
  };
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: Image;
  order: number;
}

/**
 * Raw Strapi Navigation Types
 */

export interface StrapiRawMenuItem {
  id: string;
  attributes: {
    title: string;
    type: MenuItemType;
    path: string;
    menu: {
      data: {
        id: string;
        attributes: StrapiRawMenu['attributes'];
      };
    };
    parent?: {
      data: {
        id: string;
        attributes: StrapiRawMenuItem['attributes'];
      };
    };
    children?: {
      data: Array<{
        id: string;
        attributes: StrapiRawMenuItem['attributes'];
      }>;
    };
    settings: {
      order: number;
      icon?: {
        data?: {
          id: string;
          attributes: {
            url: string;
            alternativeText?: string;
          };
        };
      };
      openInNewTab: boolean;
      highlight: boolean;
      className?: string;
    };
  };
}

export interface StrapiRawMenu {
  id: string;
  attributes: {
    title: string;
    handle: string;
    type: MenuType;
    items: {
      data: Array<{
        id: string;
        attributes: StrapiRawMenuItem['attributes'];
      }>;
    };
    position: {
      location: MenuLocation;
      order: number;
      style: MenuStyle;
      className?: string;
    };
  };
}

export interface StrapiRawMenuSection {
  id: string;
  attributes: {
    title: string;
    items: {
      data: Array<{
        id: string;
        attributes: StrapiRawMenuItem['attributes'];
      }>;
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
      data?: {
        id: string;
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
    order: number;
  };
}
