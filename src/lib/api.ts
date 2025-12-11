import {
  BlogPost,
  NewsArticle,
  Page,
  SearchParams,
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
  StrapiRawPage,
  Category,
  Tag
} from './types';
import { extractFeatures } from './featureExtractor';
import { monitoredFetch } from './monitoredFetch';
import { validateSlug } from './utils/slugUtils';

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

// Always route content requests through the Next.js proxy so that
// authentication is handled server-side with STRAPI_TOKEN.
const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  
  console.log('[getBaseUrl] Environment Debug:', {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    isServer: typeof window === 'undefined',
    nodeEnv: process.env.NODE_ENV,
    baseUrl: '/api/proxy'
  });
  
  // Force all frontend calls through the proxy. The proxy will forward to
  // `${STRAPI_URL}/api/...` with the correct server-side token.
  return '/api/proxy';
};

const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
 
// Ensure proper Bearer token format and handle missing token.
// Return a HeadersInit-compatible object. We cast to HeadersInit to satisfy
// TypeScript when spreading into fetch headers.
const getAuthHeaders = (): HeadersInit => {
  if (!API_TOKEN) {
    console.warn('[getAuthHeaders] NEXT_PUBLIC_STRAPI_TOKEN is not set — proceeding without Authorization header');
    return { 'Content-Type': 'application/json' } as HeadersInit;
  }
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  } as HeadersInit;
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

    const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    
    console.log('[API Request] Detailed Debug:', {
      baseUrl,
      path,
      fullUrl: url,
      method: options.method || 'GET',
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    const response = await monitoredFetch(
      path,
      url,
      {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        }
      }
    );

    const data = await response.json();
    
    console.log('[API Response] Detailed Debug:', {
      url,
      status: response.status,
      data: JSON.stringify(data, null, 2)
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

function mapNewsArticle(data: any | null): NewsArticle | null {
  if (!data) {
    return null;
  }
  return {
    id: String(data.id),
    title: data.title || '',
    content: data.content || '',
    summary: data.summary || '',
    slug: data.slug || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    publishedAt: data.publishedAt,
    author: data.author || '',
    tags: data.tags?.map((tag: any) => ({
      id: String(tag.id),
      name: tag.name
    })) || [],
    categories: data.categories?.map((category: any) => ({
      id: String(category.id),
      name: category.name,
      slug: category.slug || '',
      description: category.description || '',
      createdAt: category.createdAt || new Date().toISOString(),
      updatedAt: category.updatedAt || new Date().toISOString()
    })) || [],
    featuredImage: data.featuredImage ? mapImage(data.featuredImage) : undefined,
    seoTitle: data.seoTitle || '',
    seoDescription: data.seoDescription || '',
    seoKeywords: data.seoKeywords || ''
  };
}

function mapBlogPost(data: any | null): BlogPost | null {
  if (!data) {
    console.log('Invalid blog post data:', data);
    return null;
  }

  // Zorg dat featuredImage altijd een vlakke structuur krijgt
  let rawImage = data.featuredImage;
  if (rawImage && rawImage.data && rawImage.data.attributes) {
    rawImage = { id: rawImage.data.id, ...rawImage.data.attributes };
  }

  return {
    id: String(data.id),
    title: data.title || 'Untitled',
    content: data.Content || data.content || '',
    summary: data.summary || '',
    slug: data.slug || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    publishedAt: data.publishedAt,
    seoTitle: data.seoTitle || data.title || 'Untitled',
    seoDescription: data.seoDescription || '',
    seoKeywords: data.seoKeywords || '',
    author: data.Author || '',
    tags: Array.isArray(data.tags) ? data.tags.map((tag: any) => ({
      id: String(tag.id),
      name: tag.name || ''
    })) : [],
    categories: Array.isArray(data.categories) ? data.categories.map((category: any) => ({
      id: String(category.id),
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      createdAt: category.createdAt || new Date().toISOString(),
      updatedAt: category.updatedAt || new Date().toISOString()
    })) : [],
    featuredImage: rawImage ? mapImage(rawImage) : undefined
  };
}

function mapWhitepaper(data: any | null): Whitepaper | null {
  if (!data) {
    console.log('mapWhitepaper received null data');
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
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    publishedAt: data.publishedAt
  };
}

/**
 * Cloudinary cloud name for this project
 */
const CLOUDINARY_CLOUD_NAME = 'dseckqnba';

/**
 * Constructs a Cloudinary URL from provider metadata
 * @param publicId The Cloudinary public_id
 * @param extension The file extension (e.g., '.jpg', '.png')
 * @returns Full Cloudinary URL
 */
function buildCloudinaryUrl(publicId: string, extension: string = ''): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}${extension}`;
}

/**
 * Maps raw Strapi image data to our Image type.
 * Handles Cloudinary images by constructing proper URLs from provider_metadata.
 *
 * When Strapi uses Cloudinary as the upload provider, it stores:
 * - url: Local path like "/uploads/image_abc123.jpg" (which doesn't work)
 * - provider: "cloudinary"
 * - provider_metadata: { public_id: "maasiso/image_abc123", ... }
 *
 * This function detects Cloudinary images and constructs the correct URL.
 */
function mapImage(data: any): Image | undefined {
  if (!data) {
    return undefined;
  }
  
  // Handle nested attributes structure (Strapi v4/v5)
  const attrs = data.attributes || data;
  const imageId = data.id || attrs.id;
  
  // Determine the correct URL for this image
  let imageUrl = attrs.url || '';
  
  // Check if this is a Cloudinary image with provider metadata
  if (attrs.provider === 'cloudinary' && attrs.provider_metadata?.public_id) {
    const publicId = attrs.provider_metadata.public_id;
    const extension = attrs.ext || '';
    imageUrl = buildCloudinaryUrl(publicId, extension);
    
    console.log('[mapImage] Constructed Cloudinary URL:', {
      originalUrl: attrs.url,
      publicId,
      extension,
      newUrl: imageUrl
    });
  }
  // Also check if URL is already a Cloudinary URL (no transformation needed)
  else if (imageUrl && (imageUrl.includes('res.cloudinary.com') || imageUrl.includes('cloudinary.com'))) {
    console.log('[mapImage] Image already has Cloudinary URL:', imageUrl);
  }
  // For non-Cloudinary images, keep the original URL (will be proxied)
  else {
    console.log('[mapImage] Non-Cloudinary image, keeping original URL:', imageUrl);
  }
  
  return {
    id: String(imageId),
    name: attrs.name || '',
    alternativeText: attrs.alternativeText || '',
    caption: attrs.caption || '',
    width: attrs.width || 0,
    height: attrs.height || 0,
    formats: attrs.formats || {},
    hash: attrs.hash || '',
    ext: attrs.ext || '',
    mime: attrs.mime || '',
    size: attrs.size || 0,
    url: imageUrl,
    previewUrl: attrs.previewUrl,
    provider: attrs.provider || '',
    provider_metadata: attrs.provider_metadata,
    createdAt: attrs.createdAt || new Date().toISOString(),
    updatedAt: attrs.updatedAt || new Date().toISOString(),
    publishedAt: attrs.publishedAt || new Date().toISOString()
  };
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
      console.log('[API Validation] Feature grid component found, considering valid for frontend fallback rendering');
      return true;
      
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

function mapPage(rawData: any | null): Page | null {
  if (!rawData) {
    console.log('mapPage received null data');
    return null;
  }

  // Normalize Strapi data/attributes nesting so we always work with a flat object
  let data: any = rawData;

  try {
    // Unwrap any number of nested `attributes` layers (e.g. StrapiData<T>, StrapiRawPage, etc.)
    while (data && typeof data === 'object' && 'attributes' in data && (data as any).attributes) {
      const current = data as any;
      const attrs = current.attributes;
      data = {
        id: current.id ?? attrs.id,
        ...attrs
      };
    }
  } catch (e) {
    console.warn('[mapPage] Failed to normalize Strapi page data structure:', e);
  }

  if (!data) {
    console.log('mapPage received empty data after normalization');
    return null;
  }

  console.log('Page data structure:', {
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

  const layout = Array.isArray(data.layout) ? data.layout : [];

  if (layout.length > 0) {
    let validationIssues = false;
    layout.forEach((component: RawStrapiComponent, index: number) => {
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
    title: data.title || data.Title || '',
    slug: data.slug || '',
    seoMetadata,
    layout: layout.map((component: RawStrapiComponent) => {
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
            backgroundImage: component.backgroundImage ? mapImage(component.backgroundImage) : undefined,
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
            images: component.images?.map((img: any) => mapImage(img)).filter(Boolean) || [],
            layout: component.layout || 'grid'
          };
        case 'page-blocks.feature-grid':
          console.log('Feature grid component found:', {
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
        default:
          return baseComponent;
      }
    }),
    publishedAt: data.publishedAt,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

export async function getPage(slug: string): Promise<Page | null> {
  try {
    // Validate and sanitize the slug
    const validatedSlug = validateSlug(slug);
    console.log(`[getPage] Starting getPage for slug: ${validatedSlug} at ${new Date().toISOString()}`);

    // Use indexed populate parameters to avoid deep nesting issues
    const indexedPopulate = [
      'populate[0]=layout',
      'populate[1]=layout.features',
      'populate[2]=layout.features.icon',
      'populate[3]=layout.backgroundImage',
      'populate[4]=layout.ctaButton'
    ].join('&');

    // Strapi v5 REST endpoints are all prefixed with /api, so make sure we
    // call /api/pages here instead of the bare /pages collection path.
    const data = await fetchWithBaseUrl<StrapiCollectionResponse<StrapiRawPage>>(
      `/pages?filters[slug][$eq]=${validatedSlug}&${indexedPopulate}`,
      { next: { revalidate: 60 } }
    );

    return data.data && data.data.length > 0 ? mapPage(data.data[0]) : null;
  } catch (error) {
    console.error('[getPage] Error:', error);
    return null;
  }
}

export async function getNewsArticles(page = 1, pageSize = 10): Promise<{ articles: NewsArticle[]; total: number }> {
  try {
    console.log('[getNewsArticles] Starting request:', {
      page,
      pageSize,
      timestamp: new Date().toISOString(),
      environment: {
        isServer: typeof window === 'undefined',
        nodeEnv: process.env.NODE_ENV
      }
    });

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/news-articles?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*&sort=publishedAt:desc`,
      {
        next: { revalidate: 60 }
      }
    );

    // Validate API response structure
    console.log('[getNewsArticles] Raw API response structure:', {
      hasData: !!data,
      dataType: typeof data,
      hasDataArray: !!data?.data,
      isDataArray: Array.isArray(data?.data),
      dataLength: data?.data?.length,
      hasMeta: !!data?.meta,
      metaStructure: data?.meta ? Object.keys(data.meta) : null
    });

    if (!data?.data || !Array.isArray(data.data)) {
      console.error('[getNewsArticles] Invalid response structure:', {
        responseType: typeof data,
        hasData: !!data,
        dataType: data ? typeof data.data : 'undefined',
        isArray: Array.isArray(data?.data)
      });
      throw new APIError('Invalid API response structure', 500);
    }

    const total = data.meta?.pagination?.total || 0;
    console.log('[getNewsArticles] Response meta:', {
      total,
      page: data.meta?.pagination?.page,
      pageSize: data.meta?.pagination?.pageSize
    });

    type PublishedStatus = 'valid' | 'invalid' | 'not set';
    
    interface ValidationIssue {
      id: string;
      issues: {
        hasTitle: boolean;
        hasContent: boolean;
        hasSlug: boolean;
        hasValidDates: {
          created: boolean;
          updated: boolean;
          published: PublishedStatus;
        };
      };
    }

    // Track article processing
    let processedCount = 0;
    let errorCount = 0;
    let structureIssues: ValidationIssue[] = [];

    const articles = data.data
      .map(articleData => {
      try {
        // Handle both direct and nested data structures
        const article = articleData.attributes || articleData;
        const articleId = articleData.id;

        // Extract featured image from nested structure
        const rawFeaturedImage = article.featuredImage?.data?.attributes || article.featuredImage;
        const featuredImage = rawFeaturedImage ? mapImage(rawFeaturedImage) : undefined;

        console.log('[getNewsArticles] Processing article:', {
          id: articleId,
          hasAttributes: !!articleData.attributes,
          hasFeaturedImage: !!featuredImage,
          dataStructure: {
            directFields: Object.keys(articleData),
            nestedFields: article ? Object.keys(article) : null
          }
        });

        // Log the data structure for debugging
        console.log('[getNewsArticles] Article data structure:', {
          hasAttributes: !!articleData.attributes,
          isDirect: !articleData.attributes,
          availableFields: Object.keys(article)
        });

        // Validate required fields
        const validation: ValidationIssue['issues'] = {
          hasTitle: !!article.title,
          hasContent: !!article.content,
          hasSlug: !!article.slug,
          hasValidDates: {
            created: !!article.createdAt && !isNaN(new Date(article.createdAt).getTime()),
            updated: !!article.updatedAt && !isNaN(new Date(article.updatedAt).getTime()),
            published: article.publishedAt
              ? !isNaN(new Date(article.publishedAt).getTime())
                ? 'valid'
                : 'invalid'
              : 'not set'
          }
        };

        if (!validation.hasTitle) {
          console.warn('[getNewsArticles] Article validation failed:', {
            id: String(articleId),
            validation,
            availableFields: Object.keys(article)
          });
          structureIssues.push({
            id: String(articleId),
            issues: validation
          });
          return null;
        }

        processedCount++;

        // Create a properly typed NewsArticle object
        const newsArticle: NewsArticle = {
          id: String(articleId),
          title: article.title,
          content: article.content || '',
          slug: article.slug || '',
          createdAt: article.createdAt || new Date().toISOString(),
          updatedAt: article.updatedAt || new Date().toISOString(),
          // Optional fields
          summary: article.summary || undefined,
          publishedAt: article.publishedAt || undefined,
          author: article.author || undefined,
          tags: Array.isArray(article.tags?.data)
            ? article.tags.data.map((tag: any) => ({
                id: String(tag.id),
                name: tag.attributes?.name || tag.name || 'Untitled Tag'
              }))
            : Array.isArray(article.tags)
              ? article.tags.map((tag: any) => ({
                  id: String(tag.id),
                  name: tag.name || 'Untitled Tag'
                }))
              : [],
          categories: Array.isArray(article.categories?.data)
            ? article.categories.data.map((category: any) => ({
                id: String(category.id),
                name: category.attributes?.name || category.name || 'Untitled Category',
                slug: category.attributes?.slug || category.slug || '',
                description: category.attributes?.description || category.description || '',
                createdAt: category.attributes?.createdAt || category.createdAt || new Date().toISOString(),
                updatedAt: category.attributes?.updatedAt || category.updatedAt || new Date().toISOString()
              }))
            : Array.isArray(article.categories)
              ? article.categories.map((category: any) => ({
                  id: String(category.id),
                  name: category.name || 'Untitled Category',
                  slug: category.slug || '',
                  description: category.description || '',
                  createdAt: category.createdAt || new Date().toISOString(),
                  updatedAt: category.updatedAt || new Date().toISOString()
                }))
              : [],
          featuredImage: article.featuredImage?.data?.attributes
            ? mapImage(article.featuredImage.data.attributes)
            : article.featuredImage
              ? mapImage(article.featuredImage)
              : undefined,
          seoTitle: article.seoTitle || undefined,
          seoDescription: article.seoDescription || undefined,
          seoKeywords: article.seoKeywords || undefined
        };
        return newsArticle;
      } catch (error) {
        errorCount++;
        console.error('[getNewsArticles] Error mapping article:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : 'No stack trace',
          articleData: {
            id: articleData.id,
            type: typeof articleData,
            keys: Object.keys(articleData)
          }
        });
        return null;
      }
    }).filter((article): article is NewsArticle => {
      const isValid = !!article;
      if (!isValid) {
        console.log('[getNewsArticles] Filtered out invalid article');
      }
      return isValid;
    });

    // Log final processing statistics
    console.log('[getNewsArticles] Processing complete:', {
      totalReceived: data.data.length,
      successfullyProcessed: processedCount,
      errorCount,
      structureIssues,
      finalArticleCount: articles.length
    });

    // Log detailed article information
    console.log('[getNewsArticles] Processed articles:', {
      totalArticles: articles.length,
      firstArticle: articles[0] ? {
        id: articles[0].id,
        title: articles[0].title,
        hasContent: !!articles[0].content
      } : null
    });

    return {
      articles: articles.filter(Boolean), // Remove any null values
      total: data.meta?.pagination?.total || articles.length
    };
  } catch (error) {
    console.error('[getNewsArticles] Error fetching news articles:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return { articles: [], total: 0 };
  }
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    // Validate and sanitize the slug
    const validatedSlug = validateSlug(slug);

    console.log(`[getNewsArticleBySlug] Fetching article with slug: ${validatedSlug}`);

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/news-articles?filters[slug][$eq]=${validatedSlug}&populate=*`,
      { next: { revalidate: 60 } }
    );

    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.error('[getNewsArticleBySlug] Invalid response structure:', data);
      throw new Error('Invalid API response structure');
    }

    if (!Array.isArray(data.data) || data.data.length === 0) {
      console.log('[getNewsArticleBySlug] No article found for slug:', validatedSlug);
      return null;
    }

    const articleData = data.data[0];
    
    // Handle both direct and nested data structures
    const article = articleData.attributes || articleData;
    const articleId = articleData.id;

    // Log the data structure for debugging
    console.log('[getNewsArticleBySlug] Article data structure:', {
      hasAttributes: !!articleData.attributes,
      isDirect: !articleData.attributes,
      availableFields: Object.keys(article)
    });

    // Validate required fields
    if (!article.title || !article.content) {
      console.error('[getNewsArticleBySlug] Missing required fields:', {
        hasTitle: !!article.title,
        hasContent: !!article.content
      });
      throw new Error('Missing required article fields');
    }

    // Map the article with detailed validation
    const mappedArticle = {
      id: String(articleId),
      title: article.title,
      content: article.content,
      summary: article.summary || '',
      slug: article.slug || validatedSlug,
      createdAt: article.createdAt || new Date().toISOString(),
      updatedAt: article.updatedAt || new Date().toISOString(),
      publishedAt: article.publishedAt || article.createdAt || new Date().toISOString(),
      author: article.author || '',
      tags: Array.isArray(article.tags?.data)
        ? article.tags.data.map((tag: any) => ({
            id: String(tag.id),
            name: tag.attributes?.name || 'Untitled Tag'
          }))
        : [],
      categories: Array.isArray(article.categories?.data)
        ? article.categories.data.map((category: any) => ({
            id: String(category.id),
            name: category.attributes?.name || 'Untitled Category',
            slug: category.attributes?.slug || '',
            description: category.attributes?.description || '',
            createdAt: category.attributes?.createdAt || new Date().toISOString(),
            updatedAt: category.attributes?.updatedAt || new Date().toISOString()
          }))
        : [],
      // Use mapImage to properly handle Cloudinary URLs from provider_metadata
      featuredImage: article.featuredImage?.data?.attributes
        ? mapImage({ id: article.featuredImage.data.id, ...article.featuredImage.data.attributes })
        : article.featuredImage
          ? mapImage(article.featuredImage)
          : undefined,
      seoTitle: article.seoTitle || article.title,
      seoDescription: article.seoDescription || article.summary || '',
      seoKeywords: article.seoKeywords || ''
    };

    console.log('[getNewsArticleBySlug] Successfully mapped article:', {
      id: mappedArticle.id,
      title: mappedArticle.title,
      hasContent: !!mappedArticle.content,
      hasFeaturedImage: !!mappedArticle.featuredImage
    });

    return mappedArticle;
  } catch (error) {
    console.error('[getNewsArticleBySlug] Detailed error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error; // Let the error boundary handle it
  }
}

export async function getRelatedNewsArticles(currentSlug: string): Promise<NewsArticle[]> {
  try {
    const filters = [];
    // Validate and sanitize the slug
    const validatedSlug = validateSlug(currentSlug);

    filters.push(`filters[slug][$ne]=${currentSlug}`);

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/news-articles?${filters.join('&')}&populate=*&pagination[limit]=3`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    return data.data.map(articleData => {
      // Handle both direct and nested data structures
      const article = articleData.attributes || articleData;
      const articleId = articleData.id;

      console.log('[getRelatedNewsArticles] Article data structure:', {
        hasAttributes: !!articleData.attributes,
        isDirect: !articleData.attributes,
        availableFields: Object.keys(article)
      });

      return {
        id: String(articleId),
        title: article.title || '',
        content: article.content || '',
        summary: article.summary || '',
        slug: article.slug || '',
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: article.updatedAt || new Date().toISOString(),
        publishedAt: article.publishedAt,
        author: article.author || '',
        tags: Array.isArray(article.tags?.data)
          ? article.tags.data.map((tag: any) => ({
              id: String(tag.id),
              name: tag.attributes?.name || tag.name || ''
            }))
          : Array.isArray(article.tags)
            ? article.tags.map((tag: any) => ({
                id: String(tag.id),
                name: tag.name || ''
              }))
            : [],
        categories: Array.isArray(article.categories?.data)
          ? article.categories.data.map((category: any) => ({
              id: String(category.id),
              name: category.attributes?.name || category.name || '',
              slug: category.attributes?.slug || category.slug || '',
              description: category.attributes?.description || category.description || '',
              createdAt: category.attributes?.createdAt || category.createdAt || new Date().toISOString(),
              updatedAt: category.attributes?.updatedAt || category.updatedAt || new Date().toISOString()
            }))
          : Array.isArray(article.categories)
            ? article.categories.map((category: any) => ({
                id: String(category.id),
                name: category.name || '',
                slug: category.slug || '',
                description: category.description || '',
                createdAt: category.createdAt || new Date().toISOString(),
                updatedAt: category.updatedAt || new Date().toISOString()
              }))
            : [],
        featuredImage: article.featuredImage?.data?.attributes || article.featuredImage,
        seoTitle: article.seoTitle || '',
        seoDescription: article.seoDescription || '',
        seoKeywords: article.seoKeywords || ''
      };
    });
  } catch (error) {
    console.error('Error fetching related news articles:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<{ blogPost: BlogPost | null }> {
  try {
    // Validate and sanitize the slug
    const validatedSlug = validateSlug(slug);
    console.log('Fetching blog post with slug:', validatedSlug);

    // Strapi v5 REST collection is exposed at /api/blog-posts
    const data = await fetchWithBaseUrl<StrapiCollectionResponse<BlogPost>>(
      `/blog-posts?filters[slug][$eq]=${validatedSlug}&populate=*`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Blog by slug response:', {
      hasData: !!data?.data,
      dataLength: data?.data?.length,
      firstPost: data?.data?.[0],
      meta: data?.meta
    });
    
    if (!data.data || data.data.length === 0) {
      console.log('No blog post found for slug:', validatedSlug);
      return { blogPost: null };
    }

    const mappedPost = mapBlogPost(data.data[0]);
    console.log('Mapped blog post:', mappedPost);
    return { blogPost: mappedPost };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return { blogPost: null };
  }
}

