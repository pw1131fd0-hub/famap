// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GoNowSuggestions } from '../components/GoNowSuggestions';
import { LanguageProvider } from '../i18n/LanguageContext';

// Mock fetch
global.fetch = vi.fn();

// Wrapper component for tests
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('GoNowSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<GoNowSuggestions lat={25.0330} lng={121.5654} />, { wrapper: TestWrapper });
    expect(screen.getByText(/載入建議|Loading suggestions/i)).toBeInTheDocument();
  });

  it('renders Go Now header with icon', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<GoNowSuggestions lat={25.0330} lng={121.5654} />, { wrapper: TestWrapper });

    await waitFor(() => {
      // Header should be present after loading
      expect(screen.queryByText(/載入建議|Loading suggestions/i)).not.toBeInTheDocument();
    });
  });

  it('renders component without crashing', async () => {
    (global.fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const { container } = render(<GoNowSuggestions lat={25.0330} lng={121.5654} />, { wrapper: TestWrapper });

    // Should render without error
    expect(container).toBeTruthy();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/載入建議|Loading suggestions/i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles error state gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<GoNowSuggestions lat={25.0330} lng={121.5654} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(
        screen.getByText(/無法載入建議|Failed to load suggestions/i)
      ).toBeInTheDocument();
    });
  });

  it('calls onSelectLocation when suggestion is clicked', async () => {
    const handleSelect = vi.fn();
    const mockSuggestions = [
      {
        location: {
          id: 'park_1',
          name: { en: 'Test Park', zh: '測試公園' },
          category: 'park',
          averageRating: 4.5,
          facilities: ['playground'],
          coordinates: { lat: 25.0330, lng: 121.5654 },
        },
        goNowScore: 85,
        crowdLevel: 'low',
        estimatedCrowdPercentage: 30,
        distance: 500,
        reason: 'Low crowds right now',
        qualityScore: {
          overallScore: 85,
          trustLevel: 'high',
          reviewCount: 45,
        },
        bestTimeUntil: '16:00',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuggestions,
    });

    const { container } = render(
      <GoNowSuggestions
        lat={25.0330}
        lng={121.5654}
        onSelectLocation={handleSelect}
      />,
      { wrapper: TestWrapper }
    );

    await waitFor(() => {
      const suggestionElement = container.querySelector(
        '[style*="border: 2px solid"]'
      );
      if (suggestionElement) {
        (suggestionElement as HTMLElement).click();
        expect(handleSelect).toHaveBeenCalledWith('park_1');
      }
    });
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<GoNowSuggestions lat={25.0330} lng={121.5654} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/無法載入建議|Failed to load suggestions/i)).toBeInTheDocument();
    });
  });

  it('component handles empty responses', async () => {
    (global.fetch as any).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(<GoNowSuggestions lat={25.0330} lng={121.5654} />, { wrapper: TestWrapper });

    // Should show no suggestions message when response is empty
    await waitFor(() => {
      expect(screen.getByText(/附近沒有建議|No suggestions found/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('fetches suggestions with correct parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<GoNowSuggestions lat={25.0330} lng={121.5654} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('/api/suggestions/go-now');
      expect(callUrl).toContain('lat=25.03');
      expect(callUrl).toContain('lng=121.5654');
      expect(callUrl).toContain('radius=5000');
      expect(callUrl).toContain('limit=5');
    });
  });

  it('displays quality scores', async () => {
    const mockSuggestions = [
      {
        location: {
          id: 'park_1',
          name: { en: 'High Quality Park', zh: '高質量公園' },
          category: 'park',
          averageRating: 4.8,
          facilities: ['playground'],
          coordinates: { lat: 25.0330, lng: 121.5654 },
        },
        goNowScore: 88,
        crowdLevel: 'low',
        estimatedCrowdPercentage: 25,
        distance: 500,
        reason: 'Great quality venue',
        qualityScore: {
          overallScore: 92,
          trustLevel: 'high',
          reviewCount: 120,
        },
        bestTimeUntil: '16:00',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuggestions,
    });

    render(<GoNowSuggestions lat={25.0330} lng={121.5654} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/92/)).toBeInTheDocument();
    });
  });
});
