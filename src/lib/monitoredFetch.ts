import { fetchWithRetry, RetryConfig } from './retry';
import { monitoringService } from './monitoring/service';
import { FetchOptions } from './api/cache';
import logger from './logger';
import { MonitoringEventTypes } from './monitoring/types';

function getFullUrl(url: string): string {
  // If it's already a full URL, return it
  if (url.startsWith('http')) {
    return url;
  }

  // Use current origin on client side
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // Use backend URL for server-side requests
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:1337';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Wraps fetchWithRetry with performance monitoring
 */
export async function monitoredFetch(
  endpoint: string,
  url: string,
  options?: FetchOptions,
  retryConfig?: RetryConfig
): Promise<Response> {
  const startTime = Date.now();
  const fullUrl = getFullUrl(url);

  try {
    // Always log request details
    console.log('[API Request] FULL DETAILS:', {
      endpoint,
      url: fullUrl,
      method: options?.method || 'GET',
      headers: {
        ...options?.headers,
        'Authorization': '[REDACTED]'
      },
      body: options?.body ? JSON.stringify(options.body) : 'No body'
    });

    const response = await fetchWithRetry(fullUrl, {
      ...options,
      method: options?.method || 'GET',
      mode: 'cors',
      headers: {
        ...options?.headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, retryConfig);

    if (!response.ok) {
      // Log response details for debugging
      // Get response body for error details if possible
      const errorBody = await response.text().catch(() => 'Could not read error body');
      
      console.error('[API Error] FULL DETAILS', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorBody
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    monitoringService.trackEvent(MonitoringEventTypes.REQUEST, {
      method: options?.method || 'GET',
      url: fullUrl,
      duration: Date.now() - startTime,
      status: response.status
    });

    return response;
  } catch (error) {
    const status = error instanceof Error && 'status' in error
      ? (error as { status: number }).status
      : 500;

    const currentTime = Date.now();
    
    // Always log errors in detail
    console.error('[Fetch Error] FULL DETAILS', {
      url: fullUrl,
      method: options?.method || 'GET',
      status,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    monitoringService.trackEvent(MonitoringEventTypes.REQUEST, {
      method: options?.method || 'GET',
      url: fullUrl,
      duration: currentTime - startTime,
      status,
      error: error instanceof Error ? error : new Error(String(error))
    });

    throw error;
  }
}

function logUniqueErrors(url: string, method: string, status: number, error: unknown) {
  const errorKey = `${url}:${method}:${status}`;
  if (!loggedErrors.has(errorKey)) {
    loggedErrors.add(errorKey);
    logger.error('[API Error]', {
      url,
      method,
      status,
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

const loggedErrors = new Set<string>();
