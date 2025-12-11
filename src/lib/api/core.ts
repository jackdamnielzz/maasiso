import { APIError } from './types';
import { monitoredFetch } from '../monitoredFetch';

// Base URL and authentication handling
const getBaseUrl = () => {
  // Always use the API proxy for requests
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  console.log('[core.ts getBaseUrl] Environment Debug:', {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    isServer: typeof window === 'undefined',
    nodeEnv: process.env.NODE_ENV
  });
  
  return apiUrl || '/api/proxy';
};

const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

const getAuthHeaders = () => {
  if (!API_TOKEN) {
    throw new APIError('API token is missing', 401);
  }
  return {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  };
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

    const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
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

// Direct Strapi request helper - now uses proxy
export async function fetchFromStrapi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/proxy/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new APIError(`API request failed: ${response.statusText}`, response.status);
  }

  return response.json();
}

export { getBaseUrl, getAuthHeaders };