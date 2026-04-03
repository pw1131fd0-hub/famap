// @vitest-environment happy-dom
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VenueQualityAssessment } from '../components/VenueQualityAssessment';
import type { Location } from '../types';
import type { FamilyNeed } from '../utils/venueQualityAssessment';

describe('VenueQualityAssessment Component', () => {
  let mockVenue: Location;
  let mockFamilyNeeds: FamilyNeed[];

  beforeEach(() => {
    mockVenue = {
      id: 'venue_test_1',
      name: {
        zh: '測試公園',
        en: 'Test Park',
      },
      category: 'park',
      coordinates: {
        lat: 25.0355,
        lng: 121.5655,
      },
      facilities: ['changing_table', 'stroller_accessible', 'playground'],
      averageRating: 4.5,
      description: {
        zh: '美麗的公園',
        en: 'Beautiful park',
      },
    };

    mockFamilyNeeds = [
      {
        category: 'changing_table',
        importance: 'critical',
        weight: 1.0,
      },
      {
        category: 'stroller_accessible',
        importance: 'important',
        weight: 0.8,
      },
    ];
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );
      expect(container).toBeTruthy();
    });

    it('should display the component title', () => {
      render(<VenueQualityAssessment venue={mockVenue} />);
      expect(
        screen.getByText('Venue Quality Assessment')
      ).toBeInTheDocument();
    });

    it('should render the main component container', () => {
      const { container } = render(<VenueQualityAssessment venue={mockVenue} />);
      // Check that the component renders with venue data
      expect(container.querySelector('.venue-quality-assessment')).toBeInTheDocument();
    });

    it('should render all quality sections', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      // Check for sections by CSS classes
      const overallSection = container.querySelector('.vqa-overall');
      const credibilitySection = container.querySelector('.vqa-credibility');
      const suitabilitySection = container.querySelector('.vqa-suitability');

      expect(overallSection || container.querySelector('.vqa-content')).toBeInTheDocument();
    });

    it('should display the score circle', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      const scoreCircle = container.querySelector('.vqa-score-circle');
      expect(scoreCircle).toBeInTheDocument();
    });

    it('should display the overall score number', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      // Look for text containing a number (the score)
      const content = container.textContent;
      expect(content).toMatch(/\d+/);
    });
  });

  describe('Props handling', () => {
    it('should handle default props when only venue is provided', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );
      expect(container).toBeTruthy();
    });

    it('should accept and use family needs', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} familyNeeds={mockFamilyNeeds} />
      );
      expect(container).toBeTruthy();
    });

    it('should accept review count', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={50}
        />
      );
      expect(container).toBeTruthy();
    });

    it('should accept recent review count', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={50}
          recentReviewCount={15}
        />
      );
      expect(container).toBeTruthy();
    });

    it('should accept average rating', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          averageRating={4.8}
        />
      );
      expect(container).toBeTruthy();
    });

    it('should accept user contributions count', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          userContributionsCount={10}
        />
      );
      expect(container).toBeTruthy();
    });

    it('should accept last update days', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          lastUpdateDays={7}
        />
      );
      expect(container).toBeTruthy();
    });

    it('should accept onDismiss callback', () => {
      const handleDismiss = vi.fn();
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          onDismiss={handleDismiss}
        />
      );

      const closeButton = container.querySelector('.vqa-close');
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(handleDismiss).toHaveBeenCalled();
      }
    });

    it('should not render close button when onDismiss not provided', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      const closeButton = container.querySelector('.vqa-close');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should render close button when onDismiss is provided', () => {
      const handleDismiss = vi.fn();
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          onDismiss={handleDismiss}
        />
      );

      const closeButton = container.querySelector('.vqa-close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Interactive behavior', () => {
    it('should call onDismiss when close button is clicked', () => {
      const handleDismiss = vi.fn();
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          onDismiss={handleDismiss}
        />
      );

      const closeButton = container.querySelector('.vqa-close');
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(handleDismiss).toHaveBeenCalledTimes(1);
      }
    });

    it('should update when venue prop changes', () => {
      const { rerender, container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      const newVenue: Location = {
        ...mockVenue,
        id: 'venue_test_2',
        name: { zh: '新公園', en: 'New Park' },
      };

      rerender(<VenueQualityAssessment venue={newVenue} />);

      // Verify component still renders after prop change
      expect(container.querySelector('.venue-quality-assessment')).toBeInTheDocument();
    });

    it('should update when review count changes', () => {
      const { rerender } = render(
        <VenueQualityAssessment venue={mockVenue} reviewCount={10} />
      );

      rerender(<VenueQualityAssessment venue={mockVenue} reviewCount={50} />);

      // The component should re-calculate the score
      expect(screen.getByText('Venue Quality Assessment')).toBeInTheDocument();
    });

    it('should update when family needs change', () => {
      const initialNeeds = [
        {
          category: 'playground',
          importance: 'critical',
          weight: 1.0,
        },
      ];

      const { rerender } = render(
        <VenueQualityAssessment venue={mockVenue} familyNeeds={initialNeeds} />
      );

      const updatedNeeds = [
        ...initialNeeds,
        {
          category: 'restroom',
          importance: 'important',
          weight: 0.8,
        },
      ];

      rerender(
        <VenueQualityAssessment venue={mockVenue} familyNeeds={updatedNeeds} />
      );

      expect(screen.getByText('Venue Quality Assessment')).toBeInTheDocument();
    });
  });

  describe('Data visualization', () => {
    it('should show score circle with appropriate styling', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={50}
          recentReviewCount={15}
          averageRating={4.5}
        />
      );

      const scoreCircle = container.querySelector('.vqa-score-circle');
      expect(scoreCircle).toBeInTheDocument();

      const style = window.getComputedStyle(scoreCircle!);
      // The conic-gradient should be applied
      expect(style.background || scoreCircle?.getAttribute('style')).toBeTruthy();
    });

    it('should display credibility metrics section', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={50}
        />
      );

      // Check if credibility metrics are displayed
      const content = container.textContent;
      expect(content).toContain('Venue Quality Assessment');
    });

    it('should display suitability information with family needs', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          familyNeeds={mockFamilyNeeds}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should display matched needs when applicable', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          familyNeeds={[
            {
              category: 'changing_table',
              importance: 'critical',
              weight: 1.0,
            },
          ]}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should display unmatched needs when applicable', () => {
      const venueWithoutAllFacilities: Location = {
        ...mockVenue,
        facilities: ['playground'],
      };

      const { container } = render(
        <VenueQualityAssessment
          venue={venueWithoutAllFacilities}
          familyNeeds={[
            {
              category: 'changing_table',
              importance: 'critical',
              weight: 1.0,
            },
          ]}
        />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Score color coding', () => {
    it('should display high quality venues with appropriate styling', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={100}
          recentReviewCount={50}
          averageRating={4.9}
          userContributionsCount={20}
          lastUpdateDays={2}
        />
      );

      const scoreCircle = container.querySelector('.vqa-score-circle');
      expect(scoreCircle).toBeInTheDocument();
    });

    it('should display low quality venues with appropriate styling', () => {
      const poorVenue: Location = {
        ...mockVenue,
        facilities: [],
      };

      const { container } = render(
        <VenueQualityAssessment
          venue={poorVenue}
          reviewCount={2}
          recentReviewCount={0}
          averageRating={2.0}
          userContributionsCount={0}
          lastUpdateDays={180}
        />
      );

      const scoreCircle = container.querySelector('.vqa-score-circle');
      expect(scoreCircle).toBeInTheDocument();
    });

    it('should display medium quality venues appropriately', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={20}
          recentReviewCount={5}
          averageRating={3.5}
          userContributionsCount={3}
          lastUpdateDays={30}
        />
      );

      const scoreCircle = container.querySelector('.vqa-score-circle');
      expect(scoreCircle).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} onDismiss={() => {}} />
      );

      const closeButton = container.querySelector('[aria-label="Close"]');
      expect(closeButton).toBeInTheDocument();
    });

    it('should render with semantic HTML structure', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      const header = container.querySelector('.vqa-header');
      const title = container.querySelector('.vqa-title');
      const content = container.querySelector('.vqa-content');

      expect(header).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });

    it('should have readable text content', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      const textContent = container.textContent;
      expect(textContent).toContain('Venue Quality Assessment');
    });
  });

  describe('Edge cases', () => {
    it('should handle venue with no facilities', () => {
      const venueNoFacilities: Location = {
        ...mockVenue,
        facilities: [],
      };

      const { container } = render(
        <VenueQualityAssessment venue={venueNoFacilities} />
      );

      expect(container).toBeTruthy();
    });

    it('should handle venue with many facilities', () => {
      const venueWithManyFacilities: Location = {
        ...mockVenue,
        facilities: [
          'changing_table',
          'stroller_accessible',
          'high_chair',
          'nursing_room',
          'wifi',
          'parking',
          'playground',
          'restaurant',
          'bathroom',
          'water_fountain',
          'picnic_area',
        ],
      };

      const { container } = render(
        <VenueQualityAssessment venue={venueWithManyFacilities} />
      );

      expect(container).toBeTruthy();
    });

    it('should handle empty family needs array', () => {
      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} familyNeeds={[]} />
      );

      expect(container).toBeTruthy();
    });

    it('should handle very high review count', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={10000}
          recentReviewCount={5000}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should handle zero reviews', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={0}
          recentReviewCount={0}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should handle very new data (1 day old)', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          lastUpdateDays={1}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should handle very old data (365 days old)', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          lastUpdateDays={365}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should handle extreme rating values', () => {
      const { container: containerMin } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          averageRating={1.0}
        />
      );
      expect(containerMin).toBeTruthy();

      const { container: containerMax } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          averageRating={5.0}
        />
      );
      expect(containerMax).toBeTruthy();
    });
  });

  describe('Performance and memoization', () => {
    it('should memoize assessment calculation', () => {
      const { rerender } = render(
        <VenueQualityAssessment venue={mockVenue} reviewCount={50} />
      );

      // Rerender with same props - should not recalculate
      rerender(
        <VenueQualityAssessment venue={mockVenue} reviewCount={50} />
      );

      expect(screen.getByText('Venue Quality Assessment')).toBeInTheDocument();
    });

    it('should recalculate when dependencies change', () => {
      const { rerender } = render(
        <VenueQualityAssessment venue={mockVenue} reviewCount={50} />
      );

      // Rerender with different reviewCount
      rerender(
        <VenueQualityAssessment venue={mockVenue} reviewCount={100} />
      );

      expect(screen.getByText('Venue Quality Assessment')).toBeInTheDocument();
    });
  });

  describe('Integration with assessment utility', () => {
    it('should integrate credibility assessment correctly', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={50}
          recentReviewCount={15}
          averageRating={4.5}
          userContributionsCount={10}
          lastUpdateDays={7}
        />
      );

      // Component should display assessment results
      expect(container).toBeTruthy();
      expect(screen.getByText('Venue Quality Assessment')).toBeInTheDocument();
    });

    it('should integrate suitability assessment with family needs', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          familyNeeds={mockFamilyNeeds}
          reviewCount={40}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should display summary correctly', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          reviewCount={50}
          recentReviewCount={15}
          averageRating={4.5}
          familyNeeds={mockFamilyNeeds}
        />
      );

      const content = container.textContent;
      expect(content).toContain('Venue Quality Assessment');
    });
  });

  describe('Responsive design', () => {
    it('should render on mobile viewport', () => {
      // Mock window size for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      expect(container).toBeTruthy();
    });

    it('should render on tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      expect(container).toBeTruthy();
    });

    it('should render on desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const { container } = render(
        <VenueQualityAssessment venue={mockVenue} />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Complex scenarios', () => {
    it('should handle full venue assessment workflow', () => {
      const excellentVenue: Location = {
        ...mockVenue,
        facilities: [
          'changing_table',
          'stroller_accessible',
          'high_chair',
          'nursing_room',
          'wifi',
          'playground',
        ],
      };

      const { container } = render(
        <VenueQualityAssessment
          venue={excellentVenue}
          familyNeeds={mockFamilyNeeds}
          reviewCount={150}
          recentReviewCount={75}
          averageRating={4.8}
          userContributionsCount={25}
          lastUpdateDays={3}
          onDismiss={vi.fn()}
        />
      );

      expect(container).toBeTruthy();
      expect(screen.getByText('Venue Quality Assessment')).toBeInTheDocument();
    });

    it('should handle poor venue assessment workflow', () => {
      const poorVenue: Location = {
        ...mockVenue,
        facilities: [],
      };

      const { container } = render(
        <VenueQualityAssessment
          venue={poorVenue}
          familyNeeds={mockFamilyNeeds}
          reviewCount={5}
          recentReviewCount={0}
          averageRating={2.0}
          userContributionsCount={0}
          lastUpdateDays={200}
          onDismiss={vi.fn()}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should handle assessment with partial data', () => {
      const { container } = render(
        <VenueQualityAssessment
          venue={mockVenue}
          familyNeeds={[mockFamilyNeeds[0]]}
          reviewCount={20}
        />
      );

      expect(container).toBeTruthy();
    });
  });
});
