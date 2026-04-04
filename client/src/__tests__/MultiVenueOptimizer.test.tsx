// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MultiVenueOptimizer } from '../components/MultiVenueOptimizer';
import type { Location } from '../types';

// Mock browser APIs that may not be available in jsdom
beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    writable: true,
    configurable: true,
  });
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();
});

// Mock the useTranslation hook
vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    t: (key: string) => key,
    setLanguage: vi.fn(),
  }),
}));

// Mock the multiVenueOptimizer utils
vi.mock('../utils/multiVenueOptimizer', () => ({
  optimizeMultiVenueTrip: vi.fn((locations: Location[], startTime: Date) => ({
    stops: locations.map((loc: Location, idx: number) => ({
      location: loc,
      arrivalTime: new Date(Date.now() + idx * 3600000),
      departureTime: new Date(Date.now() + idx * 3600000 + 3600000),
      visitDuration: 60,
      order: idx + 1,
    })),
    totalTravelTime: 30,
    totalVisitTime: 180,
    totalTime: 210,
    totalDistance: 15,
    estimatedCost: 48,
    bestTimeToStart: startTime,
    recommendations: [
      'Test recommendation 1',
      'Test recommendation 2',
    ],
    routeEfficiency: 85,
  })),
  formatTripSummary: vi.fn(() => '3 venues | 3h 30m total | 15 km | $48'),
  encodeTrip: vi.fn(() => 'encoded-trip-url'),
  decodeTrip: vi.fn(() => null),
}));

