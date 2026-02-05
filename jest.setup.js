import '@testing-library/jest-dom';

const mockAnnounceMessage = jest.fn();

// Provide stable public env defaults for hook/component tests.
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Polyfill Web Fetch API globals in environments where jsdom doesn't expose them.
if (
  typeof globalThis.Request === 'undefined' ||
  typeof globalThis.Response === 'undefined' ||
  typeof globalThis.Headers === 'undefined'
) {
  const fetchPolyfill = require('node-fetch');
  globalThis.Request = fetchPolyfill.Request;
  globalThis.Response = fetchPolyfill.Response;
  globalThis.Headers = fetchPolyfill.Headers;
  if (typeof globalThis.fetch === 'undefined') {
    globalThis.fetch = fetchPolyfill;
  }
}

// Keep Next.js image usage deterministic in unit tests.
jest.mock('next/image', () => {
  const React = require('react');

  function MockNextImage(props) {
    const {
      src,
      alt = '',
      fill,
      loader,
      quality,
      sizes,
      priority,
      placeholder,
      blurDataURL,
      unoptimized,
      onLoad,
      onError,
      onLoadingComplete,
      ...rest
    } = props;

    const normalizedSrc =
      typeof src === 'string'
        ? src
        : (src && typeof src === 'object' && 'src' in src ? src.src : '');

    return React.createElement('img', {
      src: normalizedSrc,
      alt,
      sizes,
      loading: priority ? 'eager' : rest.loading,
      onLoad: (event) => {
        onLoad?.(event);
        if (onLoadingComplete) {
          onLoadingComplete(event.currentTarget);
        }
      },
      onError,
      ...rest,
    });
  }

  return {
    __esModule: true,
    default: MockNextImage,
  };
});

jest.mock('next/link', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ href, children, ...rest }) =>
      React.createElement(
        'a',
        {
          href: typeof href === 'string' ? href : href?.pathname || '',
          ...rest,
        },
        children
      ),
  };
});

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Provide a default accessibility context for component tests.
jest.mock('@/providers/AccessibilityProvider', () => {
  const testPath = expect.getState().testPath || '';
  if (testPath.includes('AccessibilityProvider.test.tsx')) {
    return jest.requireActual('@/providers/AccessibilityProvider');
  }

  const React = require('react');
  return {
    AccessibilityProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    useAccessibility: () => ({
      isKeyboardUser: false,
      focusVisible: false,
      announceMessage: mockAnnounceMessage,
    }),
  };
});

// Mock window event listeners
const listeners = {};

beforeEach(() => {
  mockAnnounceMessage.mockReset();

  // Reset listeners before each test
  Object.keys(listeners).forEach(event => {
    delete listeners[event];
  });

  if (typeof window !== 'undefined') {
    // Mock addEventListener
    window.addEventListener = jest.fn((event, callback) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(callback);
    });

    // Mock removeEventListener
    window.removeEventListener = jest.fn((event, callback) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      }
    });

    // Helper to trigger events
    window.triggerEvent = (event, data) => {
      if (listeners[event]) {
        listeners[event].forEach(callback => callback(data));
      }
    };
  }
});

afterEach(() => {
  jest.clearAllMocks();
  if (typeof document !== 'undefined') {
    document.body.className = '';
  }
});
