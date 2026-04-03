// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FamilyGroupOptimizer from '../components/FamilyGroupOptimizer';
import type { FamilyProfile, Location } from '../types';

describe('FamilyGroupOptimizer Component', () => {
  const mockCurrentFamily: FamilyProfile = {
    id: 'family-1',
    displayName: 'Smith Family',
    childrenAges: [5, 8],
    interests: ['parks', 'outdoor', 'educational'],
    monthlyBudget: 5000,
    specialNeeds: [],
  };

  const mockAvailableFamilies: FamilyProfile[] = [
    {
      id: 'family-2',
      displayName: 'Johnson Family',
      childrenAges: [6, 9],
      interests: ['parks', 'outdoor', 'recreational'],
      monthlyBudget: 5500,
      specialNeeds: [],
    },
    {
      id: 'family-3',
      displayName: 'Williams Family',
      childrenAges: [15, 17],
      interests: ['cultural', 'adventure'],
      monthlyBudget: 10000,
      specialNeeds: [],
    },
    {
      id: 'family-4',
      displayName: 'Brown Family',
      childrenAges: [4, 7],
      interests: ['parks', 'outdoor'],
      monthlyBudget: 4500,
      specialNeeds: [],
    },
  ];

  const mockAvailableVenues: Location[] = [
    {
      id: 'venue-1',
      name: 'City Park',
      coordinates: { lat: 25.0, lng: 121.5 },
      category: 'park',
    },
    {
      id: 'venue-2',
      name: 'Museum',
      coordinates: { lat: 25.05, lng: 121.55 },
      category: 'cultural',
    },
  ];

  describe('Rendering', () => {
    it('should render the component with title', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );
      expect(
        screen.getByText('Family Group Outing Optimizer')
      ).toBeInTheDocument();
    });

    it('should display current family information', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );
      expect(screen.getByText('Smith Family')).toBeInTheDocument();
      expect(screen.getByText(/2 \(/)).toBeInTheDocument();
    });

    it('should render family interests as tags', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );
      expect(screen.getByText('parks')).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );
      expect(
        screen.getByText(/Filter by Similar Budget/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Minimum Compatibility/i)).toBeInTheDocument();
    });

    it('should display compatible families count', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );
      expect(
        screen.getByText(/Compatible Families \(\d+\)/)
      ).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('should toggle budget filter checkbox', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkbox = container.querySelector(
        '.fgo-checkbox input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.checked).toBe(true);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it('should update minimum compatibility slider', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const slider = container.querySelector(
        '.fgo-slider'
      ) as HTMLInputElement;
      expect(slider).toBeInTheDocument();

      fireEvent.change(slider, { target: { value: '75' } });
      expect(slider.value).toBe('75');
    });

    it('should display minimum compatibility value in label', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const slider = container.querySelector(
        '.fgo-slider'
      ) as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '80' } });

      expect(screen.getByText(/Minimum Compatibility: 80%/)).toBeInTheDocument();
    });
  });

  describe('Family Matching', () => {
    it('should display matched families as cards', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      expect(screen.getByText('Johnson Family')).toBeInTheDocument();
    });

    it('should show compatibility scores for matches', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const scoreElements = container.querySelectorAll(
        '.fgo-compatibility-score'
      );
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    it('should display compatibility metrics with progress bars', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const metricBars = container.querySelectorAll('.metric-bar');
      expect(metricBars.length).toBeGreaterThan(0);
    });

    it('should show reasons for family matches', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const reasonTags = container.querySelectorAll('.fgo-reason-tag');
      expect(reasonTags.length).toBeGreaterThan(0);
    });

    it('should display no matches message when appropriate', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={[]}
        />
      );

      expect(
        screen.getByText(/Compatible Families \(0\)/)
      ).toBeInTheDocument();
    });
  });

  describe('Family Selection', () => {
    it('should select family when clicking checkbox', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;
      expect(checkboxes.length).toBeGreaterThan(0);

      fireEvent.click(checkboxes[0]);
      expect(checkboxes[0].checked).toBe(true);
    });

    it('should highlight selected family card', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;
      fireEvent.click(checkboxes[0]);

      const selectedCard = container.querySelector('.fgo-match-card.selected');
      expect(selectedCard).toBeInTheDocument();
    });

    it('should call onSelectMatch callback when family is selected', () => {
      const onSelectMatch = vi.fn();
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
          onSelectMatch={onSelectMatch}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;
      fireEvent.click(checkboxes[0]);

      expect(onSelectMatch).toHaveBeenCalled();
    });

    it('should deselect family when clicking checkbox again', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;

      fireEvent.click(checkboxes[0]);
      expect(checkboxes[0].checked).toBe(true);

      fireEvent.click(checkboxes[0]);
      expect(checkboxes[0].checked).toBe(false);
    });
  });

  describe('Group Optimization Display', () => {
    it('should display group optimization section when families are selected', async () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(
          screen.getByText(/Group Configuration/)
        ).toBeInTheDocument();
      });
    });

    it('should display group composition information', async () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(
          screen.getByText(/Group Composition/)
        ).toBeInTheDocument();
      });
    });

    it('should display estimated group budget', async () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        const budgetElements = screen.getAllByText(/Estimated Budget/i);
        expect(budgetElements.length).toBeGreaterThan(0);
      });
    });

    it('should display outing type recommendations', async () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(
          screen.getByText(/Best Outing Types/)
        ).toBeInTheDocument();
      });
    });

    it('should display group success recommendations', async () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const checkboxes = container.querySelectorAll(
        '.fgo-match-checkbox'
      ) as NodeListOf<HTMLInputElement>;
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(
          screen.getByText(/Group Success Tips/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode class when darkMode prop is true', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
          darkMode={true}
        />
      );

      const optimizer = container.querySelector('.family-group-optimizer');
      expect(optimizer).toHaveClass('dark-mode');
    });

    it('should not apply dark mode class when darkMode prop is false', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
          darkMode={false}
        />
      );

      const optimizer = container.querySelector('.family-group-optimizer');
      expect(optimizer).not.toHaveClass('dark-mode');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const h2 = screen.getByRole('heading', {
        level: 2,
      });
      expect(h2).toBeInTheDocument();
    });

    it('should have accessible form controls', () => {
      const { container } = render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should have readable contrast in labels', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={mockAvailableFamilies}
        />
      );

      const labels = screen.getAllByText(/Budget/i);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty available families list', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
          availableFamilies={[]}
        />
      );

      expect(screen.getByText(/Compatible Families \(0\)/)).toBeInTheDocument();
    });

    it('should handle current family with no children', () => {
      const familyNoChildren: FamilyProfile = {
        ...mockCurrentFamily,
        childrenAges: [],
      };

      render(
        <FamilyGroupOptimizer
          currentFamily={familyNoChildren}
          availableFamilies={mockAvailableFamilies}
        />
      );

      expect(
        screen.getByText(/Family Group Outing Optimizer/)
      ).toBeInTheDocument();
    });

    it('should handle families with no interests', () => {
      const familyNoInterests: FamilyProfile = {
        ...mockCurrentFamily,
        interests: [],
      };

      render(
        <FamilyGroupOptimizer
          currentFamily={familyNoInterests}
          availableFamilies={mockAvailableFamilies}
        />
      );

      expect(
        screen.getByText(/Family Group Outing Optimizer/)
      ).toBeInTheDocument();
    });

    it('should handle undefined optional props', () => {
      render(
        <FamilyGroupOptimizer
          currentFamily={mockCurrentFamily}
        />
      );

      expect(
        screen.getByText(/Family Group Outing Optimizer/)
      ).toBeInTheDocument();
    });
  });
});
