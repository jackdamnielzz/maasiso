import {
  Category,
  BlogPost,
  NewsArticle,
  SearchParams,
  SearchResults,
  PaginatedBlogPosts,
  PaginatedNewsArticles,
  PaginatedWhitepapers,
  Page,
  Menu,
  SocialLink,
  MenuType,
  StrapiRawNewsArticle,
  StrapiRawBlogPost,
  Tag
} from './types';
import { isObject } from './normalizers';
import {
  normalizeNewsArticle,
  isStrapiRawNewsArticle,
  normalizeBlogPost,
  isStrapiRawBlogPost,
  isStrapiPaginatedResponse,
  normalizePage,
  normalizeMenu,
  normalizeSocialLink,
  isStrapiRawMenu,
  isStrapiRawSocialLink
} from './normalizers';
import { monitoredFetch } from './monitoredFetch';
import { 
  getStaticFetchOptions, 
  getListFetchOptions, 
  getDynamicFetchOptions 
} from './api/cache';
import { clientEnv } from './config/client-env';

// Default retry configuration for API calls
const defaultRetryConfig = {
  maxAttempts: 5,
  initialDelay: 2000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatuses: [401, 403, 408, 429, 500, 502, 503, 504],
  retryableErrors: ['ERR_INSUFFICIENT_RESOURCES']
};

export async function getBlogPosts(
  page = 1,
  pageSize = 6
): Promise<PaginatedBlogPosts> {
  try {
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': 'featuredImage',
    });

    const endpoint = 'blog-posts';
    const response = await monitoredFetch(
      endpoint,
      `${clientEnv.apiUrl}/api/blog-posts?${params}`,
      getListFetchOptions('blogPost'),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!isStrapiPaginatedResponse(data)) {
      throw new Error('Invalid response structure from API');
    }

    const normalizedPosts = data.data.map(post => {
      if (!isObject(post)) {
        throw new Error('Invalid post data: not an object');
      }

      const attrs = (post.attributes || post) as Record<string, any>;
      const postData: StrapiRawBlogPost = {
        id: String(post.id),
        documentId: attrs.documentId || '',
        title: attrs.title || '',
        Content: attrs.Content || '',
        content: attrs.content || '',
        slug: attrs.slug || '',
        Author: attrs.Author || null,
        author: attrs.author || '',
        categories: [],
        tags: [],
        featuredImage: attrs.featuredImage || null,
        seoTitle: attrs.seoTitle || '',
        seoDescription: attrs.seoDescription || '',
        seoKeywords: attrs.seoKeywords || '',
        publicationDate: attrs.publicationDate || null,
        publishedAt: attrs.publishedAt || '',
        createdAt: attrs.createdAt || '',
        updatedAt: attrs.updatedAt || ''
      };
      
      if (!isStrapiRawBlogPost(postData)) {
        console.error('Invalid post structure:', JSON.stringify(postData, null, 2));
        throw new Error('Invalid blog post data structure');
      }
      return normalizeBlogPost(postData);
    });

    return {
      blogPosts: {
        data: normalizedPosts,
        meta: data.meta,
      },
    };
  } catch (error) {
    return handleApiError(error, 'Failed to fetch blog posts');
  }
}

