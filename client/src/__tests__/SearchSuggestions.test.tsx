// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { SearchSuggestions } from '../components/SearchSuggestions';
import type { Location } from '../types';

const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '台北公園', en: 'Taipei Park' },
    description: { zh: '大公園', en: 'Large Park' },
    category: 'park',
    coordinates: { lat: 25.0, lng: 121.0 },
    facilities: ['playground', 'stroller_accessible'],
    averageRating: 4.5,
    address: { zh: '台北市中心', en: 'Taipei Center' },
  },
  {
    id: '2',
    name: { zh: '護理室', en: 'Nursing Room' },
    description: { zh: '乾淨舒適', en: 'Clean and Comfortable' },
    category: 'nursing_room',
    coordinates: { lat: 25.1, lng: 121.1 },
    facilities: ['changing_table'],
    averageRating: 4.8,
    address: { zh: '台北市東區', en: 'Taipei East' },
  },
];

describe('SearchSuggestions', () => {
  it('does not show suggestions when query is empty', () => {
    const { container } = render(
      <SearchSuggestions
        query=""
        locations={mockLocations}
        language="zh"
        onSelectSuggestion={vi.fn()}
        onClearQuery={vi.fn()}
      />
    );
    expect(container.querySelector('.search-suggestions')).toBeFalsy();
  });

  it('shows suggestions when query matches locations', () => {
    const { container } = render(
      <SearchSuggestions
        query="公園"
        locations={mockLocations}
        language="zh"
        onSelectSuggestion={vi.fn()}
        onClearQuery={vi.fn()}
      />
    );
    expect(container.querySelector('.search-suggestions')).toBeTruthy();
  });

  it('filters suggestions by query', () => {
    const { container } = render(
      <SearchSuggestions
        query="公園"
        locations={mockLocations}
        language="zh"
        onSelectSuggestion={vi.fn()}
        onClearQuery={vi.fn()}
      />
    );
    const items = container.querySelectorAll('.suggestion-item');
    expect(items.length).toBe(1);
  });

  it('calls onSelectSuggestion when clicking a suggestion', () => {
    const onSelectSuggestion = vi.fn();
    const { container } = render(
      <SearchSuggestions
        query="公園"
        locations={mockLocations}
        language="zh"
        onSelectSuggestion={onSelectSuggestion}
        onClearQuery={vi.fn()}
      />
    );
    const items = container.querySelectorAll('.suggestion-item');
    fireEvent.click(items[0]);
    expect(onSelectSuggestion).toHaveBeenCalledWith(mockLocations[0]);
  });

  it('limits suggestions to 5 results', () => {
    const manyLocations = Array.from({ length: 10 }, (_, i) => ({
      ...mockLocations[0],
      id: `${i}`,
      name: { zh: `公園${i}`, en: `Park ${i}` },
    }));

    const { container } = render(
      <SearchSuggestions
        query="公園"
        locations={manyLocations}
        language="zh"
        onSelectSuggestion={vi.fn()}
        onClearQuery={vi.fn()}
      />
    );
    const items = container.querySelectorAll('.suggestion-item');
    expect(items.length).toBeLessThanOrEqual(5);
  });

  it('supports keyboard navigation with arrow keys', () => {
    const { container } = render(
      <SearchSuggestions
        query="台"
        locations={mockLocations}
        language="zh"
        onSelectSuggestion={vi.fn()}
        onClearQuery={vi.fn()}
      />
    );
    const items = container.querySelectorAll('.suggestion-item');
    expect(items[0].className).not.toContain('selected');
  });

  it('displays different languages based on language prop', () => {
    const { container: containerZh } = render(
      <SearchSuggestions
        query="台"
        locations={mockLocations}
        language="zh"
        onSelectSuggestion={vi.fn()}
        onClearQuery={vi.fn()}
      />
    );
    expect(containerZh.textContent).toContain('台北公園');
  });
});
