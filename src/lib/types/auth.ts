/**
 * Types for authentication system
 * These types are prepared for future implementation of user accounts
 */

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ResetPasswordCredentials {
  code: string;
  password: string;
  passwordConfirmation: string;
}

// Response types from Strapi
export interface StrapiAuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Error types
export interface AuthError {
  statusCode: number;
  error: string;
  message: string[];
}
