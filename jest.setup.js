import '@testing-library/jest-dom';

// Mock window event listeners
const listeners = {};

beforeEach(() => {
  // Reset listeners before each test
  Object.keys(listeners).forEach(event => {
    delete listeners[event];
  });

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
});

afterEach(() => {
  jest.clearAllMocks();
  document.body.className = '';
});