export async function search(params: SearchParams): Promise<{
  blogPosts: { data: BlogPost[]; meta: { pagination: { total: number } } };
  newsArticles: { data: NewsArticle[]; meta: { pagination: { total: number } } };
}> {
  try {
    const filters = [];
    if (params.filters?.contentType?.length) {
      filters.push(`filters[type][$in]=${params.filters.contentType.join(',')}`);
    }
    if (params.filters?.dateFrom) {
      filters.push(`filters[publishedAt][$gte]=${params.filters.dateFrom}`);
    }
    if (params.filters?.dateTo) {
      filters.push(`filters[publishedAt][$lte]=${params.filters.dateTo}`);
    }
    
    filters.push(`filters[$or][0][title][$containsi]=${params.query}`);
    filters.push(`filters[$or][1][content][$containsi]=${params.query}`);

    const sort = params.sort ? `sort=${params.sort.field}:${params.sort.direction}` : 'sort=publishedAt:desc';

    const blogData = await fetchWithBaseUrl<StrapiCollectionResponse<BlogPost>>(
      `/blog-posts?${filters.join('&')}&${sort}&pagination[page]=${params.page}&pagination[pageSize]=${params.pageSize}&populate=*`,
      { next: { revalidate: 60 } }
    );

    const newsData = await fetchWithBaseUrl<StrapiCollectionResponse<NewsArticle>>(
      `/news-articles?${filters.join('&')}&${sort}&pagination[page]=${params.page}&pagination[pageSize]=${params.pageSize}&populate=*`,
      { next: { revalidate: 60 } }
    );

    return {
      blogPosts: {
        data: blogData.data.map(post => mapBlogPost(post)).filter((post): post is BlogPost => post !== null),
        meta: {
          pagination: {
            total: blogData.meta.pagination?.total || 0
          }
        }
      },
      newsArticles: {
        data: newsData.data.map(article => mapNewsArticle(article)).filter((article): article is NewsArticle => article !== null),
        meta: {
          pagination: {
            total: newsData.meta.pagination?.total || 0
          }
        }
      }
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      blogPosts: { data: [], meta: { pagination: { total: 0 } } },
      newsArticles: { data: [], meta: { pagination: { total: 0 } } }
    };
  }
}

