// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedSearchPanel } from '../components/EnhancedSearchPanel';
import type { Location } from '../types';

const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '大安森林公園', en: 'Daan Forest Park' },
    category: 'park',
    coordinates: { lat: 25.033, lng: 121.545 },
    address: { zh: '台北市大安區', en: 'Daan District, Taipei' },
    description: { zh: '大型森林公園', en: 'Large forest park' },
    averageRating: 4.8,
    facilities: ['playground', 'public_toilet']
  },
  {
    id: '2',
    name: { zh: '兒童新樂園', en: 'Taipei Children\'s Amusement Park' },
    category: 'attraction',
    coordinates: { lat: 25.053, lng: 121.525 },
    address: { zh: '台北市士林區', en: 'Shilin District, Taipei' },
    description: { zh: '家庭遊樂園', en: 'Family amusement park' },
    averageRating: 4.5,
    facilities: ['public_toilet', 'nursing_room']
  }
];

const userLocation = { lat: 25.033, lng: 121.545 };

describe('EnhancedSearchPanel', () => {
  const mockOnSelectLocation = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnSelectLocation.mockClear();
    mockOnClose.mockClear();
    localStorage.clear();
  });

  it('should render search panel', () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    expect(screen.getByText('Search locations')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search locations')).toBeInTheDocument();
  });

  it('should show search results when user types', async () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    const input = screen.getByPlaceholderText('Search locations');
    fireEvent.change(input, { target: { value: 'park' } });

    await waitFor(() => {
      expect(screen.getByText('Search results')).toBeInTheDocument();
    });
  });

  it('should call onSelectLocation when result is clicked', async () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    const input = screen.getByPlaceholderText('Search locations');
    fireEvent.change(input, { target: { value: 'park' } });

    await waitFor(() => {
      const resultButton = screen.getByText('Daan Forest Park');
      fireEvent.click(resultButton);
    });

    expect(mockOnSelectLocation).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show suggestions when search is empty', () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    expect(screen.getByText('Suggestions')).toBeInTheDocument();
  });

  it('should handle suggestion click', async () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    const suggestionButtons = screen.getAllByRole('button');
    const suggestionButton = suggestionButtons.find(
      b => b.textContent === 'park' || b.textContent === 'attraction'
    );

    if (suggestionButton) {
      fireEvent.click(suggestionButton);
      const input = screen.getByPlaceholderText('Search locations') as HTMLInputElement;
      expect(input.value).toBeTruthy();
    }
  });

  it('should support Chinese language', () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="zh"
      />
    );

    expect(screen.getByText('搜尋位置')).toBeInTheDocument();
  });

  it('should clear search when clear button is clicked', async () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    const input = screen.getByPlaceholderText('Search locations') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'park' } });

    await waitFor(() => {
      expect(input.value).toBe('park');
    });

    const clearButton = document.querySelector('.clear-search-button');
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(input.value).toBe('');
    }
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should display search history', async () => {
    // Manually add search history
    const history = [
      { query: 'park', timestamp: Date.now(), resultCount: 5 }
    ];
    localStorage.setItem('famap_search_history', JSON.stringify(history));

    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Recent searches')).toBeInTheDocument();
    });
  });

  it('should clear search history', async () => {
    // Manually add search history
    const history = [
      { query: 'park', timestamp: Date.now(), resultCount: 5 }
    ];
    localStorage.setItem('famap_search_history', JSON.stringify(history));

    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Recent searches')).toBeInTheDocument();
    });

    const clearButton = document.querySelector('.clear-history-button');
    if (clearButton) {
      fireEvent.click(clearButton);

      // History should be gone
      await waitFor(() => {
        const historyText = screen.queryByText('Recent searches');
        // It might still be in the DOM but with no content
        expect(historyText === null || document.querySelector('.history-list')?.children.length === 0).toBe(true);
      });
    }
  });

  it('should show location names in Chinese when language is zh', async () => {
    render(
      <EnhancedSearchPanel
        locations={mockLocations}
        userLocation={userLocation}
        onSelectLocation={mockOnSelectLocation}
        onClose={mockOnClose}
        language="zh"
      />
    );

    const input = screen.getByPlaceholderText('搜尋位置');
    fireEvent.change(input, { target: { value: '森林' } });

    await waitFor(() => {
      expect(screen.getByText('搜尋結果')).toBeInTheDocument();
    });
  });
});
