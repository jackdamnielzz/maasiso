import { getBaseUrl } from '../core';

export function mapImage(data: any) {
  if (!data) {
    return undefined;
  }
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
    url: data.url ? `${getBaseUrl()}${data.url}` : '',
    previewUrl: data.previewUrl,
    provider: data.provider || '',
    provider_metadata: data.provider_metadata,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt || data.createdAt,
    publishedAt: data.publishedAt
  };
}