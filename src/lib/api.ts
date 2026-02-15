import {
  BlogPost,
  Page,
  SearchParamsV2,
  SearchResultsV2,
  StrapiCollectionResponse,
  StrapiData,
  StrapiSingleResponse,
  StrapiError,
  RawStrapiComponent,
  RawHeroComponent,
  RawFeatureGridComponent,
  RawFeature,
  RawTextBlockComponent,
  RawButtonComponent,
  RawGalleryComponent,
  Whitepaper,
  SEOMetadata,
  Image,
  PageComponent,
  StrapiRawPage
} from './types';
import type { Author } from './types';
import { extractFeatures } from './featureExtractor';
import { monitoredFetch } from './monitoredFetch';
import { validateSlug } from './utils/slugUtils';
import { normalizePageSchemaType } from './utils/pageSchema';

class APIError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// Always use the API URL for requests
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

const API_TOKEN = process.env.STRAPI_TOKEN;
const PLACEHOLDER_TOKENS = new Set(['__set_me__', 'changeme', 'your_token_here']);
const isDebugLoggingEnabled =
  process.env.NODE_ENV !== 'production' || process.env.MAASISO_DEBUG === '1';

const debugLog = (...args: unknown[]) => {
  if (isDebugLoggingEnabled) {
    console.log(...args);
  }
};

const toProxyPath = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized.startsWith('/api/proxy/')) {
    return normalized;
  }

  if (normalized.startsWith('/api/')) {
    return `/api/proxy/${normalized.slice('/api/'.length)}`;
  }

  return normalized;
};

// Ensure proper Bearer token format and handle missing token
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const normalizedToken = API_TOKEN?.trim().toLowerCase();
  const hasUsableToken = !!normalizedToken && !PLACEHOLDER_TOKENS.has(normalizedToken);

  if (hasUsableToken && API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  return headers;
};

