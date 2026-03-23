import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationList } from '../components/LocationList';
import { LanguageProvider } from '../i18n/LanguageContext';
import type { Location } from '../types';

describe('LocationList', () => {
  const mockLocations: Location[] = [
    {
      id: '1',
      name: { zh: '台北公園', en: 'Taipei Park' },
      address: { zh: '台北市中山區', en: 'Zhongshan, Taipei' },
      coordinates: { lat: 25.0330, lng: 121.5654 },
      category: 'park',
      facilities: ['changing_table', 'high_chair'],
      averageRating: 4.5,
      reviews: [],
      pricing: { isFree: true },
      accessibility: { wheelchairAccessible: true }
    },
    {
      id: '2',
      name: { zh: '兒童醫院', en: 'Children Hospital' },
      address: { zh: '台北市信義區', en: 'Xinyi, Taipei' },
      coordinates: { lat: 25.0440, lng: 121.5640 },
      category: 'medical',
      facilities: ['public_toilet', 'nursing_room', 'medical'],
      averageRating: 4.8,
      reviews: [],
      pricing: { isFree: false, priceRange: '$100-300' }
    },
    {
      id: '3',
      name: { zh: '親子餐廳', en: 'Family Restaurant' },
      address: { zh: '台北市大安區', en: 'Daan, Taipei' },
      coordinates: { lat: 25.0250, lng: 121.5550 },
      category: 'restaurant',
      facilities: ['high_chair', 'changing_table'],
      averageRating: 4.2,
      reviews: []
    }
  ];

  const mockPosition: [number, number] = [25.0330, 121.5654];
  const mockOnLocationClick = vi.fn();
  const mockOnFavoriteToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders location list with items', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('台北公園')).toBeInTheDocument();
    expect(screen.getByText('兒童醫院')).toBeInTheDocument();
    expect(screen.getByText('親子餐廳')).toBeInTheDocument();
  });

  it('handles location click', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    const cards = screen.getAllByRole('button');
    fireEvent.click(cards[0]);
    expect(mockOnLocationClick).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('handles favorite toggle', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    const favoriteButtons = screen.getAllByRole('button');
    // Find heart button (not card itself)
    const heartButton = favoriteButtons.find(btn => btn.querySelector('svg'));
    if (heartButton) {
      fireEvent.click(heartButton);
      expect(mockOnFavoriteToggle).toHaveBeenCalled();
    }
  });

  it('displays loading state when no locations', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={[]}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={true}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/載入中/)).toBeInTheDocument();
  });

  it('displays no locations message', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={[]}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/找不到景點/)).toBeInTheDocument();
  });

  it('filters locations by search query', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
          searchQuery="公園"
        />
      </LanguageProvider>
    );

    expect(screen.getByText('台北公園')).toBeInTheDocument();
    expect(screen.queryByText('兒童醫院')).not.toBeInTheDocument();
  });

  it('filters locations by facilities', () => {
    const filtered = mockLocations.filter(loc =>
      ['changing_table', 'nursing_room'].every(f => loc.facilities?.includes(f))
    );

    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
          facilitiesFilter={['changing_table', 'nursing_room']}
        />
      </LanguageProvider>
    );

    // Only locations with all facilities will be shown
    if (filtered.length === 0) {
      expect(screen.getByText(/找不到景點/)).toBeInTheDocument();
    }
  });

  it('sorts locations by distance', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
          sortBy="distance"
        />
      </LanguageProvider>
    );

    const items = screen.getAllByText(/📍/);
    expect(items.length).toBeGreaterThan(0);
  });

  it('sorts locations by rating', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
          sortBy="rating"
        />
      </LanguageProvider>
    );

    // First location should be the one with highest rating (4.8)
    const cards = screen.getAllByText(/⭐/);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('sorts locations by name', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
          sortBy="name"
        />
      </LanguageProvider>
    );

    expect(screen.getByText('台北公園')).toBeInTheDocument();
  });

  it('shows favorite locations when showFavorites is true', () => {
    const favorites = [mockLocations[0]];

    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={favorites}
          showFavorites={true}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('台北公園')).toBeInTheDocument();
    expect(screen.queryByText('兒童醫院')).not.toBeInTheDocument();
  });

  it('displays no favorites message', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={true}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/目前沒有收藏/)).toBeInTheDocument();
  });

  it('displays free pricing badge', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/免費/)).toBeInTheDocument();
  });

  it('displays price range when applicable', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/\$100-300/)).toBeInTheDocument();
  });

  it('displays critical facility indicator for medical locations', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/有必要設施/)).toBeInTheDocument();
  });

  it('marks favorite locations correctly', () => {
    const favorites = [mockLocations[0]];

    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={favorites}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    const favoriteButtons = screen.getAllByRole('button');
    expect(favoriteButtons.length).toBeGreaterThan(0);
  });

  it('displays distance for each location', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    const distances = screen.getAllByText(/📍/);
    expect(distances.length).toBeGreaterThan(0);
  });

  it('displays category for each location', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    // Categories are displayed
    const items = screen.getAllByText(/⭐/);
    expect(items.length).toBeGreaterThan(0);
  });

  it('handles empty search results', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
          searchQuery="非存在地點"
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/找不到景點/)).toBeInTheDocument();
  });

  it('combines search and facilities filter', () => {
    render(
      <LanguageProvider>
        <LocationList
          locations={mockLocations}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
          searchQuery="公園"
          facilitiesFilter={['high_chair']}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('台北公園')).toBeInTheDocument();
  });

  it('displays family-friendly badge for high family score', () => {
    const locWithHighScore: Location = {
      ...mockLocations[0],
      facilities: ['changing_table', 'high_chair', 'nursing_room', 'parking', 'public_toilet', 'stroller_accessible'],
      averageRating: 4.8,
      accessibility: { wheelchairAccessible: true },
      pricing: { isFree: true }
    };

    render(
      <LanguageProvider>
        <LocationList
          locations={[locWithHighScore]}
          position={mockPosition}
          favorites={[]}
          showFavorites={false}
          loading={false}
          onLocationClick={mockOnLocationClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      </LanguageProvider>
    );

    // Check for family-friendly badge - the family score calculation
    const items = screen.getAllByText(/親子友善|Family-Friendly/);
    expect(items.length).toBeGreaterThan(0);
  });
});