export async function getBlogPosts(
  page = 1,
  pageSize = 10,
  searchQuery?: string,
  categoryId?: string,
  tagIds?: string[]
): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    console.log('Fetching blog posts with params:', { page, pageSize, searchQuery, categoryId, tagIds });
    
    // Build filters
    const filterParts: string[] = [];
    
    // Search filter
    if (searchQuery) {
      filterParts.push(`filters[title][$containsi]=${encodeURIComponent(searchQuery)}`);
    }
    
    // Category filter - now using ID instead of slug
    if (categoryId) {
      filterParts.push(`filters[categories][id][$eq]=${encodeURIComponent(categoryId)}`);
    }
    
    // Tags filter (multiple tags with OR logic) - now using IDs instead of names
    if (tagIds && tagIds.length > 0) {
      // Use $or filter for tags to match any of the selected tags
      tagIds.forEach((tagId, index) => {
        filterParts.push(`filters[$or][${index}][tags][id][$eq]=${encodeURIComponent(tagId)}`);
      });
    }
    
    const filters = filterParts.length > 0 ? `&${filterParts.join('&')}` : '';
    
    // Strapi v5 REST collection - use explicit populate for featuredImage
    // Using indexed populate to ensure images are properly populated
    // IMPORTANT: provider and provider_metadata are required for Cloudinary URL detection
    const populateParams = [
      'populate[featuredImage][fields][0]=url',
      'populate[featuredImage][fields][1]=alternativeText',
      'populate[featuredImage][fields][2]=width',
      'populate[featuredImage][fields][3]=height',
      'populate[featuredImage][fields][4]=formats',
      'populate[featuredImage][fields][5]=name',
      'populate[featuredImage][fields][6]=hash',
      'populate[featuredImage][fields][7]=ext',
      'populate[featuredImage][fields][8]=mime',
      'populate[featuredImage][fields][9]=size',
      'populate[featuredImage][fields][10]=provider',
      'populate[featuredImage][fields][11]=provider_metadata',
      'populate[tags][fields][0]=id',
      'populate[tags][fields][1]=name',
      'populate[categories][fields][0]=id',
      'populate[categories][fields][1]=name',
      'populate[categories][fields][2]=slug'
    ].join('&');
    
    const data = await fetchWithBaseUrl<StrapiCollectionResponse<BlogPost>>(
      `/blog-posts?pagination[page]=${page}&pagination[pageSize]=${pageSize}&${populateParams}&sort=publishedAt:desc${filters}`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Raw Strapi response:', {
      dataExists: !!data,
      hasData: !!data?.data,
      dataLength: data?.data?.length,
      meta: data?.meta,
      firstPost: data?.data?.[0],
      firstPostImage: (data?.data?.[0] as any)?.featuredImage,
      firstPostImageKeys: (data?.data?.[0] as any)?.featuredImage ? Object.keys((data.data[0] as any).featuredImage) : 'no image'
    });

    const posts = data.data
      .map(post => {
        const mappedPost = mapBlogPost(post);
        console.log('Mapped post:', {
          id: mappedPost?.id,
          title: mappedPost?.title,
          hasFeaturedImage: !!mappedPost?.featuredImage,
          featuredImageUrl: mappedPost?.featuredImage?.url
        });
        return mappedPost;
      })
      .filter((post): post is BlogPost => post !== null);

    const result = {
      posts,
      total: data.meta.pagination?.total || 0
    };
    
    console.log('Final posts result:', { postsCount: result.posts.length, total: result.total });
    return result;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { posts: [], total: 0 };
  }
}