export async function getNewsArticles(
  page = 1,
  pageSize = 6
): Promise<PaginatedNewsArticles> {
  try {
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': 'featuredImage',
    });

    const url = `${clientEnv.apiUrl}/api/news-articles?${params}`;

    const endpoint = 'news-articles';
    const response = await monitoredFetch(
      endpoint,
      url,
      getListFetchOptions('newsArticle'),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch news articles: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!isStrapiPaginatedResponse(data)) {
      throw new Error('Invalid response structure from API');
    }

    const normalizedArticles = data.data.map(article => {
      if (!isObject(article)) {
        throw new Error('Invalid article data: not an object');
      }

      const attrs = (article.attributes || article) as Record<string, any>;
      
      const processedArticle = {
        id: String(article.id),
        title: attrs.title || '',
        content: attrs.content || '',
        slug: attrs.slug || '',
        author: attrs.author || '',
        articledescription: attrs.articledescription || '',
        categories: [],
        tags: [],
        featuredImage: attrs.featuredImage,
        seoTitle: attrs.seoTitle || '',
        seoDescription: attrs.seoDescription || '',
        seoKeywords: attrs.seoKeywords || '',
        publishedAt: attrs.publishedAt || '',
        createdAt: attrs.createdAt || '',
        updatedAt: attrs.updatedAt || ''
      };

      if (!isStrapiRawNewsArticle(processedArticle)) {
        console.error('Invalid article structure:', JSON.stringify(processedArticle, null, 2));
        throw new Error('Invalid news article data structure');
      }
      return normalizeNewsArticle(processedArticle);
    });

    return {
      newsArticles: {
        data: normalizedArticles,
        meta: data.meta || { pagination: { page: 1, pageSize: 6, pageCount: 1, total: normalizedArticles.length } },
      },
    };
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return {
      newsArticles: {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 6,
            pageCount: 0,
            total: 0
          }
        }
      }
    };
  }
}

// Helper function to handle API errors
function handleApiError(error: unknown, message: string): never {
  console.error('API Error:', error);
  if (error instanceof Error) {
    throw new Error(`${message}: ${error.message}`);
  }
  throw new Error(message);
}

