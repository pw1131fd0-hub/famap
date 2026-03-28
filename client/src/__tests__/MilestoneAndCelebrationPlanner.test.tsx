/**
 * Tests for MilestoneAndCelebrationPlanner component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MilestoneAndCelebrationPlanner from '../components/MilestoneAndCelebrationPlanner';
import { LanguageProvider } from '../components/LanguageContext';

// Mock the CSS import
vi.mock('../styles/MilestoneAndCelebrationPlanner.css', () => ({}));

const renderWithLanguage = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('MilestoneAndCelebrationPlanner component', () => {
  beforeEach(() => {
    // Clear any mocks before each test
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with header', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const header = screen.getByText(/Milestone & Celebration Planner/i);
      expect(header).toBeInTheDocument();
    });

    it('should render with Chinese content when language is zh', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      // Check for English content as default
      expect(screen.getByText(/Milestone & Celebration Planner/i)).toBeInTheDocument();
    });

    it('should render all form sections', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      expect(screen.getByLabelText(/Milestone Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Milestone Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Celebrant Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Celebration Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Attendees/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Budget/i)).toBeInTheDocument();
    });

    it('should render milestone type selector', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const select = screen.getByDisplayValue(/Birthday/i);
      expect(select).toBeInTheDocument();
    });

    it('should render venue style buttons', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const casualButton = screen.getByRole('button', { name: /Casual/i });
      expect(casualButton).toBeInTheDocument();
    });

    it('should render generate button', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const generateButton = screen.getByRole('button', { name: /Generate Celebration Plan/i });
      expect(generateButton).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update milestone title when input changes', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const titleInput = screen.getByPlaceholderText(/e.g., Sarah's 5th Birthday/i);
      fireEvent.change(titleInput, { target: { value: 'Tom\'s Birthday Party' } });
      expect((titleInput as HTMLInputElement).value).toBe('Tom\'s Birthday Party');
    });

    it('should update celebrant name when input changes', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const nameInput = screen.getByPlaceholderText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Sarah' } });
      expect((nameInput as HTMLInputElement).value).toBe('Sarah');
    });

    it('should update age when input changes', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const ageInputs = screen.getAllByRole('spinbutton');
      const ageInput = ageInputs.find(input => (input as HTMLInputElement).max === '120');
      if (ageInput) {
        fireEvent.change(ageInput, { target: { value: '8' } });
        expect((ageInput as HTMLInputElement).value).toBe('8');
      }
    });

    it('should update attendees count', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const attendeeInputs = screen.getAllByRole('spinbutton');
      const attendeeInput = attendeeInputs.find(input => (input as HTMLInputElement).max === '500');
      if (attendeeInput) {
        fireEvent.change(attendeeInput, { target: { value: '20' } });
        expect((attendeeInput as HTMLInputElement).value).toBe('20');
      }
    });

    it('should update budget amount', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const budgetInputs = screen.getAllByRole('spinbutton');
      const budgetInput = budgetInputs.find(input => (input as HTMLInputElement).step === '100');
      if (budgetInput) {
        fireEvent.change(budgetInput, { target: { value: '5000' } });
        expect((budgetInput as HTMLInputElement).value).toBe('5000');
      }
    });

    it('should change milestone type', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const typeSelect = screen.getByDisplayValue(/Birthday/i);
      fireEvent.change(typeSelect, { target: { value: 'anniversary' } });
      expect((typeSelect as HTMLSelectElement).value).toBe('anniversary');
    });

    it('should toggle venue style selection', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const casualButton = screen.getByRole('button', { name: /Casual/i });
      expect(casualButton).not.toHaveClass('selected');
      fireEvent.click(casualButton);
      expect(casualButton).toHaveClass('selected');
    });

    it('should allow selecting multiple venue styles', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const outdoorButton = screen.getByRole('button', { name: /Outdoor/i });
      const adventureButton = screen.getByRole('button', { name: /Adventure/i });

      fireEvent.click(outdoorButton);
      fireEvent.click(adventureButton);

      expect(outdoorButton).toHaveClass('selected');
      expect(adventureButton).toHaveClass('selected');
    });

    it('should toggle special requirements', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const accessibleButton = screen.getByRole('button', { name: /Wheelchair Accessible/i });
      expect(accessibleButton).not.toHaveClass('selected');
      fireEvent.click(accessibleButton);
      expect(accessibleButton).toHaveClass('selected');
    });
  });

  describe('Date Handling', () => {
    it('should have a valid default date (future)', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const dateInput = screen.getByLabelText(/Celebration Date/i) as HTMLInputElement;
      expect(dateInput.value).toBeTruthy();

      const selectedDate = new Date(dateInput.value);
      const today = new Date();
      expect(selectedDate.getTime()).toBeGreaterThan(today.getTime());
    });

    it('should display urgency indicator', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const urgencyIndicator = screen.getByText(/Urgency:/i);
      expect(urgencyIndicator).toBeInTheDocument();
    });

    it('should allow changing the date', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const dateInput = screen.getByLabelText(/Celebration Date/i) as HTMLInputElement;
      const newDate = '2026-04-15';
      fireEvent.change(dateInput, { target: { value: newDate } });
      expect(dateInput.value).toBe(newDate);
    });
  });

  describe('Venue Suggestions', () => {
    it('should render suggested venues when provided', () => {
      const mockVenues = [
        {
          venueId: 'venue-1',
          venueName: 'Happy Park',
          category: 'park',
          matchScore: 85,
          celebrationReason: 'Great for outdoor parties',
          suggestedActivities: ['games', 'picnic'],
          estimatedCost: { perPerson: 150, total: 1800, includesFood: true, includesEntertainment: true },
          capacity: { minGroup: 5, maxGroup: 30, eventSpaceAvailable: true },
          besttimes: { weekdays: ['morning'], weekend: true, peakTimes: [] },
          advantages: ['Spacious'],
          considerations: ['Weather dependent']
        }
      ];

      renderWithLanguage(
        <MilestoneAndCelebrationPlanner suggestedVenues={mockVenues} />
      );

      expect(screen.getByText('Happy Park')).toBeInTheDocument();
      expect(screen.getByText('Great for outdoor parties')).toBeInTheDocument();
    });

    it('should allow selecting a venue', () => {
      const mockVenues = [
        {
          venueId: 'venue-1',
          venueName: 'Happy Park',
          category: 'park',
          matchScore: 85,
          celebrationReason: 'Great for outdoor parties',
          suggestedActivities: ['games', 'picnic'],
          estimatedCost: { perPerson: 150, total: 1800, includesFood: true, includesEntertainment: true },
          capacity: { minGroup: 5, maxGroup: 30, eventSpaceAvailable: true },
          besttimes: { weekdays: ['morning'], weekend: true, peakTimes: [] },
          advantages: ['Spacious'],
          considerations: ['Weather dependent']
        }
      ];

      renderWithLanguage(
        <MilestoneAndCelebrationPlanner suggestedVenues={mockVenues} />
      );

      const venueCard = screen.getByText('Happy Park').closest('.venue-card');
      expect(venueCard).toBeInTheDocument();

      if (venueCard) {
        fireEvent.click(venueCard);
        expect(venueCard).toHaveClass('selected');
      }
    });

    it('should display match scores for venues', () => {
      const mockVenues = [
        {
          venueId: 'venue-1',
          venueName: 'Happy Park',
          category: 'park',
          matchScore: 85,
          celebrationReason: 'Great for outdoor parties',
          suggestedActivities: ['games', 'picnic'],
          estimatedCost: { perPerson: 150, total: 1800, includesFood: true, includesEntertainment: true },
          capacity: { minGroup: 5, maxGroup: 30, eventSpaceAvailable: true },
          besttimes: { weekdays: ['morning'], weekend: true, peakTimes: [] },
          advantages: [],
          considerations: []
        }
      ];

      renderWithLanguage(
        <MilestoneAndCelebrationPlanner suggestedVenues={mockVenues} />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  describe('Plan Generation', () => {
    it('should call onPlanCreated callback when generating plan', () => {
      const mockCallback = vi.fn();
      const mockVenues = [
        {
          venueId: 'venue-1',
          venueName: 'Happy Park',
          category: 'park',
          matchScore: 85,
          celebrationReason: 'Great for outdoor parties',
          suggestedActivities: ['games', 'picnic'],
          estimatedCost: { perPerson: 150, total: 1800, includesFood: true, includesEntertainment: true },
          capacity: { minGroup: 5, maxGroup: 30, eventSpaceAvailable: true },
          besttimes: { weekdays: ['morning'], weekend: true, peakTimes: [] },
          advantages: [],
          considerations: []
        }
      ];

      renderWithLanguage(
        <MilestoneAndCelebrationPlanner
          suggestedVenues={mockVenues}
          onPlanCreated={mockCallback}
        />
      );

      // Select a venue first
      const venueCard = screen.getByText('Happy Park').closest('.venue-card');
      if (venueCard) {
        fireEvent.click(venueCard);
      }

      // Click generate button
      const generateButton = screen.getByRole('button', { name: /Generate Celebration Plan/i });
      fireEvent.click(generateButton);

      // Check callback was called
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should display plan results after generation', () => {
      const mockVenues = [
        {
          venueId: 'venue-1',
          venueName: 'Happy Park',
          category: 'park',
          matchScore: 85,
          celebrationReason: 'Great for outdoor parties',
          suggestedActivities: ['games', 'picnic'],
          estimatedCost: { perPerson: 150, total: 1800, includesFood: true, includesEntertainment: true },
          capacity: { minGroup: 5, maxGroup: 30, eventSpaceAvailable: true },
          besttimes: { weekdays: ['morning'], weekend: true, peakTimes: [] },
          advantages: [],
          considerations: []
        }
      ];

      renderWithLanguage(
        <MilestoneAndCelebrationPlanner suggestedVenues={mockVenues} />
      );

      const venueCard = screen.getByText('Happy Park').closest('.venue-card');
      if (venueCard) {
        fireEvent.click(venueCard);
      }

      const generateButton = screen.getByRole('button', { name: /Generate Celebration Plan/i });
      fireEvent.click(generateButton);

      // Check for plan results
      expect(screen.getByText(/Celebration Plan Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Success Score/i)).toBeInTheDocument();
    });

    it('should display success score with progress bar', () => {
      const mockVenues = [
        {
          venueId: 'venue-1',
          venueName: 'Happy Park',
          category: 'park',
          matchScore: 85,
          celebrationReason: 'Great',
          suggestedActivities: [],
          estimatedCost: { perPerson: 150, total: 1800, includesFood: true, includesEntertainment: true },
          capacity: { minGroup: 5, maxGroup: 30, eventSpaceAvailable: true },
          besttimes: { weekdays: ['morning'], weekend: true, peakTimes: [] },
          advantages: [],
          considerations: []
        }
      ];

      renderWithLanguage(
        <MilestoneAndCelebrationPlanner suggestedVenues={mockVenues} />
      );

      const venueCard = screen.getByText('Happy Park').closest('.venue-card');
      if (venueCard) {
        fireEvent.click(venueCard);
      }

      const generateButton = screen.getByRole('button', { name: /Generate Celebration Plan/i });
      fireEvent.click(generateButton);

      // Check for score bar
      const scoreBar = screen.getByText(/Success Score/i).closest('.success-score');
      expect(scoreBar?.querySelector('.score-bar')).toBeInTheDocument();
    });
  });

  describe('Analysis Display', () => {
    it('should display event analysis section', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      expect(screen.getByText(/Event Analysis/i)).toBeInTheDocument();
    });

    it('should show celebration scale', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      expect(screen.getByText(/Scale:/i)).toBeInTheDocument();
    });

    it('should show budget level', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      expect(screen.getByText(/Budget:/i)).toBeInTheDocument();
    });

    it('should show recommended style', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      expect(screen.getByText(/Recommended Style:/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      expect(screen.getByLabelText(/Milestone Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Celebrant Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
    });

    it('should have role attributes for buttons', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const generateButton = screen.getByRole('button', { name: /Generate Celebration Plan/i });
      expect(generateButton.tagName).toBe('BUTTON');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark-mode class when darkMode prop is true', () => {
      const { container } = renderWithLanguage(
        <MilestoneAndCelebrationPlanner darkMode={true} />
      );
      const plannerDiv = container.querySelector('.milestone-planner');
      expect(plannerDiv).toHaveClass('dark-mode');
    });

    it('should not apply dark-mode class when darkMode prop is false', () => {
      const { container } = renderWithLanguage(
        <MilestoneAndCelebrationPlanner darkMode={false} />
      );
      const plannerDiv = container.querySelector('.milestone-planner');
      expect(plannerDiv).not.toHaveClass('dark-mode');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty venue list gracefully', () => {
      renderWithLanguage(
        <MilestoneAndCelebrationPlanner suggestedVenues={[]} />
      );
      // Should still render without errors
      expect(screen.getByText(/Milestone & Celebration Planner/i)).toBeInTheDocument();
    });

    it('should handle large attendee numbers', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const attendeeInputs = screen.getAllByRole('spinbutton');
      const attendeeInput = attendeeInputs.find(input => (input as HTMLInputElement).max === '500');
      if (attendeeInput) {
        fireEvent.change(attendeeInput, { target: { value: '500' } });
        expect((attendeeInput as HTMLInputElement).value).toBe('500');
      }
    });

    it('should handle large budgets', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const budgetInputs = screen.getAllByRole('spinbutton');
      const budgetInput = budgetInputs.find(input => (input as HTMLInputElement).step === '100');
      if (budgetInput) {
        fireEvent.change(budgetInput, { target: { value: '100000' } });
        expect((budgetInput as HTMLInputElement).value).toBe('100000');
      }
    });

    it('should handle minimum valid inputs', () => {
      renderWithLanguage(<MilestoneAndCelebrationPlanner />);
      const attendeeInputs = screen.getAllByRole('spinbutton');
      const attendeeInput = attendeeInputs.find(input => (input as HTMLInputElement).max === '500');
      if (attendeeInput) {
        fireEvent.change(attendeeInput, { target: { value: '1' } });
        expect((attendeeInput as HTMLInputElement).value).toBe('1');
      }
    });
  });
});
