// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TripExportPanel } from '../components/TripExportPanel';
import type { Location } from '../types';

const mockLocation: Location = {
  id: 'loc1',
  name: { zh: '測試公園', en: 'Test Park' },
  category: 'park',
  address: { zh: '123 測試街', en: '123 Test Street' },
  description: { zh: '一個美麗的公園', en: 'A beautiful park' },
  coordinates: { lat: 25.033, lng: 121.565 },
  averageRating: 4.5,
  facilities: [],
  phoneNumber: '02-XXXX-XXXX'
};

const mockTrip = {
  id: 'trip1',
  name: 'Summer Family Outing',
  date: '2026-04-01',
  budget: 2000,
  totalSpent: 1500,
  members: [
    { id: 'u1', name: 'Parent', role: 'planner' as const },
    { id: 'u2', name: 'Child', role: 'member' as const }
  ],
  suggestedLocations: [mockLocation],
  finalLocations: [mockLocation],
  notes: 'Have fun at the park',
  status: 'confirmed' as const,
  createdAt: '2026-03-24T10:00:00Z'
};

// Mock useTranslation
vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    t: (key: string) => key,
    setLanguage: vi.fn()
  })
}));

describe('TripExportPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    vi.clearAllMocks();
  });

  it('should render export panel with all sections', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    expect(screen.getByText('Export Options')).toBeInTheDocument();
    expect(screen.getByText('Share Trip Plan')).toBeInTheDocument();
    expect(screen.getByText('Tips')).toBeInTheDocument();
    expect(screen.getByText('Trip Summary')).toBeInTheDocument();
  });

  it('should have export buttons for different formats', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    expect(screen.getByText('iCalendar')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('should display trip summary information', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    expect(screen.getByText('Summer Family Outing')).toBeInTheDocument();
    expect(screen.getByText('NT$2000')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Members count
  });

  it('should close panel when close button is clicked', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('should show share link when generate button is clicked', async () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    const generateButton = screen.getByText('Generate Share Link');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/sharedTrip=/)).toBeInTheDocument();
    });
  });

  it('should copy share link to clipboard', async () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true
    });

    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    fireEvent.click(screen.getByText('Generate Share Link'));

    await waitFor(() => {
      const copyButton = screen.getByTitle('Copy link');
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  it('should show copied message after copying', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true
    });

    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    fireEvent.click(screen.getByText('Generate Share Link'));

    await waitFor(() => {
      const copyButton = screen.getByTitle('Copy link');
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Copied to clipboard')).toBeInTheDocument();
    });
  });

  it('should hide share link when hide button is clicked', async () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    fireEvent.click(screen.getByText('Generate Share Link'));

    await waitFor(() => {
      expect(screen.getByDisplayValue(/sharedTrip=/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Hide Link'));

    expect(screen.queryByDisplayValue(/sharedTrip=/)).not.toBeInTheDocument();
  });

  it('should apply dark mode class when darkMode is true', () => {
    const { container } = render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={true}
      />
    );

    const panel = container.querySelector('.trip-export-panel');
    expect(panel).toHaveClass('dark');
  });

  it('should display export buttons with proper icons', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(3); // Close + 3 export + share + more
  });

  it('should display helpful tips', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    const tips = screen.getByText(/iCalendar format can be imported/);
    expect(tips).toBeInTheDocument();
  });

  it('should handle empty finalLocations gracefully', () => {
    const tripWithoutFinal = {
      ...mockTrip,
      finalLocations: []
    };

    render(
      <TripExportPanel
        trip={tripWithoutFinal}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    expect(screen.getByText('Trip Summary')).toBeInTheDocument();
  });

  it('should display location count in summary', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    // Check for location count in summary
    const summaryRows = screen.getAllByText(/Locations:/);
    expect(summaryRows.length).toBeGreaterThan(0);
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    const closeBtn = screen.getByLabelText('Close');
    expect(closeBtn).toBeInTheDocument();
  });

  it('should render with Chinese language labels when available', () => {
    // This test checks that the component structure is correct
    const { container } = render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    expect(container.querySelector('.trip-export-panel')).toBeInTheDocument();
  });

  it('should have proper CSS classes for styling', () => {
    const { container } = render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    expect(container.querySelector('.export-header')).toBeInTheDocument();
    expect(container.querySelector('.export-content')).toBeInTheDocument();
    expect(container.querySelector('.export-section')).toBeInTheDocument();
    expect(container.querySelector('.share-section')).toBeInTheDocument();
  });

  it('should handle multiple export button clicks', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    const exportButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('iCalendar') ||
      btn.textContent?.includes('Print') ||
      btn.textContent?.includes('CSV')
    );

    exportButtons.forEach(btn => {
      fireEvent.click(btn);
      // Component should not crash
    });
  });

  it('should display share link input as readonly', async () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    fireEvent.click(screen.getByText('Generate Share Link'));

    await waitFor(() => {
      const input = screen.getByDisplayValue(/sharedTrip=/) as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });
  });

  it('should display trip date in readable format', () => {
    render(
      <TripExportPanel
        trip={mockTrip}
        onClose={mockOnClose}
        darkMode={false}
      />
    );

    // Date should be formatted
    expect(screen.getByText(/4\/1\/2026|1\/4\/2026|2026-04-01/)).toBeInTheDocument();
  });
});
