import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { Headers, Request, Response } from 'node-fetch';

// Set up web API globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Setup environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:1337';
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_GRAPHQL_URL = 'http://localhost:1337/graphql';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.STRAPI_API_TOKEN = 'test-token';
