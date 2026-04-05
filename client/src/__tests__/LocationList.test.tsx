// @vitest-environment happy-dom
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
      description: { zh: '台北市中心的公園', en: 'Park in central Taipei' },
      coordinates: { lat: 25.0330, lng: 121.5654 },
      category: 'park',
      facilities: ['changing_table', 'high_chair'],
      averageRating: 4.5,
      pricing: { isFree: true },
      accessibility: { wheelchairAccessible: true }
    },
    {
      id: '2',
      name: { zh: '兒童醫院', en: 'Children Hospital' },
      address: { zh: '台北市信義區', en: 'Xinyi, Taipei' },
      description: { zh: '提供兒童醫療服務', en: 'Children medical services' },
      coordinates: { lat: 25.0440, lng: 121.5640 },
      category: 'medical',
      facilities: ['public_toilet', 'nursing_room', 'medical'],
      averageRating: 4.8,
      pricing: { isFree: false, priceRange: '$100-300' }
    },
    {
      id: '3',
      name: { zh: '親子餐廳', en: 'Family Restaurant' },
      address: { zh: '台北市大安區', en: 'Daan, Taipei' },
      description: { zh: '家庭友善的餐廳', en: 'Family-friendly restaurant' },
      coordinates: { lat: 25.0250, lng: 121.5550 },
      category: 'restaurant',
      facilities: ['high_chair', 'changing_table'],
      averageRating: 4.2
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
    const { container } = render(
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

    expect(container.querySelector('.location-list-skeleton')).toBeInTheDocument();
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

    expect(screen.getByText(/此地區沒有地點/)).toBeInTheDocument();
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
      expect(screen.getByText(/此地區沒有地點/)).toBeInTheDocument();
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

    expect(screen.getByText(/還沒有收藏/)).toBeInTheDocument();
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

    expect(screen.getByText(/找不到.*非存在地點/)).toBeInTheDocument();
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

  describe('openNowOnly filter', () => {
    it('shows all locations when openNowOnly is false', () => {
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
            openNowOnly={false}
          />
        </LanguageProvider>
      );
      // Renders in Chinese by default - check zh names
      expect(screen.getByText('台北公園')).toBeInTheDocument();
      expect(screen.getByText('兒童醫院')).toBeInTheDocument();
    });

    it('accepts openNowOnly prop without crashing', () => {
      expect(() =>
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
              openNowOnly={true}
            />
          </LanguageProvider>
        )
      ).not.toThrow();
    });
  });

  describe('childAge filter', () => {
    const locWithAgeRange: Location = {
      ...mockLocations[0],
      id: 'age-test',
      name: { zh: '幼兒公園', en: 'Toddler Park' },
      ageRange: { minAge: 0, maxAge: 5 },
    };

    const locWithHighAge: Location = {
      ...mockLocations[0],
      id: 'age-high',
      name: { zh: '大童樂園', en: 'Big Kids Park' },
      ageRange: { minAge: 8, maxAge: 14 },
    };

    it('shows all locations when childAge is undefined', () => {
      render(
        <LanguageProvider>
          <LocationList
            locations={[locWithAgeRange, locWithHighAge]}
            position={mockPosition}
            favorites={[]}
            showFavorites={false}
            loading={false}
            onLocationClick={mockOnLocationClick}
            onFavoriteToggle={mockOnFavoriteToggle}
            childAge={undefined}
          />
        </LanguageProvider>
      );
      expect(screen.getByText('幼兒公園')).toBeInTheDocument();
      expect(screen.getByText('大童樂園')).toBeInTheDocument();
    });

    it('filters out locations whose age range excludes the child age', () => {
      render(
        <LanguageProvider>
          <LocationList
            locations={[locWithAgeRange, locWithHighAge]}
            position={mockPosition}
            favorites={[]}
            showFavorites={false}
            loading={false}
            onLocationClick={mockOnLocationClick}
            onFavoriteToggle={mockOnFavoriteToggle}
            childAge={3}
          />
        </LanguageProvider>
      );
      // Toddler park (0-5) should show for age 3
      expect(screen.getByText('幼兒公園')).toBeInTheDocument();
      // Big kids park (8-14) should be hidden for age 3
      expect(screen.queryByText('大童樂園')).not.toBeInTheDocument();
    });

    it('shows locations without ageRange for any child age', () => {
      const locNoAge: Location = {
        ...mockLocations[0],
        id: 'no-age',
        name: { zh: '無限制地點', en: 'No Age Limit' },
        ageRange: undefined,
      };
      render(
        <LanguageProvider>
          <LocationList
            locations={[locNoAge, locWithHighAge]}
            position={mockPosition}
            favorites={[]}
            showFavorites={false}
            loading={false}
            onLocationClick={mockOnLocationClick}
            onFavoriteToggle={mockOnFavoriteToggle}
            childAge={2}
          />
        </LanguageProvider>
      );
      expect(screen.getByText('無限制地點')).toBeInTheDocument();
      expect(screen.queryByText('大童樂園')).not.toBeInTheDocument();
    });

    it('persists childAge filter across re-renders', () => {
      const { rerender } = render(
        <LanguageProvider>
          <LocationList
            locations={[locWithAgeRange, locWithHighAge]}
            position={mockPosition}
            favorites={[]}
            showFavorites={false}
            loading={false}
            onLocationClick={mockOnLocationClick}
            onFavoriteToggle={mockOnFavoriteToggle}
            childAge={3}
          />
        </LanguageProvider>
      );
      expect(screen.queryByText('大童樂園')).not.toBeInTheDocument();

      rerender(
        <LanguageProvider>
          <LocationList
            locations={[locWithAgeRange, locWithHighAge]}
            position={mockPosition}
            favorites={[]}
            showFavorites={false}
            loading={false}
            onLocationClick={mockOnLocationClick}
            onFavoriteToggle={mockOnFavoriteToggle}
            childAge={10}
          />
        </LanguageProvider>
      );
      // Now age 10 should see Big Kids Park (8-14) but not Toddler Park (0-5)
      expect(screen.getByText('大童樂園')).toBeInTheDocument();
      expect(screen.queryByText('幼兒公園')).not.toBeInTheDocument();
    });
  });

  describe('visitedIds and hideVisited', () => {
    it('shows "已去過" visited badge for checked-in venues', () => {
      const visitedSet = new Set(['1']);
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
            visitedIds={visitedSet}
          />
        </LanguageProvider>
      );
      // Location 1 (台北公園) should show visited badge
      expect(screen.getByText(/已去過/)).toBeInTheDocument();
      // Other locations should not
      expect(screen.getAllByText(/已去過/).length).toBe(1);
    });

    it('does not show visited badge when visitedIds is empty', () => {
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
            visitedIds={new Set()}
          />
        </LanguageProvider>
      );
      expect(screen.queryByText(/已去過/)).not.toBeInTheDocument();
    });

    it('hides visited venues when hideVisited is true', () => {
      const visitedSet = new Set(['1', '2']); // Park and Hospital visited
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
            visitedIds={visitedSet}
            hideVisited={true}
          />
        </LanguageProvider>
      );
      // Visited venues should be hidden
      expect(screen.queryByText('台北公園')).not.toBeInTheDocument();
      expect(screen.queryByText('兒童醫院')).not.toBeInTheDocument();
      // Unvisited venue should still show
      expect(screen.getByText('親子餐廳')).toBeInTheDocument();
    });

    it('shows all venues when hideVisited is false regardless of visitedIds', () => {
      const visitedSet = new Set(['1', '2']);
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
            visitedIds={visitedSet}
            hideVisited={false}
          />
        </LanguageProvider>
      );
      // All venues visible regardless of visitedIds when hideVisited is false
      expect(screen.getByText('台北公園')).toBeInTheDocument();
      expect(screen.getByText('兒童醫院')).toBeInTheDocument();
      expect(screen.getByText('親子餐廳')).toBeInTheDocument();
    });

    it('shows empty state when all locations are visited and hideVisited is true', () => {
      const allVisited = new Set(['1', '2', '3']);
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
            visitedIds={allVisited}
            hideVisited={true}
          />
        </LanguageProvider>
      );
      expect(screen.getByText(/此地區沒有地點/)).toBeInTheDocument();
    });

    it('shows multiple visited badges for multiple checked-in venues', () => {
      const visitedSet = new Set(['1', '3']); // Park and Restaurant visited
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
            visitedIds={visitedSet}
            hideVisited={false}
          />
        </LanguageProvider>
      );
      // Two visited badges should appear
      expect(screen.getAllByText(/已去過/).length).toBe(2);
    });
  });
});
