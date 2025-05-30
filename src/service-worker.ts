/// <reference lib="webworker" />
/// <reference lib="es2015" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, Route, RouteMatchCallback, RouteHandlerCallbackOptions } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponse } from 'workbox-cacheable-response';
import { Queue } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null;
    url: string;
  }>;
};

// Configuration
let API_URL: string | undefined;

// Error tracking
const trackError = (error: Error, context: Record<string, any>) => {
  const extraContext = {
    timestamp: new Date().toISOString(),
    serviceWorkerVersion: self.__WB_MANIFEST.map(item => item.revision).join(','),
    navigator: navigator.userAgent,
    ...context
  };
  console.error('Service Worker Error:', error, extraContext);
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'ERROR',
        error: {
          message: error.message,
          stack: error.stack,
          ...extraContext
        }
      });
    });
  });
};

// Take control of all pages immediately
clientsClaim();

// Precache all static assets generated by build
const manifest = self.__WB_MANIFEST.map(entry => ({
  url: entry.url,
  revision: entry.revision || undefined
}));
precacheAndRoute(manifest);

// Handle SPA navigation
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute: RouteMatchCallback = ({ request }) => {
  return request?.mode === 'navigate' || false;
};
registerRoute(navigationRoute, handler);

// Content-type specific caching strategies
const cacheStrategies = {
  // Blog posts and articles
  content: new StaleWhileRevalidate({
    cacheName: 'content-cache',
    plugins: [
      new CacheableResponse({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 3600, // 1 hour
      }),
    ],
  }),

  // News articles (shorter cache time)
  news: new NetworkFirst({
    cacheName: 'news-cache',
    plugins: [
      new CacheableResponse({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 1800, // 30 minutes
      }),
    ],
    networkTimeoutSeconds: 3,
  }),

  // Static pages
  pages: new CacheFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponse({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 86400, // 24 hours
      }),
    ],
  }),

  // Images with offline support
  images: new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponse({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 604800, // 7 days
      }),
    ],
  }),

  // Fonts and static assets
  assets: new CacheFirst({
    cacheName: 'assets-cache',
    plugins: [
      new CacheableResponse({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 2592000, // 30 days
      }),
    ],
  }),
};

// Cache effectiveness monitoring
const monitorCacheEffectiveness = async (request: Request, response: Response, cacheName: string) => {
  const startTime = performance.now();
  const cacheResponse = await caches.match(request);
  const endTime = performance.now();
  
  const metrics = {
    url: request.url,
    cacheName,
    hit: !!cacheResponse,
    duration: endTime - startTime,
    timestamp: new Date().toISOString(),
  };

  // Send metrics to client
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_METRICS',
        metrics,
      });
    });
  });

  return response;
};

// Background sync for offline mutations
const bgSyncQueue = new Queue('offline-mutations', {
  maxRetentionTime: 24 * 60 // 24 hours in minutes
});

// Register routes with content-type specific caching
const contentRoute = new Route(
  ({ url }) => {
    const path = url.pathname;
    if (path.startsWith('/api/')) {
      if (path.includes('/news/')) return 'news';
      if (path.includes('/blog/')) return 'content';
      if (path.includes('/pages/')) return 'pages';
      return false;
    }
    return false;
  },
  async (options: RouteHandlerCallbackOptions) => {
    if (!options.request) {
      return new Response('No request', { status: 400 });
    }

    const path = options.url.pathname;
    let strategy;
    
    if (path.includes('/news/')) strategy = cacheStrategies.news;
    else if (path.includes('/blog/')) strategy = cacheStrategies.content;
    else if (path.includes('/pages/')) strategy = cacheStrategies.pages;
    else return fetch(options.request);

    const response = await strategy.handle({
      ...options,
      request: options.request
    });
    return monitorCacheEffectiveness(options.request, response, strategy.cacheName);
  }
);
registerRoute(contentRoute);

// Cache static assets
const assetsRoute = new Route(
  ({ request }) => {
    if (!request) return false;
    const destination = request.destination;
    if (destination === 'image') return 'images';
    if (destination === 'font' || destination === 'style' || destination === 'script') return 'assets';
    return false;
  },
  async (options: RouteHandlerCallbackOptions) => {
    if (!options.request) return new Response('No request', { status: 400 });
    const destination = options.request.destination;
    const strategy = destination === 'image' ? cacheStrategies.images : cacheStrategies.assets;
    const response = await strategy.handle(options);
    return monitorCacheEffectiveness(options.request, response, strategy.cacheName);
  }
);
registerRoute(assetsRoute);

// Handle offline mutations
const mutationRoute = new Route(
  ({ url, request }) => {
    if (!request) return false;
    return url.pathname.startsWith('/api/') && 
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  },
  new NetworkFirst({
    cacheName: 'mutations-cache',
    plugins: [
      new CacheableResponse({
        statuses: [0, 200],
      })
    ],
  })
);
registerRoute(mutationRoute);

// Listen for offline/online events
self.addEventListener('online', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CONNECTION_STATUS',
        status: 'online'
      });
    });
  });
});

self.addEventListener('offline', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CONNECTION_STATUS',
        status: 'offline'
      });
    });
  });
});

// Handle sync events
self.addEventListener('sync', ((event: SyncEvent) => {
  if (event.tag === 'offline-mutations') {
    event.waitUntil(
      (async () => {
        try {
          await bgSyncQueue.replay();
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_STATUS',
              hasPending: false
            });
          });
        } catch (error) {
          trackError(error as Error, {
            context: 'BackgroundSync',
            tag: event.tag,
            apiUrl: API_URL
          });
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_STATUS',
              hasPending: true,
              error: error instanceof Error ? error.message : String(error)
            });
          });
        }
      })()
    );
  }
}) as EventListener);

// Handle messages from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const message = event.data as { type: string; config?: { apiUrl: string } };
  
  if (message.type === 'CONFIG' && message.config?.apiUrl) {
    API_URL = message.config.apiUrl;
    console.debug('Service Worker configured with API URL:', API_URL);
  }
});

// Skip waiting on install
self.addEventListener('install', () => {
  self.skipWaiting();
  console.debug('Service Worker installed');
});

// Log activation
self.addEventListener('activate', () => {
  console.debug('Service Worker activated');
});
