import { v4 as uuidv4 } from 'uuid';
import type {
  AnalyticsEvent,
  AnalyticsConfig,
  EventQueue,
  ConsentSettings,
  SessionData,
  DeviceInfo
} from './types';
import { createEvent, buildNavigationEvent } from './events';
import { debugEvent } from './utils';

// Default configuration
const DEFAULT_CONFIG: AnalyticsConfig = {
  measurementId: process.env.NEXT_PUBLIC_GA_ID || '',
  debugMode: process.env.NODE_ENV === 'development',
  sampleRate: 100,
  sessionTimeout: 30,
  webVitalsTracking: true,
  errorTracking: true,
  consentRequired: true,
  anonymizeIp: true,
  excludedRoutes: ['/api/', '/admin/', '/_next/'],
};

// Event Queue Implementation
class AnalyticsQueue implements EventQueue {
  private queue: AnalyticsEvent[] = [];
  private processing = false;
  private maxBatchSize = 20;
  private maxRetries = 3;
  private flushInterval = 1000;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.startTimer();
  }

  private startTimer(): void {
    if (typeof window !== 'undefined' && !this.timer) {
      this.timer = setInterval(() => this.flush(), this.flushInterval);
    }
  }

  push(event: AnalyticsEvent): void {
    this.queue.push(event);
    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    try {
      this.processing = true;
      const batch = this.queue.splice(0, this.maxBatchSize);
      await this.sendBatch(batch);
    } catch (error) {
      console.error('Failed to flush analytics queue:', error);
      // Re-add failed events to the queue
      this.queue.unshift(...this.queue.splice(0, this.maxBatchSize));
    } finally {
      this.processing = false;
    }
  }

  private async sendBatch(batch: AnalyticsEvent[]): Promise<void> {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        await this.sendToGA(batch);
        return;
      } catch (error) {
        retries++;
        if (retries === this.maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  private async sendToGA(events: AnalyticsEvent[]): Promise<void> {
    if (typeof window === 'undefined' || !window.gtag) return;

    events.forEach(event => {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        non_interaction: event.nonInteraction,
        ...this.getEventSpecificParams(event),
      });
    });
  }

  private getEventSpecificParams(event: AnalyticsEvent): Record<string, unknown> {
    switch (event.category) {
      case 'Search':
        return {
          search_term: event.searchQuery,
          results_count: event.resultsCount,
          page_number: event.pageNumber,
        };
      case 'Content':
        return {
          content_type: event.contentType,
          content_id: event.contentId,
          content_title: event.contentTitle,
          ...event.contentMetadata,
          ...event.engagementMetrics,
        };
      case 'Navigation':
        return {
          page_path: event.path,
          referrer: event.referrer,
          navigation_time: event.navigationTime,
        };
      case 'Performance':
        return {
          metric_name: event.metric,
          metric_value: event.value,
          ...event.context,
        };
      case 'Error':
        return {
          error_code: event.errorCode,
          error_message: event.errorMessage,
          ...event.context,
        };
      default:
        return {};
    }
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }
}

// Session Management
class SessionManager {
  private session: SessionData;
  private storage: Storage | null;

  constructor(private config: AnalyticsConfig) {
    this.storage = typeof window !== 'undefined' ? window.sessionStorage : null;
    this.session = this.initSession();
  }

  private initSession(): SessionData {
    if (!this.storage) return this.createNewSession();

    const stored = this.storage.getItem('analytics_session');
    if (!stored) return this.createNewSession();

    const session = JSON.parse(stored) as SessionData;
    const now = Date.now();
    
    if (now - session.lastActivity > this.config.sessionTimeout * 60 * 1000) {
      return this.createNewSession();
    }

    session.lastActivity = now;
    this.saveSession(session);
    return session;
  }

  private createNewSession(): SessionData {
    const session: SessionData = {
      id: uuidv4(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: 0,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    };
    this.saveSession(session);
    return session;
  }

  private saveSession(session: SessionData): void {
    if (this.storage) {
      this.storage.setItem('analytics_session', JSON.stringify(session));
    }
  }

  updateActivity(): void {
    this.session.lastActivity = Date.now();
    this.session.events += 1;
    this.saveSession(this.session);
  }

  recordPageView(): void {
    this.session.pageViews += 1;
    this.updateActivity();
  }

  getSessionId(): string {
    return this.session.id;
  }

  getSessionData(): SessionData {
    return { ...this.session };
  }
}

// Device Information
class DeviceInfoCollector {
  private info: DeviceInfo;

  constructor() {
    this.info = this.collectDeviceInfo();
  }

  private collectDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        platform: '',
        language: '',
        screenSize: { width: 0, height: 0 },
      };
    }

    return {
      userAgent: window.navigator.userAgent,
      platform: window.navigator.platform,
      language: window.navigator.language,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
  }

  getDeviceInfo(): DeviceInfo {
    return { ...this.info };
  }
}

// Main Analytics Class
export class Analytics {
  private static instance: Analytics;
  private config: AnalyticsConfig;
  private queue: AnalyticsQueue;
  private sessionManager: SessionManager;
  private deviceInfo: DeviceInfoCollector;
  private consent: ConsentSettings = {
    analytics: false,
    performance: false,
    advertising: false,
    functional: false,
  };

  private constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.queue = new AnalyticsQueue();
    this.sessionManager = new SessionManager(this.config);
    this.deviceInfo = new DeviceInfoCollector();
  }

  static getInstance(config?: Partial<AnalyticsConfig>): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics(config);
    }
    return Analytics.instance;
  }

  setConsent(settings: Partial<ConsentSettings>): void {
    this.consent = { ...this.consent, ...settings };
  }

  private shouldTrack(event: AnalyticsEvent): boolean {
    if (!this.consent.analytics && event.category !== 'Error') return false;
    if (!this.consent.performance && event.category === 'Performance') return false;
    
    const random = Math.random() * 100;
    if (random > this.config.sampleRate) return false;

    if (typeof window !== 'undefined' && this.config.excludedRoutes.some(route => 
      window.location.pathname.startsWith(route)
    )) {
      return false;
    }

    return true;
  }

  track<T extends AnalyticsEvent>(
    event: Omit<T, 'id' | 'timestamp' | 'deviceInfo'>
  ): void {
    const deviceInfo = this.deviceInfo.getDeviceInfo();
    const fullEvent = createEvent<T>(event, deviceInfo);

    if (this.shouldTrack(fullEvent)) {
      if (this.config.debugMode) {
        debugEvent(fullEvent);
      }
      this.queue.push(fullEvent);
      this.sessionManager.updateActivity();
    }
  }

  pageView(path: string): void {
    const event = buildNavigationEvent(
      'page_view',
      path,
      typeof document !== 'undefined' ? document.referrer : undefined,
      typeof performance !== 'undefined' ? performance.now() : undefined
    );
    this.track(event);
    this.sessionManager.recordPageView();
  }

  getSessionId(): string {
    return this.sessionManager.getSessionId();
  }

  async flush(): Promise<void> {
    await this.queue.flush();
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();
