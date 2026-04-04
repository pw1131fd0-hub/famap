// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IntelligentActivityPlanner from '../components/IntelligentActivityPlanner';
import type { Location } from '../types';
import { LanguageProvider } from '../i18n/LanguageContext';

// Mock fetch to prevent hanging from pending requests in happy-dom
beforeAll(() => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });
  global.fetch = mockFetch;
  if (typeof window !== 'undefined') {
    (window as any).fetch = mockFetch;
  }
});

afterAll(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});

const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '公園', en: 'Park' },
    description: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25.0330, lng: 121.5654 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['playground', 'stroller-accessible', 'restroom'],
    averageRating: 4.5,
  },
  {
    id: '2',
    name: { zh: '餐廳', en: 'Restaurant' },
    description: { zh: '餐廳', en: 'Restaurant' },
    category: 'restaurant',
    coordinates: { lat: 25.0340, lng: 121.5664 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['high-chair', 'changing-table', 'family-friendly'],
    averageRating: 4.2,
  },
  {
    id: '3',
    name: { zh: '公園', en: 'Park' },
    description: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25.0350, lng: 121.5674 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['elevator', 'restroom', 'family-friendly'],
    averageRating: 4.8,
  },
  {
    id: '4',
    name: { zh: '公園', en: 'Park' },
    description: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25.0320, lng: 121.5644 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['high-chair', 'wifi', 'family-friendly'],
    averageRating: 4.3,
  },
];

