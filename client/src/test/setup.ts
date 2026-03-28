import { vi, afterEach, beforeEach } from 'vitest';

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

  class MockElement {
    private static idCounter = 0;
    id: string = '';
    className: string = '';
    tagName: string = 'DIV';
    textContent: string = '';
    innerHTML: string = '';
    private attributes: Map<string, string> = new Map();
    private children: MockElement[] = [];
    parentNode: MockElement | null = null;

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
    }

    removeChild(child: MockElement) {
      const index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
        child.parentNode = null;
      }
    }

    remove() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
      if (this.id) elementStore.delete(this.id);
    }

    addEventListener() {}
    removeEventListener() {}
    contains(node: MockElement): boolean {
      return this === node || this.children.some(child => child.contains(node));
    }

    querySelector(): null { return null; }
    querySelectorAll(): MockElement[] { return []; }
  }

  const mockBody = new MockElement('BODY');

  (global as any).document = {
    createElement: (tag: string) => new MockElement(tag),
    getElementById: (id: string) => elementStore.get(id) || null,
    getElementsByTagName: () => [],
    getElementsByClassName: () => [],
    querySelector: () => null,
    querySelectorAll: () => [],
    body: mockBody,
  };
}

beforeEach(() => {
  if ((global as any).localStorage?.clear) {
    (global as any).localStorage.clear();
  }
});

// Global cleanup after each test
afterEach(() => {
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
});
