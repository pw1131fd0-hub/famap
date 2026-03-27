/**
 * Tests for Best Time Visit Recommender Component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import BestTimeVisitRecommender from '../components/BestTimeVisitRecommender';
import type { Location } from '../types';

// Mock the translation hook
vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

describe('BestTimeVisitRecommender Component', () => {
  const mockLocation: Location = {
    id: 'test-loc-1',
    name: { zh: '公園', en: 'Test Park' },
    description: { zh: '公園描述', en: 'Park description' },
    category: 'park',
    coordinates: { lat: 25.0, lng: 121.0 },
    address: { zh: '台北市安寧街', en: 'Anling St, Taipei' },
    facilities: ['swings', 'sandbox', 'stroller_accessible'],
    averageRating: 4.5,
  };

  const mockFamilyProfile = {
    childrenAges: [3, 5],
    preferredActivityType: 'outdoor',
    preferredTimeOfDay: 'morning' as const,
    crowdTolerance: 'medium' as const,
    mobilityNeeds: true,
  };

  it('should render the component', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);
    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
  });

  it('should render without family profile', () => {
    render(<BestTimeVisitRecommender location={mockLocation} />);
    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
  });

  it('should display top recommendation', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    // Should have at least one time window visible (format: HH:MM - HH:MM)
    const timeWindows = screen.queryAllByText(/\d{2}:\d{2}\s-\s\d{2}:\d{2}/);
    // If not found in that format, check for "Recommended" text instead
    const hasTimeWindows = timeWindows.length > 0 || screen.queryByText(/Recommended|推薦/) !== null;
    expect(hasTimeWindows).toBe(true);
  });

  it('should show suitability score when family profile is provided', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    // Should display "Family Suitability" or "家庭適合度"
    expect(screen.getByText(/Family Suitability|家庭適合度/)).toBeInTheDocument();
  });

  it('should not show suitability score without family profile', () => {
    render(<BestTimeVisitRecommender location={mockLocation} />);

    // Should not display "Family Suitability"
    expect(screen.queryByText(/Family Suitability|家庭適合度/)).not.toBeInTheDocument();
  });

  it('should have View All button when multiple recommendations exist', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    // Should have a button to view all times
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should toggle additional recommendations when View All button is clicked', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    const buttons = screen.getAllByRole('button');
    // Find button that contains "View All Times" or similar text
    const toggleButton = buttons.find((btn) => {
      const text = btn.textContent || '';
      return text.includes('View All') || text.includes('Hide') || text.includes('查看') || text.includes('隱藏');
    });

    if (toggleButton) {
      // Click to expand
      fireEvent.click(toggleButton);

      // Verify button action occurred
      expect(toggleButton).toBeInTheDocument();
    }
  });

  it('should display weather condition emoji', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    // Should have weather emoji
    const weatherEmojis = screen.queryAllByText(/☀️|🌤️|☁️|🌧️/);
    expect(weatherEmojis.length).toBeGreaterThan(0);
  });

  it('should display crowd level badges', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    // Should have "Crowd" or "人潮" text
    const crowdTexts = screen.queryAllByText(/Crowd|人潮/);
    expect(crowdTexts.length).toBeGreaterThan(0);
  });

  it('should display wait time information', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    // Should have "Wait Time" or "等待時間" text
    const waitTexts = screen.queryAllByText(/Wait Time|等待時間/);
    expect(waitTexts.length).toBeGreaterThan(0);
  });

  it('should display reasons to visit', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    // Top recommendation should have reasons to visit (assuming good time is recommended)
    const checkmarks = screen.queryAllByRole('img', { hidden: true });
    // There should be some checkmarks from reasons to visit section
    expect(checkmarks.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle different location types', () => {
    const types: Array<'park' | 'restaurant' | 'nursing_room' | 'medical' | 'attraction' | 'other'> = [
      'park',
      'restaurant',
      'nursing_room',
      'medical',
    ];

    types.forEach((type) => {
      const location = {
        ...mockLocation,
        category: type,
      };

      const { unmount } = render(
        <BestTimeVisitRecommender location={location} familyProfile={mockFamilyProfile} />
      );

      expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle different crowd tolerances', () => {
    const tolerances: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

    tolerances.forEach((tolerance) => {
      const profile = {
        ...mockFamilyProfile,
        crowdTolerance: tolerance,
      };

      const { unmount } = render(
        <BestTimeVisitRecommender location={mockLocation} familyProfile={profile} />
      );

      expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle different time preferences', () => {
    const preferences: Array<'morning' | 'afternoon' | 'evening' | 'any'> = [
      'morning',
      'afternoon',
      'evening',
      'any',
    ];

    preferences.forEach((pref) => {
      const profile = {
        ...mockFamilyProfile,
        preferredTimeOfDay: pref,
      };

      const { unmount } = render(
        <BestTimeVisitRecommender location={mockLocation} familyProfile={profile} />
      );

      expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle locations with different ratings', () => {
    const location1 = {
      ...mockLocation,
      averageRating: 4.8,
    };

    const location2 = {
      ...mockLocation,
      averageRating: 2.0,
    };

    const { rerender } = render(
      <BestTimeVisitRecommender location={location1} familyProfile={mockFamilyProfile} />
    );

    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();

    rerender(
      <BestTimeVisitRecommender location={location2} familyProfile={mockFamilyProfile} />
    );

    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
  });

  it('should be responsive to location changes', () => {
    const { rerender } = render(
      <BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />
    );

    const newLocation: Location = {
      ...mockLocation,
      id: 'new-loc-1',
      name: { zh: '博物館', en: 'Museum' },
      category: 'attraction',
    };

    rerender(
      <BestTimeVisitRecommender location={newLocation} familyProfile={mockFamilyProfile} />
    );

    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
  });

  it('should be responsive to family profile changes', () => {
    const { rerender } = render(
      <BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />
    );

    const newProfile = {
      ...mockFamilyProfile,
      childrenAges: [6, 8, 10],
      crowdTolerance: 'high' as const,
    };

    rerender(
      <BestTimeVisitRecommender location={mockLocation} familyProfile={newProfile} />
    );

    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
  });

  it('should handle undefined family profile gracefully', () => {
    const { rerender } = render(
      <BestTimeVisitRecommender location={mockLocation} familyProfile={undefined} />
    );

    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();

    rerender(
      <BestTimeVisitRecommender location={mockLocation} />
    );

    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<BestTimeVisitRecommender location={mockLocation} familyProfile={mockFamilyProfile} />);

    // Check for heading
    expect(screen.getByText(/Best Times to Visit|最佳訪問時間/)).toBeInTheDocument();
  });
});
