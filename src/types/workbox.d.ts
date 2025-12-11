declare module 'workbox-core' {
  export function clientsClaim(): void;
}

declare module 'workbox-expiration' {
  export class ExpirationPlugin implements WorkboxPlugin {
    constructor(config: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    });
  }
}

declare module 'workbox-precaching' {
  export interface PrecacheEntry {
    url: string;
    revision: string | null;
  }
  export function precacheAndRoute(entries: Array<string | PrecacheEntry>): void;
  export function createHandlerBoundToURL(url: string): RouteHandler;
}

declare module 'workbox-routing' {
  export interface RouteMatchCallbackOptions {
    url: URL;
    request: Request;
    event?: FetchEvent;
  }

  export interface RouteHandlerCallbackOptions extends RouteMatchCallbackOptions {
    params?: { [key: string]: string };
  }

  export type RouteMatchCallback = (options: RouteMatchCallbackOptions) => boolean | string | undefined | null | void;
  export type RouteHandler = (options: RouteHandlerCallbackOptions) => Promise<Response>;

  export class Route {
    constructor(
      match: RouteMatchCallback,
      handler: RouteHandler | WorkboxStrategy
    );
  }

  export function registerRoute(
    capture: RouteMatchCallback | Route,
    handler?: RouteHandler | WorkboxStrategy
  ): void;
}

declare module 'workbox-strategies' {
  export interface WorkboxStrategy {
    handle(options: RouteHandlerCallbackOptions): Promise<Response>;
    cacheName: string;
  }

  export class StaleWhileRevalidate implements WorkboxStrategy {
    constructor(options?: {
      cacheName?: string;
      plugins?: WorkboxPlugin[];
    });
    handle(options: RouteHandlerCallbackOptions): Promise<Response>;
    cacheName: string;
  }

  export class CacheFirst implements WorkboxStrategy {
    constructor(options?: {
      cacheName?: string;
      plugins?: WorkboxPlugin[];
    });
    handle(options: RouteHandlerCallbackOptions): Promise<Response>;
    cacheName: string;
  }

  export class NetworkFirst implements WorkboxStrategy {
    constructor(options?: {
      cacheName?: string;
      plugins?: WorkboxPlugin[];
      networkTimeoutSeconds?: number;
    });
    handle(options: RouteHandlerCallbackOptions): Promise<Response>;
    cacheName: string;
  }
}

declare module 'workbox-cacheable-response' {
  export class CacheableResponse implements WorkboxPlugin {
    constructor(options: {
      statuses: number[];
    });
  }
}

declare module 'workbox-background-sync' {
  export class Queue implements WorkboxPlugin {
    constructor(
      name: string,
      options?: {
        maxRetentionTime?: number;
      }
    );
    pushRequest(request: Request): Promise<void>;
    replay(): Promise<void>;
  }
}

interface WorkboxPlugin {
  cacheWillUpdate?: (params: { request: Request; response: Response }) => Promise<Response | null>;
  cacheDidUpdate?: (params: { cacheName: string; request: Request; response: Response }) => void;
  cacheKeyWillBeUsed?: (params: { request: Request; mode: string }) => Promise<Request | string>;
  cachedResponseWillBeUsed?: (params: { cacheName: string; request: Request; response: Response }) => Promise<Response | null>;
  requestWillFetch?: (params: { request: Request }) => Promise<Request>;
  fetchDidFail?: (params: { error: Error; request: Request }) => void;
  fetchDidSucceed?: (params: { request: Request; response: Response }) => Promise<Response>;
}

// Service Worker types
declare global {
  interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
  }

  interface SyncEvent extends ExtendableEvent {
    readonly tag: string;
  }

  interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
  }

  interface SyncManager {
    getTags(): Promise<string[]>;
    register(tag: string): Promise<void>;
  }
}

export {};