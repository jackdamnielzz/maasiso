export interface StrapiData<T> {
  id: number;
  attributes: T;
}

export interface StrapiCollectionResponse<T> {
  data: StrapiData<T>[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: StrapiData<T>;
  meta: {};
}

export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: any;
}

export interface PageData {
  title: string;
  Title?: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  primaryKeyword?: string;
  schemaType?: 'Article' | 'WebPage' | 'Service' | string;
  serviceName?: string;
  serviceDescription?: string;
  serviceType?: string;
  areaServed?: string;
  providerOverride?: boolean;
  layout?: any[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
