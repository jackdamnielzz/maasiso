import { Page, PageData } from '../types';
import { validatePageComponent, mapComponent } from './components';
import { normalizePageSchemaType } from '@/lib/utils/pageSchema';

export function mapPage(data: PageData): Page | null {
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
  
  const seoMetadata = {
    metaTitle: data.seoTitle || '',
    metaDescription: data.seoDescription || '',
    keywords: data.seoKeywords || ''
  };
  
  if (Array.isArray(data.layout)) {
    let validationIssues = false;
    data.layout.forEach((component: any, index: number) => {
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
    slug: data.slug,
    seoMetadata,
    primaryKeyword: data.primaryKeyword,
    schemaType: normalizePageSchemaType(data.schemaType),
    serviceName: typeof data.serviceName === 'string' ? data.serviceName : undefined,
    serviceDescription: typeof data.serviceDescription === 'string' ? data.serviceDescription : undefined,
    serviceType: typeof data.serviceType === 'string' ? data.serviceType : undefined,
    areaServed: typeof data.areaServed === 'string' ? data.areaServed : undefined,
    providerOverride: typeof data.providerOverride === 'boolean' ? data.providerOverride : undefined,
    layout: data.layout?.map(mapComponent) || [],
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}
