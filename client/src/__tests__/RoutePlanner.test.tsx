import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoutePlanner } from '../components/RoutePlanner';
import { LanguageProvider } from '../i18n/LanguageContext';
import type { Location } from '../types';

const mockLocations: Location[] = [
  {
    id: 'loc1',
    name: { zh: '地點1', en: 'Location 1' },
    description: { zh: '描述1', en: 'Description 1' },
    category: 'park',
    coordinates: { lat: 25.0330, lng: 121.5654 },
    address: { zh: '台北市', en: 'Taipei' },
    facilities: [],
    averageRating: 4.5,
  },
  {
    id: 'loc2',
    name: { zh: '地點2', en: 'Location 2' },
    description: { zh: '描述2', en: 'Description 2' },
    category: 'restaurant',
    coordinates: { lat: 25.0430, lng: 121.5654 },
    address: { zh: '台北市', en: 'Taipei' },
    facilities: [],
    averageRating: 4.0,
  },
  {
    id: 'loc3',
    name: { zh: '地點3', en: 'Location 3' },
    description: { zh: '描述3', en: 'Description 3' },
    category: 'nursing_room',
    coordinates: { lat: 25.0530, lng: 121.5754 },
    address: { zh: '台北市', en: 'Taipei' },
    facilities: [],
    averageRating: 4.2,
  },
];

const mockUserLocation: [number, number] = [25.0330, 121.5654];

const renderWithProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe('RoutePlanner Component', () => {
  it('renders route planner interface', () => {
    const mockOnClose = vi.fn();
    renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Plan a Route|規劃路線/)).toBeInTheDocument();
  });

  it('displays all locations', () => {
    const mockOnClose = vi.fn();
    renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Location 1')).toBeInTheDocument();
    expect(screen.getByText('Location 2')).toBeInTheDocument();
    expect(screen.getByText('Location 3')).toBeInTheDocument();
  });

  it('allows selecting locations', () => {
    const mockOnClose = vi.fn();
    const { container } = renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    const selectButtons = container.querySelectorAll('.location-selector-item');
    fireEvent.click(selectButtons[0]);

    expect(selectButtons[0]).toHaveClass('selected');
  });

  it('prevents selecting more than 15 locations', () => {
    const manyLocations = Array.from({ length: 20 }, (_, i) => ({
      id: `loc${i}`,
      name: { zh: `地點${i}`, en: `Location ${i}` },
      description: { zh: `描述${i}`, en: `Description ${i}` },
      category: 'park' as const,
      coordinates: { lat: 25.0330 + i * 0.01, lng: 121.5654 },
      address: { zh: '台北市', en: 'Taipei' },
      facilities: [],
      averageRating: 4.0,
    }));

    const mockOnClose = vi.fn();
    const { container } = renderWithProvider(
      <RoutePlanner
        locations={manyLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    const selectButtons = container.querySelectorAll('.location-selector-item');
    for (let i = 0; i < selectButtons.length; i++) {
      fireEvent.click(selectButtons[i]);
    }

    // Only 15 should be selected
    const selectedButtons = container.querySelectorAll('.location-selector-item.selected');
    expect(selectedButtons.length).toBeLessThanOrEqual(15);
  });

  it('disables optimize button when no locations selected', () => {
    const mockOnClose = vi.fn();
    renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    const optimizeButton = screen.getByRole('button', {
      name: /Optimize Route|規劃最優路線/,
    });
    expect(optimizeButton).toBeDisabled();
  });

  it('enables optimize button when locations are selected', () => {
    const mockOnClose = vi.fn();
    const { container } = renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    const selectButtons = container.querySelectorAll('.location-selector-item');
    fireEvent.click(selectButtons[0]);

    const optimizeButton = screen.getByRole('button', {
      name: /Optimize Route|規劃最優路線/,
    });
    expect(optimizeButton).not.toBeDisabled();
  });

  it('calls onClose when close button clicked', () => {
    const mockOnClose = vi.fn();
    const { container } = renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    const closeButton = container.querySelector('.close-detail-button') as HTMLButtonElement;
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays selected locations preview', () => {
    const mockOnClose = vi.fn();
    const { container } = renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    const selectButtons = container.querySelectorAll('.location-selector-item');
    fireEvent.click(selectButtons[0]);
    fireEvent.click(selectButtons[1]);

    expect(screen.getByText('Location 1')).toBeInTheDocument();
    expect(screen.getByText('Location 2')).toBeInTheDocument();
  });

  it('removes location from selection', () => {
    const mockOnClose = vi.fn();
    const { container } = renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    const selectButtons = container.querySelectorAll('.location-selector-item');
    fireEvent.click(selectButtons[0]);

    const removeButtons = container.querySelectorAll('.preview-remove');
    fireEvent.click(removeButtons[0]);

    expect(selectButtons[0]).not.toHaveClass('selected');
  });

  it('shows error message when API fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    const mockOnClose = vi.fn();
    const { container } = renderWithProvider(
      <RoutePlanner
        locations={mockLocations}
        userLocation={mockUserLocation}
        onClose={mockOnClose}
      />
    );

    const selectButtons = container.querySelectorAll('.location-selector-item');
    fireEvent.click(selectButtons[0]);

    const optimizeButton = screen.getByRole('button', {
      name: /Optimize Route|規劃最優路線/,
    });
    fireEvent.click(optimizeButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
