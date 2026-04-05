import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLinks, useFocusManagement } from '../components/SkipLinks';

// Mock the useTranslation hook
vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'zh',
    t: {
      common: {
        skipToMain: '跳到主要內容',
        skipToSidebar: '跳到側邊欄',
        skipToSearch: '跳到搜尋',
        skipToMap: '跳到地圖',
      },
    },
  }),
}));

describe('SkipLinks', () => {
  it('renders all skip links', () => {
    render(<SkipLinks />);

    expect(screen.getByText(/跳到主要內容/)).toBeDefined();
    expect(screen.getByText(/跳到側邊欄/)).toBeDefined();
    expect(screen.getByText(/跳到搜尋/)).toBeDefined();
    expect(screen.getByText(/跳到地圖/)).toBeDefined();
  });

  it('has correct href attributes', () => {
    render(<SkipLinks />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '#main-content');
    expect(links[1]).toHaveAttribute('href', '#sidebar');
    expect(links[2]).toHaveAttribute('href', '#search');
    expect(links[3]).toHaveAttribute('href', '#map');
  });

  it('has proper aria-label', () => {
    render(<SkipLinks />);

    const nav = screen.getByLabelText('Skip navigation');
    expect(nav).toBeDefined();
  });

  it('has correct role', () => {
    render(<SkipLinks />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeDefined();
  });
});

describe('useFocusManagement', () => {
  it('focusFirst focuses first focusable element', () => {
    const { focusFirst } = useFocusManagement();

    const container = document.createElement('div');
    container.innerHTML = `
      <button>First</button>
      <input type="text" />
    `;
    document.body.appendChild(container);

    focusFirst(container);

    expect(document.activeElement).toBe(container.querySelector('button'));
  });

  it('focusFirst does nothing for empty container', () => {
    const { focusFirst } = useFocusManagement();

    expect(() => focusFirst(null)).not.toThrow();
  });

  it('focusFirst does nothing for container with no focusable elements', () => {
    const { focusFirst } = useFocusManagement();

    const container = document.createElement('div');
    container.innerHTML = '<span>Just text</span>';
    document.body.appendChild(container);

    focusFirst(container);

    // No error should be thrown
    expect(true).toBe(true);
  });
});
