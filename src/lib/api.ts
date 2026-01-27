import {
  BlogPost,
  NewsArticle,
  Page,
  SearchParams,
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

// Always use the API URL for requests
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

// Ensure proper Bearer token format and handle missing token
const getAuthHeaders = () => {
  if (!API_TOKEN) {
    throw new APIError('API token is missing', 401);
  }
  return {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  };
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

    console.log('[API Response] Detailed Debug:', {
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
        createdAt: attr.createdAt || new Date().toISOString(),
        updatedAt: attr.updatedAt || new Date().toISOString(),
        publishedAt: attr.publishedAt,
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
        createdAt: authorData.createdAt || new Date().toISOString(),
        updatedAt: authorData.updatedAt || new Date().toISOString(),
        publishedAt: authorData.publishedAt,
      };
    }

    return undefined;
  };

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
      console.log('[mapRelatedPosts] No related posts found, data:', relatedData);
      return [];
    }

    console.log('[mapRelatedPosts] Processing', posts.length, 'related posts');

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
        createdAt: postData.createdAt || new Date().toISOString(),
        updatedAt: postData.updatedAt || new Date().toISOString(),
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

    // Dates
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
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
          createdAt: tag.createdAt || new Date().toISOString(),
          updatedAt: tag.updatedAt || new Date().toISOString(),
          publishedAt: tag.publishedAt,
        }))
      : [],
    categories: Array.isArray(data.categories)
      ? data.categories.map((cat: any) => ({
          id: String(cat.id || cat.documentId),
          name: cat.name || '',
          slug: cat.slug || '',
          description: cat.description || '',
          createdAt: cat.createdAt || new Date().toISOString(),
          updatedAt: cat.updatedAt || new Date().toISOString(),
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
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    publishedAt: data.publishedAt || new Date().toISOString()
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

function mapPage(data: any | null): Page | null {
  if (!data) {
    console.log('mapPage received null data');
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
    }) || [],
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

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<StrapiRawPage>>(
      `/api/pages?filters[slug][$eq]=${validatedSlug}&${indexedPopulate}`,
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
    const debug = false;

    if (debug) console.log('[getNewsArticles] Starting request:', {
      page,
      pageSize,
      timestamp: new Date().toISOString(),
      environment: {
        isServer: typeof window === 'undefined',
        nodeEnv: process.env.NODE_ENV
      }
    });

    const data = await fetchWithBaseUrl<StrapiCollectionResponse<any>>(
      `/api/news-articles?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*&sort=publishedAt:desc`,
      {
        next: { revalidate: 60 }
      }
    );

    // Validate API response structure
    if (debug) console.log('[getNewsArticles] Raw API response structure:', {
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
    if (debug) console.log('[getNewsArticles] Response meta:', {
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

        if (debug) console.log('[getNewsArticles] Processing article:', {
          id: articleId,
          hasAttributes: !!articleData.attributes,
          hasFeaturedImage: !!featuredImage,
          dataStructure: {
            directFields: Object.keys(articleData),
            nestedFields: article ? Object.keys(article) : null
          }
        });

        // Log the data structure for debugging
        if (debug) console.log('[getNewsArticles] Article data structure:', {
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
    if (debug) console.log('[getNewsArticles] Processing complete:', {
      totalReceived: data.data.length,
      successfullyProcessed: processedCount,
      errorCount,
      structureIssues,
      finalArticleCount: articles.length
    });

    // Log detailed article information
    if (debug) console.log('[getNewsArticles] Processed articles:', {
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
      `/api/news-articles?filters[slug][$eq]=${validatedSlug}&populate=*`,
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
      featuredImage: article.featuredImage?.data?.attributes
        ? {
            ...article.featuredImage.data.attributes,
            url: article.featuredImage.data.attributes.url.startsWith('http')
              ? article.featuredImage.data.attributes.url
              : `${getBaseUrl()}${article.featuredImage.data.attributes.url}`
          }
        : article.featuredImage // Handle direct image data
          ? {
              ...article.featuredImage,
              url: article.featuredImage.url.startsWith('http')
                ? article.featuredImage.url
                : `${getBaseUrl()}${article.featuredImage.url}`
            }
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
      `/api/news-articles?${filters.join('&')}&populate=*&pagination[limit]=3`,
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
      `/api/proxy/blog-posts?${filters.join('&')}&${sort}&pagination[page]=${params.page}&pagination[pageSize]=${params.pageSize}&populate=*`,
      { next: { revalidate: 60 } }
    );

    const newsData = await fetchWithBaseUrl<StrapiCollectionResponse<NewsArticle>>(
      `/api/news-articles?${filters.join('&')}&${sort}&pagination[page]=${params.page}&pagination[pageSize]=${params.pageSize}&populate=*`,
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
    if (debug) console.log('Fetching blog posts with params:', { page, pageSize });
    
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

    if (debug) console.log('Raw Strapi response:', {
      dataExists: !!data,
      hasData: !!data?.data,
      dataLength: data?.data?.length,
      meta: data?.meta,
      firstPost: data?.data?.[0],
    });

    const posts = data.data
      .map(post => {
        const mappedPost = mapBlogPost(post);
        if (debug) console.log('Mapped post:', mappedPost);
        return mappedPost;
      })
      .filter((post): post is BlogPost => post !== null);

    const result = {
      posts,
      total: data.meta.pagination?.total || 0
    };
    
    if (debug) console.log('Final posts result:', result);
    return result;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { posts: [], total: 0 };
  }
}

export async function getWhitepapers(page = 1, pageSize = 10): Promise<{ whitepapers: StrapiCollectionResponse<Whitepaper>; total: number }> {
  try {
    console.log('Fetching whitepapers with params:', { page, pageSize });
    
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
