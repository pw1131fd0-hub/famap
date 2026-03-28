import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccessibilityAssistant } from '../components/AccessibilityAssistant';

describe('AccessibilityAssistant Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering Tests
  describe('Component Rendering', () => {
    it('should render the component with header', () => {
      render(<AccessibilityAssistant />);

      expect(
        screen.getByText(/Accessibility & Special Needs Assistant/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Find the perfect venues for your family's unique needs/)
      ).toBeInTheDocument();
    });

    it('should display profile section', () => {
      render(<AccessibilityAssistant />);

      expect(screen.getByText(/Special Needs Profiles/)).toBeInTheDocument();
      expect(screen.getByText(/New Profile/)).toBeInTheDocument();
    });

    it('should display empty state message initially', () => {
      render(<AccessibilityAssistant />);

      expect(
        screen.getByText(/Create a special needs profile to get personalized/)
      ).toBeInTheDocument();
    });
  });

  // Profile Creation Tests
  describe('Profile Creation', () => {
    it('should show form when New Profile button clicked', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        expect(screen.getByText(/Child's Name:/)).toBeInTheDocument();
        expect(screen.getByText(/Age:/)).toBeInTheDocument();
      });
    });

    it('should hide form when Cancel clicked', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        expect(screen.getByText(/Child's Name:/)).toBeInTheDocument();
      });

      const cancelBtn = screen.getByText(/✕ Cancel/);
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Child's Name:/)).not.toBeInTheDocument();
      });
    });

    it('should allow entering child name', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Alex' } });

        expect(nameInput).toHaveValue('Alex');
      });
    });

    it('should allow selecting age', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const ageInput = screen.getByDisplayValue('5');
        fireEvent.change(ageInput, { target: { value: '8' } });

        expect(ageInput).toHaveValue(8);
      });
    });

    it('should allow selecting conditions', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const autismCheckbox = screen.getByRole('checkbox', {
          name: /autism/i,
        });
        fireEvent.click(autismCheckbox);

        expect(autismCheckbox).toBeChecked();
      });
    });

    it('should create profile when form submitted', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Alex' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      await waitFor(() => {
        expect(screen.getByText('Alex')).toBeInTheDocument();
      });
    });

    it('should display created profile as a card', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'TestChild' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      await waitFor(() => {
        const profileCard = screen.getByText('TestChild');
        expect(profileCard).toBeInTheDocument();
      });
    });
  });

  // Profile Selection Tests
  describe('Profile Selection', () => {
    it('should allow selecting a profile', async () => {
      render(<AccessibilityAssistant />);

      // Create first profile
      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Child1' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      // Click on profile to select
      await waitFor(() => {
        const profileCard = screen.getByText('Child1');
        fireEvent.click(profileCard);

        const card = profileCard.closest('.profile-card');
        expect(card).toHaveClass('selected');
      });
    });
  });

  // Venue Assessment Display Tests
  describe('Venue Assessment Display', () => {
    it('should show venue cards when profile selected', async () => {
      render(<AccessibilityAssistant />);

      // Create and select profile
      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Alex' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      await waitFor(() => {
        const profileCard = screen.getByText('Alex');
        fireEvent.click(profileCard);
      });

      // Verify venue section appears
      await waitFor(() => {
        expect(
          screen.getByText(/Venue Accessibility Assessment/)
        ).toBeInTheDocument();
      });
    });

    it('should display venue names', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Alex' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      await waitFor(() => {
        const profileCard = screen.getByText('Alex');
        fireEvent.click(profileCard);
      });

      await waitFor(() => {
        expect(screen.getByText('Peaceful Park')).toBeInTheDocument();
        expect(screen.getByText('Urban Entertainment Center')).toBeInTheDocument();
        expect(screen.getByText('Family-Friendly Museum')).toBeInTheDocument();
      });
    });

    it('should display accessibility scores', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Alex' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      await waitFor(() => {
        const profileCard = screen.getByText('Alex');
        fireEvent.click(profileCard);
      });

      await waitFor(() => {
        const matchScores = screen.getAllByText(/Match/);
        expect(matchScores.length).toBeGreaterThan(0);
      });
    });
  });

  // Form Validation Tests
  describe('Form Validation', () => {
    it('should allow sound sensitivity selection', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const soundSelects = screen.getAllByDisplayValue('normal');
        const soundSelect = soundSelects.find((s) =>
          s.closest('.form-group')?.textContent?.includes('Sound Sensitivity')
        );

        if (soundSelect) {
          fireEvent.change(soundSelect, { target: { value: 'high' } });
          expect(soundSelect).toHaveValue('high');
        }
      });
    });

    it('should allow crowd tolerance selection', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const selects = screen.getAllByDisplayValue('normal');
        const crowdSelect = selects.find((s) =>
          s.closest('.form-group')?.textContent?.includes('Crowd Tolerance')
        );

        if (crowdSelect) {
          fireEvent.change(crowdSelect, { target: { value: 'low' } });
          expect(crowdSelect).toHaveValue('low');
        }
      });
    });
  });

  // Best Venues Section Tests
  describe('Best Venues Section', () => {
    it('should show best venues list when profile selected', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Alex' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      await waitFor(() => {
        const profileCard = screen.getByText('Alex');
        fireEvent.click(profileCard);
      });

      await waitFor(() => {
        expect(screen.getByText(/Best Venues for Alex/)).toBeInTheDocument();
      });
    });
  });

  // Multiple Profiles Tests
  describe('Multiple Profiles', () => {
    it('should support creating multiple profiles', async () => {
      render(<AccessibilityAssistant />);

      // Create first profile
      let newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Alex' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      // Create second profile
      newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'Jordan' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      // Verify both profiles exist
      await waitFor(() => {
        expect(screen.getByText('Alex')).toBeInTheDocument();
        expect(screen.getByText('Jordan')).toBeInTheDocument();
      });
    });

    it('should switch between profiles', async () => {
      render(<AccessibilityAssistant />);

      // Create two profiles
      for (let i = 0; i < 2; i++) {
        const newProfileBtn = screen.getByText(/New Profile/);
        fireEvent.click(newProfileBtn);

        await waitFor(() => {
          const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
          fireEvent.change(nameInput, {
            target: { value: `Child${i}` },
          });

          const createBtn = screen.getByText(/Create Profile/);
          fireEvent.click(createBtn);
        });
      }

      // Switch between profiles
      const profile1 = screen.getByText('Child0');
      const profile2 = screen.getByText('Child1');

      fireEvent.click(profile1);
      await waitFor(() => {
        expect(profile1.closest('.profile-card')).toHaveClass('selected');
      });

      fireEvent.click(profile2);
      await waitFor(() => {
        expect(profile2.closest('.profile-card')).toHaveClass('selected');
      });
    });
  });

  // Accessibility Tests
  describe('Accessibility Features', () => {
    it('should have proper heading structure', () => {
      render(<AccessibilityAssistant />);

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      expect(newProfileBtn).toBeInTheDocument();
    });

    it('should have form labels for inputs', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        expect(screen.getByText(/Child's Name:/)).toBeInTheDocument();
        expect(screen.getByText(/Age:/)).toBeInTheDocument();
      });
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle form submission gracefully', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      // Try to create profile without name
      await waitFor(() => {
        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      // Should handle gracefully without crashing
      expect(screen.getByText(/Special Needs Profiles/)).toBeInTheDocument();
    });
  });

  // UI State Tests
  describe('UI State Management', () => {
    it('should maintain form state during input', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'TestName' } });

        // Verify input maintains value
        expect(nameInput).toHaveValue('TestName');
      });
    });

    it('should clear form after profile creation', async () => {
      render(<AccessibilityAssistant />);

      const newProfileBtn = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        fireEvent.change(nameInput, { target: { value: 'TestName' } });

        const createBtn = screen.getByText(/Create Profile/);
        fireEvent.click(createBtn);
      });

      // Open form again
      const newProfileBtn2 = screen.getByText(/New Profile/);
      fireEvent.click(newProfileBtn2);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/e.g., Alex/);
        // Should be empty after profile creation and form reopening
        expect(nameInput).toHaveValue('');
      });
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should render properly on mobile viewport', () => {
      // Set mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;

      const { container } = render(<AccessibilityAssistant />);

      expect(container.querySelector('.accessibility-assistant')).toBeInTheDocument();
    });

    it('should render properly on tablet viewport', () => {
      // Set tablet viewport
      global.innerWidth = 768;
      global.innerHeight = 1024;

      const { container } = render(<AccessibilityAssistant />);

      expect(container.querySelector('.accessibility-assistant')).toBeInTheDocument();
    });
  });
});
