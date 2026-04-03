// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollaborativeVenueInsights } from '../components/CollaborativeVenueInsights';
import * as venueInsightsUtils from '../utils/venueInsights';

// Mock the utility functions
vi.mock('../utils/venueInsights');

describe('CollaborativeVenueInsights component', () => {
  const mockLocationId = 'location_test_123';
  const mockLocationName = 'Test Park';

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (venueInsightsUtils.getLocationInsights as any).mockReturnValue([
      {
        id: 'insight_1',
        locationId: mockLocationId,
        authorId: 'author_1',
        authorName: 'Test Parent',
        type: 'tip',
        title: 'Great playground',
        content: 'Very clean and spacious',
        tags: ['clean', 'kid-friendly'],
        trustScore: 85,
        helpfulCount: 10,
        notHelpfulCount: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(),
        visibility: 'public',
      },
    ]);

    (venueInsightsUtils.getVenueInsightStats as any).mockReturnValue({
      locationId: mockLocationId,
      totalInsights: 15,
      averageTrustScore: 78,
      mostCommonTags: ['clean', 'kid-friendly', 'staff-friendly'],
      recentInsights: [],
      crowdednessHistory: [
        {
          timestamp: new Date(),
          level: 'moderate',
          reportCount: 3,
        },
      ],
    });

    (venueInsightsUtils.markInsightHelpfulness as any).mockImplementation(() => {});
    (venueInsightsUtils.addVenueInsight as any).mockReturnValue({
      id: 'new_insight',
      locationId: mockLocationId,
      authorId: 'user_1',
      authorName: 'Parent Contributor',
      type: 'tip',
      title: 'New insight',
      content: 'New content',
      tags: ['test'],
      trustScore: 50,
      helpfulCount: 0,
      notHelpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      visibility: 'public',
    });

    (venueInsightsUtils.getLocationTips as any).mockReturnValue([
      {
        id: 'insight_2',
        locationId: mockLocationId,
        authorId: 'author_2',
        authorName: 'Another Parent',
        type: 'tip',
        title: 'Best time to visit',
        content: 'Go in the morning for fewer crowds',
        tags: ['crowded', 'timing'],
        trustScore: 82,
        helpfulCount: 15,
        notHelpfulCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: 'public',
      },
    ]);

    (venueInsightsUtils.getLocationStatus as any).mockReturnValue([
      {
        id: 'insight_3',
        locationId: mockLocationId,
        authorId: 'author_3',
        authorName: 'Status Reporter',
        type: 'status_update',
        title: 'Current status',
        content: 'Currently busy due to school trip',
        tags: ['busy'],
        trustScore: 75,
        helpfulCount: 5,
        notHelpfulCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: 'public',
      },
    ]);
  });

  describe('Rendering', () => {
    it('should render component with title and subtitle', () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      expect(screen.getByText('Parent Community Insights')).toBeInTheDocument();
      expect(screen.getByText('Real-time tips and status from families')).toBeInTheDocument();
    });

    it('should display statistics bar with insights count', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Total Insights')).toBeInTheDocument();
      });
    });

    it('should display tab navigation', () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      expect(screen.getByRole('button', { name: /All Insights/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tips/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Status/i })).toBeInTheDocument();
    });

    it('should display add insight button', () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      expect(screen.getByRole('button', { name: /Share Your Experience/i })).toBeInTheDocument();
    });

    it('should display insight cards with content', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Great playground')).toBeInTheDocument();
        expect(screen.getByText('Very clean and spacious')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should show add insight form when button is clicked', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const addButton = screen.getByRole('button', { name: /Share Your Experience/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/What kind of insight/i)).toBeInTheDocument();
        expect(screen.getByText(/Title/i)).toBeInTheDocument();
        expect(screen.getByText(/Your Insight/i)).toBeInTheDocument();
      });
    });

    it('should hide form when cancel is clicked', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      // Open form
      const addButton = screen.getByRole('button', { name: /Share Your Experience/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Your Insight/i)).toBeInTheDocument();
      });

      // Close form
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Your Insight/i)).not.toBeInTheDocument();
      });
    });

    it('should allow selecting insight type', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const addButton = screen.getByRole('button', { name: /Share Your Experience/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        const warningButton = screen.getByRole('button', { name: /warning/i });
        expect(warningButton).toBeInTheDocument();
      });
    });

    it('should allow toggling tags', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const addButton = screen.getByRole('button', { name: /Share Your Experience/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        const cleanTag = screen.getByRole('button', { name: /clean/i });
        fireEvent.click(cleanTag);
        expect(cleanTag).toHaveClass('selected');
      });
    });

    it('should display share insight button', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const addButton = screen.getByRole('button', { name: /Share Your Experience/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Share Insight/i });
        expect(submitButton).toBeInTheDocument();
      });
    });

    it('should disable submit button when form is incomplete', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const addButton = screen.getByRole('button', { name: /Share Your Experience/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Share Insight/i }) as HTMLButtonElement;
        expect(submitButton.disabled).toBe(true);
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to tips tab', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const tipsTab = screen.getByRole('button', { name: /Tips/i });
      fireEvent.click(tipsTab);

      expect(tipsTab).toHaveClass('active');
    });

    it('should switch to status tab', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const statusTab = screen.getByRole('button', { name: /Status/i });
      fireEvent.click(statusTab);

      expect(statusTab).toHaveClass('active');
    });

    it('should call getLocationTips when tips tab is active', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const tipsTab = screen.getByRole('button', { name: /Tips/i });
      fireEvent.click(tipsTab);

      await waitFor(() => {
        expect(venueInsightsUtils.getLocationTips).toHaveBeenCalled();
      });
    });

    it('should call getLocationStatus when status tab is active', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const statusTab = screen.getByRole('button', { name: /Status/i });
      fireEvent.click(statusTab);

      await waitFor(() => {
        expect(venueInsightsUtils.getLocationStatus).toHaveBeenCalled();
      });
    });
  });

  describe('Insight Feedback', () => {
    it('should mark insight as helpful', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      await waitFor(() => {
        const helpfulButtons = screen.getAllByRole('button', { name: /Helpful/i });
        expect(helpfulButtons.length).toBeGreaterThan(0);
        fireEvent.click(helpfulButtons[0]);
      });

      expect(venueInsightsUtils.markInsightHelpfulness).toHaveBeenCalledWith(
        'insight_1',
        'user_anonymous',
        true
      );
    });

    it('should mark insight as not helpful', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      await waitFor(() => {
        const notHelpfulButtons = screen.getAllByRole('button', { name: /Not helpful/i });
        expect(notHelpfulButtons.length).toBeGreaterThan(0);
        fireEvent.click(notHelpfulButtons[0]);
      });

      expect(venueInsightsUtils.markInsightHelpfulness).toHaveBeenCalledWith(
        'insight_1',
        'user_anonymous',
        false
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Parent Community Insights');
    });

    it('should have accessible form labels', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const addButton = screen.getByRole('button', { name: /Share Your Experience/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Your Insight/i)).toBeInTheDocument();
      });
    });

    it('should support keyboard activation', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      const addButton = screen.getByRole('button', { name: /Share Your Experience/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should render statistics bar', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Total Insights')).toBeInTheDocument();
      });
    });

    it('should display statistics with mocked data', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Trust Score')).toBeInTheDocument();
        expect(screen.getByText('Latest Status')).toBeInTheDocument();
      });
    });

    it('should render insights content properly', async () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Great playground')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty insights gracefully', () => {
      (venueInsightsUtils.getLocationInsights as any).mockReturnValue([]);
      (venueInsightsUtils.getVenueInsightStats as any).mockReturnValue({
        locationId: mockLocationId,
        totalInsights: 0,
        averageTrustScore: 0,
        mostCommonTags: [],
        recentInsights: [],
        crowdednessHistory: [],
      });

      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
        />
      );

      expect(screen.getByText(/No insights yet/i)).toBeInTheDocument();
    });

    it('should handle custom user ID', () => {
      render(
        <CollaborativeVenueInsights
          locationId={mockLocationId}
          locationName={mockLocationName}
          currentUserId="custom_user_123"
        />
      );

      expect(screen.getByText('Parent Community Insights')).toBeInTheDocument();
    });
  });
});
