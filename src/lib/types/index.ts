import { Tag } from '../types';

// Common types
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Image type
export interface ImageAttributes {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

export interface ImageData {
  id: string;
  attributes: ImageAttributes;
}

export interface Image {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  data?: ImageData;
}

// Category type
export interface Category extends BaseModel {
  name: string;
  slug: string;
  description: string;
}

// Author type
export interface Author extends BaseModel {
  name: string;
  slug: string;
  bio: string;
  credentials?: string;
  expertise?: string[];
  profileImage?: Image;
  linkedIn?: string;
  email?: string;
}

// Blog post component types
export interface TldrItem {
  id?: string;
  point: string;
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

// Blog post enums
export enum SchemaType {
  ARTICLE = 'Article',
  HOWTO = 'HowTo',
  FAQPAGE = 'FAQPage'
}

export enum SearchIntent {
  INFORMATIONAL = 'Informational',
  COMMERCIAL = 'Commercial',
  TRANSACTIONAL = 'Transactional'
}

export enum CtaVariant {
  CONTACT = 'contact',
  DOWNLOAD = 'download',
  NEWSLETTER = 'newsletter',
  NONE = 'none'
}

// Enhanced Blog post type with all SEO/GEO fields
export interface BlogPost extends BaseModel {
  // Core content fields
  title: string;
  slug: string;
  content: string;
  excerpt?: string;

  // Author (can be string for backward compatibility or Author object for new structure)
  author?: string | Author;

  // Relations
  tags: Tag[];
  categories?: Category[];
  relatedPosts?: BlogPost[];

  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  primaryKeyword?: string;

  // Images
  featuredImage?: Image;
  featuredImageAltText?: string;
  ogImage?: Image;

  // Dates
  publicationDate?: string;

  // Components
  tldr?: TldrItem[];
  faq?: FaqItem[];

  // Schema and intent
  schemaType?: SchemaType | string;
  searchIntent?: SearchIntent | string;
  ctaVariant?: CtaVariant | string;

  // Robots directives
  robotsIndex?: boolean;
  robotsFollow?: boolean;

  // Video fields
  videoUrl?: string;
  videoTitle?: string;
  videoDuration?: string;
}

export interface PaginatedBlogPosts {
  blogPosts: {
    data: BlogPost[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  };
}

// Menu types
export enum MenuPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

export enum MenuItemType {
  LINK = 'link',
  BUTTON = 'button',
  DROPDOWN = 'dropdown',
  PAGE = 'page'
}

export interface MenuItemSettings {
  icon?: string;
  order: number;
  openInNewTab?: boolean;
  highlight?: boolean;
  [key: string]: unknown;
}

export interface MenuItem extends BaseModel {
  title: string;
  type: MenuItemType;
  path: string;
  menuHandle: string;
  menu: {
    id: string;
    handle: string;
    title: string;
    position: MenuPosition;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    type: 'header' | 'footer' | 'sidebar';
    items: MenuItem[];
  };
  settings: MenuItemSettings;
  label?: string;
  url?: string;
  icon?: string;
  order?: number;
  children?: MenuItem[];
}

export interface Menu extends BaseModel {
  handle: string;
  title: string;
  items: MenuItem[];
  position: MenuPosition;
  type: 'header' | 'footer' | 'sidebar';
  style?: string;
  className?: string;
}

// Page types
export interface Page extends BaseModel {
  title: string;
  slug: string;
  layout: any;
  seoMetadata: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

// Social link types
export interface SocialLink extends BaseModel {
  platform: string;
  url: string;
  icon: Image;
  order: number;
}

// Search types
export interface SearchParams {
  query: string;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    contentType?: ('blog' | 'news')[];
  };
  sort?: {
    field: 'date' | 'title' | 'relevance';
    direction: 'asc' | 'desc';
  };
  page?: number;
  pageSize?: number;
}

export interface SearchResults {
  blogPosts: {
    data: BlogPost[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  };
  newsArticles: {
    data: NewsArticle[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  };
}

// News article types
export interface NewsArticle extends BaseModel {
  title: string;
  slug: string;
  content: string;
  summary: string;
  author: string | undefined;
  categories: Category[];
  featuredImage?: Image;
}

export interface PaginatedNewsArticles {
  newsArticles: {
    data: NewsArticle[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  };
}

// Helper functions
export function isValidMenuPosition(position: unknown): position is MenuPosition {
  return Object.values(MenuPosition).includes(position as MenuPosition);
}

export { normalizeMenuPosition } from './normalizers';
