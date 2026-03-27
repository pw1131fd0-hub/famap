/**
 * Accessibility Helpers Tests
 * Tests for keyboard navigation, focus traps, and ARIA support
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleKeyboardNavigation,
  generateLocationLabel,
  generateAriaLabel,
  createFocusTrapHandler,
  announceToScreenReader,
  LANDMARKS,
  ariaAttributes,
  SKIP_TO_MAIN_HTML,
  SKIP_TO_MAIN_CSS,
  type KeyboardHandlers
} from '../utils/accessibilityHelpers';

describe('Accessibility Helpers', () => {
  describe('handleKeyboardNavigation', () => {
    let handlers: KeyboardHandlers;

    beforeEach(() => {
      handlers = {
        onEnter: vi.fn(),
        onEscape: vi.fn(),
        onArrowUp: vi.fn(),
        onArrowDown: vi.fn(),
        onTab: vi.fn()
      };
    });

    it('should handle Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, handlers);

      expect(handlers.onEnter).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle Escape key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, handlers);

      expect(handlers.onEscape).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle ArrowUp key', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, handlers);

      expect(handlers.onArrowUp).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle ArrowDown key', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, handlers);

      expect(handlers.onArrowDown).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle Tab key without shift', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, handlers);

      expect(handlers.onTab).toHaveBeenCalledWith(false);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle Tab key with shift', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, handlers);

      expect(handlers.onTab).toHaveBeenCalledWith(true);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not handle unknown keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, handlers);

      expect(handlers.onEnter).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should not call handler if not provided', () => {
      const minimalHandlers: KeyboardHandlers = {};
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, minimalHandlers);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should handle multiple handlers in sequence', () => {
      const event1 = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      const event2 = new KeyboardEvent('keydown', { key: 'Escape' }) as any;
      event1.preventDefault = vi.fn();
      event2.preventDefault = vi.fn();

      handleKeyboardNavigation(event1, handlers);
      handleKeyboardNavigation(event2, handlers);

      expect(handlers.onEnter).toHaveBeenCalledTimes(1);
      expect(handlers.onEscape).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateLocationLabel', () => {
    it('should combine name and category', () => {
      const label = generateLocationLabel('Taipei Zoo', 'park');
      expect(label).toBe('Taipei Zoo, park');
    });

    it('should handle names with spaces', () => {
      const label = generateLocationLabel('Taipei 101 Park', 'landmark');
      expect(label).toBe('Taipei 101 Park, landmark');
    });

    it('should handle special characters in name', () => {
      const label = generateLocationLabel("McDonald's Kids Play", 'restaurant');
      expect(label).toContain("McDonald's");
      expect(label).toContain('restaurant');
    });

    it('should handle different categories', () => {
      const categories = ['park', 'nursing_room', 'restaurant', 'medical'];
      categories.forEach(cat => {
        const label = generateLocationLabel('Test Location', cat);
        expect(label).toContain(cat);
      });
    });

    it('should return properly formatted string', () => {
      const label = generateLocationLabel('Test', 'category');
      expect(typeof label).toBe('string');
      expect(label).toMatch(/^.+, .+$/);
    });
  });

  describe('generateAriaLabel', () => {
    it('should generate label with action only', () => {
      const label = generateAriaLabel('Open');
      expect(label).toBe('Open');
    });

    it('should generate label with action and target', () => {
      const label = generateAriaLabel('Open', 'location details');
      expect(label).toBe('Open location details');
    });

    it('should handle various actions', () => {
      const actions = ['Save', 'Delete', 'Edit', 'Close', 'Submit'];
      actions.forEach(action => {
        const label = generateAriaLabel(action);
        expect(label).toBe(action);
      });
    });

    it('should handle various targets', () => {
      const targets = ['menu', 'dialog', 'sidebar', 'panel'];
      targets.forEach(target => {
        const label = generateAriaLabel('Open', target);
        expect(label).toContain('Open');
        expect(label).toContain(target);
      });
    });

    it('should not add target if undefined', () => {
      const label = generateAriaLabel('Save', undefined);
      expect(label).toBe('Save');
    });

    it('should not add target if empty string', () => {
      const label = generateAriaLabel('Save', '');
      expect(label).toBe('Save');
    });
  });

  describe('createFocusTrapHandler', () => {
    it('should create a focus trap handler', () => {
      const containerRef = { current: document.createElement('div') };
      const handler = createFocusTrapHandler(containerRef);
      expect(typeof handler).toBe('function');
    });

    it('should return early if container is not available', () => {
      const containerRef = { current: null } as unknown as React.RefObject<HTMLElement>;
      const handler = createFocusTrapHandler(containerRef);
      const event = new KeyboardEvent('keydown', { key: 'Tab' }) as any;
      event.preventDefault = vi.fn();

      handler(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should return early if key is not Tab', () => {
      const containerRef = { current: document.createElement('div') };
      const handler = createFocusTrapHandler(containerRef);
      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      event.preventDefault = vi.fn();

      handler(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should move focus to last element when Tab on first element', () => {
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);

      const containerRef = { current: container };
      const handler = createFocusTrapHandler(containerRef);

      button1.focus();
      expect(document.activeElement).toBe(button1);

      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }) as any;
      event.preventDefault = vi.fn();

      handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(button2);

      container.remove();
    });

    it('should move focus to first element when Shift+Tab on last element', () => {
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);

      const containerRef = { current: container };
      const handler = createFocusTrapHandler(containerRef);

      button2.focus();
      expect(document.activeElement).toBe(button2);

      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false }) as any;
      event.preventDefault = vi.fn();

      handler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.activeElement).toBe(button1);

      container.remove();
    });
  });

  describe('announceToScreenReader', () => {
    afterEach(() => {
      // Clean up all announcements from the DOM
      document.querySelectorAll('[aria-live]').forEach(el => el.remove());
      vi.useRealTimers();
    });

    it('should create announcement element', () => {
      vi.useFakeTimers();
      announceToScreenReader('Test announcement');

      const announcements = document.querySelectorAll('[aria-live]');
      expect(announcements.length).toBeGreaterThan(0);
    });

    it('should set aria-live to polite by default', () => {
      vi.useFakeTimers();
      announceToScreenReader('Test announcement');

      const announcements = document.querySelectorAll('[aria-live="polite"]');
      expect(announcements.length).toBeGreaterThan(0);
    });

    it('should set aria-live to assertive when specified', () => {
      vi.useFakeTimers();
      announceToScreenReader('Important announcement', 'assertive');

      const announcements = document.querySelectorAll('[aria-live="assertive"]');
      expect(announcements.length).toBeGreaterThan(0);
    });

    it('should set aria-atomic to true', () => {
      vi.useFakeTimers();
      announceToScreenReader('Test announcement');

      const announcements = document.querySelectorAll('[aria-atomic="true"]');
      expect(announcements.length).toBeGreaterThan(0);
    });

    it('should have sr-only class', () => {
      vi.useFakeTimers();
      announceToScreenReader('Test announcement');

      const announcements = document.querySelectorAll('.sr-only[aria-live]');
      expect(announcements.length).toBeGreaterThan(0);
    });

    it('should contain the announcement text', () => {
      vi.useFakeTimers();
      const message = 'Test announcement message';
      announceToScreenReader(message);

      // Get the last announcement (most recently created)
      const announcements = Array.from(document.querySelectorAll('[aria-live]'));
      const lastAnnouncement = announcements[announcements.length - 1];
      expect(lastAnnouncement?.textContent).toBe(message);
    });

    it('should remove announcement element after timeout', async () => {
      vi.useRealTimers(); // Use real timers for this test

      announceToScreenReader('Test announcement');
      const announcementBefore = document.querySelector('[aria-live]');
      expect(announcementBefore).toBeTruthy();

      // Wait for the timeout to trigger (1000ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 1100));

      const announcementAfter = document.querySelector('[aria-live]');
      expect(announcementAfter).toBeFalsy();
    });

    it('should handle multiple announcements', () => {
      vi.useFakeTimers();
      announceToScreenReader('First announcement');
      announceToScreenReader('Second announcement');

      const announcements = document.querySelectorAll('[aria-live]');
      expect(announcements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('LANDMARKS constant', () => {
    it('should define main landmark', () => {
      expect(LANDMARKS.MAIN).toBe('main');
    });

    it('should define navigation landmark', () => {
      expect(LANDMARKS.NAVIGATION).toBe('navigation');
    });

    it('should define search landmark', () => {
      expect(LANDMARKS.SEARCH).toBe('search');
    });

    it('should define complementary landmark', () => {
      expect(LANDMARKS.COMPLEMENTARY).toBe('complementary');
    });

    it('should define contentinfo landmark', () => {
      expect(LANDMARKS.CONTENTINFO).toBe('contentinfo');
    });

    it('should have all expected properties', () => {
      expect(Object.keys(LANDMARKS).length).toBe(5);
    });
  });

  describe('ariaAttributes object', () => {
    it('should define button attributes', () => {
      expect(ariaAttributes.button).toBeDefined();
      expect(ariaAttributes.button['aria-pressed']).toBe('false');
      expect(ariaAttributes.button['aria-haspopup']).toBe(false);
      expect(ariaAttributes.button['aria-expanded']).toBe(false);
    });

    it('should define modal attributes', () => {
      expect(ariaAttributes.modal).toBeDefined();
      expect(ariaAttributes.modal.role).toBe('dialog');
      expect(ariaAttributes.modal['aria-modal']).toBe(true);
    });

    it('should define menuitem attributes', () => {
      expect(ariaAttributes.menuItem).toBeDefined();
      expect(ariaAttributes.menuItem.role).toBe('menuitem');
      expect(ariaAttributes.menuItem['aria-disabled']).toBe(false);
    });

    it('should define listitem attributes', () => {
      expect(ariaAttributes.listItem).toBeDefined();
      expect(ariaAttributes.listItem.role).toBe('listitem');
      expect(ariaAttributes.listItem['aria-current']).toBe(false);
    });
  });

  describe('Skip to main content HTML', () => {
    it('should contain skip link HTML', () => {
      expect(SKIP_TO_MAIN_HTML).toContain('skip-to-main');
      expect(SKIP_TO_MAIN_HTML).toContain('#main-content');
      expect(SKIP_TO_MAIN_HTML).toContain('Skip to main content');
    });

    it('should be valid HTML', () => {
      expect(SKIP_TO_MAIN_HTML).toMatch(/<a\s+href="#main-content"/);
    });
  });

  describe('Skip to main CSS', () => {
    it('should contain skip-to-main styles', () => {
      expect(SKIP_TO_MAIN_CSS).toContain('.skip-to-main');
      expect(SKIP_TO_MAIN_CSS).toContain('position: absolute');
      expect(SKIP_TO_MAIN_CSS).toContain('left: -9999px');
    });

    it('should include focus styles', () => {
      expect(SKIP_TO_MAIN_CSS).toContain('.skip-to-main:focus');
      expect(SKIP_TO_MAIN_CSS).toContain('left: 50%');
    });

    it('should use sr-only pattern correctly', () => {
      // Off-screen but accessible when focused
      expect(SKIP_TO_MAIN_CSS).toContain('left: -9999px');
      expect(SKIP_TO_MAIN_CSS).toContain('z-index: 999');
    });
  });

  describe('Accessibility integration', () => {
    it('should provide complete keyboard navigation setup', () => {
      const handlers: KeyboardHandlers = {
        onEnter: vi.fn(),
        onEscape: vi.fn()
      };

      const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
      event.preventDefault = vi.fn();

      handleKeyboardNavigation(event, handlers);

      expect(handlers.onEnter).toHaveBeenCalled();
    });

    it('should provide ARIA labels for common patterns', () => {
      const label1 = generateAriaLabel('Save', 'location');
      const label2 = generateLocationLabel('Park Name', 'park');

      expect(label1).toBeTruthy();
      expect(label2).toBeTruthy();
    });

    it('should support landmarks and semantic regions', () => {
      expect(LANDMARKS.MAIN).toBe('main');
      expect(LANDMARKS.NAVIGATION).toBe('navigation');
      expect(LANDMARKS.SEARCH).toBe('search');
    });
  });
});
