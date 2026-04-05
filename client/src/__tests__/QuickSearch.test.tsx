// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QuickSearch } from '../components/QuickSearch';
import type { Location, PaginatedLocationsResponse } from '../types';

// Mock the locationApi
vi.mock('../services/api', () => ({
  locationApi: {
    search: vi.fn(),
    getFeatured: vi.fn(),
    getNearby: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
  },
}));

import { locationApi } from '../services/api';

const mockLocation: Location = {
  id: '1',
  name: { zh: '大安森林公園', en: 'Daan Forest Park' },
  category: 'park',
  coordinates: { lat: 25.031, lng: 121.536 },
  address: { zh: '台北市大安區新生南路二段1號', en: 'Daan District, Taipei' },
  description: { zh: '台北最大森林公園', en: 'Largest forest park in Taipei' },
  averageRating: 4.8,
  facilities: ['playground', 'public_toilet'],
};

const mockResponse: PaginatedLocationsResponse = {
  items: [mockLocation],
  total: 1,
  page: 1,
  page_size: 6,
  has_next: false,
  has_prev: false,
};

const emptyResponse: PaginatedLocationsResponse = {
  items: [],
  total: 0,
  page: 1,
  page_size: 6,
  has_next: false,
  has_prev: false,
};

describe('QuickSearch', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default placeholder in Chinese', () => {
    render(<QuickSearch lang="zh" />);
    expect(screen.getByPlaceholderText(/搜尋地點/)).toBeTruthy();
  });

  it('renders with English placeholder', () => {
    render(<QuickSearch lang="en" />);
    expect(screen.getByPlaceholderText(/Search locations/)).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    render(<QuickSearch lang="zh" placeholder="自訂搜尋" />);
    expect(screen.getByPlaceholderText('自訂搜尋')).toBeTruthy();
  });

  it('calls locationApi.search after debounce', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockResolvedValue(mockResponse);
    render(<QuickSearch lang="zh" onSelectLocation={mockOnSelect} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '大安' } });
    expect(locationApi.search).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(locationApi.search).toHaveBeenCalledWith({ q: '大安', page_size: 6 });
    vi.useRealTimers();
  });

  it('shows results after search', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockResolvedValue(mockResponse);
    render(<QuickSearch lang="zh" onSelectLocation={mockOnSelect} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '大安' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
      // Allow the resolved promise to flush
      await Promise.resolve();
    });

    expect(screen.getByText('大安森林公園')).toBeTruthy();
    vi.useRealTimers();
  });

  it('shows result count', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockResolvedValue(mockResponse);
    render(<QuickSearch lang="zh" onSelectLocation={mockOnSelect} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '大安' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(screen.getByText(/找到 1 個地點/)).toBeTruthy();
    vi.useRealTimers();
  });

  it('shows no results message when empty', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockResolvedValue(emptyResponse);
    render(<QuickSearch lang="zh" />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'xyzNotExist' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(screen.getByText('找不到相關地點')).toBeTruthy();
    vi.useRealTimers();
  });

  it('shows error message on API failure', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockRejectedValue(new Error('Network error'));
    render(<QuickSearch lang="zh" />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '公園' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(screen.getByText('搜尋失敗，請再試一次')).toBeTruthy();
    vi.useRealTimers();
  });

  it('calls onSelectLocation when result is clicked', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockResolvedValue(mockResponse);
    render(<QuickSearch lang="zh" onSelectLocation={mockOnSelect} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '大安' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByText('大安森林公園'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockLocation);
    vi.useRealTimers();
  });

  it('clears query and results when X is clicked', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockResolvedValue(mockResponse);
    render(<QuickSearch lang="zh" onSelectLocation={mockOnSelect} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '大安' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(screen.getByText('大安森林公園')).toBeTruthy();

    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);

    expect(input).toHaveProperty('value', '');
    expect(screen.queryByText('大安森林公園')).toBeNull();
    vi.useRealTimers();
  });

  it('shows English results label', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockResolvedValue(mockResponse);
    render(<QuickSearch lang="en" onSelectLocation={mockOnSelect} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'park' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(screen.getByText('Found 1 location')).toBeTruthy();
    vi.useRealTimers();
  });

  it('does not search when query is empty', () => {
    vi.useFakeTimers();
    render(<QuickSearch lang="zh" />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    vi.advanceTimersByTime(300);
    expect(locationApi.search).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('shows rating for results with rating > 0', async () => {
    vi.useFakeTimers();
    vi.mocked(locationApi.search).mockResolvedValue(mockResponse);
    render(<QuickSearch lang="zh" onSelectLocation={mockOnSelect} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '大安' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(screen.getByText(/★ 4.8/)).toBeTruthy();
    vi.useRealTimers();
  });
});
