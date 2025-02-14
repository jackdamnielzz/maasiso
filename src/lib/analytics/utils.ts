import type { AnalyticsEvent, NavigationEvent, ContentEvent } from './types';

interface NetworkInformation {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  [key: string]: unknown;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

// Event Creation Helpers
export function createNavigationEvent(
  action: NavigationEvent['action'],
  path: string,
  referrer?: string
): Omit<NavigationEvent, 'id' | 'timestamp' | 'deviceInfo'> {
  return {
    category: 'Navigation',
    action,
    path,
    referrer,
    navigationTime: typeof performance !== 'undefined' ? performance.now() : undefined,
  };
}

export function createContentEvent(
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

// Event Validation
export function isValidEvent(event: Partial<AnalyticsEvent>): boolean {
  return (
    !!event.category &&
    !!event.action &&
    !containsSensitiveData(event)
  );
}

// Data Sanitization
export function sanitizeEventData<T extends AnalyticsEvent>(event: T): T {
  return {
    ...event,
    label: sanitizeString(event.label),
    ...(event.category === 'Error' && {
      errorMessage: sanitizeString(event.errorMessage),
      stackTrace: sanitizeStackTrace(event.stackTrace),
    }),
  };
}

// Utility Functions
function sanitizeString(str?: string): string | undefined {
  if (!str) return undefined;
  return str
    .replace(/[<>]/g, '') // Remove potential HTML/XML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
}

function sanitizeStackTrace(stack?: string): string | undefined {
  if (!stack) return undefined;
  return stack
    .split('\n')
    .filter(line => !line.includes('node_modules'))
    .join('\n');
}

function containsSensitiveData(event: Partial<AnalyticsEvent>): boolean {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /api[_-]?key/i,
    /secret/i,
    /credential/i,
    /auth/i,
  ];

  const eventString = JSON.stringify(event).toLowerCase();
  return sensitivePatterns.some(pattern => pattern.test(eventString));
}

// Performance Utilities
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
    domLoad: navigation.domContentLoadedEventEnd - navigation.startTime,
    windowLoad: navigation.loadEventEnd - navigation.startTime,
  };
}

// Session Utilities
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function getClientInfo() {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      language: '',
      viewport: { width: 0, height: 0 },
      connection: null,
    };
  }

  return {
    userAgent: window.navigator.userAgent,
    language: window.navigator.language,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    connection: 'connection' in navigator
      ? (navigator as NavigatorWithConnection).connection?.effectiveType
      : null,
  };
}

// Sampling Utilities
export function shouldSampleEvent(
  eventCategory: string,
  samplingRate: number
): boolean {
  if (samplingRate >= 100) return true;
  if (samplingRate <= 0) return false;

  // Always collect error events
  if (eventCategory === 'Error') return true;

  return Math.random() * 100 < samplingRate;
}

// Debug Utilities
export function debugEvent(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('Analytics Event');
  console.log('Category:', event.category);
  console.log('Action:', event.action);
  console.log('Timestamp:', new Date(event.timestamp).toISOString());
  console.log('Details:', event);
  console.groupEnd();
}