export async function getNewsArticleBySlug(slug: string): Promise<{ newsArticle: NewsArticle }> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate': 'featuredImage'
    });

    const endpoint = `news-articles/${slug}`;
    const response = await monitoredFetch(
      endpoint,
      `${clientEnv.apiUrl}/api/news-articles?${params}`,
      getDynamicFetchOptions(),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch news article: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data?.[0]) {
      throw new Error('News article not found');
    }

    const article = data.data[0];
    const attrs = (article.attributes || article) as Record<string, any>;
    const processedArticle: StrapiRawNewsArticle = {
      id: String(article.id),
      title: attrs.title || '',
      content: attrs.content || '',
      slug: attrs.slug || '',
      author: attrs.author || '',
      articledescription: attrs.articledescription || '',
      categories: [],
      tags: [],
      featuredImage: attrs.featuredImage || null,
      seoTitle: attrs.seoTitle || '',
      seoDescription: attrs.seoDescription || '',
      seoKeywords: attrs.seoKeywords || '',
      publishedAt: attrs.publishedAt || '',
      createdAt: attrs.createdAt || '',
      updatedAt: attrs.updatedAt || ''
    };

    if (!isStrapiRawNewsArticle(processedArticle)) {
      throw new Error('Invalid news article data structure');
    }

    return {
      newsArticle: normalizeNewsArticle(processedArticle)
    };
  } catch (error) {
    throw new Error(`Failed to fetch news article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBlogPostBySlug(slug: string): Promise<{ blogPost: BlogPost }> {
  try {
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate': 'featuredImage'
    });

    const endpoint = `blog-posts/${slug}`;
    const response = await monitoredFetch(
      endpoint,
      `${clientEnv.apiUrl}/api/blog-posts?${params}`,
      getDynamicFetchOptions(),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch blog post: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data?.[0]) {
      throw new Error('Blog post not found');
    }

    const post = data.data[0];
    const attrs = (post.attributes || post) as Record<string, any>;
    const processedPost: StrapiRawBlogPost = {
      id: String(post.id),
      documentId: attrs.documentId || '',
      title: attrs.title || '',
      Content: attrs.Content || '',
      content: attrs.content || '',
      slug: attrs.slug || '',
      Author: attrs.Author || null,
      author: attrs.author || '',
      categories: [],
      tags: [],
      featuredImage: attrs.featuredImage || null,
      seoTitle: attrs.seoTitle || '',
      seoDescription: attrs.seoDescription || '',
      seoKeywords: attrs.seoKeywords || '',
      publicationDate: attrs.publicationDate || null,
      publishedAt: attrs.publishedAt || '',
      createdAt: attrs.createdAt || '',
      updatedAt: attrs.updatedAt || ''
    };

    if (!isStrapiRawBlogPost(processedPost)) {
      throw new Error('Invalid blog post data structure');
    }

    return {
      blogPost: normalizeBlogPost(processedPost)
    };
  } catch (error) {
    throw new Error(`Failed to fetch blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getRelatedPosts(currentPostId: string, limit = 3): Promise<BlogPost[]> {
  try {
    const params = new URLSearchParams({
      'pagination[limit]': limit.toString(),
      'filters[id][$ne]': currentPostId,
      'populate': 'featuredImage'
    });

    const endpoint = 'blog-posts/related';
    const response = await monitoredFetch(
      endpoint,
      `${clientEnv.apiUrl}/api/blog-posts?${params}`,
      getListFetchOptions('blogPost'),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data) {
      return [];
    }

    return data.data.map((post: Record<string, any>) => {
      const attrs = (post.attributes || post) as Record<string, any>;
      const processedPost: StrapiRawBlogPost = {
        id: String(post.id),
        documentId: attrs.documentId || '',
        title: attrs.title || '',
        Content: attrs.Content || '',
        content: attrs.content || '',
        slug: attrs.slug || '',
        Author: attrs.Author || null,
        author: attrs.author || '',
        categories: [],
        tags: [],
        featuredImage: attrs.featuredImage || null,
        seoTitle: attrs.seoTitle || '',
        seoDescription: attrs.seoDescription || '',
        seoKeywords: attrs.seoKeywords || '',
        publicationDate: attrs.publicationDate || null,
        publishedAt: attrs.publishedAt || '',
        createdAt: attrs.createdAt || '',
        updatedAt: attrs.updatedAt || ''
      };

      if (!isStrapiRawBlogPost(processedPost)) {
        throw new Error('Invalid blog post data structure');
      }

      return normalizeBlogPost(processedPost);
    });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const endpoint = 'categories';
    const response = await monitoredFetch(
      endpoint,
      `${clientEnv.apiUrl}/api/categories`,
      getListFetchOptions('category'),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!isStrapiPaginatedResponse(data)) {
      throw new Error('Invalid response structure from API');
    }

    return data.data.map(category => {
      if (!isObject(category)) {
        throw new Error('Invalid category data: not an object');
      }

      const attrs = (category.attributes || category) as Record<string, any>;
      return {
        id: String(category.id),
        name: attrs.name || '',
        description: attrs.description || '',
        slug: attrs.slug || '',
        createdAt: attrs.createdAt || '',
        updatedAt: attrs.updatedAt || ''
      };
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function search(params: SearchParams): Promise<SearchResults> {
  try {
    const searchParams = new URLSearchParams({
      'query': params.query,
      'page': (params.page || 1).toString(),
      'pageSize': (params.pageSize || 10).toString(),
      'populate': '*'
    });

    if (params.filters?.categories?.length) {
      params.filters.categories.forEach(cat =>
        searchParams.append('filters[categories][]', cat)
      );
    }

    if (params.filters?.contentType?.length) {
      params.filters.contentType.forEach(type =>
        searchParams.append('filters[type][]', type)
      );
    }

    if (params.sort) {
      searchParams.append('sort[field]', params.sort.field);
      searchParams.append('sort[direction]', params.sort.direction);
    }

    const endpoint = 'search';
    const response = await monitoredFetch(
      endpoint,
      `${clientEnv.apiUrl}/api/search?${searchParams}`,
      getDynamicFetchOptions(),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      blogPosts: {
        data: data.blogPosts?.map(normalizeBlogPost) || [],
        meta: data.blogPostsMeta || { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } }
      },
      newsArticles: {
        data: data.newsArticles?.map(normalizeNewsArticle) || [],
        meta: data.newsArticlesMeta || { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } }
      }
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      blogPosts: {
        data: [],
        meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } }
      },
      newsArticles: {
        data: [],
        meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } }
      }
    };
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
      `${clientEnv.apiUrl}/api/pages?${params}`,
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
    const attrs = (page.attributes || page) as Record<string, any>;

    return {
      id: String(page.id),
      title: attrs.title || '',
      slug: attrs.slug || '',
      seoMetadata: {
        metaTitle: attrs.seoTitle || '',
        metaDescription: attrs.seoDescription || '',
        keywords: attrs.seoKeywords || '',
        ogImage: attrs.ogImage || null
      },
      layout: attrs.layout || [],
      publishedAt: attrs.publishedAt || '',
      createdAt: attrs.createdAt || '',
      updatedAt: attrs.updatedAt || ''
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

export async function getWhitepapers(
  page = 1,
  pageSize = 6
): Promise<PaginatedWhitepapers> {
  try {
    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': '*',
    });

    const endpoint = 'whitepapers';
    const response = await monitoredFetch(
      endpoint,
      `${clientEnv.apiUrl}/api/whitepapers?${params}`,
      getListFetchOptions('whitepaper'),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch whitepapers: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!isStrapiPaginatedResponse(data)) {
      throw new Error('Invalid response structure from API');
    }

    const normalizedWhitepapers = data.data.map(whitepaper => {
      if (!isObject(whitepaper)) {
        throw new Error('Invalid whitepaper data: not an object');
      }

      const attrs = (whitepaper.attributes || whitepaper) as Record<string, any>;
      return {
        id: String(whitepaper.id),
        title: attrs.title || '',
        description: attrs.description || '',
        version: attrs.version || '1.0.0',
        author: attrs.author || '',
        downloadLink: attrs.downloadLink || '',
        slug: attrs.slug || '',
        seoTitle: attrs.seoTitle || '',
        seoDescription: attrs.seoDescription || '',
        seoKeywords: attrs.seoKeywords || '',
        publishedAt: attrs.publishedAt || '',
        createdAt: attrs.createdAt || '',
        updatedAt: attrs.updatedAt || ''
      };
    });

    return {
      whitepapers: {
        data: normalizedWhitepapers,
        meta: data.meta,
      },
    };
  } catch (error) {
    console.error('Error fetching whitepapers:', error);
    return {
      whitepapers: {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 6,
            pageCount: 0,
            total: 0
          }
        }
      }
    };
  }
}