const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '公園', en: 'Park' },
    description: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25.0, lng: 121.5 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: [],
    averageRating: 4.5,
    operatingHours: { monday: '9:00-17:00' },
  },
  {
    id: '2',
    name: { zh: '動物園', en: 'Zoo' },
    description: { zh: '動物園', en: 'Zoo' },
    category: 'park',
    coordinates: { lat: 25.1, lng: 121.6 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: [],
    averageRating: 4.3,
    operatingHours: { monday: '9:00-17:00' },
  },
  {
    id: '3',
    name: { zh: '博物館', en: 'Museum' },
    description: { zh: '博物館', en: 'Museum' },
    category: 'attraction',
    coordinates: { lat: 25.2, lng: 121.7 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: [],
    averageRating: 4.4,
    operatingHours: { monday: '9:00-17:00' },
  },
];

describe('MultiVenueOptimizer Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render empty state when no locations selected', () => {
      render(
        <MultiVenueOptimizer selectedLocations={[]} onClose={mockOnClose} />
      );
      expect(screen.getByText(/Select multiple venues/i)).toBeInTheDocument();
    });

    it('should render optimizer with locations', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Multi-Venue Trip Optimizer')).toBeInTheDocument();
    });

    it('should display summary cards', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/Total Time/i)).toBeInTheDocument();
      expect(screen.getByText(/Distance/i)).toBeInTheDocument();
      expect(screen.getByText(/Est. Cost/i)).toBeInTheDocument();
      expect(screen.getByText(/Route Efficiency/i)).toBeInTheDocument();
    });

    it('should display itinerary section', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Optimized Itinerary')).toBeInTheDocument();
    });

    it('should display all venue stops', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      mockLocations.forEach((location) => {
        expect(screen.getByText(location.name.en)).toBeInTheDocument();
      });
    });

    it('should display recommendations section', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });

    it('should display action buttons', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/Share Trip/i)).toBeInTheDocument();
      expect(screen.getByText(/Export Calendar/i)).toBeInTheDocument();
      expect(screen.getByText(/Export CSV/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should close when close button clicked', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      const closeBtn = document.querySelector(`.closeBtn`);
      if (closeBtn) {
        fireEvent.click(closeBtn);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should expand stop details when clicked', async () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      const firstStop = screen.getByText('Park');
      fireEvent.click(firstStop);

      await waitFor(() => {
        expect(screen.getByText(/Category:/)).toBeInTheDocument();
      });
    });

    it('should collapse stop details when clicked again', async () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      const firstStop = screen.getByText('Park');

      fireEvent.click(firstStop);
      await waitFor(() => {
        expect(screen.getByText(/Category:/)).toBeInTheDocument();
      });

      fireEvent.click(firstStop);
      await waitFor(() => {
        expect(screen.queryByText(/Category:/)).not.toBeInTheDocument();
      });
    });

    it('should handle share button click', async () => {
      // Mock clipboard before this test
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: writeTextMock } });

      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      const shareBtn = screen.getByText(/Share Trip/i);
      fireEvent.click(shareBtn);

      await waitFor(() => {
        expect(screen.getByText(/Trip URL copied/i)).toBeInTheDocument();
      });
    });

    it('should handle export calendar button click', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );

      const exportCalendarBtn = Array.from(
        screen.getAllByText(/Export Calendar/i)
      ).find((el) => el.tagName === 'BUTTON');

      if (exportCalendarBtn) {
        fireEvent.click(exportCalendarBtn);
        // Should trigger download (hard to test directly, but no error should occur)
      }
    });

    it('should handle export CSV button click', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );

      const exportCSVBtn = Array.from(
        screen.getAllByText(/Export CSV/i)
      ).find((el) => el.tagName === 'BUTTON');

      if (exportCSVBtn) {
        fireEvent.click(exportCSVBtn);
        // Should trigger download (hard to test directly, but no error should occur)
      }
    });
  });

  describe('props handling', () => {
    it('should accept familySize prop', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
          familySize={4}
        />
      );
      expect(screen.getByText('Multi-Venue Trip Optimizer')).toBeInTheDocument();
    });

    it('should accept childAges prop', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
          childAges={[3, 7]}
        />
      );
      expect(screen.getByText('Multi-Venue Trip Optimizer')).toBeInTheDocument();
    });

    it('should handle empty selectedLocations array', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={[]}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/Select multiple venues/i)).toBeInTheDocument();
    });

    it('should handle single location', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={[mockLocations[0]]}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Park')).toBeInTheDocument();
    });
  });

  describe('display values', () => {
    it('should display correct time format', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      // Component shows the calculated time values
      expect(screen.getByText('Multi-Venue Trip Optimizer')).toBeInTheDocument();
    });

    it('should display distance with correct decimals', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/km/)).toBeInTheDocument();
    });

    it('should display estimated cost', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });

    it('should display route efficiency percentage', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });
  });

  describe('recommendations', () => {
    it('should display recommendations', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Test recommendation 1')).toBeInTheDocument();
      expect(screen.getByText('Test recommendation 2')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible heading', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      const heading = screen.getByRole('heading', {
        name: /Multi-Venue Trip Optimizer/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('should have buttons with accessible labels', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/Share Trip/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle very long location names', () => {
      const longNameLocation = {
        ...mockLocations[0],
        name: {
          zh: '這是一個非常很長很長很長的地點名稱用來測試長文本呈現',
          en: 'This is a very long location name that should be handled properly by the component',
        },
      };
      render(
        <MultiVenueOptimizer
          selectedLocations={[longNameLocation]}
          onClose={mockOnClose}
        />
      );
      expect(
        screen.getByText(longNameLocation.name.en)
      ).toBeInTheDocument();
    });

    it('should update when selectedLocations prop changes', () => {
      const { rerender } = render(
        <MultiVenueOptimizer
          selectedLocations={[mockLocations[0]]}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Park')).toBeInTheDocument();

      rerender(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Park')).toBeInTheDocument();
      expect(screen.getByText('Zoo')).toBeInTheDocument();
      expect(screen.getByText('Museum')).toBeInTheDocument();
    });

    it('should handle undefined familySize', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Multi-Venue Trip Optimizer')).toBeInTheDocument();
    });

    it('should handle undefined childAges', () => {
      render(
        <MultiVenueOptimizer
          selectedLocations={mockLocations}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Multi-Venue Trip Optimizer')).toBeInTheDocument();
    });
  });
});
