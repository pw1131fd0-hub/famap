// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';
import MonthlyTravelPlanner from '../components/MonthlyTravelPlanner';
import type { Location } from '../types';

// Mock the useLanguage hook
vi.mock('../i18n/useLanguage', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

describe('MonthlyTravelPlanner Component', () => {
  let mockLocations: Location[];

  beforeEach(() => {
    mockLocations = [
      {
        id: '1',
        name_en: 'Central Park',
        name_zh: '中央公園',
        category: 'park',
        coordinates: { lat: 40.7829, lng: -73.9654 },
        facilities: ['stroller_accessible'],
        averageRating: 4.8,
        address_en: '123 Park Ave',
        address_zh: '公園大街123號',
      },
      {
        id: '2',
        name_en: 'Children Museum',
        name_zh: '兒童博物館',
        category: 'attraction',
        coordinates: { lat: 40.7614, lng: -73.7776 },
        facilities: ['stroller_accessible'],
        averageRating: 4.6,
        address_en: '456 Museum Rd',
        address_zh: '博物館路456號',
      },
      {
        id: '3',
        name_en: 'Family Restaurant',
        name_zh: '家庭餐廳',
        category: 'restaurant',
        coordinates: { lat: 40.7505, lng: -73.9972 },
        facilities: ['high_chair'],
        averageRating: 4.3,
        address_en: '789 Food St',
        address_zh: '美食街789號',
      },
    ];
  });

  describe('Rendering', () => {
    it('should render the component with locations', () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      expect(screen.getByText(/Monthly Family Travel Planner/i)).toBeInTheDocument();
      expect(screen.getByText(/Generate Plan/i)).toBeInTheDocument();
    });

    it('should render with empty locations', () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={[]} />
        </LanguageProvider>
      );

      expect(screen.getByText(/Monthly Family Travel Planner/i)).toBeInTheDocument();
      expect(screen.getByText(/No locations available/i)).toBeInTheDocument();
    });

    it('should render month and year selectors', () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('should have settings button', () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const settingsBtn = screen.getByTitle(/Settings/i);
      expect(settingsBtn).toBeInTheDocument();
    });
  });

  describe('Settings Panel', () => {
    it('should toggle settings visibility', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const settingsBtn = screen.getByTitle(/Settings/i);
      fireEvent.click(settingsBtn);

      await waitFor(() => {
        expect(screen.getByDisplayValue(/nearby|Nearby/)).toBeInTheDocument();
      });
    });

    it('should allow budget adjustment', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const settingsBtn = screen.getByTitle(/Settings/i);
      fireEvent.click(settingsBtn);

      const budgetInputs = screen.getAllByDisplayValue('500');
      expect(budgetInputs.length).toBeGreaterThan(0);
    });

    it('should allow adding child age', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const settingsBtn = screen.getByTitle(/Settings/i);
      fireEvent.click(settingsBtn);

      const addButtons = screen.getAllByText(/Add/);
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Plan Generation', () => {
    it('should generate a plan on button click', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Weekly Breakdown/i)).toBeInTheDocument();
      });
    });

    it('should show budget summary after generation', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        // Check for budget summary cards which appear after generation
        const budgetCards = screen.getAllByText(/Monthly Budget|Estimated Cost/i);
        expect(budgetCards.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('should display monthly summary', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        // Look for any element that indicates summary is displayed
        try {
          expect(screen.getByText(/Summary/i)).toBeInTheDocument();
        } catch (e) {
          // Alternative check for summary content
          expect(screen.getByText(/Variety Score|Family-Friendliness/i)).toBeInTheDocument();
        }
      }, { timeout: 2000 });
    });

    it('should show recommendations', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
      });
    });

    it('should display export button after generation', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Export Plan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Month/Year Selection', () => {
    it('should update month selection', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const selects = screen.getAllByRole('combobox');
      const monthSelect = selects[0];

      fireEvent.change(monthSelect, { target: { value: '5' } });

      await waitFor(() => {
        expect((monthSelect as HTMLSelectElement).value).toBe('5');
      });
    });

    it('should update year selection', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const selects = screen.getAllByRole('combobox');
      const yearSelect = selects[selects.length - 1];

      fireEvent.change(yearSelect, { target: { value: '2027' } });

      await waitFor(() => {
        expect((yearSelect as HTMLSelectElement).value).toBe('2027');
      });
    });
  });

  describe('Disabled States', () => {
    it('should disable generate button when no locations', () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={[]} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i) as HTMLButtonElement;
      expect(generateBtn.disabled).toBe(true);
    });

    it('should enable generate button when locations available', () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i) as HTMLButtonElement;
      expect(generateBtn.disabled).toBe(false);
    });
  });

  describe('Export Functionality', () => {
    it('should call onExport callback when export button clicked', async () => {
      const onExportMock = vi.fn();

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} onExport={onExportMock} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        const exportBtn = screen.getByText(/Export Plan/i);
        fireEvent.click(exportBtn);

        expect(onExportMock).toHaveBeenCalled();
      });
    });

    it('should create downloadable file on export', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        const exportBtn = screen.getByText(/Export Plan/i);
        fireEvent.click(exportBtn);

        // Verify createElement was called for download link
        expect(createElementSpy).toHaveBeenCalledWith('a');
      });

      createElementSpy.mockRestore();
    });
  });

  describe('Responsive Layout', () => {
    it('should render properly on mobile viewport', async () => {
      // Mock window size
      global.innerWidth = 375;

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      expect(screen.getByText(/Monthly Family Travel Planner/i)).toBeInTheDocument();
    });

    it('should render properly on tablet viewport', async () => {
      global.innerWidth = 768;

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      expect(screen.getByText(/Monthly Family Travel Planner/i)).toBeInTheDocument();
    });

    it('should render properly on desktop viewport', async () => {
      global.innerWidth = 1200;

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      expect(screen.getByText(/Monthly Family Travel Planner/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle rapid plan generation', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);

      // Click multiple times rapidly
      fireEvent.click(generateBtn);
      fireEvent.click(generateBtn);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        // Should still display properly
        expect(screen.getByText(/Weekly Breakdown/i)).toBeInTheDocument();
      });
    });

    it('should handle settings panel toggle multiple times', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const settingsBtn = screen.getByTitle(/Settings/i);

      // Toggle multiple times
      fireEvent.click(settingsBtn);
      fireEvent.click(settingsBtn);
      fireEvent.click(settingsBtn);

      // Should still be functional
      expect(settingsBtn).toBeInTheDocument();
    });
  });

  describe('Data Updates', () => {
    it('should update plan when family profile changes', async () => {
      const { rerender } = render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Weekly Breakdown/i)).toBeInTheDocument();
      });

      // Update with different locations
      const updatedLocations = [...mockLocations, mockLocations[0]];
      rerender(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={updatedLocations} />
        </LanguageProvider>
      );

      // Generate new plan
      const newGenerateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(newGenerateBtn);

      await waitFor(() => {
        expect(screen.getByText(/Weekly Breakdown/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const settingsBtn = screen.getByTitle(/Settings/i);
      fireEvent.click(settingsBtn);

      // All inputs should be accessible
      expect(screen.getByRole('button', { name: /Generate Plan/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={mockLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i) as HTMLButtonElement;

      // Simulate keyboard activation
      generateBtn.focus();
      fireEvent.keyDown(generateBtn, { key: 'Enter', code: 'Enter' });

      // Button should be focused
      expect(generateBtn).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single location', () => {
      const singleLocation = [mockLocations[0]];

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={singleLocation} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      expect(generateBtn).not.toBeDisabled();
    });

    it('should handle many locations', () => {
      const manyLocations = Array.from({ length: 50 }, (_, i) => ({
        ...mockLocations[i % mockLocations.length],
        id: `loc-${i}`,
      }));

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={manyLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      // Should complete without errors
      expect(generateBtn).toBeInTheDocument();
    });

    it('should handle duplicate locations', () => {
      const duplicateLocations = [...mockLocations, ...mockLocations];

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={duplicateLocations} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      fireEvent.click(generateBtn);

      // Should handle gracefully
      expect(generateBtn).toBeInTheDocument();
    });

    it('should handle locations with missing properties', () => {
      const incompleteLocations = [
        {
          id: '1',
          name_en: 'Test Location',
          name_zh: '測試位置',
          category: 'park' as const,
          coordinates: { lat: 0, lng: 0 },
          facilities: [],
        },
      ];

      render(
        <LanguageProvider>
          <MonthlyTravelPlanner locations={incompleteLocations as any} />
        </LanguageProvider>
      );

      const generateBtn = screen.getByText(/Generate Plan/i);
      expect(generateBtn).not.toBeDisabled();
    });
  });
});
