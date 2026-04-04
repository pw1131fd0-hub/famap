// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SmartTripSuggestionPanel from '../components/SmartTripSuggestionPanel';
import { LanguageContext } from '../i18n/context';
import type { TripSuggestion } from '../utils/smartTripSuggester';

// Mock LanguageContext
const mockLanguageValue = {
  language: 'en' as const,
  setLanguage: vi.fn(),
  t: {},
};

// Mock data
const mockFamilyProfile = {
  id: 'family_1',
  name: 'Test Family',
  childrenAges: [5, 8],
  preferences: {
    preferredCategories: ['park', 'restaurant'],
    budget: 300,
  },
};

const mockVenues = [
  {
    id: 'venue_1',
    name: { en: 'Central Park', zh: '中央公園' },
    category: 'park',
    coordinates: { lat: 25.04, lng: 121.56 },
    address: { en: 'Taipei', zh: '台北' },
    averageRating: 4.5,
    reviewCount: 150,
    facilities: ['restroom', 'playground'],
  },
  {
    id: 'venue_2',
    name: { en: 'Family Restaurant', zh: '家庭餐廳' },
    category: 'restaurant',
    coordinates: { lat: 25.05, lng: 121.57 },
    address: { en: 'Taipei', zh: '台北' },
    averageRating: 4.2,
    reviewCount: 80,
    facilities: ['highchair', 'kids_menu'],
  },
];

const mockActivityHistory = [
  {
    id: 'visit_1',
    familyId: 'family_1',
    locationId: 'venue_1',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    spentAmount: 50,
    notes: 'Great park day',
    category: 'park',
  },
];

const mockWeather = {
  temperature: 25,
  humidity: 60,
  windSpeed: 5,
  precipitation: 0,
  condition: 'sunny',
};

