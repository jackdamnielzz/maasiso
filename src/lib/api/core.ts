import { APIError } from './types';
import { monitoredFetch } from '../monitoredFetch';

// Base URL and authentication handling
const getBaseUrl = () => {
  // For direct API calls, always use the backend URL
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:1337';
  }
  
  // For client-side calls, use the current origin
  return window.location.origin;
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

// Direct Strapi request helper
export async function fetchFromStrapi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

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