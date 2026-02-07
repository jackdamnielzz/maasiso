/**
 * Normalization functions to convert Strapi raw responses to normalized types
 */
import { ButtonComponent, StrapiRawButtonComponent } from './types/components';
import { clientEnv } from './config/client-env';
import { normalizePageSchemaType } from './utils/pageSchema';
import {
  Category,
  Tag,
  Image,
  ImageFormat,
  BlogPost,
  NewsArticle,
  StrapiRawBlogPost,
  StrapiRawNewsArticle,
  CTAButton,
  HeroComponent,
  TextBlockComponent,
  ImageGalleryComponent,
  Feature,
  FeatureGridComponent,
  FaqSectionComponent,
  KeyTakeawaysComponent,
  FactBlockComponent,
  StrapiRawCTAButton,
  StrapiRawHeroComponent,
  StrapiRawTextBlockComponent,
  StrapiRawImageGalleryComponent,
  StrapiRawFeature,
  StrapiRawFeatureGridComponent,
  StrapiRawFaqSectionComponent,
  StrapiRawKeyTakeawaysComponent,
  StrapiRawFactBlockComponent,
  StrapiRawFaqItem,
  StrapiRawKeyTakeawayItem,
  Page,
  StrapiRawPage,
  StrapiRawPageAttributes,
  SEOMetadata,
  PageComponentType,
  // Navigation Types
  Menu,
  MenuItem,
  MenuSection,
  SocialLink,
  MenuPosition,
  MenuItemSettings,
  // Navigation Raw Types
  StrapiRawMenu,
  StrapiRawMenuItem,
  StrapiRawMenuSection,
  StrapiRawSocialLink
} from './types';

interface StrapiPaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
}

/**
 * Normalize a category from Strapi response
 */
export function normalizeCategory(data: {
  id: string | number;
  attributes?: {
    name?: string;
    description?: string;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
    data?: {
      id?: string | number;
      attributes?: {
        name?: string;
        description?: string;
        slug?: string;
        createdAt?: string;
        updatedAt?: string;
      };
    };
  };
  name?: string;
  description?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}): Category {
  const attrs = isObject(data.attributes) ? data.attributes : data;
  const nestedAttributes = isObject((attrs as any).data)
    ? (attrs as any).data?.attributes
    : undefined;
  const source = isObject(nestedAttributes) ? nestedAttributes : attrs;

  return {
    id: String(data.id),
    name: typeof source.name === 'string' ? source.name : '',
    description: typeof source.description === 'string' ? source.description : undefined,
    slug: typeof source.slug === 'string' ? source.slug : '',
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : '',
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : ''
  };
}

/**
 * Normalize a tag from Strapi response
 */
export function normalizeTag(data: {
  id: string | number;
  attributes?: {
    name?: string;
    data?: {
      id?: string | number;
      attributes?: {
        name?: string;
      };
    };
  };
  name?: string;
}): Tag {
  const attrs = isObject(data.attributes) ? data.attributes : data;
  const nestedAttributes = isObject((attrs as any).data)
    ? (attrs as any).data?.attributes
    : undefined;
  const source = isObject(nestedAttributes) ? nestedAttributes : attrs;

  return {
    id: String(data.id),
    name: typeof source.name === 'string' ? source.name : ''
  };
}

import { normalizeImage } from './types/image';

/**
 * Type guard for Strapi pagination structure
 */
export function isStrapiPaginatedResponse<T>(data: unknown): data is StrapiPaginatedResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as any).data) &&
    'meta' in data &&
    typeof (data as any).meta === 'object' &&
    (data as any).meta !== null &&
    'pagination' in (data as any).meta &&
    typeof (data as any).meta.pagination === 'object' &&
    'total' in (data as any).meta.pagination &&
    'page' in (data as any).meta.pagination &&
    'pageSize' in (data as any).meta.pagination &&
    'pageCount' in (data as any).meta.pagination
  );
}

/**
 * Transform Strapi paginated response to match interface
 */
export function transformStrapiPaginatedResponse<T>(response: unknown): StrapiPaginatedResponse<T> {
  if (!isStrapiPaginatedResponse<T>(response)) {
    throw new Error('Invalid Strapi pagination structure in response');
  }
  
  return {
    data: response.data as T[],
    meta: response.meta
  };
}

/**
 * Normalize a blog post from Strapi response
 */