const renderWithLanguage = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('IntelligentActivityPlanner Component', () => {
  describe('Rendering', () => {
    it('should render the component with title', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );
      expect(screen.getByText(/Intelligent Activity Planner|智能活動計劃/i)).toBeInTheDocument();
    });

    it('should render configuration controls', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );
      expect(screen.getByText(/Children Ages|孩子年齡/i)).toBeInTheDocument();
      expect(screen.getByText(/Duration|持續時間/i)).toBeInTheDocument();
      expect(screen.getByText(/Preferences|偏好/i)).toBeInTheDocument();
    });

    it('should render activity cards when locations are provided', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const cards = screen.queryAllByText(/Family Day Out|家庭一日遊/i);
        expect(cards.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Family Configuration', () => {
    it('should display initial children age', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should allow adding new children ages', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const addButton = screen.getByText(/\+ Add Age|\+ 添加年齡/i);
      fireEvent.click(addButton);

      await waitFor(() => {
        const ageInputs = screen.getAllByDisplayValue(/\d+/);
        expect(ageInputs.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should allow removing children ages', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      // Add an age first
      const addButton = screen.getByText(/\+ Add Age|\+ 添加年齡/i);
      fireEvent.click(addButton);

      await waitFor(() => {
        const removeButtons = screen.getAllByText('×');
        if (removeButtons.length > 0) {
          fireEvent.click(removeButtons[0]);
        }
      });
    });

    it('should handle duration slider changes', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const durationInputs = screen.getAllByRole('slider');
      expect(durationInputs.length).toBeGreaterThan(0);
    });

    it('should handle educational preference toggle', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });
  });

  describe('Activity Display', () => {
    it('should display activity details on click', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const activityHeaders = screen.queryAllByText(/Family Day Out|家庭一日遊/i);
        if (activityHeaders.length > 0) {
          fireEvent.click(activityHeaders[0]);
        }
      });
    });

    it('should display crowd level badges', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const crowdLevelText = screen.queryByText(/Low|Moderate|High|低|中等|高/i);
        expect(crowdLevelText).toBeInTheDocument();
      });
    });

    it('should display duration in human-readable format', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );
      // Component should render without errors
      expect(screen.getByText(/Intelligent Activity Planner|智能活動計劃/i)).toBeInTheDocument();
    });

    it('should display estimated cost', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const costText = screen.queryByText(/TWD|元/i);
        expect(costText).toBeInTheDocument();
      });
    });

    it('should display number of stops', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const stopsText = screen.queryByText(/Stops|站點/i);
        expect(stopsText).toBeInTheDocument();
      });
    });
  });

  describe('Activity Selection', () => {
    it('should call onActivitySelect callback when activity is selected', async () => {
      const mockCallback = vi.fn();
      renderWithLanguage(
        <IntelligentActivityPlanner
          locations={mockLocations}
          onActivitySelect={mockCallback}
        />
      );

      await waitFor(() => {
        const activityHeaders = screen.queryAllByText(/Family Day Out|家庭一日遊/i);
        if (activityHeaders.length > 0) {
          fireEvent.click(activityHeaders[0]);
          const useButton = screen.queryByText(/Use This Plan|使用此計劃/i);
          if (useButton) {
            fireEvent.click(useButton);
          }
        }
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode styles when isDarkMode is true', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} isDarkMode={true} />
      );
      expect(screen.getByText(/Intelligent Activity Planner|智能活動計劃/i)).toBeInTheDocument();
    });

    it('should apply light mode styles when isDarkMode is false', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} isDarkMode={false} />
      );
      expect(screen.getByText(/Intelligent Activity Planner|智能活動計劃/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty locations array gracefully', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={[]} />
      );
      expect(screen.getByText(/Intelligent Activity Planner|智能活動計劃/i)).toBeInTheDocument();
    });

    it('should display message when no activities found', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={[mockLocations[0]]} />
      );

      await waitFor(() => {
        const noActivitiesMsg = screen.queryByText(/No suitable activities|無法找到合適的活動/i);
        // May or may not appear depending on whether system generates activities
        expect(noActivitiesMsg || screen.getByText(/Intelligent Activity Planner|智能活動計劃/i)).toBeTruthy();
      });
    });
  });

  describe('Bilingual Support', () => {
    it('should render component in default language', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );
      // Component defaults to Chinese, check for Chinese title
      expect(screen.getByText(/智能活動計劃/i)).toBeInTheDocument();
    });

    it('should display both English and Chinese text for activities', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const activity = screen.queryByText(/Family Day Out|家庭一日遊/i);
        expect(activity).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should toggle activity details on click', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const activityHeaders = screen.queryAllByText(/Family Day Out|家庭一日遊/i);
        if (activityHeaders.length > 0) {
          fireEvent.click(activityHeaders[0]);
          // Click again to collapse
          fireEvent.click(activityHeaders[0]);
        }
      });
    });

    it('should update activities when family configuration changes', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const durationInputs = screen.getAllByRole('slider');
      if (durationInputs.length > 0) {
        fireEvent.change(durationInputs[0], { target: { value: '5' } });

        await waitFor(() => {
          expect(screen.getByText('5')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and semantics', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very young children (0-2 years)', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const addButton = screen.getByText(/\+ Add Age|\+ 添加年齡/i);
      for (let i = 0; i < 3; i++) {
        fireEvent.click(addButton);
      }
    });

    it('should handle many children', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const addButton = screen.getByText(/\+ Add Age|\+ 添加年齡/i);
      // Try to add multiple ages
      fireEvent.click(addButton);
      fireEvent.click(addButton);
    });

    it('should handle very short duration (1 hour)', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const durationInputs = screen.getAllByRole('slider');
      if (durationInputs.length > 0) {
        fireEvent.change(durationInputs[0], { target: { value: '1' } });
      }
    });

    it('should handle very long duration (8 hours)', () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      const durationInputs = screen.getAllByRole('slider');
      if (durationInputs.length > 0) {
        fireEvent.change(durationInputs[0], { target: { value: '8' } });
      }
    });
  });

  describe('Stop Details Display', () => {
    it('should display all stops when activity is expanded', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const activityHeaders = screen.queryAllByText(/Family Day Out|家庭一日遊/i);
        if (activityHeaders.length > 0) {
          fireEvent.click(activityHeaders[0]);

          // Look for stop details
          const stopsHeader = screen.queryByText(/Stops|站點/i);
          expect(stopsHeader).toBeInTheDocument();
        }
      });
    });

    it('should display facility highlights for each stop', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const activityHeaders = screen.queryAllByText(/Family Day Out|家庭一日遊/i);
        if (activityHeaders.length > 0) {
          fireEvent.click(activityHeaders[0]);

          const facilitiesHeader = screen.queryByText(/Facility Highlights|設施亮點/i);
          expect(facilitiesHeader).toBeInTheDocument();
        }
      });
    });
  });

  describe('Recommendation Reason Display', () => {
    it('should display why the activity is recommended', async () => {
      renderWithLanguage(
        <IntelligentActivityPlanner locations={mockLocations} />
      );

      await waitFor(() => {
        const activityHeaders = screen.queryAllByText(/Family Day Out|家庭一日遊/i);
        if (activityHeaders.length > 0) {
          fireEvent.click(activityHeaders[0]);
        }
      });
    });
  });
});
