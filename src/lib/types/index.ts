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

// Blog post types
export interface BlogPost extends BaseModel {
  title: string;
  slug: string;
  content: string;
  author: string | undefined;
  tags: Tag[];
  categories?: Category[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  featuredImage?: Image;
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