export function normalizeBlogPost(raw: StrapiRawBlogPost): BlogPost {
  const mapCategory = (cat: any) => {
    const source = isObject(cat?.attributes) ? { id: cat.id, ...cat.attributes } : cat;
    return {
      id: String(source?.id ?? ''),
      name: source?.name || '',
      description: source?.description || '',
      slug: source?.slug || '',
      createdAt: source?.createdAt || '',
      updatedAt: source?.updatedAt || ''
    };
  };

  const mapTag = (tag: any) => {
    const source = isObject(tag?.attributes) ? { id: tag.id, ...tag.attributes } : tag;
    return {
      id: String(source?.id ?? ''),
      name: source?.name || ''
    };
  };

  return {
    id: String(raw.id),
    title: raw.title || '',
    content: raw.Content || raw.content || '',
    slug: raw.slug || '',
    author: raw.Author || raw.author || undefined,
    categories: Array.isArray(raw.categories) 
      ? raw.categories.map(mapCategory)
      : [],
    tags: Array.isArray(raw.tags)
      ? raw.tags.map(mapTag)
      : [],
    featuredImage: raw.featuredImage ? normalizeImage({
      id: raw.featuredImage.id,
      url: raw.featuredImage.url,
      name: raw.featuredImage.name,
      alternativeText: raw.featuredImage.alternativeText || undefined,
      caption: raw.featuredImage.caption || undefined,
      width: raw.featuredImage.width,
      height: raw.featuredImage.height,
      formats: raw.featuredImage.formats,
      hash: raw.featuredImage.hash,
      ext: raw.featuredImage.ext,
      mime: raw.featuredImage.mime,
      size: raw.featuredImage.size,
      previewUrl: raw.featuredImage.previewUrl || undefined,
      provider: raw.featuredImage.provider,
      provider_metadata: raw.featuredImage.provider_metadata || undefined,
      createdAt: raw.featuredImage.createdAt,
      updatedAt: raw.featuredImage.updatedAt,
      publishedAt: raw.featuredImage.publishedAt
    }) : undefined,
    seoTitle: raw.seoTitle || '',
    seoDescription: raw.seoDescription || '',
    seoKeywords: raw.seoKeywords || '',
    publishedAt: raw.publishedAt || raw.publicationDate || '',
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || ''
  };
}

/**
 * Normalize a news article from Strapi response
 */
export function normalizeNewsArticle(raw: StrapiRawNewsArticle): NewsArticle {
  if (!isObject(raw)) {
    throw new Error('Invalid news article: raw data is not an object');
  }

  // Handle both flat and nested structures
  const data = 'attributes' in raw && isObject(raw.attributes) ? raw.attributes : raw;
  const id = String(raw.id);

  // Type guard for the data object
  if (!isObject(data)) {
    throw new Error('Invalid news article: data is not an object');
  }

  // Extract content from the correct location in the response with type checking
  const content = (
    typeof data.Content === 'string' ? data.Content :
    typeof data.content === 'string' ? data.content :
    ''
  );

  // Ensure categories and tags are arrays with type checking
  const categories = (
    Array.isArray(data.categories) ? data.categories :
    isObject(data.categories) && Array.isArray(data.categories?.data) ? data.categories.data :
    []
  );
  
  const tags = (
    Array.isArray(data.tags) ? data.tags :
    isObject(data.tags) && Array.isArray(data.tags?.data) ? data.tags.data :
    []
  );

  // Helper function to safely access nested properties
  const safeString = (value: unknown): string => typeof value === 'string' ? value : '';
  const safeObject = (value: unknown): Record<string, unknown> => isObject(value) ? value : {};

  // Process featured image if it exists
  const featuredImage = data.featuredImage ? safeObject(data.featuredImage) : null;
  const featuredImageData = featuredImage && 'data' in featuredImage ? safeObject(featuredImage.data) : featuredImage;

  return {
    id,
    title: safeString(data.title),
    content,
    slug: safeString(data.slug),
    summary: typeof data.summary === 'string' ? data.summary : undefined,
    articledescription: typeof data.articledescription === 'string' ? data.articledescription : undefined,
    author: typeof data.Author === 'string' ? data.Author : typeof data.author === 'string' ? data.author : undefined,
    categories: categories.map(cat => {
      const catData = 'attributes' in cat ? { id: cat.id, ...safeObject(cat.attributes) } : cat;
      return {
        id: String(catData.id),
        name: safeString(catData.name),
        description: safeString(catData.description),
        slug: safeString(catData.slug),
        createdAt: safeString(catData.createdAt),
        updatedAt: safeString(catData.updatedAt)
      };
    }),
    tags: tags.map(tag => {
      const tagData = 'attributes' in tag ? { id: tag.id, ...safeObject(tag.attributes) } : tag;
      return {
        id: String(tagData.id),
        name: safeString(tagData.name)
      };
    }),
    featuredImage: featuredImageData ? {
      id: String(featuredImageData.id),
      name: safeString(featuredImageData.name),
      alternativeText: safeString(featuredImageData.alternativeText),
      caption: safeString(featuredImageData.caption),
      width: typeof featuredImageData.width === 'number' ? featuredImageData.width : 0,
      height: typeof featuredImageData.height === 'number' ? featuredImageData.height : 0,
      formats: isObject(featuredImageData.formats)
        ? Object.entries(featuredImageData.formats).reduce((acc, [key, format]) => ({
            ...acc,
            [key]: {
              ...(isObject(format) ? format : {}),
              url: `${clientEnv.apiUrl}${safeString((format as any)?.url)}`
            }
          }), {})
        : {},
      hash: safeString(featuredImageData.hash),
      ext: safeString(featuredImageData.ext),
      mime: safeString(featuredImageData.mime),
      size: typeof featuredImageData.size === 'number' ? featuredImageData.size : 0,
      url: `${clientEnv.apiUrl}${safeString(featuredImageData.url)}`,
      previewUrl: safeString(featuredImageData.previewUrl),
      provider: safeString(featuredImageData.provider),
      provider_metadata: isObject(featuredImageData.provider_metadata) ? featuredImageData.provider_metadata : undefined,
      createdAt: safeString(featuredImageData.createdAt),
      updatedAt: safeString(featuredImageData.updatedAt),
      publishedAt: safeString(featuredImageData.publishedAt)
    } : undefined,
    seoTitle: safeString(data.seoTitle),
    seoDescription: safeString(data.seoDescription),
    seoKeywords: safeString(data.seoKeywords),
    publishedAt: safeString(data.publishedAt),
    createdAt: safeString(data.createdAt),
    updatedAt: safeString(data.updatedAt)
  };
}

