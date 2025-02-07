import { 
  AuthError, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  ResetPasswordCredentials, 
  StrapiAuthResponse,
  User 
} from './types/auth';

/**
 * Authentication utilities
 * These functions are prepared for future implementation of user accounts
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

/**
 * Normalizes a Strapi user object to our internal User type
 */
export function normalizeUser(strapiUser: StrapiAuthResponse['user']): User {
  return {
    id: strapiUser.id,
    username: strapiUser.username,
    email: strapiUser.email,
    createdAt: strapiUser.createdAt,
    updatedAt: strapiUser.updatedAt,
  };
}

/**
 * Handles authentication errors
 */
interface StrapiErrorResponse {
  response?: {
    data?: {
      statusCode: number;
      error: string;
      message: string | string[];
    };
  };
}

export function handleAuthError(error: StrapiErrorResponse): AuthError {
  if (error.response?.data) {
    return {
      statusCode: error.response.data.statusCode,
      error: error.response.data.error,
      message: Array.isArray(error.response.data.message) 
        ? error.response.data.message 
        : [error.response.data.message],
    };
  }
  
  return {
    statusCode: 500,
    error: 'Internal Server Error',
    message: ['An unexpected error occurred'],
  };
}

/**
 * Future implementation: Login with email/username and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier: credentials.identifier,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    throw handleAuthError(await response.json());
  }

  const data = await response.json();
  return {
    jwt: data.jwt,
    user: normalizeUser(data.user),
  };
}

/**
 * Future implementation: Register a new user
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw handleAuthError(await response.json());
  }

  const data = await response.json();
  return {
    jwt: data.jwt,
    user: normalizeUser(data.user),
  };
}

/**
 * Future implementation: Request password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw handleAuthError(await response.json());
  }
}

/**
 * Future implementation: Reset password with token
 */
export async function resetPassword(credentials: ResetPasswordCredentials): Promise<void> {
  const response = await fetch(`${STRAPI_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw handleAuthError(await response.json());
  }
}

/**
 * Future implementation: Get current user profile
 */
export async function getProfile(jwt: string): Promise<User> {
  const response = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!response.ok) {
    throw handleAuthError(await response.json());
  }

  const data = await response.json();
  return normalizeUser(data);
}
