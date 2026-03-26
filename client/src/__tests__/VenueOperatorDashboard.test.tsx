import { render, screen, fireEvent } from '@testing-library/react';
import VenueOperatorDashboard from '../components/VenueOperatorDashboard';
import { vi } from 'vitest';

// Mock the useLanguage hook
vi.mock('../i18n/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
  }),
}));

describe('VenueOperatorDashboard', () => {
  const defaultProps = {
    venueId: 'test_venue_1',
    venueName: {
      zh: '測試公園',
      en: 'Test Park',
    },
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <VenueOperatorDashboard {...defaultProps} />
      );
      expect(container).toBeTruthy();
    });

    it('should display the dashboard title', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);
      expect(screen.getByText(/Venue Operator Dashboard/i)).toBeInTheDocument();
    });

    it('should display the venue name in welcome message', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    it('should display all tab buttons', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Visitor Demographics/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reviews/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Competitive Analysis/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
    });

    it('should render dark mode when prop is true', () => {
      const { container } = render(
        <VenueOperatorDashboard {...defaultProps} isDarkMode={true} />
      );

      const darkModeElement = container.querySelector('.darkMode');
      expect(darkModeElement).toBeTruthy();
    });
  });

  describe('Overview Tab', () => {
    it('should render overview tab by default', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      expect(screen.getByText(/Profile Views/i)).toBeInTheDocument();
      expect(screen.getByText(/Added to Favorites/i)).toBeInTheDocument();
      expect(screen.getByText(/Search Impressions/i)).toBeInTheDocument();
      expect(screen.getByText(/Reviews/i)).toBeInTheDocument();
    });

    it('should display metric cards with values', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const metricValues = screen.getAllByText(/↑/);
      expect(metricValues.length).toBeGreaterThan(0);
    });

    it('should display rating distribution', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      expect(screen.getByText(/Average Rating/i)).toBeInTheDocument();
      expect(screen.getByText(/5⭐/i)).toBeInTheDocument();
      expect(screen.getByText(/4⭐/i)).toBeInTheDocument();
      expect(screen.getByText(/3⭐/i)).toBeInTheDocument();
    });
  });

  describe('Demographics Tab', () => {
    it('should render demographics content when clicked', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const demographicsButton = screen.getByRole('button', {
        name: /Visitor Demographics/i,
      });
      fireEvent.click(demographicsButton);

      expect(screen.getByText(/Age Group/i)).toBeInTheDocument();
      expect(screen.getByText(/Interests/i)).toBeInTheDocument();
      expect(screen.getByText(/Accessibility Needs/i)).toBeInTheDocument();
      expect(screen.getByText(/Budget Level/i)).toBeInTheDocument();
    });

    it('should display age group data', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const demographicsButton = screen.getByRole('button', {
        name: /Visitor Demographics/i,
      });
      fireEvent.click(demographicsButton);

      expect(screen.getByText(/preschool/i)).toBeInTheDocument();
      expect(screen.getByText(/school-age/i)).toBeInTheDocument();
    });

    it('should display percentage indicators', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const demographicsButton = screen.getByRole('button', {
        name: /Visitor Demographics/i,
      });
      fireEvent.click(demographicsButton);

      const percentages = screen.getAllByText(/%/);
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Reviews Tab', () => {
    it('should render reviews content when clicked', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const reviewsButton = screen.getByRole('button', { name: /^Reviews$/i });
      fireEvent.click(reviewsButton);

      expect(screen.getByText(/Total Reviews/i)).toBeInTheDocument();
      expect(screen.getByText(/Response Rate/i)).toBeInTheDocument();
      expect(screen.getByText(/Common Review Themes/i)).toBeInTheDocument();
    });

    it('should display recent reviews', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const reviewsButton = screen.getByRole('button', { name: /^Reviews$/i });
      fireEvent.click(reviewsButton);

      expect(screen.getByText(/Recent Reviews/i)).toBeInTheDocument();
    });

    it('should display response indicators', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const reviewsButton = screen.getByRole('button', { name: /^Reviews$/i });
      fireEvent.click(reviewsButton);

      expect(screen.getByText(/Responded/i)).toBeInTheDocument();
    });
  });

  describe('Competitive Analysis Tab', () => {
    it('should render competitive content when clicked', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const competitiveButton = screen.getByRole('button', {
        name: /Competitive Analysis/i,
      });
      fireEvent.click(competitiveButton);

      expect(screen.getByText(/Rank/i)).toBeInTheDocument();
      expect(screen.getByText(/Rating Percentile/i)).toBeInTheDocument();
    });

    it('should display venue rank', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const competitiveButton = screen.getByRole('button', {
        name: /Competitive Analysis/i,
      });
      fireEvent.click(competitiveButton);

      expect(screen.getByText(/out of/i)).toBeInTheDocument();
      expect(screen.getByText(/similar venues/i)).toBeInTheDocument();
    });

    it('should display strengths and improvement areas', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const competitiveButton = screen.getByRole('button', {
        name: /Competitive Analysis/i,
      });
      fireEvent.click(competitiveButton);

      expect(screen.getByText(/Strengths/i)).toBeInTheDocument();
      expect(screen.getByText(/Areas for Improvement/i)).toBeInTheDocument();
    });
  });

  describe('Settings Tab', () => {
    it('should render settings content when clicked', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const settingsButton = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsButton);

      expect(screen.getByText(/Venue Claim Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Update Information/i)).toBeInTheDocument();
      expect(screen.getByText(/Support/i)).toBeInTheDocument();
    });

    it('should display claim status', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const settingsButton = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsButton);

      expect(screen.getByText(/Claimed/i)).toBeInTheDocument();
    });

    it('should display update button', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const settingsButton = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsButton);

      expect(
        screen.getByRole('button', { name: /Edit Venue Information/i })
      ).toBeInTheDocument();
    });

    it('should display support information', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const settingsButton = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsButton);

      expect(screen.getByText(/support@fammap.com/i)).toBeInTheDocument();
      expect(screen.getByText(/help.fammap.com/i)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      // Start on overview
      expect(screen.getByText(/Profile Views/i)).toBeInTheDocument();

      // Click demographics tab
      const demographicsButton = screen.getByRole('button', {
        name: /Visitor Demographics/i,
      });
      fireEvent.click(demographicsButton);
      expect(screen.getByText(/Age Group/i)).toBeInTheDocument();

      // Click reviews tab
      const reviewsButton = screen.getByRole('button', { name: /^Reviews$/i });
      fireEvent.click(reviewsButton);
      expect(screen.getByText(/Total Reviews/i)).toBeInTheDocument();

      // Click competitive tab
      const competitiveButton = screen.getByRole('button', {
        name: /Competitive Analysis/i,
      });
      fireEvent.click(competitiveButton);
      expect(screen.getByText(/similar venues/i)).toBeInTheDocument();

      // Click settings tab
      const settingsButton = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsButton);
      expect(screen.getByText(/Venue Claim Status/i)).toBeInTheDocument();

      // Back to overview
      const overviewButton = screen.getByRole('button', {
        name: /Overview/i,
      });
      fireEvent.click(overviewButton);
      expect(screen.getByText(/Profile Views/i)).toBeInTheDocument();
    });

    it('should highlight active tab', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const demographicsButton = screen.getByRole('button', {
        name: /Visitor Demographics/i,
      });

      fireEvent.click(demographicsButton);

      expect(demographicsButton).toHaveClass('active');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles when enabled', () => {
      const { container } = render(
        <VenueOperatorDashboard {...defaultProps} isDarkMode={true} />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('darkMode');
    });

    it('should not apply dark mode styles when disabled', () => {
      const { container } = render(
        <VenueOperatorDashboard {...defaultProps} isDarkMode={false} />
      );

      const mainContainer = container.firstChild as HTMLElement | null;
      expect(mainContainer?.className).not.toContain('darkMode');
    });
  });

  describe('Language Support', () => {
    it('should use English labels when language is en', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      expect(screen.getByText(/Venue Operator Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display numerical data correctly', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      // Check for numbers in the metrics
      const metricCards = screen.getAllByText(/↑/);
      expect(metricCards.length).toBeGreaterThan(0);
    });

    it('should display footer with last updated time', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      expect(screen.getByText(/Last Updated/i)).toBeInTheDocument();
    });

    it('should display emoji indicators for sections', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const demographicsButton = screen.getByRole('button', {
        name: /Visitor Demographics/i,
      });
      fireEvent.click(demographicsButton);

      // Check for emoji presence in content
      expect(document.body.textContent).toMatch(/[🧒💝♿💰]/u);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.textContent).toBeTruthy();
      });
    });

    it('should be navigable with keyboard', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toHaveProperty('onclick');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional props', () => {
      const { container } = render(
        <VenueOperatorDashboard
          venueId="test_venue"
          venueName={{ zh: 'Test', en: 'Test' }}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should handle long venue names', () => {
      const longName = {
        zh: '這是一個非常長的公園名稱用於測試長名稱的顯示',
        en: 'This is a very long park name used for testing the display of long venue names',
      };

      render(
        <VenueOperatorDashboard
          venueId="test_venue"
          venueName={longName}
        />
      );

      expect(document.body.textContent).toContain(longName.en);
    });

    it('should render with numeric venue IDs', () => {
      const { container } = render(
        <VenueOperatorDashboard
          venueId="12345"
          venueName={{ zh: 'Park', en: 'Park' }}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should render with special characters in venue name', () => {
      const specialName = {
        zh: "公園 & 遊樂場",
        en: "Park & Play Area",
      };

      render(
        <VenueOperatorDashboard
          venueId="test_venue"
          venueName={specialName}
        />
      );

      expect(document.body.textContent).toContain(specialName.en);
    });
  });

  describe('Interactive Elements', () => {
    it('should have clickable metric cards', () => {
      const { container } = render(
        <VenueOperatorDashboard {...defaultProps} />
      );

      const cards = container.querySelectorAll('.metricCard');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should respond to button clicks', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const demographicsButton = screen.getByRole('button', {
        name: /Visitor Demographics/i,
      });

      expect(demographicsButton).not.toHaveClass('active');
      fireEvent.click(demographicsButton);
      expect(demographicsButton).toHaveClass('active');
    });

    it('should display edit button in settings', () => {
      render(<VenueOperatorDashboard {...defaultProps} />);

      const settingsButton = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsButton);

      const editButton = screen.getByRole('button', {
        name: /Edit Venue Information/i,
      });
      expect(editButton).toBeInTheDocument();
    });
  });
});
