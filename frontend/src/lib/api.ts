import { monitoredFetch } from './monitoredFetch';
import { getDynamicFetchOptions } from './api/cache';
import { defaultConfig as defaultRetryConfig } from './retry';
import { Page, HeroComponent, TextBlockComponent, ImageGalleryComponent, FeatureGridComponent, ButtonComponent, Image } from './types';

import { NewsArticle, Category, StrapiRawNewsArticle, StrapiPaginatedResponse } from './types';

export async function getNewsArticles(page: number, pageSize: number) {
  try {
    const params = new URLSearchParams({
      'pagination[page]': String(page),
      'pagination[pageSize]': String(pageSize),
      'populate': '*'
    });

    const response = await monitoredFetch(
      'news-articles',
      `/api/proxy/news-articles?${params}`,
      getDynamicFetchOptions(),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch news articles: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as StrapiPaginatedResponse<StrapiRawNewsArticle>;
    return {
      newsArticles: {
        data: data.data.map((article) => ({
          ...article.attributes,
          id: String(article.id)
        } as NewsArticle)),
        meta: data.meta
      }
    };
  } catch (error) {
    console.error('Error fetching news articles:', error);
    throw error;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await monitoredFetch(
      'categories',
      '/api/proxy/categories',
      getDynamicFetchOptions(),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as StrapiPaginatedResponse<Category>;
    return data.data.map((category) => ({
      ...category.attributes,
      id: String(category.id)
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getPage(slug: string): Promise<Page> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate': '*'
    });

    const endpoint = `pages/${slug}`;
    const response = await monitoredFetch(
      endpoint,
      `/api/proxy/pages?${params}`,
      getDynamicFetchOptions(),
      defaultRetryConfig
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('404: Page not found');
      }
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data?.[0]) {
      throw new Error('404: Page not found');
    }

    const page = data.data[0];
    const attrs = (page.attributes || page) as Record<string, unknown>;

    return {
      id: String(page.id),
      title: String(attrs.title || ''),
      slug: String(attrs.slug || ''),
      seoMetadata: {
        metaTitle: String(attrs.seoTitle || ''),
        metaDescription: String(attrs.seoDescription || ''),
        keywords: String(attrs.seoKeywords || ''),
        ogImage: attrs.ogImage as Image | undefined
      },
      layout: (attrs.layout || []) as (HeroComponent | TextBlockComponent | ImageGalleryComponent | FeatureGridComponent | ButtonComponent)[],
      publishedAt: String(attrs.publishedAt || ''),
      createdAt: String(attrs.createdAt || ''),
      updatedAt: String(attrs.updatedAt || '')
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}