export async function getWhitepapers(page = 1, pageSize = 10): Promise<{ whitepapers: StrapiCollectionResponse<Whitepaper>; total: number }> {
  try {
    console.log('Fetching whitepapers with params:', { page, pageSize });
    
    // Whitepaper collection is exposed as /api/whitepapers in Strapi v5
    const data = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/whitepapers?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`,
      {
        next: { revalidate: 60 },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Raw Strapi whitepaper response:', {
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

export async function getCategories(): Promise<Category[]> {
  try {
    console.log('Fetching categories from Strapi');
    
    // Fetch all categories with blog posts populated to get counts
    const categoriesData = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/categories?populate[blog_posts][fields][0]=id&sort=name:asc&pagination[limit]=100`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!categoriesData.data || categoriesData.data.length === 0) {
      console.log('No categories found');
      return [];
    }

    console.log(`Found ${categoriesData.data.length} categories`);

    // Map categories with post counts
    return categoriesData.data.map(item => {
      const categoryData = item.attributes || item;
      
      // Count blog posts - handle different possible structures
      let postCount = 0;
      if (categoryData.blog_posts?.data) {
        postCount = Array.isArray(categoryData.blog_posts.data) 
          ? categoryData.blog_posts.data.length 
          : 0;
      } else if (Array.isArray(categoryData.blog_posts)) {
        postCount = categoryData.blog_posts.length;
      }
      
      return {
        id: String(item.id || categoryData.id),
        name: categoryData.name || 'Unnamed Category',
        slug: categoryData.slug || '',
        description: categoryData.description || '',
        createdAt: categoryData.createdAt || new Date().toISOString(),
        updatedAt: categoryData.updatedAt || new Date().toISOString(),
        postCount: postCount
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    console.log('Fetching tags from Strapi');
    
    // Fetch all tags with blog posts populated to get counts
    const tagsData = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/tags?populate[blog_posts][fields][0]=id&sort=name:asc&pagination[limit]=200`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!tagsData.data || tagsData.data.length === 0) {
      console.log('No tags found');
      return [];
    }

    console.log(`Found ${tagsData.data.length} tags`);

    // Map tags with post counts
    return tagsData.data.map(item => {
      const tagData = item.attributes || item;
      
      // Count blog posts - handle different possible structures
      let postCount = 0;
      if (tagData.blog_posts?.data) {
        postCount = Array.isArray(tagData.blog_posts.data) 
          ? tagData.blog_posts.data.length 
          : 0;
      } else if (Array.isArray(tagData.blog_posts)) {
        postCount = tagData.blog_posts.length;
      }
      
      return {
        id: String(item.id || tagData.id),
        name: tagData.name || 'Unnamed Tag',
        postCount: postCount
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
