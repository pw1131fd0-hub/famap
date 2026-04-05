import { useTranslation } from '../i18n/useTranslation';

export function SkipLinks() {
  const { language } = useTranslation();

  return (
    <nav className="skip-links" aria-label="Skip navigation">
      <a href="#main-content" className="skip-link">
        {language === 'zh' ? '跳到主要內容' : 'Skip to main content'}
      </a>
      <a href="#sidebar" className="skip-link">
        {language === 'zh' ? '跳到側邊欄' : 'Skip to sidebar'}
      </a>
      <a href="#search" className="skip-link">
        {language === 'zh' ? '跳到搜尋' : 'Skip to search'}
      </a>
      <a href="#map" className="skip-link">
        {language === 'zh' ? '跳到地圖' : 'Skip to map'}
      </a>
    </nav>
  );
}

// Hook to manage focus for accessibility
export function useFocusManagement() {
  const focusFirst = (container: HTMLElement | null) => {
    if (!container) return;
    const focusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  return { focusFirst, trapFocus };
}
