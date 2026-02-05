import { APIError } from './types';
import { monitoredFetch } from '../monitoredFetch';

// Base URL and authentication handling
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

const API_TOKEN = process.env.STRAPI_TOKEN;

const toProxyPath = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized.startsWith('/api/proxy/')) {
    return normalized;
  }

  if (normalized.startsWith('/api/')) {
    return `/api/proxy/${normalized.slice('/api/'.length)}`;
  }

  return normalized;
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  return headers;
};

// Base fetch function with monitoring
export async function fetchWithBaseUrl<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      throw new APIError('API base URL is not configured', 500);
    }

    const resolvedPath = toProxyPath(path);
    const url = `${baseUrl}${resolvedPath.startsWith('/') ? '' : '/'}${resolvedPath}`;
    const response = await monitoredFetch(
      path,
      url,
      {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        }
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
}

// Direct Strapi request helper
export async function fetchFromStrapi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = process.env.STRAPI_TOKEN;

  if (!strapiUrl || !token) {
    throw new APIError('Missing Strapi configuration', 500);
  }

  const url = `${strapiUrl}/api/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new APIError(`Strapi request failed: ${response.statusText}`, response.status);
  }

  return response.json();
}

export { getBaseUrl, getAuthHeaders };
