// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock IntersectionObserver which isn't available in test environment
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    return null;
  }
  
  unobserve() {
    return null;
  }
  
  disconnect() {
    return null;
  }
}

// Mock fetch for API tests
global.fetch = jest.fn();

// Define window object properties that might be missing in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scroll methods
global.scrollTo = jest.fn();

// Define IntersectionObserver mock
global.IntersectionObserver = MockIntersectionObserver;

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation
});

// Mock navigator.onLine
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(i => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Suppress React 18 console errors/warnings
const originalConsoleError = console.error;
jest.spyOn(console, 'error').mockImplementation((...args) => {
  if (args[0]?.includes('ReactDOM.render is no longer supported')) {
    return;
  }
  if (args[0]?.includes('act(...)')) {
    return;
  }
  originalConsoleError(...args);
}); 