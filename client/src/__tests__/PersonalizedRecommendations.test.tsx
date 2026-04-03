// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PersonalizedRecommendations } from '../components/PersonalizedRecommendations';
import * as userPrefsModule from '../utils/userPreferences';

// Mock the user preferences module
vi.mock('../utils/userPreferences', () => ({
  loadPreferences: vi.fn(),
  savePreferences: vi.fn(),
  recordLocationView: vi.fn(),
  getPersonalizedRecommendations: vi.fn(),
  getPreferenceSummary: vi.fn(),
  setChildAgeRange: vi.fn(),
  recordLocationSave: vi.fn(),
  recordLocationUnsave: vi.fn(),
  initializePreferences: vi.fn(),
}));

describe('PersonalizedRecommendations Component', () => {
  const mockLocations = [
    {
      id: 'park-1',
      name: { en: 'Central Park', zh: '中央公園' },
      category: 'park',
      facilities: ['playground', 'restroom'],
      averageRating: 4.5,
    },
    {
      id: 'rest-1',
      name: { en: 'Family Restaurant', zh: '家庭餐廳' },
      category: 'restaurant',
      facilities: ['highchair', 'restroom'],
      averageRating: 4.2,
    },
    {
      id: 'park-2',
      name: { en: 'Beach Park', zh: '海灘公園' },
      category: 'park',
      facilities: ['playground', 'shower'],
      averageRating: 4.8,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(userPrefsModule.loadPreferences).mockReturnValue({
      preferredCategories: [],
      preferredFacilities: [],
      preferredTimeOfDay: null,
      preferredDaysOfWeek: [],
      childAgeRange: null,
      searchHistory: [],
      viewedLocations: [],
      savedLocations: new Set(),
      averageRating: 0,
      interactionCount: 0,
      lastUpdatedAt: new Date().toISOString(),
    });

    vi.mocked(userPrefsModule.getPersonalizedRecommendations).mockReturnValue([
      'park-1',
      'park-2',
      'rest-1',
    ]);

    vi.mocked(userPrefsModule.getPreferenceSummary).mockReturnValue({
      topCategories: [],
      topFacilities: [],
      totalInteractions: 0,
      lastInteractionTime: new Date().toISOString(),
      childAgeRange: 'Not specified',
    });
  });

  describe('Rendering', () => {
    it('should render component with header', async () => {
      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Personalized for You')).toBeInTheDocument();
      });
    });

    it('should display correct language', async () => {
      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="zh"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('個性化推薦')).toBeInTheDocument();
      });
    });

    it('should show preferences when available', async () => {
      vi.mocked(userPrefsModule.getPreferenceSummary).mockReturnValue({
        topCategories: ['park'],
        topFacilities: ['playground'],
        totalInteractions: 5,
        lastInteractionTime: new Date().toISOString(),
        childAgeRange: '3-5 years',
      });

      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
          showPreferenceSummary={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Your Preferences/i)).toBeInTheDocument();
      });
    });

    it('should display empty message when no recommendations', async () => {
      vi.mocked(userPrefsModule.getPersonalizedRecommendations).mockReturnValue([]);

      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/No personalized recommendations/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interaction', () => {
    it('should handle component mounting with mock functions', async () => {
      const mockSelect = vi.fn();

      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          onSelectLocation={mockSelect}
          language="en"
        />
      );

      await waitFor(() => {
        expect(userPrefsModule.loadPreferences).toHaveBeenCalled();
      });
    });

    it('should call getPersonalizedRecommendations on mount', async () => {
      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
        />
      );

      await waitFor(() => {
        expect(userPrefsModule.getPersonalizedRecommendations).toHaveBeenCalledWith(
          mockLocations,
          expect.any(Object),
          5
        );
      });
    });
  });

  describe('Preference Summary', () => {
    it('should show preference summary when provided', async () => {
      vi.mocked(userPrefsModule.getPreferenceSummary).mockReturnValue({
        topCategories: ['park'],
        topFacilities: ['playground'],
        totalInteractions: 5,
        lastInteractionTime: new Date().toISOString(),
        childAgeRange: '3-5 years',
      });

      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
          showPreferenceSummary={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Your Preferences/i)).toBeInTheDocument();
      });
    });

    it('should hide preference summary when showPreferenceSummary is false', async () => {
      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
          showPreferenceSummary={false}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText(/Your Preferences/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Child Age Selection', () => {
    it('should show age selection buttons when no age is set', async () => {
      vi.mocked(userPrefsModule.loadPreferences).mockReturnValue({
        preferredCategories: [],
        preferredFacilities: [],
        preferredTimeOfDay: null,
        preferredDaysOfWeek: [],
        childAgeRange: null,
        searchHistory: [],
        viewedLocations: [],
        savedLocations: new Set(),
        averageRating: 0,
        interactionCount: 0,
        lastUpdatedAt: new Date().toISOString(),
      });

      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Tell us your child/i)).toBeInTheDocument();
      });
    });

    it('should handle age range selection', async () => {
      vi.mocked(userPrefsModule.loadPreferences).mockReturnValue({
        preferredCategories: [],
        preferredFacilities: [],
        preferredTimeOfDay: null,
        preferredDaysOfWeek: [],
        childAgeRange: null,
        searchHistory: [],
        viewedLocations: [],
        savedLocations: new Set(),
        averageRating: 0,
        interactionCount: 0,
        lastUpdatedAt: new Date().toISOString(),
      });

      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
        />
      );

      await waitFor(() => {
        const ageButtons = screen.getAllByRole('button');
        expect(ageButtons.length).toBeGreaterThan(0);
      });
    });

    it('should not show age buttons when age is already set', async () => {
      vi.mocked(userPrefsModule.loadPreferences).mockReturnValue({
        preferredCategories: [],
        preferredFacilities: [],
        preferredTimeOfDay: null,
        preferredDaysOfWeek: [],
        childAgeRange: [3, 5],
        searchHistory: [],
        viewedLocations: [],
        savedLocations: new Set(),
        averageRating: 0,
        interactionCount: 0,
        lastUpdatedAt: new Date().toISOString(),
      });

      vi.mocked(userPrefsModule.getPreferenceSummary).mockReturnValue({
        topCategories: [],
        topFacilities: [],
        totalInteractions: 0,
        lastInteractionTime: new Date().toISOString(),
        childAgeRange: '3-5 years',
      });

      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText(/Tell us your child/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Recommendations', () => {
    it('should call getPersonalizedRecommendations with limit', async () => {
      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
          limit={3}
        />
      );

      await waitFor(() => {
        expect(userPrefsModule.getPersonalizedRecommendations).toHaveBeenCalledWith(
          mockLocations,
          expect.any(Object),
          3
        );
      });
    });

    it('should respect limit parameter', async () => {
      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
          limit={2}
        />
      );

      await waitFor(() => {
        expect(userPrefsModule.getPersonalizedRecommendations).toHaveBeenCalledWith(
          mockLocations,
          expect.any(Object),
          2
        );
      });
    });

    it('should show message when no recommendations available', async () => {
      vi.mocked(userPrefsModule.getPersonalizedRecommendations).mockReturnValue([]);

      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/No personalized recommendations/i)).toBeInTheDocument();
      });
    });
  });

  describe('Bilingual Support', () => {
    it('should support English language', async () => {
      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="en"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Personalized for You')).toBeInTheDocument();
      });
    });

    it('should support Chinese language', async () => {
      render(
        <PersonalizedRecommendations
          locations={mockLocations}
          language="zh"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('個性化推薦')).toBeInTheDocument();
      });
    });
  });
});
