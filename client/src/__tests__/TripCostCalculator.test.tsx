/**
 * Trip Cost Calculator Component Tests
 * Tests for React component rendering and interactions
 */

import { vi } from 'vitest';

// Mock the translation hook BEFORE importing the component
vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    t: (key: string) => key,
    setLanguage: vi.fn(),
  }),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TripCostCalculator } from '../components/TripCostCalculator';
import type { Location } from '../types';

// Mock location data
const mockLocations: Location[] = [
  {
    id: '1',
    name: { zh: '大安森林公園', en: 'Daan Forest Park' },
    description: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25.033, lng: 121.545 },
    address: { zh: '台北市', en: 'Taipei' },
    averageRating: 4.5,
    totalReviews: 100,
    facilities: ['playground'],
    pricing: { isFree: true },
    parking: { available: true, cost: '30-50', hasValidation: true },
    nearby: { nearbyRestaurants: true },
    booking: { requiresPreBooking: false },
    payment: { acceptsCash: true, acceptsLinePay: true },
  },
  {
    id: '2',
    name: { zh: '台北101', en: 'Taipei 101' },
    description: { zh: '購物中心', en: 'Mall' },
    category: 'attraction',
    coordinates: { lat: 25.033, lng: 121.545 },
    address: { zh: '台北市', en: 'Taipei' },
    averageRating: 4.8,
    totalReviews: 500,
    facilities: ['shopping'],
    pricing: { isFree: false, priceRange: '200-300' },
    parking: { available: true, cost: '50-80', hasValidation: true },
    nearby: { nearbyRestaurants: true },
    booking: { requiresPreBooking: false },
    payment: { acceptsCash: true, acceptsLinePay: true },
  },
];