async function fetchWithBaseUrl<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      throw new APIError('API base URL is not configured', 500);
    }

    const resolvedPath = toProxyPath(path);
    const url = `${baseUrl}${resolvedPath.startsWith('/') ? '' : '/'}${resolvedPath}`;
    
    const normalizeHeaders = (headers: RequestInit['headers']): Record<string, string> => {
      if (!headers) return {};
      if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries());
      }
      if (Array.isArray(headers)) {
        return Object.fromEntries(headers);
      }
      return headers as Record<string, string>;
    };

    const requestHeaders: Record<string, string> = {
      ...getAuthHeaders(),
      ...normalizeHeaders(options.headers),
    };

    const safeHeaders: Record<string, string> = { ...requestHeaders };
    for (const key of Object.keys(safeHeaders)) {
      if (key.toLowerCase() === 'authorization') {
        safeHeaders[key] = '[REDACTED]';
      }
    }

    debugLog('[API Request] Detailed Debug:', {
      baseUrl,
      path,
      resolvedPath,
      fullUrl: url,
      method: options.method || 'GET',
      headers: safeHeaders
    });

    const response = await monitoredFetch(
      path,
      url,
      {
        ...options,
        headers: {
          ...requestHeaders,
        }
      }
    );

    const data = await response.json();

    // Avoid expensive/full JSON stringification in logs (can be massive for content fields)
    const summary = (() => {
      if (!data || typeof data !== 'object') return { type: typeof data };
      const obj = data as any;
      const dataLen = Array.isArray(obj.data) ? obj.data.length : undefined;
      const keys = Object.keys(obj);
      const pagination = obj?.meta?.pagination;
      return {
        keys,
        dataLength: dataLen,
        pagination,
      };
    })();

    debugLog('[API Response] Detailed Debug:', {
      url,
      status: response.status,
      summary
    });

    return data;
  } catch (error) {
    console.error('[API Fetch Error] Detailed Debug:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
}

// Helper to flatten Strapi media fields
const flattenMedia = (media: any) => {
  if (!media) return undefined;
  if (media.data && media.data.attributes) {
    return { id: media.data.id, ...media.data.attributes };
  }
  return media;
};

// Helper to map author (can be string or relation)
const mapAuthor = (authorData: any) => {
  // Backward compatibility: if it's a string, return as-is
  if (typeof authorData === 'string') {
    return authorData;
  }

  // Strapi v4: nested { data: { attributes: {...} } } structure
  if (authorData?.data?.attributes) {
    const attr = authorData.data.attributes;
    return {
      id: String(authorData.data.id),
      documentId: authorData.data.documentId,
      name: attr.name || '',
      slug: attr.slug || '',
      bio: attr.bio || '',
      credentials: attr.credentials,
      expertise: attr.expertise,
      profileImage: attr.profileImage ? flattenMedia(attr.profileImage) : undefined,
      linkedIn: attr.linkedIn,
      email: attr.email,
      createdAt: attr.createdAt,
      updatedAt: attr.updatedAt || attr.publishedAt || attr.createdAt,
      publishedAt: attr.publishedAt,
      blog_posts: attr.blog_posts?.data ? attr.blog_posts.data.map((p: any) => mapBlogPost(p.attributes ? { id: p.id, ...p.attributes } : p)) : undefined,
    };
  }

  // Strapi v5: flat object structure (direct author object)
  if (authorData && typeof authorData === 'object' && authorData.name) {
    return {
      id: String(authorData.id || authorData.documentId),
      documentId: authorData.documentId,
      name: authorData.name || '',
      slug: authorData.slug || '',
      bio: authorData.bio || '',
      credentials: authorData.credentials,
      expertise: authorData.expertise,
      profileImage: authorData.profileImage ? flattenMedia(authorData.profileImage) : undefined,
      linkedIn: authorData.linkedIn,
      email: authorData.email,
      createdAt: authorData.createdAt,
      updatedAt: authorData.updatedAt || authorData.publishedAt || authorData.createdAt,
      publishedAt: authorData.publishedAt,
      blog_posts: authorData.blog_posts ? authorData.blog_posts.map((p: any) => mapBlogPost(p)) : undefined,
    };
  }

  return undefined;
};

function mapBlogPost(data: any | null): BlogPost | null {
  if (!data) {
    debugLog('Invalid blog post data:', data);
    return null;
  }

  // Map related posts if they exist
  // Strapi v5 returns flat array, not nested data.attributes structure
  const mapRelatedPosts = (relatedData: any) => {
    // Handle both Strapi v4 (nested) and v5 (flat) structures
    let posts: any[] = [];
    
    if (Array.isArray(relatedData)) {
      // Strapi v5: flat array of posts
      posts = relatedData;
    } else if (relatedData?.data && Array.isArray(relatedData.data)) {
      // Strapi v4: nested { data: [...] } structure
      posts = relatedData.data;
    } else {
      debugLog('[mapRelatedPosts] No related posts found, data:', relatedData);
      return [];
    }

    debugLog('[mapRelatedPosts] Processing', posts.length, 'related posts');

    return posts.map((post: any) => {
      // Handle both flat (v5) and nested (v4) post structure
      const postData = post.attributes || post;
      const postId = post.id;
      
      return {
        id: String(postId),
        title: postData.title || '',
        slug: postData.slug || '',
        excerpt: postData.excerpt,
        featuredImage: postData.featuredImage
          ? flattenMedia(postData.featuredImage)
          : undefined,
        createdAt: postData.createdAt,
        updatedAt: postData.updatedAt || postData.publishedAt || postData.createdAt,
        publishedAt: postData.publishedAt,
      };
    });
  };

  return {
    id: String(data.id),
    title: data.title || 'Untitled',
    slug: data.slug || '',
    content: data.Content || data.content || '',
    excerpt: data.excerpt,

    // Author (backward compatible)
    author: mapAuthor(data.author || data.Author),

    // Dates - use createdAt/publishedAt as fallback for updatedAt, never use current date
    // This ensures blog post dates reflect Strapi data, not deployment/build time
    createdAt: data.createdAt,
    updatedAt: data.updatedAt || data.publishedAt || data.createdAt,
    publishedAt: data.publishedAt,
    publicationDate: data.publicationDate,

    // SEO fields
    seoTitle: data.seoTitle || data.title || 'Untitled',
    seoDescription: data.seoDescription || '',
    seoKeywords: data.seoKeywords || '',
    primaryKeyword: data.primaryKeyword,

    // Relations
    tags: Array.isArray(data.tags)
      ? data.tags.map((tag: any) => ({
          id: String(tag.id || tag.documentId),
          name: tag.name || '',
          slug: tag.slug || '',
          description: tag.description,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt || tag.createdAt,
          publishedAt: tag.publishedAt,
        }))
      : [],
    categories: Array.isArray(data.categories)
      ? data.categories.map((cat: any) => ({
          id: String(cat.id || cat.documentId),
          name: cat.name || '',
          slug: cat.slug || '',
          description: cat.description || '',
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt || cat.createdAt,
          publishedAt: cat.publishedAt,
        }))
      : [],
    relatedPosts: mapRelatedPosts(data.relatedPosts),

    // Images
    featuredImage: flattenMedia(data.featuredImage),
    featuredImageAltText: data.featuredImageAltText,
    ogImage: flattenMedia(data.ogImage),

    // Components
    tldr: data.tldr || [],
    faq: data.faq || [],

    // Schema and categorization
    schemaType: data.schemaType,
    searchIntent: data.searchIntent,
    ctaVariant: data.ctaVariant,

    // Robots directives
    robotsIndex: data.robotsIndex ?? true,
    robotsFollow: data.robotsFollow ?? true,

    // Video fields
    videoUrl: data.videoUrl,
    videoTitle: data.videoTitle,
    videoDuration: data.videoDuration,
  };
}

function mapWhitepaper(data: any | null): Whitepaper | null {
  if (!data) {
    debugLog('mapWhitepaper received null data');
    return null;
  }
  
  return {
    id: String(data.id),
    title: data.title || '',
    slug: data.slug || '',
    description: data.description || '',
    version: data.version || '1.0',
    author: data.author || '',
    downloadLink: data.file?.data?.attributes?.url || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt || data.publishedAt || data.createdAt,
    publishedAt: data.publishedAt
  };
}

function mapImage(data: any): Image | undefined {
  if (!data) {
    return undefined;
  }
  // Handle flat image structure
  return {
    id: String(data.id),
    name: data.name || '',
    alternativeText: data.alternativeText || '',
    caption: data.caption || '',
    width: data.width || 0,
    height: data.height || 0,
    formats: data.formats || {},
    hash: data.hash || '',
    ext: data.ext || '',
    mime: data.mime || '',
    size: data.size || 0,
    url: data.url || '',
    previewUrl: data.previewUrl,
    provider: data.provider || '',
    provider_metadata: data.provider_metadata,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt || data.createdAt,
    publishedAt: data.publishedAt
  };
}

function mapMediaField(media: any): Image | undefined {
  if (!media) return undefined;

  if (Array.isArray(media)) {
    return mapMediaField(media[0]);
  }

  if (media?.data && Array.isArray(media.data)) {
    return mapMediaField(media.data[0]);
  }

  // Strapi v5 single media relation often uses: { data: { id, url, ... } }
  if (media?.data && typeof media.data === 'object') {
    return mapMediaField(media.data);
  }

  if (media?.data && media.data.attributes) {
    return mapImage({
      id: media.data.id,
      ...media.data.attributes,
    });
  }

  if (media?.attributes) {
    return mapImage({
      id: media.id,
      ...media.attributes,
    });
  }

  return mapImage(media);
}

function mapMediaCollection(media: any): Image[] {
  if (!media) return [];

  if (Array.isArray(media)) {
    return media.map((item) => mapMediaField(item)).filter(Boolean) as Image[];
  }

  if (media?.data && Array.isArray(media.data)) {
    return media.data.map((item: any) => mapMediaField(item)).filter(Boolean) as Image[];
  }

  const single = mapMediaField(media);
  return single ? [single] : [];
}

function validatePageComponent(component: RawStrapiComponent, index: number): boolean {
  if (!component || !component.__component) {
    console.warn(`[API Validation] Invalid component at index ${index}: Missing __component property`);
    return false;
  }

  let isValid = true;
  const componentType = component.__component.split('.')[1];
  
  switch (componentType) {
    case 'hero':
      const heroComponent = component as RawHeroComponent;
      if (!heroComponent.title) {
        console.warn(`[API Validation] Hero component missing title at index ${index}`);
        isValid = false;
      }
      if (heroComponent.ctaButton && (!heroComponent.ctaButton.text || !heroComponent.ctaButton.link)) {
        console.warn(`[API Validation] Hero component has incomplete ctaButton at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'feature-grid':
      debugLog('[API Validation] Feature grid component found, considering valid for frontend fallback rendering');
      return true;
    case 'faq-section': {
      const items = (component as any).items;
      if (items !== undefined && !Array.isArray(items)) {
        console.warn(`[API Validation] FAQ section items is not an array at index ${index}`);
        isValid = false;
      }
      break;
    }
    case 'key-takeaways': {
      const items = (component as any).items;
      if (items !== undefined && !Array.isArray(items)) {
        console.warn(`[API Validation] Key takeaways items is not an array at index ${index}`);
        isValid = false;
      }
      break;
    }
    case 'fact-block': {
      const factComponent = component as any;
      if (!factComponent.label || !factComponent.value) {
        console.warn(`[API Validation] Fact block missing label or value at index ${index}`);
        isValid = false;
      }
      break;
    }
      
    case 'text-block':
      const textBlockComponent = component as RawTextBlockComponent;
      if (!textBlockComponent.content) {
        console.warn(`[API Validation] Text block missing content at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'button':
      const buttonComponent = component as RawButtonComponent;
      if (!buttonComponent.text || !buttonComponent.link) {
        console.warn(`[API Validation] Button component missing text or link at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'gallery':
      const galleryComponent = component as RawGalleryComponent;
      if (!galleryComponent.images?.data || galleryComponent.images.data.length === 0) {
        console.warn(`[API Validation] Gallery component missing images at index ${index}`);
        isValid = false;
      }
      break;
  }
  
  return isValid;
}

function normalizeFactBlockSource(
  rawSource: unknown
): string | string[] | undefined {
  if (!rawSource) return undefined;

  if (Array.isArray(rawSource)) {
    const normalized = rawSource
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }
        if (item && typeof item === 'object') {
          const maybeUrl = typeof (item as any).url === 'string' ? (item as any).url.trim() : '';
          const maybeLabel = typeof (item as any).label === 'string' ? (item as any).label.trim() : '';
          return maybeUrl || maybeLabel;
        }
        return '';
      })
      .filter(Boolean);
    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof rawSource === 'string') {
    const normalized = rawSource.trim();
    return normalized || undefined;
  }

  return undefined;
}

export function mapPage(data: any | null): Page | null {
  if (!data) {
    debugLog('mapPage received null data');
    return null;
  }
  
  debugLog('Page data structure:', {
    id: data.id,
    availableFields: Object.keys(data),
    hasLayout: Array.isArray(data.layout),
    layoutLength: Array.isArray(data.layout) ? data.layout.length : 0
  });
  
  const seoMetadata: SEOMetadata = {
    metaTitle: data.seoTitle || '',
    metaDescription: data.seoDescription || '',
    keywords: data.seoKeywords || ''
  };
  
  if (Array.isArray(data.layout)) {
    let validationIssues = false;
    data.layout.forEach((component: RawStrapiComponent, index: number) => {
      if (!validatePageComponent(component, index)) {
        validationIssues = true;
      }
    });
    
    if (validationIssues) {
      console.warn('[API Validation] Some components have validation issues. Check logs above for details.');
    }
  }
  
  return {
    id: String(data.id),
    title: data.title || '',
    slug: data.slug || '',
    seoMetadata,
    featuredImage: mapMediaField(data.featuredImage),
    primaryKeyword: data.primaryKeyword,
    schemaType: normalizePageSchemaType(data.schemaType),
    serviceName: typeof data.serviceName === 'string' ? data.serviceName : undefined,
    serviceDescription: typeof data.serviceDescription === 'string' ? data.serviceDescription : undefined,
    serviceType: typeof data.serviceType === 'string' ? data.serviceType : undefined,
    areaServed: typeof data.areaServed === 'string' ? data.areaServed : undefined,
    providerOverride: typeof data.providerOverride === 'boolean' ? data.providerOverride : undefined,
    layout: data.layout?.map((component: RawStrapiComponent) => {
      const baseComponent = {
        id: component.id,
        __component: component.__component
      };

      switch (component.__component) {
        case 'page-blocks.hero':
          return {
            ...baseComponent,
            title: component.title || '',
            subtitle: component.subtitle || '',
            backgroundImage: mapMediaField(component.backgroundImage),
            ctaButton: component.ctaButton
          };
        case 'page-blocks.text-block':
          return {
            ...baseComponent,
            content: component.content || '',
            alignment: component.alignment || 'left'
          };
        case 'page-blocks.gallery':
          return {
            ...baseComponent,
            images: mapMediaCollection(component.images),
            layout: component.layout || 'grid'
          };
        case 'page-blocks.feature-grid':
          debugLog('Feature grid component found:', {
            id: component.id || 'unknown',
            hasFeatures: 'features' in component,
            componentKeys: Object.keys(component)
          });
          
          return {
            ...baseComponent,
            features: extractFeatures(component)
          };
        case 'page-blocks.button':
          return {
            ...baseComponent,
            text: component.text || '',
            link: component.link || '',
            style: component.style || 'primary'
          };
        case 'page-blocks.faq-section': {
          const rawItems = Array.isArray((component as any).items)
            ? (component as any).items
            : (component as any).items?.data || [];
          const items = rawItems.map((item: any) => {
            const itemData = item?.attributes || item || {};
            return {
              id: String(item?.id || itemData?.id || ''),
              question: itemData.question || '',
              answer: itemData.answer || ''
            };
          });
          return {
            ...baseComponent,
            items
          };
        }
        case 'page-blocks.key-takeaways': {
          const rawItems = Array.isArray((component as any).items)
            ? (component as any).items
            : (component as any).items?.data || [];
          const items = rawItems.map((item: any) => {
            const itemData = item?.attributes || item || {};
            return {
              id: String(item?.id || itemData?.id || ''),
              title: itemData.title || '',
              value: itemData.value || ''
            };
          });
          return {
            ...baseComponent,
            items
          };
        }
        case 'page-blocks.fact-block':
          return {
            ...baseComponent,
            label: (component as any).label || '',
            value: (component as any).value || '',
            source: normalizeFactBlockSource((component as any).source)
          };
        default:
          return baseComponent;
      }
    }) || [],
    publicationDate: data.publicationDate,
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt || data.publishedAt || data.createdAt
  };
}

export async function getPage(slug: string): Promise<Page | null> {
  try {
    // Validate and sanitize the slug
    const validatedSlug = validateSlug(slug);
    debugLog(`[getPage] Starting getPage for slug: ${validatedSlug} at ${new Date().toISOString()}`);

    // Use indexed populate parameters to avoid deep nesting issues
    const indexedPopulate = [
      'populate[0]=layout',
      'populate[1]=layout.features',
      'populate[2]=layout.features.icon',
      'populate[3]=layout.backgroundImage',
      'populate[4]=layout.ctaButton',
      'populate[5]=layout.items',
      'populate[6]=featuredImage'
    ].join('&');

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<StrapiRawPage>>(
      `/api/pages?filters[slug][$eq]=${validatedSlug}&${indexedPopulate}`,
      { next: { revalidate: 60 } }
    );

    if (!data.data || data.data.length === 0) {
      return null;
    }

    return mapPage(data.data[0]);
  } catch (error) {
    console.error('[getPage] Error:', error);
    return null;
  }
}

export async function getBlogPostBySlug(slug: string): Promise<{ blogPost: BlogPost | null }> {
  try {
    // Validate and sanitize the slug
    const validatedSlug = validateSlug(slug);
    debugLog('Fetching blog post with slug:', validatedSlug);

    // Use indexed populate to explicitly include relatedPosts with their details
    const populateParams = [
      'populate[0]=featuredImage',
      'populate[1]=ogImage',
      'populate[2]=categories',
      'populate[3]=tags',
      'populate[4]=author',
      'populate[5]=author.profileImage',
      'populate[6]=tldr',
      'populate[7]=faq',
      'populate[8]=relatedPosts',
      'populate[9]=relatedPosts.featuredImage'
    ].join('&');

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<BlogPost>>(
      `/api/blog-posts?filters[slug][$eq]=${validatedSlug}&${populateParams}`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    debugLog('Blog by slug response:', {
      hasData: !!data?.data,
      dataLength: data?.data?.length,
      firstPost: data?.data?.[0],
      meta: data?.meta
    });
    
    if (!data.data || data.data.length === 0) {
      debugLog('No blog post found for slug:', validatedSlug);
      return { blogPost: null };
    }

    const mappedPost = mapBlogPost(data.data[0]);
    debugLog('Mapped blog post:', mappedPost);
    return { blogPost: mappedPost };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return { blogPost: null };
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const validatedSlug = validateSlug(slug);
    debugLog('Fetching author with slug:', validatedSlug);

    const populateParams = [
      'populate[0]=profileImage',
      'populate[1]=blog_posts',
      'populate[2]=blog_posts.featuredImage'
    ].join('&');

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/api/authors?filters[slug][$eq]=${validatedSlug}&${populateParams}`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!data?.data || data.data.length === 0) {
      debugLog('No author found for slug:', validatedSlug);
      return null;
    }

    const authorData = data.data[0].attributes ? { data: data.data[0] } : data.data[0];
    return mapAuthor(authorData) as Author;
  } catch (error) {
    console.error('Error fetching author:', error);
    return null;
  }
}

/**
 * Search V2 (relevance-based scoring + field scope filtering)
 * Calls the local Next.js route handler at GET /api/search.
 */
export async function searchV2(params: SearchParamsV2): Promise<SearchResultsV2> {
  const queryParams = new URLSearchParams({
    q: params.query,
    scope: params.scope || 'all',
    type: params.contentType || 'all',
    page: String(params.page || 1),
    pageSize: String(params.pageSize || 10)
  });

  if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.set('dateTo', params.dateTo);

  const response = await fetch(`/api/search?${queryParams.toString()}`);

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      // ignore
    }
    throw new Error(
      `Search failed (status ${response.status})${details ? `: ${JSON.stringify(details)}` : ''}`
    );
  }

  return response.json();
}

export async function getBlogPosts(page = 1, pageSize = 10): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    const debug = false;
    if (debug) debugLog('Fetching blog posts with params:', { page, pageSize });
    
    const data = await fetchWithBaseUrl<StrapiCollectionResponse<BlogPost>>(
      `/api/blog-posts?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*&sort=publishedAt:desc`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (debug) debugLog('Raw Strapi response:', {
      dataExists: !!data,
      hasData: !!data?.data,
      dataLength: data?.data?.length,
      meta: data?.meta,
      firstPost: data?.data?.[0],
    });

    const posts = data.data
      .map(post => {
        const mappedPost = mapBlogPost(post);
        if (debug) debugLog('Mapped post:', mappedPost);
        return mappedPost;
      })
      .filter((post): post is BlogPost => post !== null);

    const result = {
      posts,
      total: data.meta.pagination?.total || 0
    };
    
    if (debug) debugLog('Final posts result:', result);
    return result;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { posts: [], total: 0 };
  }
}

export async function getWhitepapers(page = 1, pageSize = 10): Promise<{ whitepapers: StrapiCollectionResponse<Whitepaper>; total: number }> {
  try {
    debugLog('Fetching whitepapers with params:', { page, pageSize });
    
    const data = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/api/whitepapers?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    debugLog('Raw Strapi whitepaper response:', {
      dataExists: !!data,
      hasData: !!data?.data,
      dataLength: data?.data?.length,
      meta: data?.meta
    });

    const whitepapers = {
      data: data.data.map(item => {
        const mappedWhitepaper = mapWhitepaper(item.attributes);
        return mappedWhitepaper ? { id: item.id, attributes: mappedWhitepaper } : null;
      }).filter((item): item is StrapiData<Whitepaper> => item !== null),
      meta: data.meta
    };

    return {
      whitepapers,
      total: data.meta.pagination?.total || 0
    };
  } catch (error) {
    console.error('Error fetching whitepapers:', error);
    return { whitepapers: { data: [], meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } } }, total: 0 };
  }
}

export async function getWhitepaperBySlug(slug: string): Promise<{ whitepaper: Whitepaper | null }> {
  try {
    const validatedSlug = validateSlug(slug);
    debugLog('Fetching whitepaper with slug:', validatedSlug);

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/api/whitepapers?filters[slug][$eq]=${encodeURIComponent(validatedSlug)}&populate=*`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!data?.data || data.data.length === 0) {
      debugLog('No whitepaper found for slug:', validatedSlug);
      return { whitepaper: null };
    }

    const firstItem = data.data[0];
    const rawWhitepaper = firstItem?.attributes || firstItem;
    const mappedWhitepaper = mapWhitepaper(rawWhitepaper);

    if (!mappedWhitepaper) {
      return { whitepaper: null };
    }

    return {
      whitepaper: {
        ...mappedWhitepaper,
        id: String(firstItem?.id || rawWhitepaper?.id || mappedWhitepaper.id),
        slug: mappedWhitepaper.slug || validatedSlug,
      }
    };
  } catch (error) {
    console.error('Error fetching whitepaper by slug:', error);
    return { whitepaper: null };
  }
}