export async function getRelatedNewsArticles(currentArticleId: string, limit = 3): Promise<NewsArticle[]> {
  try {
    const params = new URLSearchParams({
      'pagination[limit]': limit.toString(),
      'filters[id][$ne]': currentArticleId,
      'populate': 'featuredImage'
    });

    const endpoint = 'news-articles/related';
    const response = await monitoredFetch(
      endpoint,
      `${clientEnv.apiUrl}/api/news-articles?${params}`,
      getListFetchOptions('newsArticle'),
      defaultRetryConfig
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch related articles: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data) {
      return [];
    }

    return data.data.map((article: Record<string, any>) => {
      const attrs = (article.attributes || article) as Record<string, any>;
      const processedArticle: StrapiRawNewsArticle = {
        id: String(article.id),
        title: attrs.title || '',
        content: attrs.content || '',
        slug: attrs.slug || '',
        author: attrs.author || '',
        articledescription: attrs.articledescription || '',
        categories: [],
        tags: [],
        featuredImage: attrs.featuredImage || null,
        seoTitle: attrs.seoTitle || '',
        seoDescription: attrs.seoDescription || '',
        seoKeywords: attrs.seoKeywords || '',
        publishedAt: attrs.publishedAt || '',
        createdAt: attrs.createdAt || '',
        updatedAt: attrs.updatedAt || ''
      };

      if (!isStrapiRawNewsArticle(processedArticle)) {
        throw new Error('Invalid news article data structure');
      }

      return normalizeNewsArticle(processedArticle);
    });
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}
