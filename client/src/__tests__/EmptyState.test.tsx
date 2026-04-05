import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState, MiniEmptyState } from '../components/EmptyState';

// Mock translations
vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'zh',
    t: {
      common: {
        clearSearch: '清除搜尋',
        noLocations: '此地區沒有地點',
        noFavorites: '還沒有收藏',
      },
    },
  }),
}));

describe('EmptyState', () => {
  it('renders no-results type with search query', () => {
    const onAction = vi.fn();
    const { container } = render(
      <EmptyState type="no-results" searchQuery="測試" onAction={onAction} />
    );

    expect(container.textContent).toContain('找不到「測試」的結果');
    expect(container.textContent).toContain('清除搜尋');
  });

  it('renders no-favorites type', () => {
    const { container } = render(<EmptyState type="no-favorites" />);

    expect(container.textContent).toContain('還沒有收藏');
    expect(container.textContent).toContain('點擊心形圖標來收藏喜愛的地點');
  });

  it('renders no-visited type', () => {
    const { container } = render(<EmptyState type="no-visited" />);

    expect(container.textContent).toContain('還沒有去過的地方');
  });

  it('renders error type', () => {
    const { container } = render(<EmptyState type="error" />);

    expect(container.textContent).toContain('載入失敗');
    expect(container.textContent).toContain('請檢查網路連線或稍後再試');
  });

  it('calls onAction when action button is clicked', () => {
    const onAction = vi.fn();
    render(<EmptyState type="no-results" searchQuery="test" onAction={onAction} />);

    fireEvent.click(screen.getByText(/清除搜尋/));
    expect(onAction).toHaveBeenCalled();
  });

  it('shows suggestions for no-results type', () => {
    const { container } = render(<EmptyState type="no-results" />);

    expect(container.textContent).toContain('建議');
    expect(container.textContent).toContain('嘗試更廣泛的搜尋關鍵詞');
  });
});

describe('MiniEmptyState', () => {
  it('renders message correctly', () => {
    const { container } = render(<MiniEmptyState message="沒有更多結果" />);
    expect(container.textContent).toContain('沒有更多結果');
  });

  it('has proper role for accessibility', () => {
    const { container } = render(<MiniEmptyState message="test" />);
    expect(container.querySelector('[role="status"]')).toBeTruthy();
  });
});
