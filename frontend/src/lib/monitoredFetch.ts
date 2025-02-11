import { fetchWithRetry, RetryConfig } from './retry';
import { monitoringService } from './monitoring/service';
import { FetchOptions } from './api/cache';
import { clientEnv } from './config/client-env';
import logger from './logger';

const DEBUG = process.env.DEBUG === 'true';

function getFullUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  
  // If we're on the client side, use the current origin
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  // On the server side, use the Strapi URL directly
  const strapiUrl = process.env.STRAPI_URL;
  if (url.startsWith('/api/proxy/')) {
    const apiPath = url.replace('/api/proxy/', '');
    return `${strapiUrl}/api/${apiPath}`;
  }
  
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
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
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Request]', {
        endpoint,
        url: fullUrl,
        method: options?.method || 'GET',
        headers: {
          ...options?.headers,
          'Authorization': '[REDACTED]'
        }
      });
    }

    // Get the token and ensure it's properly formatted
    const token = clientEnv.strapiToken;
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const response = await fetchWithRetry(fullUrl, {
      ...options,
      method: options?.method || 'GET',
      mode: 'cors',
      headers: {
        ...options?.headers,
        'Authorization': formattedToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, retryConfig);

    if (response.status === 401) {
      console.error('[Auth Error] Token:', token ? '[REDACTED]' : 'MISSING');
      throw new Error('Authentication failed: Invalid or expired token');
    }

    if (!response.ok) {
      // Log response details for debugging
      console.error('[API Error]', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    monitoringService.trackRequest({
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
    if (DEBUG) {
      logUniqueErrors(fullUrl, options?.method || 'GET', status, error);
    }

    monitoringService.trackRequest({
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
