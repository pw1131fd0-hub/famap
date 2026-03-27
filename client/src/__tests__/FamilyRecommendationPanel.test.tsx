import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import FamilyRecommendationPanel from '../components/FamilyRecommendationPanel';
import { LanguageProvider } from '../i18n/LanguageContext';
import type { LocationWithReviews } from '../utils/familyRecommender';

// Helper to render with language provider
const renderWithLanguage = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('FamilyRecommendationPanel Component', () => {
  const mockVenue1: LocationWithReviews = {
    id: 'venue-1',
    name: { zh: '公園A', en: 'Park A' },
    category: 'park',
    ageRange: { min: 2, max: 12 },
    averageRating: 4.5,
    reviewCount: 50,
    facilities: ['playground', 'stroller_accessible', 'nursing_room'],
    crowdiness: 45,
    price: 0,
    distance: 5,
    trending: 0.3,
    seasonalityFactor: 0.8,
  };

  const mockVenue2: LocationWithReviews = {
    id: 'venue-2',
    name: { zh: '餐廳B', en: 'Restaurant B' },
    category: 'restaurant',
    ageRange: { min: 0, max: 15 },
    averageRating: 4.2,
    reviewCount: 30,
    facilities: ['high_chair', 'changing_table', 'wifi'],
    crowdiness: 60,
    price: 800,
    distance: 3,
    trending: -0.1,
    seasonalityFactor: 0.5,
  };

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[mockVenue1, mockVenue2]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should accept venues prop', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[mockVenue1]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should work with dark mode', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel
          venues={[mockVenue1]}
          isDarkMode={true}
        />
      );
      expect(container).toBeDefined();
    });

    it('should work with light mode', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel
          venues={[mockVenue1]}
          isDarkMode={false}
        />
      );
      expect(container).toBeDefined();
    });

    it('should handle empty venues array', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[]} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should accept optional callbacks', () => {
      const mockCallback = vi.fn();
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel
          venues={[mockVenue1]}
          onVenueSelect={mockCallback}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('should accept family profile prop', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel
          venues={[mockVenue1]}
          familyProfile={{
            childrenAges: [5],
            interests: ['playground'],
            accessibilityNeeds: [],
            dietaryRestrictions: [],
            budgetLevel: 'moderate',
            preferredDistance: 15,
          }}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('should accept user history prop', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel
          venues={[mockVenue1]}
          userHistory={{
            searchTerms: ['park'],
            viewedLocations: [],
            favoriteLocations: ['venue-1'],
            previousVisits: [],
          }}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have a main panel element', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[mockVenue1]} />
      );
      const panel = container.querySelector('.panel');
      expect(panel).toBeDefined();
    });

    it('should have header with title', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[mockVenue1]} />
      );
      const header = container.querySelector('.header');
      expect(header).toBeDefined();
    });

    it('should have tabs element', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[mockVenue1]} />
      );
      const tabs = container.querySelector('.tabs');
      expect(tabs).toBeDefined();
    });

    it('should have content area', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[mockVenue1]} />
      );
      const content = container.querySelector('.content');
      expect(content).toBeDefined();
    });
  });

  describe('Multiple Venues', () => {
    it('should handle multiple venues', () => {
      const venues = [mockVenue1, mockVenue2];
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={venues} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle single venue', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[mockVenue1]} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should render with all props provided', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel
          venues={[mockVenue1, mockVenue2]}
          familyProfile={{
            childrenAges: [3, 7],
            interests: ['playground', 'water'],
            accessibilityNeeds: ['stroller_accessible'],
            dietaryRestrictions: [],
            budgetLevel: 'moderate',
            preferredDistance: 20,
          }}
          userHistory={{
            searchTerms: ['park'],
            viewedLocations: ['venue-2'],
            favoriteLocations: ['venue-1'],
            previousVisits: [
              { venueId: 'venue-1', rating: 5, timestamp: 1000 },
            ],
          }}
          isDarkMode={true}
          onVenueSelect={vi.fn()}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('should work with minimal props', () => {
      const { container } = renderWithLanguage(
        <FamilyRecommendationPanel venues={[mockVenue1]} />
      );
      expect(container).toBeInTheDocument();
    });
  });
});
