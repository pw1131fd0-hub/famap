/**
 * Accessibility Helpers
 * Provides utilities for enhanced keyboard navigation and ARIA support
 */

export interface KeyboardHandlers {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onTab?: (shiftKey?: boolean) => void;
}

/**
 * Handle common keyboard navigation patterns
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent<HTMLElement>,
  handlers: KeyboardHandlers
): void {
  switch (event.key) {
    case 'Enter':
      if (handlers.onEnter) {
        event.preventDefault();
        handlers.onEnter();
      }
      break;
    case 'Escape':
      if (handlers.onEscape) {
        event.preventDefault();
        handlers.onEscape();
      }
      break;
    case 'ArrowUp':
      if (handlers.onArrowUp) {
        event.preventDefault();
        handlers.onArrowUp();
      }
      break;
    case 'ArrowDown':
      if (handlers.onArrowDown) {
        event.preventDefault();
        handlers.onArrowDown();
      }
      break;
    case 'Tab':
      if (handlers.onTab) {
        event.preventDefault();
        handlers.onTab(event.shiftKey);
      }
      break;
    default:
      break;
  }
}

/**
 * Generate accessible label for a location
 */
export function generateLocationLabel(name: string, category: string): string {
  return `${name}, ${category}`;
}

/**
 * Generate accessible description for action buttons
 */
export function generateAriaLabel(action: string, target?: string): string {
  if (target) {
    return `${action} ${target}`;
  }
  return action;
}

/**
 * Create focus trap handler for modals - keeps focus within the modal
 */
export function createFocusTrapHandler(containerRef: React.RefObject<HTMLElement>): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Screen reader only class
  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remove after announcement is made
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

/**
 * Create semantic landmark regions
 */
export const LANDMARKS = {
  MAIN: 'main',
  NAVIGATION: 'navigation',
  SEARCH: 'search',
  COMPLEMENTARY: 'complementary', // for sidebars
  CONTENTINFO: 'contentinfo' // for footer
};

/**
 * ARIA attributes for common patterns
 */
export const ariaAttributes = {
  button: {
    'aria-pressed': 'false',
    'aria-haspopup': false,
    'aria-expanded': false
  },
  modal: {
    'role': 'dialog',
    'aria-modal': true,
    'aria-labelledby': '',
    'aria-describedby': ''
  },
  menuItem: {
    'role': 'menuitem',
    'aria-disabled': false
  },
  listItem: {
    'role': 'listitem',
    'aria-current': false
  }
};

/**
 * Skip to main content link HTML (should be placed at the start of body)
 */
export const SKIP_TO_MAIN_HTML = `
  <a href="#main-content" class="skip-to-main">
    Skip to main content
  </a>
`;

/**
 * CSS for skip-to-main link
 */
export const SKIP_TO_MAIN_CSS = `
  .skip-to-main {
    position: absolute;
    left: -9999px;
    z-index: 999;
    padding: 1em;
    background: #000;
    color: #fff;
    text-decoration: none;
  }

  .skip-to-main:focus {
    left: 50%;
    transform: translateX(-50%);
    top: 0;
  }
`;
