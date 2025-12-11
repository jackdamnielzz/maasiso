export interface RawStrapiComponent {
  id: number;
  __component: string;
}

export interface RawHeroComponent extends RawStrapiComponent {
  title: string;
  subtitle?: string;
  backgroundImage?: any;
  ctaButton?: {
    text: string;
    link: string;
  };
}

export interface RawFeatureGridComponent extends RawStrapiComponent {
  features?: Array<{
    id: number;
    title: string;
    description: string;
    link: string | null;
    icon?: any;
  }>;
}

export interface RawTextBlockComponent extends RawStrapiComponent {
  content: string;
  alignment?: string;
}

export interface RawButtonComponent extends RawStrapiComponent {
  text: string;
  link: string;
  style?: string;
}

export interface RawGalleryComponent extends RawStrapiComponent {
  images?: {
    data: Array<{
      id: number;
      attributes: any;
    }>;
  };
  layout?: string;
}

export interface RawFeature {
  id: number;
  title: string;
  description: string;
  link: string | null;
  icon?: any;
}

export class APIError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}