/**
 * Type guard functions
 */
interface StrapiRawData {
  id: string;
  attributes: Record<string, unknown>;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isPromise(value: unknown): value is Promise<unknown> {
  return value instanceof Promise;
}

interface StrapiAttributes {
  [key: string]: unknown;
  Content?: string;
  content?: string;
}

interface StrapiDataWithAttributes {
  id: string;
  attributes: StrapiAttributes;
}

function hasRequiredAttributes(data: unknown, attributes: string[]): data is StrapiDataWithAttributes {
  if (!isObject(data)) return false;
  if (!('id' in data) || typeof data.id !== 'string') return false;
  if (!('attributes' in data)) return false;
  
  const attrs = data.attributes;
  if (!isObject(attrs)) return false;
  
  // Type guard to ensure attrs is StrapiAttributes
  const hasAllAttributes = attributes.every(attr => attr in attrs);
  if (!hasAllAttributes) return false;
  
  return true;
}

type StrapiComponent =
  | StrapiRawHeroComponent
  | StrapiRawTextBlockComponent
  | StrapiRawImageGalleryComponent
  | StrapiRawFeatureGridComponent
  | StrapiRawButtonComponent
  | StrapiRawFaqSectionComponent
  | StrapiRawKeyTakeawaysComponent
  | StrapiRawFactBlockComponent;

function hasRequiredComponentAttributes<T extends StrapiComponent>(
  data: unknown,
  component: PageComponentType,
  attributes: string[]
): data is T {
  if (!isObject(data)) {
    console.debug('Component validation failed: not an object');
    return false;
  }
  
  if (!('id' in data) || typeof data.id !== 'string') {
    console.debug('Component validation failed: missing or invalid id');
    return false;
  }
  
  if (!('__component' in data) || typeof data.__component !== 'string') {
    console.debug('Component validation failed: missing or invalid __component');
    return false;
  }

  // Normalize component names for comparison
  const normalizeComponentName = (name: string) => {
    const namespace = 'page-blocks.';
    return name.startsWith(namespace) ? name : `${namespace}${name}`;
  };

  const expectedComponent = normalizeComponentName(component);
  const actualComponent = normalizeComponentName(data.__component);

  if (expectedComponent !== actualComponent) {
    console.debug(`Component validation failed: expected ${expectedComponent}, got ${actualComponent}`);
    return false;
  }

  // Verify each required attribute exists and is not undefined
  for (const attr of attributes) {
    if (!(attr in data) || data[attr] === undefined) {
      console.debug(`Component validation failed: missing or undefined attribute ${attr}`);
      return false;
    }
  }

  return true;
}

function getComponentType(component: string): string {
  return component.replace('page-blocks.', '');
}

function isHeroComponent(data: StrapiComponent): data is StrapiRawHeroComponent {
  return getComponentType(data.__component) === 'hero' && 'title' in data;
}

function isTextBlockComponent(data: StrapiComponent): data is StrapiRawTextBlockComponent {
  return getComponentType(data.__component) === 'text-block' && 'content' in data && 'alignment' in data;
}

function isImageGalleryComponent(data: StrapiComponent): data is StrapiRawImageGalleryComponent {
  return getComponentType(data.__component) === 'gallery' && 'images' in data && 'layout' in data;
}

function isFeatureGridComponent(data: StrapiComponent): data is StrapiRawFeatureGridComponent {
  return getComponentType(data.__component) === 'feature-grid' && 'features' in data && Array.isArray(data.features);
}

export function isStrapiRawBlogPost(data: unknown): data is StrapiRawBlogPost {
  if (!isObject(data)) {
    console.debug('Blog post validation failed: not an object');
    return false;
  }

  // Handle both flat and nested structures
  const post = 'attributes' in data && isObject(data.attributes)
    ? { id: data.id, ...data.attributes as Record<string, unknown> }
    : 'data' in data && Array.isArray((data as any).data)
    ? (data as any).data[0]
    : data;

  // Check required fields
  if (!('id' in post)) {
    console.debug('Blog post validation failed: missing id field');
    return false;
  }
  
  // Convert numeric id to string if needed
  post.id = String(post.id);

  // Check other required fields
  const requiredFields = ['title', 'slug'];
  for (const field of requiredFields) {
    if (!(field in post) || typeof post[field] !== 'string') {
      console.debug(`Blog post validation failed: missing or invalid ${field} field`);
      return false;
    }
  }

  // Check content (either Content or content should be present)
  const hasContent =
    ('Content' in post && (typeof post.Content === 'string' || post.Content === null)) ||
    ('content' in post && (typeof post.content === 'string' || post.content === null));

  if (!hasContent) {
    console.debug('Blog post validation failed: missing content field');
    return false;
  }

  // Check categories if present
  if ('categories' in post && post.categories !== null) {
    if (!Array.isArray(post.categories)) {
      console.debug('Blog post validation failed: categories is not an array');
      return false;
    }

    for (const category of post.categories) {
      // Convert category id to string if needed
      const cat = 'attributes' in category ? { id: String(category.id), ...category.attributes } : category;
      if (!isObject(cat)) {
        console.debug('Blog post validation failed: category is not an object');
        return false;
      }

      const requiredCategoryFields = ['id', 'name', 'slug'];
      for (const field of requiredCategoryFields) {
        if (!(field in cat)) {
          console.debug(`Blog post validation failed: category missing ${field} field`);
          return false;
        }
        if (field === 'id') {
          cat.id = String(cat.id);
        } else if (typeof cat[field] !== 'string') {
          console.debug(`Blog post validation failed: category invalid ${field} field`);
          return false;
        }
      }
    }
  }

  // Check tags if present
  if ('tags' in post && post.tags !== null) {
    if (!Array.isArray(post.tags)) {
      console.debug('Blog post validation failed: tags is not an array');
      return false;
    }

    for (const tag of post.tags) {
      const t = 'attributes' in tag ? { id: String(tag.id), ...tag.attributes } : tag;
      if (!isObject(t)) {
        console.debug('Blog post validation failed: tag is not an object');
        return false;
      }

      if (!('id' in t) || !('name' in t)) {
        console.debug('Blog post validation failed: tag missing required fields');
        return false;
      }

      // Convert tag id to string if needed
      t.id = String(t.id);

      if (typeof t.name !== 'string') {
        console.debug('Blog post validation failed: tag name is not a string');
        return false;
      }
    }
  }

  // Check featured image if present
  if ('featuredImage' in post && post.featuredImage !== null && isObject(post.featuredImage)) {
    const imageData = post.featuredImage;
    
    // Handle nested Strapi image structure
    if ('data' in imageData && imageData.data && isObject(imageData.data)) {
      const nestedImage = imageData.data;
      if (!('id' in nestedImage)) {
        console.debug('Blog post validation failed: featuredImage missing id');
        return false;
      }
      // Convert image id to string if needed
      nestedImage.id = String(nestedImage.id);

      const imageAttrs = 'attributes' in nestedImage && isObject(nestedImage.attributes) 
        ? nestedImage.attributes 
        : nestedImage;

      if (!isObject(imageAttrs) || !('url' in imageAttrs) || typeof imageAttrs.url !== 'string') {
        console.debug('Blog post validation failed: featuredImage has invalid structure');
        return false;
      }
    } else {
      // Handle flat image structure
      if (!('id' in imageData)) {
        console.debug('Blog post validation failed: featuredImage missing id');
        return false;
      }
      // Convert image id to string if needed
      imageData.id = String(imageData.id);

      if (!('url' in imageData) || typeof imageData.url !== 'string') {
        console.debug('Blog post validation failed: featuredImage missing or invalid url field');
        return false;
      }
    }
  }

  // Check date fields
  const dateFields = ['createdAt', 'updatedAt', 'publishedAt'];
  for (const field of dateFields) {
    if (field in post && post[field] !== null && typeof post[field] !== 'string') {
      console.debug(`Blog post validation failed: invalid ${field} type`);
      return false;
    }
  }

  return true;
}

export function isStrapiRawNewsArticle(data: unknown): data is StrapiRawNewsArticle {
  if (!isObject(data)) {
    console.debug('News article validation failed: not an object');
    return false;
  }

  // Handle nested Strapi structure
  const article = 'attributes' in data && isObject(data.attributes)
    ? { id: data.id, ...data.attributes as Record<string, unknown> }
    : data;

  // Check required fields
  if (!('id' in article)) {
    console.debug('News article validation failed: missing id field');
    return false;
  }

  // Convert numeric id to string if needed
  article.id = String(article.id);

  // Check required fields
  const requiredFields = ['title', 'slug'];
  for (const field of requiredFields) {
    if (!(field in article) || typeof article[field] !== 'string') {
      console.debug(`News article validation failed: missing or invalid ${field} field`);
      return false;
    }
  }

  // Check content (either Content or content should be present)
  const hasContent =
    ('Content' in article && (typeof article.Content === 'string' || article.Content === null)) ||
    ('content' in article && (typeof article.content === 'string' || article.content === null));

  if (!hasContent) {
    console.debug('News article validation failed: missing content field');
    return false;
  }

  // Check categories if present
  if ('categories' in article && article.categories !== null) {
    // Handle both flat and nested structures
    const categories = Array.isArray(article.categories)
      ? article.categories
      : (article.categories as { data?: Array<any> })?.data || [];
    
    if (!Array.isArray(categories)) {
      console.debug('News article validation failed: categories is not an array');
      return false;
    }
  }

  // Check tags if present
  if ('tags' in article && article.tags !== null) {
    // Handle both flat and nested structures
    const tags = Array.isArray(article.tags)
      ? article.tags
      : (article.tags as { data?: Array<any> })?.data || [];
    
    if (!Array.isArray(tags)) {
      console.debug('News article validation failed: tags is not an array');
      return false;
    }
  }

  return true;
}

/**
 * Page Builder Component Normalizers
 */

export function normalizeCTAButton(raw: StrapiRawCTAButton): CTAButton {
  return {
    text: raw.text,
    link: raw.link,
    style: raw.style
  };
}

function isValidSubtitle(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

export function normalizeHeroComponent(raw: StrapiRawHeroComponent): HeroComponent {
  return {
    id: String(raw.id ?? ''),
    __component: 'page-blocks.hero',
    title: raw.title || '',
    subtitle: raw.subtitle && typeof raw.subtitle === 'string' ? raw.subtitle : undefined,
    backgroundImage: raw.backgroundImage?.data ? normalizeImage(raw.backgroundImage.data) : undefined,
    ctaButton: raw.ctaButton ? normalizeCTAButton(raw.ctaButton) : undefined
  };
}

export function normalizeTextBlockComponent(raw: StrapiRawTextBlockComponent): TextBlockComponent {
  // Unescape newlines and normalize content
  const normalizedContent = raw.content
    ? raw.content
        .replace(/\\n/g, '\n') // Replace escaped newlines with actual newlines
        .replace(/\\\\/g, '\\') // Replace double escaped backslashes with single backslash
        .replace(/\\"/g, '"') // Replace escaped double quotes with actual quotes
    : '';

  return {
    id: String(raw.id ?? ''),
    __component: 'page-blocks.text-block' as const,
    content: normalizedContent || '',
    alignment: raw.alignment || 'left'
  };
}

export function normalizeImageGalleryComponent(raw: StrapiRawImageGalleryComponent): ImageGalleryComponent {
  return {
    id: String(raw.id ?? ''),
    __component: 'page-blocks.gallery',
    images: raw.images?.data?.map(normalizeImage) || [],
    layout: raw.layout || 'grid'
  };
}

export function normalizeFeature(raw: StrapiRawFeature): Feature {
  return {
    id: String(raw.id ?? ''),
    title: raw.title || '',
    description: raw.description || '',
    icon: raw.icon?.data ? normalizeImage(raw.icon.data) : undefined,
    link: raw.link || ''
  };
}

export function normalizeFeatureGridComponent(raw: StrapiRawFeatureGridComponent): FeatureGridComponent {
  return {
    id: String(raw.id ?? ''),
    __component: 'page-blocks.feature-grid',
    features: Array.isArray(raw.features)
      ? raw.features.map(normalizeFeature)
      : raw.features?.data?.map(item => normalizeFeature(item.attributes)) || []
  };
}

/**
 * Type guards for Page Builder components
 */

export function isStrapiRawHeroComponent(data: unknown): data is StrapiRawHeroComponent {
  return hasRequiredComponentAttributes(data, 'page-blocks.hero', ['title']);
}

export function isStrapiRawTextBlockComponent(data: unknown): data is StrapiRawTextBlockComponent {
  return hasRequiredComponentAttributes(data, 'page-blocks.text-block', ['content', 'alignment']);
}

export function isStrapiRawImageGalleryComponent(data: unknown): data is StrapiRawImageGalleryComponent {
  return hasRequiredComponentAttributes(data, 'page-blocks.gallery', ['images', 'layout']);
}

export function isStrapiRawFeatureGridComponent(data: unknown): data is StrapiRawFeatureGridComponent {
  if (!hasRequiredComponentAttributes(data, 'page-blocks.feature-grid', ['features'])) return false;
  if (!('features' in data) || !Array.isArray((data as any).features)) return false;
  return true;
}

/**
 * Page normalizers
 */

interface BaseComponent {
  __component: string;
  [key: string]: unknown;
}

function isBaseComponent(value: unknown): value is BaseComponent {
  return isObject(value) && typeof value.__component === 'string';
}

function normalizeLayoutComponent(
  rawComponent: unknown
): HeroComponent | TextBlockComponent | ImageGalleryComponent | FeatureGridComponent | ButtonComponent | FaqSectionComponent | KeyTakeawaysComponent | FactBlockComponent | undefined {
  if (!rawComponent) {
    console.warn('Received null or undefined component');
    return undefined;
  }
  if (!isBaseComponent(rawComponent)) {
    console.warn('Invalid component: missing __component property');
    return undefined;
  }

  try {
    // Extract the component type from the full string (e.g., "page-blocks.hero" -> "hero")
    const componentType = rawComponent.__component.replace('page-blocks.', '');

    switch (componentType) {
      case 'hero':
      case 'page-blocks.hero': {
        if (!('id' in rawComponent) || !('title' in rawComponent)) {
          console.warn('Invalid hero component: missing required fields');
          return undefined;
        }
        return normalizeHeroComponent(rawComponent as unknown as StrapiRawHeroComponent);
      }
      case 'text-block':
      case 'page-blocks.text-block': {
        if (!('id' in rawComponent) || !('content' in rawComponent) || !('alignment' in rawComponent)) {
          console.warn('Invalid text-block component: missing required fields');
          return undefined;
        }
        return normalizeTextBlockComponent(rawComponent as unknown as StrapiRawTextBlockComponent);
      }
      case 'button':
      case 'page-blocks.button': {
        if (!('id' in rawComponent) || !('text' in rawComponent) || !('link' in rawComponent) || !('style' in rawComponent)) {
          console.warn('Invalid button component: missing required fields');
          return undefined;
        }
        return {
          id: String(rawComponent.id),
          __component: 'page-blocks.button' as const,
          text: String(rawComponent.text),
          link: String(rawComponent.link),
          style: rawComponent.style as 'primary' | 'secondary'
        };
      }
      case 'feature-grid':
      case 'page-blocks.feature-grid': {
        if (!('id' in rawComponent) || !('features' in rawComponent) || !Array.isArray(rawComponent.features)) {
          console.warn('Invalid feature-grid component: missing required fields or invalid features array');
          return undefined;
        }
        return normalizeFeatureGridComponent(rawComponent as unknown as StrapiRawFeatureGridComponent);
      }
      case 'faq-section':
      case 'page-blocks.faq-section': {
        if (!('id' in rawComponent)) {
          console.warn('Invalid faq-section component: missing id');
          return undefined;
        }
        const items = Array.isArray((rawComponent as StrapiRawFaqSectionComponent).items)
          ? (rawComponent as StrapiRawFaqSectionComponent).items as StrapiRawFaqItem[]
          : [];
        return {
          id: String(rawComponent.id),
          __component: 'page-blocks.faq-section' as const,
          items: items.map((item) => ({
            id: Number(item.id) || 0,
            question: item.question || '',
            answer: item.answer || ''
          }))
        };
      }
      case 'key-takeaways':
      case 'page-blocks.key-takeaways': {
        if (!('id' in rawComponent)) {
          console.warn('Invalid key-takeaways component: missing id');
          return undefined;
        }
        const items = Array.isArray((rawComponent as StrapiRawKeyTakeawaysComponent).items)
          ? (rawComponent as StrapiRawKeyTakeawaysComponent).items as StrapiRawKeyTakeawayItem[]
          : [];
        return {
          id: String(rawComponent.id),
          __component: 'page-blocks.key-takeaways' as const,
          items: items.map((item) => ({
            id: item.id || '',
            title: item.title || '',
            value: item.value || ''
          }))
        };
      }
      case 'fact-block':
      case 'page-blocks.fact-block': {
        if (!('id' in rawComponent)) {
          console.warn('Invalid fact-block component: missing id');
          return undefined;
        }
        const rawSource = (rawComponent as StrapiRawFactBlockComponent).source;
        const normalizedSource = Array.isArray(rawSource)
          ? rawSource
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
            .filter(Boolean)
          : typeof rawSource === 'string'
            ? rawSource.trim() || undefined
            : undefined;
        return {
          id: String(rawComponent.id),
          __component: 'page-blocks.fact-block' as const,
          label: String((rawComponent as StrapiRawFactBlockComponent).label || ''),
          value: String((rawComponent as StrapiRawFactBlockComponent).value || ''),
          source: normalizedSource
        };
      }
      default:
        console.warn(`Unknown component type: ${componentType} (full: ${rawComponent.__component})`);
    }
  } catch (error) {
    console.error('Failed to normalize component:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Component data:', rawComponent);
    }
  }

  return undefined;
}

export function normalizePage(raw: StrapiRawPage): Page {
  // Handle both flat and nested structures
  const data = raw.attributes || {} as StrapiRawPageAttributes;

  const normalizedPage: Page = {
    id: String(raw.id),
    title: data.Title || data.title || '',
    slug: data.slug || '',
    seoMetadata: {
      metaTitle: data.seoTitle || '',
      metaDescription: data.seoDescription || '',
      keywords: data.seoKeywords || ''
    },
    layout: data.layout
      ?.map(normalizeLayoutComponent)
      .filter((component: HeroComponent | TextBlockComponent | ImageGalleryComponent | FeatureGridComponent | ButtonComponent | FaqSectionComponent | KeyTakeawaysComponent | FactBlockComponent | undefined): component is NonNullable<typeof component> => component !== undefined) || [],
    schemaType: normalizePageSchemaType(data.schemaType),
    publicationDate: data.publicationDate,
    publishedAt: data.publishedAt || '',
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || ''
  };

  if (typeof data.primaryKeyword === 'string') {
    normalizedPage.primaryKeyword = data.primaryKeyword;
  }

  if (typeof data.serviceName === 'string') {
    normalizedPage.serviceName = data.serviceName;
  }

  if (typeof data.serviceDescription === 'string') {
    normalizedPage.serviceDescription = data.serviceDescription;
  }

  if (typeof data.serviceType === 'string') {
    normalizedPage.serviceType = data.serviceType;
  }

  if (typeof data.areaServed === 'string') {
    normalizedPage.areaServed = data.areaServed;
  }

  if (typeof data.providerOverride === 'boolean') {
    normalizedPage.providerOverride = data.providerOverride;
  }

  return normalizedPage;
}

/**
 * Navigation System Normalizers
 */

export function normalizeMenuPosition(raw: StrapiRawMenu['attributes']['position']): MenuPosition {
  return {
    location: raw.location,
    order: raw.order,
    style: raw.style,
    className: raw.className
  };
}

export function normalizeMenuItemSettings(raw: StrapiRawMenuItem['attributes']['settings']): MenuItemSettings {
  return {
    order: raw.order,
    icon: raw.icon?.data ? {
      data: {
        id: String(raw.icon.data.id || ''),
        attributes: {
          url: raw.icon.data.attributes?.url || '',
          width: raw.icon.data.attributes?.width || 0,
          height: raw.icon.data.attributes?.height || 0,
          alternativeText: raw.icon.data.attributes?.alternativeText,
          formats: raw.icon.data.attributes?.formats,
          hash: raw.icon.data.attributes?.hash,
          ext: raw.icon.data.attributes?.ext,
          mime: raw.icon.data.attributes?.mime,
          size: raw.icon.data.attributes?.size,
          provider: raw.icon.data.attributes?.provider
        }
      }
    } : undefined,
    openInNewTab: raw.openInNewTab,
    highlight: raw.highlight,
    className: raw.className
  };
}

export function normalizeMenuItem(raw: StrapiRawMenuItem, parentMenu?: Menu): MenuItem {
  const item: MenuItem = {
    id: String(raw.id),
    title: raw.attributes.title,
    type: raw.attributes.type,
    path: raw.attributes.path,
    menu: parentMenu || normalizeMenu(raw.attributes.menu.data),
    settings: normalizeMenuItemSettings(raw.attributes.settings)
  };

  // Handle parent relationship if exists
  if (raw.attributes.parent?.data) {
    item.parent = normalizeMenuItem(raw.attributes.parent.data);
  }

  // Handle children if they exist
  if (raw.attributes.children?.data) {
    item.children = raw.attributes.children.data.map(child => normalizeMenuItem(child, item.menu));
  }

  return item;
}

export function normalizeMenu(raw: { id: string; attributes: StrapiRawMenu['attributes'] }): Menu {
  const menu: Menu = {
    id: String(raw.id),
    title: raw.attributes.title,
    handle: raw.attributes.handle,
    type: raw.attributes.type,
    position: normalizeMenuPosition(raw.attributes.position),
    items: [] // Initialize empty array to avoid circular reference issues
  };

  // Now that menu object exists, we can normalize items with proper parent reference
  menu.items = raw.attributes.items.data.map(item => normalizeMenuItem(item, menu));

  return menu;
}

export function normalizeMenuSection(raw: StrapiRawMenuSection): MenuSection {
  return {
    id: String(raw.id),
    title: raw.attributes.title,
    items: raw.attributes.items.data.map(item => normalizeMenuItem(item)),
    order: raw.attributes.order
  };
}

export function normalizeSocialLink(raw: StrapiRawSocialLink): SocialLink {
  return {
    id: String(raw.id),
    platform: raw.attributes.platform,
    url: raw.attributes.url,
    icon: raw.attributes.icon?.data ? normalizeImage(raw.attributes.icon.data) : undefined,
    order: raw.attributes.order
  };
}

/**
 * Navigation Type Guards
 */

export function isStrapiRawMenuItem(data: unknown): data is StrapiRawMenuItem {
  return hasRequiredAttributes(data, ['title', 'type', 'path', 'settings']);
}

export function isStrapiRawMenu(data: unknown): data is { id: string; attributes: StrapiRawMenu['attributes'] } {
  return hasRequiredAttributes(data, ['title', 'handle', 'type', 'position', 'items']);
}

export function isStrapiRawMenuSection(data: unknown): data is StrapiRawMenuSection {
  return hasRequiredAttributes(data, ['title', 'items', 'order']);
}

export function isStrapiRawSocialLink(data: unknown): data is StrapiRawSocialLink {
  return hasRequiredAttributes(data, ['platform', 'url', 'order']);
}

/**
 * Helper functions for navigation
 */

export function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>();
  const rootItems: MenuItem[] = [];

  // First pass: Create a map of all items
  items.forEach(item => {
    itemMap.set(item.id, item);
  });

  // Second pass: Build the tree structure
  items.forEach(item => {
    if (item.parent) {
      const parent = itemMap.get(item.parent.id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(item);
      }
    } else {
      rootItems.push(item);
    }
  });

  // Sort items by order at each level
  const sortByOrder = (items: MenuItem[]) => {
    items.sort((a, b) => a.settings.order - b.settings.order);
    items.forEach(item => {
      if (item.children) {
        sortByOrder(item.children);
      }
    });
  };

  sortByOrder(rootItems);
  return rootItems;
}
