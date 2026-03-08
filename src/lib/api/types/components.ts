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
  icon?: Record<string, unknown>;
}

export interface RawFaqItem {
  id?: number | string;
  question?: string;
  answer?: string;
  attributes?: {
    id?: number | string;
    question?: string;
    answer?: string;
  };
}

export interface RawFaqSectionComponent extends RawStrapiComponent {
  items?: RawFaqItem[] | { data?: RawFaqItem[] };
}

export interface RawKeyTakeawayItem {
  id?: number | string;
  title?: string;
  value?: string;
  attributes?: {
    id?: number | string;
    title?: string;
    value?: string;
  };
}

export interface RawKeyTakeawaysComponent extends RawStrapiComponent {
  items?: RawKeyTakeawayItem[] | { data?: RawKeyTakeawayItem[] };
}

export interface RawFactBlockComponent extends RawStrapiComponent {
  label?: string;
  value?: string;
  source?: unknown;
}

export interface RawSourceItem {
  url?: string;
  label?: string;
}

export class APIError extends Error {
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}