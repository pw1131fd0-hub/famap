// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import LocationAnalyticsPanel from '../components/LocationAnalyticsPanel';

// Mock the useI18n hook
vi.mock('../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    isZh: true,
  }),
}));

describe('LocationAnalyticsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with location name', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 4, 4, 3, 2]}
        reviewCount={5}
      />
    );

    expect(container.textContent).toContain('Test Park');
  });

  it('should display the average rating', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 5, 4, 4, 4]}
        reviewCount={5}
      />
    );

    // Average should be 4.4
    expect(container.textContent).toContain('4.4');
  });

  it('should display the review count', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 4, 3, 2, 1]}
        reviewCount={5}
      />
    );

    expect(container.textContent).toContain('5');
  });

  it('should display rating distribution bars', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 5, 5, 4, 4, 4, 3, 2, 1]}
        reviewCount={9}
      />
    );

    // Should show all rating levels
    expect(container.textContent).toContain('5⭐');
    expect(container.textContent).toContain('4⭐');
    expect(container.textContent).toContain('3⭐');
    expect(container.textContent).toContain('2⭐');
    expect(container.textContent).toContain('1⭐');
  });

  it('should display key metrics section', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 4, 3, 2, 1]}
        reviewCount={5}
      />
    );

    // Should have metrics
    expect(container.textContent).toContain('推薦分數'); // Recommender Score in Chinese
  });

  it('should handle zero ratings', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[]}
        reviewCount={0}
      />
    );

    expect(container.textContent).toContain('0.0');
  });

  it('should handle high ratings well', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 5, 5, 5, 5, 5, 5]}
        reviewCount={7}
      />
    );

    expect(container.textContent).toContain('5.0');
  });

  it('should handle low ratings well', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[1, 1, 1, 2, 2]}
        reviewCount={5}
      />
    );

    expect(container.textContent).toContain('1.4');
  });

  it('should include insights section', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 5, 4, 4, 4]}
        reviewCount={5}
      />
    );

    expect(container.textContent).toContain('智慧洞察');
  });

  it('should include rating distribution section', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 4, 3, 2, 1]}
        reviewCount={5}
      />
    );

    expect(container.textContent).toContain('評分分佈');
  });

  it('should render trend indicator when trend data provided', () => {
    const trendData = [
      { period: '2026-01-01', averageRating: 3.5, reviewCount: 10 },
      { period: '2026-02-01', averageRating: 4.5, reviewCount: 15 },
    ];

    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 4, 3, 2, 1]}
        reviewCount={5}
        trendData={trendData}
      />
    );

    expect(container.textContent).toContain('趨勢');
  });

  it('should handle mixed rating distribution', () => {
    const ratings = Array(50)
      .fill(null)
      .map((_, i) => {
        if (i < 10) return 1;
        if (i < 20) return 2;
        if (i < 30) return 3;
        if (i < 40) return 4;
        return 5;
      });

    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={ratings}
        reviewCount={50}
      />
    );

    expect(container.textContent).toContain('3.0'); // Average should be 3.0
  });

  it('should render engagement metric', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 5, 5, 5, 5]}
        reviewCount={5}
      />
    );

    // Should show engagement percentage
    expect(container.textContent).toMatch(/%/);
  });

  it('should display analytics header', () => {
    const { container } = render(
      <LocationAnalyticsPanel
        locationId="loc-1"
        locationName="Test Park"
        ratings={[5, 4, 3, 2, 1]}
        reviewCount={5}
      />
    );

    expect(container.textContent).toContain('位置分析');
  });
});
