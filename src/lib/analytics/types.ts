// Analytics Event Types and Interfaces
export type EventCategory = 
  | 'Search'
  | 'Content'
  | 'Navigation'
  | 'Interaction'
  | 'Performance'
  | 'Error'
  | 'User'
  | 'Experiment';

export type ContentType = 'blog' | 'news';

export type SortOption = 'date' | 'relevance' | 'title';

export type ViewportSize = {
  width: number;
  height: number;
};

export type DeviceInfo = {
  userAgent: string;
  platform: string;
  language: string;
  screenSize: ViewportSize;
};

// Base Event Interface
export interface BaseEvent {
  id: string;
  timestamp: number;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  deviceInfo?: DeviceInfo;
}

// Search Events
export type SearchAction = 
  | 'execute_search'
  | 'filter_results'
  | 'sort_results'
  | 'clear_filters'
  | 'save_search'
  | 'load_more';

export interface SearchEvent extends BaseEvent {
  category: 'Search';
  action: SearchAction;
  searchQuery?: string;
  resultsCount?: number;
  filterType?: string;
  sortType?: SortOption;
  pageNumber?: number;
  totalPages?: number;
}

// Content Events
export type ContentAction = 
  | 'view_content'
  | 'scroll_content'
  | 'share_content'
  | 'content_engagement'
  | 'content_complete'
  | 'download_content'
  | 'print_content';

export interface ContentEvent extends BaseEvent {
  category: 'Content';
  action: ContentAction;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  contentMetadata?: {
    author?: string;
    publishDate?: string;
    tags?: string[];
    readingTime?: number;
    wordCount?: number;
  };
  engagementMetrics?: {
    timeSpent?: number;
    scrollDepth?: number;
    interactions?: number;
    completion?: boolean;
  };
}

// Navigation Events
export type NavigationAction = 
  | 'page_view'
  | 'category_select'
  | 'internal_link'
  | 'external_link'
  | 'back_navigation'
  | 'menu_interaction';

export interface NavigationEvent extends BaseEvent {
  category: 'Navigation';
  action: NavigationAction;
  path: string;
  referrer?: string;
  navigationTime?: number;
}

// Performance Events
export type PerformanceAction = 
  | 'web_vital'
  | 'api_timing'
  | 'api_call'
  | 'render_timing'
  | 'resource_timing'
  | 'memory_usage'
  | 'error_boundary';

export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType?: string;
}

export interface PerformanceEvent extends BaseEvent {
  category: 'Performance';
  action: PerformanceAction;
  metric: string;
  value: number;
  context?: {
    component?: string;
    route?: string;
    apiEndpoint?: string;
    rating?: 'good' | 'needs-improvement' | 'poor';
    id?: string;
    page?: string;
  };
}

// Error Events
export type ErrorAction =
  | 'api_error'
  | 'render_error'
  | 'runtime_error'
  | 'network_error'
  | 'validation_error';

export interface ErrorEvent extends BaseEvent {
  category: 'Error';
  action: ErrorAction;
  errorCode?: string;
  errorMessage: string;
  stackTrace?: string;
  componentStack?: string;
  context?: Record<string, unknown>;
}

// User Events
export type UserAction =
  | 'preference_change'
  | 'consent_update'
  | 'feature_interaction'
  | 'feedback_submit';

export interface UserEvent extends BaseEvent {
  category: 'User';
  action: UserAction;
  preferences?: Record<string, unknown>;
  sessionId?: string;
  clientId?: string;
}

// Experiment Events
export type ExperimentAction =
  | 'experiment_assignment'
  | 'experiment_exposure'
  | 'experiment_conversion'
  | 'experiment_completion';

export interface ExperimentEvent extends BaseEvent {
  category: 'Experiment';
  action: ExperimentAction;
  experimentId: string;
  experimentName: string;
  variantId: string;
  variantName: string;
  metadata?: {
    audience?: Record<string, string>;
    conversion?: {
      type: string;
      value?: number;
    };
  };
}

// Union type of all possible events
export type AnalyticsEvent =
  | SearchEvent
  | ContentEvent
  | NavigationEvent
  | PerformanceEvent
  | ErrorEvent
  | UserEvent
  | ExperimentEvent;

// Analytics Configuration
export interface AnalyticsConfig {
  measurementId: string;
  debugMode: boolean;
  sampleRate: number;
  sessionTimeout: number;
  webVitalsTracking: boolean;
  errorTracking: boolean;
  consentRequired: boolean;
  anonymizeIp: boolean;
  excludedRoutes: string[];
  customDimensions?: Record<string, string>;
}

// Queue Management
export interface EventQueue {
  push(event: AnalyticsEvent): void;
  flush(): Promise<void>;
  clear(): void;
  size(): number;
}

// Consent Management
export interface ConsentSettings {
  analytics: boolean;
  performance: boolean;
  advertising: boolean;
  functional: boolean;
}

// Session Management
export interface SessionData {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  referrer?: string;
  campaign?: string;
}
