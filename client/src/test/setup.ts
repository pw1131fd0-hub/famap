import { vi, afterEach, beforeEach } from 'vitest';

// Import jest-dom matchers when running in jsdom environment
if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
  import('@testing-library/jest-dom');
}

// Setup global storage implementations for Node.js environment
const createStorageImpl = (): Storage => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length,
  } as Storage;
};

if (typeof (global as any).localStorage === 'undefined') {
  (global as any).localStorage = createStorageImpl();
}
if (typeof (global as any).sessionStorage === 'undefined') {
  (global as any).sessionStorage = createStorageImpl();
}

// Setup minimal DOM implementations for Node.js environment
// This enables tests that need document and element APIs to run
if (typeof (global as any).document === 'undefined') {
  const elementStore = new Map<string, any>();
  const eventListeners: Record<string, (() => void)[]> = {};

  class MockElement {
    private static idCounter = 0;
    id: string = '';
    className: string = '';
    tagName: string = 'DIV';
    textContent: string = '';
    innerHTML: string = '';
    style: Record<string, any> = {};
    private attributes: Map<string, string> = new Map();
    private children: MockElement[] = [];
    parentNode: MockElement | null = null;
    private listeners: Map<string, (() => void)[]> = new Map();

    constructor(tagName: string = 'DIV') {
      this.tagName = tagName.toUpperCase();
    }

    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
      if (name === 'id') this.id = value;
      if (name === 'class') this.className = value;
    }

    getAttribute(name: string): string | null {
      return this.attributes.get(name) || null;
    }

    appendChild(child: MockElement) {
      child.parentNode = this;
      this.children.push(child);
      if (child.id) elementStore.set(child.id, child);
      return child;
    }

    removeChild(child: MockElement) {
      const index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
        child.parentNode = null;
      }
      return child;
    }

    remove() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
      if (this.id) elementStore.delete(this.id);
    }

    addEventListener(event: string, listener: () => void) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)!.push(listener);
    }

    removeEventListener(event: string, listener: () => void) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      }
    }

    contains(node: MockElement): boolean {
      return this === node || this.children.some(child => child.contains(node));
    }

    querySelector(_selector: string): null { return null; }
    querySelectorAll(_selector: string): MockElement[] { return []; }

    getBoundingClientRect() {
      return {
        top: 0, left: 0, bottom: 0, right: 0,
        width: 0, height: 0, x: 0, y: 0
      };
    }
  }

  const mockBody = new MockElement('BODY');

  // Setup window object with all necessary APIs
  (global as any).window = {
    document: null, // Will be set below
    innerWidth: 1024,
    innerHeight: 768,
    innerHeight: 768,
    outerWidth: 1024,
    outerHeight: 800,
    devicePixelRatio: 1,
    location: {
      href: 'http://localhost/',
      origin: 'http://localhost',
      pathname: '/',
      search: '',
      hash: '',
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
    },
    localStorage: (global as any).localStorage,
    sessionStorage: (global as any).sessionStorage,
    addEventListener: (event: string, listener: () => void) => {
      if (!eventListeners[event]) eventListeners[event] = [];
      eventListeners[event].push(listener);
    },
    removeEventListener: (event: string, listener: () => void) => {
      if (eventListeners[event]) {
        const index = eventListeners[event].indexOf(listener);
        if (index > -1) eventListeners[event].splice(index, 1);
      }
    },
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    getComputedStyle: () => ({}),
    requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0),
    cancelAnimationFrame: (id: number) => clearTimeout(id),
  };

  (global as any).document = {
    createElement: (_tag: string) => new MockElement(_tag),
    getElementById: (id: string) => elementStore.get(id) || null,
    getElementsByTagName: (_tag: string) => [],
    getElementsByClassName: (_name: string) => [],
    querySelector: (_selector: string) => null,
    querySelectorAll: (_selector: string) => [],
    body: mockBody,
    documentElement: mockBody,
    addEventListener: (event: string, listener: () => void) => {
      if (!eventListeners[event]) eventListeners[event] = [];
      eventListeners[event].push(listener);
    },
    removeEventListener: (event: string, listener: () => void) => {
      if (eventListeners[event]) {
        const index = eventListeners[event].indexOf(listener);
        if (index > -1) eventListeners[event].splice(index, 1);
      }
    },
  };

  (global as any).window.document = (global as any).document;

  // Add DOMParser
  (global as any).DOMParser = class DOMParser {
    parseFromString(_html: string, _type: string) {
      return { documentElement: mockBody };
    }
  };

  // Add other global APIs
  if (typeof (global as any).navigator === 'undefined') {
    (global as any).navigator = {
      userAgent: 'Node.js Test Environment',
      language: 'en-US',
      onLine: true,
    };
  } else {
    // Navigator already exists, just enhance it
    if (!(global as any).navigator.userAgent) {
      (global as any).navigator.userAgent = 'Node.js Test Environment';
    }
    if (!(global as any).navigator.language) {
      (global as any).navigator.language = 'en-US';
    }
  }

  (global as any).fetch = vi.fn();
  (global as any).XMLHttpRequest = class XMLHttpRequest {};

  // Add ResizeObserver
  (global as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Add IntersectionObserver
  (global as any).IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Add MutationObserver
  (global as any).MutationObserver = class MutationObserver {
    observe() {}
    disconnect() {}
  };

  // Add URL and URLSearchParams
  if (typeof (global as any).URL === 'undefined') {
    (global as any).URL = class URL {
      href: string;
      origin: string;
      pathname: string;
      search: string;
      hash: string;

      constructor(url: string, _base?: string) {
        this.href = url;
        this.origin = 'http://localhost';
        this.pathname = '/';
        this.search = '';
        this.hash = '';
      }
    };
  }

  if (typeof (global as any).URLSearchParams === 'undefined') {
    (global as any).URLSearchParams = class URLSearchParams {
      private data: Map<string, string> = new Map();

      constructor(init?: string | Record<string, string>) {
        if (typeof init === 'string') {
          init.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            this.data.set(decodeURIComponent(key), decodeURIComponent(value || ''));
          });
        } else if (init) {
          Object.entries(init).forEach(([key, value]) => {
            this.data.set(key, value);
          });
        }
      }

      get(name: string) {
        return this.data.get(name) || null;
      }

      set(name: string, value: string) {
        this.data.set(name, value);
      }

      has(name: string) {
        return this.data.has(name);
      }

      delete(name: string) {
        this.data.delete(name);
      }

      toString() {
        return Array.from(this.data.entries())
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&');
      }
    };
  }
}

beforeEach(() => {
  if ((global as any).localStorage?.clear) {
    (global as any).localStorage.clear();
  }
});

// Global cleanup after each test
afterEach(async () => {
  vi.clearAllMocks();
  vi.clearAllTimers();

  try {
    if ((global as any).localStorage?.clear) {
      (global as any).localStorage.clear();
    }
  } catch {
    // Ignore errors
  }

  try {
    if ((global as any).sessionStorage?.clear) {
      (global as any).sessionStorage.clear();
    }
  } catch {
    // Ignore errors
  }

  // Reset circuit breaker state for api tests
  try {
    const api = await import('../services/api');
    if (api.circuitBreakerUtils?.reset) {
      api.circuitBreakerUtils.reset();
    }
  } catch {
    // Ignore errors if api module not loaded
  }
});