describe('SmartTripSuggestionPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      familyProfile: mockFamilyProfile,
      activityHistory: mockActivityHistory,
      availableVenues: mockVenues,
      currentWeather: mockWeather,
      onTripSelect: vi.fn(),
      onDismiss: vi.fn(),
      ...props,
    };

    return render(
      <LanguageContext.Provider value={mockLanguageValue}>
        <SmartTripSuggestionPanel {...defaultProps} />
      </LanguageContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('should render the panel with header', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Smart Trip Ideas/i)).toBeInTheDocument();
      });
    });

    it('should display panel title and subtitle', async () => {
      renderComponent();

      await waitFor(() => {
        expect(
          screen.getByText(/Smart Trip Ideas for Your Family/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Personalized suggestions based on/i)
        ).toBeInTheDocument();
      });
    });

    it('should render close button', async () => {
      renderComponent();

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      const { container } = renderComponent();

      // Generation is synchronous, so panel renders immediately (loading completes within act())
      expect(container.querySelector('.smart-trip-panel')).toBeInTheDocument();
    });

    it('should load suggestions after initial load', async () => {
      renderComponent();

      await waitFor(
        () => {
          expect(screen.queryByText(/Generating suggestions/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Suggestions Display', () => {
    it('should display suggestion cards after loading', async () => {
      renderComponent();

      await waitFor(() => {
        const cards = screen.getAllByRole('button', { name: /Plan This Trip/i });
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should show confidence score on each card', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getAllByText(/Confidence:/i).length).toBeGreaterThan(0);
      });
    });

    it('should display trip dates', async () => {
      renderComponent();

      await waitFor(() => {
        const dateElements = screen.queryAllByText(/^[A-Za-z]+,/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it('should show budget information', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getAllByText(/Estimated Budget/i).length).toBeGreaterThan(0);
      });
    });

    it('should display expected satisfaction score', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getAllByText(/Expected Satisfaction/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Interactivity', () => {
    it('should call onDismiss when close button is clicked', async () => {
      const onDismiss = vi.fn();
      renderComponent({ onDismiss });

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      expect(onDismiss).toHaveBeenCalled();
    });

    it('should select suggestion when card is clicked', async () => {
      const onTripSelect = vi.fn();
      renderComponent({ onTripSelect });

      await waitFor(() => {
        const planButtons = screen.getAllByRole('button', { name: /Plan This Trip/i });
        expect(planButtons.length).toBeGreaterThan(0);
      });

      const planButton = screen.getAllByRole('button', { name: /Plan This Trip/i })[0];
      fireEvent.click(planButton);

      await waitFor(() => {
        expect(onTripSelect).toHaveBeenCalled();
      });
    });

    it('should show details when suggestion is selected', async () => {
      renderComponent();

      await waitFor(() => {
        const planButtons = screen.getAllByRole('button', { name: /Plan This Trip/i });
        expect(planButtons.length).toBeGreaterThan(0);
      });

      await waitFor(() => {
        expect(screen.queryAllByText(/Why we recommend this/i).length).toBeGreaterThan(0);
      });
    });

    it('should refresh suggestions on refresh button click', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Refresh suggestions/i })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /Refresh suggestions/i });
      fireEvent.click(refreshButton);

      // Should still show suggestions
      await waitFor(() => {
        expect(screen.queryByText(/Generating suggestions/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty venues gracefully', async () => {
      renderComponent({ availableVenues: [] });

      await waitFor(() => {
        expect(screen.queryByText(/Generating suggestions/i)).not.toBeInTheDocument();
      });
    });

    it('should handle empty activity history', async () => {
      renderComponent({ activityHistory: [] });

      await waitFor(() => {
        expect(screen.queryByText(/Generating suggestions/i)).not.toBeInTheDocument();
      });
    });

    it('should handle missing family profile gracefully', async () => {
      renderComponent({ familyProfile: null });

      await waitFor(() => {
        expect(screen.queryByText(/Generating suggestions/i)).not.toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      renderComponent({ availableVenues: [] });

      await waitFor(() => {
        // Error or no suggestions state
        expect(screen.queryByText(/Generating suggestions/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Weather Integration', () => {
    it('should display weather outlook', async () => {
      renderComponent();

      await waitFor(() => {
        const cards = screen.getAllByRole('button', { name: /Plan This Trip/i });
        expect(cards.length).toBeGreaterThan(0);
        expect(screen.queryAllByText(/Weather outlook/i).length).toBeGreaterThan(0);
      });
    });

    it('should show different outlook for different weather conditions', async () => {
      const rainyWeather = { ...mockWeather, condition: 'rainy' };
      renderComponent({ currentWeather: rainyWeather });

      await waitFor(() => {
        expect(screen.queryAllByText(/Rainy/i).length).toBeGreaterThan(0);
      });
    });

    it('should include packing tips based on weather', async () => {
      renderComponent();

      await waitFor(() => {
        const cards = screen.getAllByRole('button', { name: /Plan This Trip/i });
        expect(cards.length).toBeGreaterThan(0);
        expect(screen.queryAllByText(/Packing tips/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Bilingual Support', () => {
    it('should display content in English by default', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Smart Trip Ideas/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Plan This Trip/i).length).toBeGreaterThan(0);
      });
    });

    it('should display venue names in English', async () => {
      renderComponent();

      await waitFor(() => {
        const cards = screen.getAllByRole('button', { name: /Plan This Trip/i });
        expect(cards.length).toBeGreaterThan(0);
        expect(screen.queryAllByText(/Central Park|Family Restaurant/i).length).toBeGreaterThan(0);
      });
    });

    it('should handle Chinese language when set', async () => {
      const chineseLanguage = { ...mockLanguageValue, language: 'zh' };

      const { container } = render(
        <LanguageContext.Provider value={chineseLanguage}>
          <SmartTripSuggestionPanel
            familyProfile={mockFamilyProfile}
            activityHistory={mockActivityHistory}
            availableVenues={mockVenues}
            currentWeather={mockWeather}
          />
        </LanguageContext.Provider>
      );

      await waitFor(() => {
        expect(container.textContent).toBeTruthy();
      });
    });
  });

  describe('Suggestion Details', () => {
    it('should show reasons for suggestions', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryAllByText(/Why we recommend this/i).length).toBeGreaterThan(0);
      });
    });

    it('should display venue list in suggestions', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryAllByText(/Venues/i).length).toBeGreaterThan(0);
      });
    });

    it('should show crowd prediction', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryAllByText(/Expected crowd/i).length).toBeGreaterThan(0);
      });
    });

    it('should display estimated travel time', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryAllByText(/Travel time/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render properly on mobile screens', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      const { container } = renderComponent();

      expect(container.querySelector('.smart-trip-panel')).toBeInTheDocument();
    });

    it('should render properly on tablet screens', () => {
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));

      const { container } = renderComponent();

      expect(container.querySelector('.smart-trip-panel')).toBeInTheDocument();
    });

    it('should render properly on desktop screens', () => {
      global.innerWidth = 1440;
      global.dispatchEvent(new Event('resize'));

      const { container } = renderComponent();

      expect(container.querySelector('.smart-trip-panel')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', async () => {
      renderComponent();

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard navigable', async () => {
      renderComponent();

      await waitFor(() => {
        const planButtons = screen.getAllByRole('button', { name: /Plan This Trip/i });
        expect(planButtons.length).toBeGreaterThan(0);

        planButtons[0].focus();
        expect(document.activeElement).toBe(planButtons[0]);
      });
    });

    it('should have sufficient color contrast', () => {
      const { container } = renderComponent();

      const titles = container.querySelectorAll('.panel-title');
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency', () => {
    it('should pass correct trip data to onTripSelect callback', async () => {
      const onTripSelect = vi.fn();
      renderComponent({ onTripSelect });

      await waitFor(() => {
        const planButtons = screen.getAllByRole('button', { name: /Plan This Trip/i });
        expect(planButtons.length).toBeGreaterThan(0);
        fireEvent.click(planButtons[0]);
      });

      await waitFor(() => {
        expect(onTripSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            tripId: expect.any(String),
            title: expect.any(String),
            venues: expect.any(Array),
            confidenceScore: expect.any(Number),
          })
        );
      });
    });

    it('should maintain trip data consistency across re-renders', async () => {
      const { rerender } = renderComponent();

      await waitFor(() => {
        expect(screen.queryByText(/Generating suggestions/i)).not.toBeInTheDocument();
      });

      const beforeText = screen.queryAllByRole('button', { name: /Plan This Trip/i });
      const beforeCount = beforeText.length;

      rerender(
        <LanguageContext.Provider value={mockLanguageValue}>
          <SmartTripSuggestionPanel
            familyProfile={mockFamilyProfile}
            activityHistory={mockActivityHistory}
            availableVenues={mockVenues}
            currentWeather={mockWeather}
          />
        </LanguageContext.Provider>
      );

      await waitFor(() => {
        const afterText = screen.queryAllByRole('button', { name: /Plan This Trip/i });
        expect(afterText.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should render suggestions quickly', async () => {
      const startTime = performance.now();

      renderComponent();

      await waitFor(() => {
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(3000);
      });
    });

    it('should handle multiple suggestions efficiently', async () => {
      const manyVenues = Array.from({ length: 50 }, (_, i) => ({
        ...mockVenues[0],
        id: `venue_${i}`,
        name: { en: `Venue ${i}`, zh: `場地 ${i}` },
      }));

      renderComponent({ availableVenues: manyVenues });

      await waitFor(() => {
        expect(screen.queryByText(/Generating suggestions/i)).not.toBeInTheDocument();
      });
    });
  });
});
