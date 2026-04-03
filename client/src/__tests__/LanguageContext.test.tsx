// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import { useTranslation } from '../i18n/useTranslation';

const TestComponent = () => {
  const { language, setLanguage, t } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="text">{t.common.all}</span>
      <button onClick={() => setLanguage('en')}>Set EN</button>
      <button onClick={() => setLanguage('zh')}>Set ZH</button>
    </div>
  );
};

describe('LanguageContext', () => {
  it('provides default language and translations', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('zh');
    expect(screen.getByTestId('text')).toHaveTextContent('全部');
  });

  it('switches language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('Set EN'));
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('text')).toHaveTextContent('All');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useTranslation must be used within a LanguageProvider');
    spy.mockRestore();
  });
});
