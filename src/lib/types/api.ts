// Strapi common types
interface StrapiAttribute {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface StrapiResponse<T> {
  data: Array<{
    id: number;
    attributes: T & StrapiAttribute;
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Category types
export interface StrapiCategory extends StrapiAttribute {
  name: string;
  description: string;
  slug: string;
}

export type StrapiCategoryResponse = StrapiResponse<StrapiCategory>;

// Blog post types
export interface StrapiBlogPost extends StrapiAttribute {
  title: string;
  slug: string;
  content: string;
  author: string | null;
  categories: {
    data: Array<{
      id: number;
      attributes: StrapiCategory;
    }>;
  };
}

export type StrapiBlogPostResponse = StrapiResponse<StrapiBlogPost>;

// Menu types
export interface StrapiMenuItem extends StrapiAttribute {
  id: number;
  label: string;
  url: string;
  icon?: string;
  order: number;
  openInNewTab?: boolean;
  highlight?: boolean;
  menu?: {
    data: {
      id: number;
      attributes: {
        handle: string;
        title: string;
        position: string;
        createdAt: string;
        updatedAt: string;
        publishedAt?: string;
      };
    };
  };
  children?: {
    data: Array<{
      id: number;
      attributes: StrapiMenuItem;
    }>;
  };
}

export interface StrapiMenu extends StrapiAttribute {
  handle: string;
  title: string;
  items: {
    data: Array<{
      id: number;
      attributes: StrapiMenuItem;
    }>;
  };
  position: string;
  type: 'header' | 'footer' | 'sidebar';
}

export type StrapiMenuResponse = StrapiResponse<StrapiMenu>;

// Page types
export interface StrapiPage extends StrapiAttribute {
  title: string;
  slug: string;
  layout: any; // Define specific layout type if needed
  seoMetadata: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

export type StrapiPageResponse = StrapiResponse<StrapiPage>;

// Social link types
export interface StrapiSocialLink extends StrapiAttribute {
  platform: string;
  url: string;
  icon: string;
  order: number;
}

export type StrapiSocialLinkResponse = StrapiResponse<StrapiSocialLink>;