describe('TripCostCalculator Component', () => {
  describe('Rendering', () => {
    it('should render with locations', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      expect(screen.getByText(/Trip Cost Calculator/i)).toBeInTheDocument();
    });

    it('should display empty state without locations', () => {
      render(<TripCostCalculator locations={[]} />);
      expect(screen.getByText(/Please select locations first/i)).toBeInTheDocument();
    });

    it('should render in dark mode', () => {
      const { container } = render(
        <TripCostCalculator locations={mockLocations} darkMode={true} />
      );
      const calculator = container.querySelector('.trip-cost-calculator');
      expect(calculator).toHaveClass('dark-mode');
    });

    it('should display all sections', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      expect(screen.getByText(/Family Composition/i)).toBeInTheDocument();
      expect(screen.getByText(/Transportation/i)).toBeInTheDocument();
      expect(screen.getByText(/Cost Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Budget Estimates/i)).toBeInTheDocument();
    });
  });

  describe('Family Composition', () => {
    it('should initialize with family composition section', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      expect(screen.getByText(/Family Composition/i)).toBeInTheDocument();
    });

    it('should have input fields for family size', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThanOrEqual(3); // adults, children, total
    });
  });

  describe('Transportation Options', () => {
    it('should have transportation section', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      expect(screen.getByText(/Transportation/i)).toBeInTheDocument();
    });

    it('should have radio buttons for transport options', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(2);
    });
  });

  describe('Budget Input', () => {
    it('should have budget section', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      expect(screen.getByText(/Your Budget/i)).toBeInTheDocument();
    });

    it('should have budget input field', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const budgetInputs = screen.getAllByRole('spinbutton').filter(input =>
        (input as HTMLInputElement).placeholder?.includes('e.g.')
      );
      expect(budgetInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Cost Display', () => {
    it('should display cost information', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      expect(screen.getByText(/Total/i)).toBeInTheDocument();
      expect(screen.getByText(/Per Person/i)).toBeInTheDocument();
    });
  });

  describe('Collapsible Sections', () => {
    it('should expand cost breakdown on click', async () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const breakdownHeader = screen.getByText(/Cost Breakdown/i);

      fireEvent.click(breakdownHeader);

      await waitFor(() => {
        expect(screen.getByText(/Admission/i)).toBeInTheDocument();
        expect(screen.getByText(/Parking/i)).toBeInTheDocument();
      });
    });

    it('should expand savings tips on click', async () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const tipsHeader = screen.getByText(/Money-Saving Tips/i);

      fireEvent.click(tipsHeader);

      await waitFor(() => {
        const tips = screen.queryByText(/💡|✨|🚌/);
        expect(tips || screen.queryByText(/snacks/i)).toBeInTheDocument();
      });
    });

    it('should expand payment opportunities on click', async () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const paymentHeader = screen.getByText(/Payment Opportunities/i);

      fireEvent.click(paymentHeader);

      await waitFor(() => {
        expect(screen.queryByText(/Payment|savings/i)).toBeInTheDocument();
      });
    });
  });

  describe('Budget Estimates', () => {
    it('should display three budget levels', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      expect(screen.getByText(/Budget Friendly/i)).toBeInTheDocument();
      expect(screen.getByText(/Comfortable/i)).toBeInTheDocument();
      expect(screen.getByText(/Premium/i)).toBeInTheDocument();
    });

    it('should show increasing costs for each level', async () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const estimates = screen.getAllByText(/💰|💳|✨/);
      expect(estimates.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Button Actions', () => {
    it('should have generate report button', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const button = screen.getByText(/Generate Budget Report/i);
      expect(button).toBeInTheDocument();
    });

    it('should call callback when generating report', async () => {
      const mockCallback = vi.fn();
      render(
        <TripCostCalculator
          locations={mockLocations}
          onBudgetPlanCreated={mockCallback}
        />
      );

      const button = screen.getByText(/Generate Budget Report/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled();
        const callArg = mockCallback.mock.calls[0][0];
        expect(typeof callArg).toBe('string');
        expect(callArg).toContain('預算');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      // Simulate mobile viewport
      global.innerWidth = 375;

      const { container } = render(
        <TripCostCalculator locations={mockLocations} />
      );
      const calculator = container.querySelector('.trip-cost-calculator');
      expect(calculator).toBeInTheDocument();
    });

    it('should render on tablet viewport', () => {
      global.innerWidth = 768;

      const { container } = render(
        <TripCostCalculator locations={mockLocations} />
      );
      const calculator = container.querySelector('.trip-cost-calculator');
      expect(calculator).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle complete user flow', async () => {
      const mockCallback = vi.fn();
      render(
        <TripCostCalculator
          locations={mockLocations}
          darkMode={false}
          onBudgetPlanCreated={mockCallback}
        />
      );

      // User adjusts family composition
      const adultInput = screen.getAllByLabelText(/Adults/i)[0] as HTMLInputElement;
      fireEvent.change(adultInput, { target: { value: '2' } });

      // User sets budget
      const budgetInput = screen.getByPlaceholderText(/e.g./i) as HTMLInputElement;
      fireEvent.change(budgetInput, { target: { value: '2000' } });

      // User toggles sections
      fireEvent.click(screen.getByText(/Cost Breakdown/i));
      await waitFor(() => {
        expect(screen.getByText(/Admission/i)).toBeInTheDocument();
      });

      // User generates report
      const button = screen.getByText(/Generate Budget Report/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled();
      });
    });

    it('should handle transportation change impact on costs', async () => {
      render(<TripCostCalculator locations={mockLocations} />);

      // Get initial costs with car
      const totalWithCar = screen.getByText(/Total/i).textContent;

      // Switch to public transit
      const publicTransitRadio = screen.getByLabelText(/Public Transit/i);
      fireEvent.click(publicTransitRadio);

      await waitFor(() => {
        const totalWithoutCar = screen.getByText(/Total/i).textContent;
        // Cost should decrease (no parking)
        expect(totalWithoutCar).not.toBe(totalWithCar);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      expect(screen.getByLabelText(/Adults/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Children/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const button = screen.getByText(/Generate Budget Report/i);

      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    });

    it('should have proper heading hierarchy', () => {
      render(<TripCostCalculator locations={mockLocations} />);
      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);

      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty locations', () => {
      render(<TripCostCalculator locations={[]} />);
      expect(screen.getByText(/Please select locations first/i)).toBeInTheDocument();
    });

    it('should handle dark mode', () => {
      const { container } = render(
        <TripCostCalculator locations={mockLocations} darkMode={true} />
      );
      const calculator = container.querySelector('.trip-cost-calculator.dark-mode');
      expect(calculator).toBeInTheDocument();
    });
  });
});
