import { Image, ImageFormat } from '../types';
import { clientEnv } from '../config/client-env';

function extractFileInfo(url: string): { ext: string; filename: string; hash: string } {
  let pathname = '';

  try {
    pathname = new URL(url, clientEnv.apiUrl).pathname;
  } catch {
    pathname = url.split('?')[0].split('#')[0];
  }

  const filename = pathname.split('/').filter(Boolean).pop() || '';
  const lastDotIndex = filename.lastIndexOf('.');
  const hasExtension = lastDotIndex > 0;

  const ext = hasExtension ? filename.slice(lastDotIndex + 1) : '';
  const hash = hasExtension ? filename.slice(0, lastDotIndex) : filename;

  return { ext, filename, hash };
}

/**
 * Normalize an image format from raw data
 */
export function normalizeImageFormat(format: {
  url: string;
  width: number;
  height: number;
  ext?: string;
  hash?: string;
  mime?: string;
  name?: string;
  path?: string;
  size?: number;
  sizeInBytes?: number;
}): ImageFormat {
  const url = format.url || '';
  const { ext, filename, hash } = extractFileInfo(url);
  const mime = `image/${ext}`;

  return {
    ext: format.ext || `.${ext}`,
    url: url.startsWith('http') ? url : `${clientEnv.apiUrl}${url}`,
    hash: format.hash || hash,
    mime: format.mime || mime,
    name: format.name || filename,
    path: format.path ?? undefined,
    size: format.size || 0,
    width: format.width,
    height: format.height,
    sizeInBytes: format.sizeInBytes || 0
  };
}

/**
 * Normalize an image from raw data
 */
export function normalizeImage(data: {
  id: string;
  documentId?: string;
  attributes?: {
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: {
      small?: {
        url: string;
        width: number;
        height: number;
        ext?: string;
        hash?: string;
        mime?: string;
        name?: string;
        path?: string;
        size?: number;
        sizeInBytes?: number;
      };
      thumbnail?: {
        url: string;
        width: number;
        height: number;
        ext?: string;
        hash?: string;
        mime?: string;
        name?: string;
        path?: string;
        size?: number;
        sizeInBytes?: number;
      };
    };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url: string;
    previewUrl?: string;
    provider?: string;
    provider_metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
  // Support flat structure
  name?: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    small?: {
      url: string;
      width: number;
      height: number;
      ext?: string;
      hash?: string;
      mime?: string;
      name?: string;
      path?: string;
      size?: number;
      sizeInBytes?: number;
    };
    thumbnail?: {
      url: string;
      width: number;
      height: number;
      ext?: string;
      hash?: string;
      mime?: string;
      name?: string;
      path?: string;
      size?: number;
      sizeInBytes?: number;
    };
  };
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  url?: string;
  previewUrl?: string;
  provider?: string;
  provider_metadata?: any;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}): Image {
  // Handle both nested and flat structures
  const attrs = data.attributes || data;
  
  // Extract URL from either flat or nested structure
  const url = attrs.url || '';
  const { ext, filename, hash } = extractFileInfo(url);
  const mime = `image/${ext}`;
  const now = new Date().toISOString();

  // Normalize formats if they exist
  const formats = attrs.formats ? {
    small: attrs.formats.small ? normalizeImageFormat(attrs.formats.small) : undefined,
    thumbnail: attrs.formats.thumbnail ? normalizeImageFormat(attrs.formats.thumbnail) : undefined
  } : {};

  return {
    id: String(data.id),
    documentId: data.documentId ? String(data.documentId) : undefined,
    name: attrs.name || filename,
    alternativeText: attrs.alternativeText,
    caption: attrs.caption,
    width: attrs.width || 0,
    height: attrs.height || 0,
    formats: formats,
    hash: attrs.hash || hash,
    ext: attrs.ext || `.${ext}`,
    mime: attrs.mime || mime,
    size: attrs.size || 0,
    url: url.startsWith('http') ? url : `${clientEnv.apiUrl}${url}`,
    previewUrl: attrs.previewUrl,
    provider: attrs.provider || 'strapi',
    provider_metadata: attrs.provider_metadata,
    createdAt: attrs.createdAt || now,
    updatedAt: attrs.updatedAt || now,
    publishedAt: attrs.publishedAt || now
  };
}
