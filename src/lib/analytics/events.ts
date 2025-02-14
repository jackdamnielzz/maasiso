import type {
  AnalyticsEvent,
  SearchEvent,
  ContentEvent,
  NavigationEvent,
  PerformanceEvent,
  ErrorEvent,
  UserEvent,
  DeviceInfo
} from './types';

// Event Creation Functions
export function createEvent<T extends AnalyticsEvent>(
  baseEvent: Omit<T, 'id' | 'timestamp' | 'deviceInfo'>,
  deviceInfo: DeviceInfo
): T {
  return {
    ...baseEvent,
    id: generateEventId(),
    timestamp: Date.now(),
    deviceInfo,
  } as T;
}

// Type Guards
export function isSearchEvent(event: AnalyticsEvent): event is SearchEvent {
  return event.category === 'Search';
}

export function isContentEvent(event: AnalyticsEvent): event is ContentEvent {
  return event.category === 'Content';
}

export function isNavigationEvent(event: AnalyticsEvent): event is NavigationEvent {
  return event.category === 'Navigation';
}

export function isPerformanceEvent(event: AnalyticsEvent): event is PerformanceEvent {
  return event.category === 'Performance';
}

export function isErrorEvent(event: AnalyticsEvent): event is ErrorEvent {
  return event.category === 'Error';
}

export function isUserEvent(event: AnalyticsEvent): event is UserEvent {
  return event.category === 'User';
}

// Helper Functions
function generateEventId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Event Builders
export function buildSearchEvent(
  action: SearchEvent['action'],
  searchQuery?: string,
  resultsCount?: number,
  filterType?: string,
  sortType?: SearchEvent['sortType'],
  pageNumber?: number
): Omit<SearchEvent, 'id' | 'timestamp' | 'deviceInfo'> {
  return {
    category: 'Search',
    action,
    searchQuery,
    resultsCount,
    filterType,
    sortType,
    pageNumber,
  };
}

export function buildContentEvent(
  action: ContentEvent['action'],
  contentType: ContentEvent['contentType'],
  contentId: string,
  contentTitle: string,
  metadata?: ContentEvent['contentMetadata'],
  engagementMetrics?: ContentEvent['engagementMetrics']
): Omit<ContentEvent, 'id' | 'timestamp' | 'deviceInfo'> {
  return {
    category: 'Content',
    action,
    contentType,
    contentId,
    contentTitle,
    contentMetadata: metadata,
    engagementMetrics,
  };
}

export function buildNavigationEvent(
  action: NavigationEvent['action'],
  path: string,
  referrer?: string,
  navigationTime?: number
): Omit<NavigationEvent, 'id' | 'timestamp' | 'deviceInfo'> {
  return {
    category: 'Navigation',
    action,
    path,
    referrer,
    navigationTime,
  };
}

export function buildPerformanceEvent(
  action: PerformanceEvent['action'],
  metric: string,
  value: number,
  context?: PerformanceEvent['context']
): Omit<PerformanceEvent, 'id' | 'timestamp' | 'deviceInfo'> {
  return {
    category: 'Performance',
    action,
    metric,
    value,
    context,
  };
}

export function buildErrorEvent(
  action: ErrorEvent['action'],
  errorMessage: string,
  errorCode?: string,
  stackTrace?: string,
  context?: ErrorEvent['context']
): Omit<ErrorEvent, 'id' | 'timestamp' | 'deviceInfo'> {
  return {
    category: 'Error',
    action,
    errorMessage,
    errorCode,
    stackTrace,
    context,
  };
}

export function buildUserEvent(
  action: UserEvent['action'],
  preferences?: Record<string, unknown>,
  sessionId?: string,
  clientId?: string
): Omit<UserEvent, 'id' | 'timestamp' | 'deviceInfo'> {
  return {
    category: 'User',
    action,
    preferences,
    sessionId,
    clientId,
  };
}
