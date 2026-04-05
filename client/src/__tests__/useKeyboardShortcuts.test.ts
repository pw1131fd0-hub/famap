import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts, createNavigationShortcuts } from '../hooks/useKeyboardShortcuts';

// Mock the callback
const mockAction = vi.fn();

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    mockAction.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is defined as a function', () => {
    expect(typeof useKeyboardShortcuts).toBe('function');
  });

  it('creates navigation shortcuts with correct structure', () => {
    const shortcuts = createNavigationShortcuts({
      onFindMe: mockAction,
      onToggleSidebar: mockAction,
      onSearch: mockAction,
      onToggleDarkMode: mockAction,
      onLanguageSwitch: mockAction,
    });

    expect(shortcuts).toHaveLength(5);
    expect(shortcuts[0].key).toBe('m');
    expect(shortcuts[0].description).toBe('Toggle sidebar');
    expect(shortcuts[1].key).toBe('f');
    expect(shortcuts[1].description).toBe('Find my location');
    expect(shortcuts[2].key).toBe('/');
    expect(shortcuts[2].description).toBe('Focus search');
  });

  it('creates shortcuts with ctrl modifier', () => {
    const shortcuts = createNavigationShortcuts({});
    const ctrlShortcut = shortcuts.find(s => s.ctrl);

    expect(ctrlShortcut).toBeDefined();
    expect(ctrlShortcut?.key).toBe('d');
    expect(ctrlShortcut?.description).toBe('Toggle dark mode');
  });

  it('handles action being undefined', () => {
    const shortcuts = createNavigationShortcuts({});

    shortcuts.forEach(shortcut => {
      // Should not throw when action is called
      expect(() => shortcut.action?.()).not.toThrow();
    });
  });
});

describe('createNavigationShortcuts', () => {
  it('returns array of correct length', () => {
    const shortcuts = createNavigationShortcuts({});
    expect(Array.isArray(shortcuts)).toBe(true);
    expect(shortcuts.length).toBeGreaterThan(0);
  });

  it('each shortcut has required properties', () => {
    const shortcuts = createNavigationShortcuts({});

    shortcuts.forEach(shortcut => {
      expect(shortcut).toHaveProperty('key');
      expect(shortcut).toHaveProperty('action');
      expect(shortcut).toHaveProperty('description');
      expect(typeof shortcut.key).toBe('string');
      expect(typeof shortcut.description).toBe('string');
    });
  });
});
