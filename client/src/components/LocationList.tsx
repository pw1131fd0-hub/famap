import { useMemo, memo } from 'react';
import { Heart } from 'lucide-react';
import type { Location } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { calculateDistance, formatDistance, getLocationFamilyScore } from '../utils/locationUtils';

interface LocationListProps {
  locations: Location[];
  position: [number, number];
  favorites: Location[];
  showFavorites: boolean;
  loading: boolean;
  onLocationClick: (location: Location) => void;
  onFavoriteToggle: (e: React.MouseEvent, locationId: string) => void;
  facilitiesFilter?: string[];
  sortBy?: 'distance' | 'rating' | 'name';
  searchQuery?: string;
}

// Memoized location card component to prevent unnecessary re-renders
const LocationCard = memo(({
  location,
  position,
  isFavorite,
  language,
  t,
  onLocationClick,
  onFavoriteToggle,
}: {
  location: Location;
  position: [number, number];
  isFavorite: boolean;
  language: string;
  t: any;
  onLocationClick: (location: Location) => void;
  onFavoriteToggle: (e: React.MouseEvent, locationId: string) => void;
}) => {
  const criticalFacilities = location.facilities.filter(f =>
    ['public_toilet', 'nursing_room', 'medical'].includes(f) ||
    (location.category === 'medical')
  );
  const hasCriticalFacility = criticalFacilities.length > 0 || location.category === 'medical';
  const distance = calculateDistance(position[0], position[1], location.coordinates.lat, location.coordinates.lng);

  return (
    <div
      className="location-card"
      onClick={() => onLocationClick(location)}
      style={hasCriticalFacility ? { borderLeft: '3px solid #ff6b6b' } : {}}
    >
      <div className="card-header">
        <h3>{location.name[language as keyof typeof location.name]}</h3>
        <button
          className={`favorite-icon-button ${isFavorite ? 'active' : ''}`}
          onClick={(e) => onFavoriteToggle(e, location.id)}
          aria-label={isFavorite ? t.common.removeFromFavorites : t.common.addToFavorites}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-meta">
        <p className="category-label">{t.categories[location.category]}</p>
        <p className="distance-text">📍 {formatDistance(distance)}</p>
      </div>
      <p className="address-text">{location.address[language as keyof typeof location.address]}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '8px', flexWrap: 'wrap' }}>
        <div className="rating">⭐ {location.averageRating}</div>
        {(() => {
          const familyScore = getLocationFamilyScore(location);
          if (familyScore >= 6) {
            return (
              <div style={{ fontSize: '0.75em', background: '#c3e6cb', color: '#155724', padding: '2px 6px', borderRadius: '3px', fontWeight: '600' }}>
                👨‍👩‍👧‍👦 {language === 'zh' ? '親子友善' : 'Family-Friendly'}
              </div>
            );
          }
          return null;
        })()}
        {location.pricing?.isFree && (
          <div style={{ fontSize: '0.75em', background: '#d4edda', color: '#155724', padding: '2px 6px', borderRadius: '3px', fontWeight: '600' }}>
            💚 {language === 'zh' ? '免費' : 'FREE'}
          </div>
        )}
        {location.pricing?.priceRange && !location.pricing?.isFree && (
          <div style={{ fontSize: '0.75em', background: '#fff3cd', color: '#856404', padding: '2px 6px', borderRadius: '3px', fontWeight: '600' }}>
            💳 {location.pricing.priceRange}
          </div>
        )}
        {hasCriticalFacility && (
          <div style={{ fontSize: '0.8em', color: '#ff6b6b', fontWeight: '600' }}>
            ⚠️ {language === 'zh' ? '有必要設施' : 'Key Facilities'}
          </div>
        )}
      </div>
    </div>
  );
});

LocationCard.displayName = 'LocationCard';

function LocationListImpl({
  locations,
  position,
  favorites,
  showFavorites,
  loading,
  onLocationClick,
  onFavoriteToggle,
  facilitiesFilter = [],
  sortBy = 'distance',
  searchQuery = '',
}: LocationListProps) {
  const { language, t } = useTranslation();

  const filteredLocations = useMemo(() => {
    let filtered = showFavorites ? favorites : locations;

    // Filter by search query (name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loc =>
        loc.name.zh.toLowerCase().includes(query) ||
        loc.name.en.toLowerCase().includes(query) ||
        (loc.address && (
          loc.address.zh?.toLowerCase().includes(query) ||
          loc.address.en?.toLowerCase().includes(query)
        ))
      );
    }

    if (facilitiesFilter.length > 0) {
      filtered = filtered.filter(loc =>
        facilitiesFilter.every(facility => loc.facilities.includes(facility))
      );
    }

    // Sort based on selected option
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'distance': {
          const distA = calculateDistance(position[0], position[1], a.coordinates.lat, a.coordinates.lng);
          const distB = calculateDistance(position[0], position[1], b.coordinates.lat, b.coordinates.lng);
          return distA - distB;
        }
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'name':
          return a.name[language].localeCompare(b.name[language], language === 'zh' ? 'zh-Hans' : 'en');
        default:
          return 0;
      }
    });

    return sorted;
  }, [showFavorites, favorites, locations, searchQuery, facilitiesFilter, sortBy, position, language]);

  if (filteredLocations.length === 0) {
    return (
      <div className="location-list-empty">
        {loading ? (
          <p>{t.common.loading}</p>
        ) : (
          <p>{showFavorites ? t.common.noFavorites : t.common.noLocations}</p>
        )}
      </div>
    );
  }

  return (
    <div className="location-list">
      {filteredLocations.map((loc) => (
        <LocationCard
          key={loc.id}
          location={loc}
          position={position}
          isFavorite={favorites.some(f => f.id === loc.id)}
          language={language}
          t={t}
          onLocationClick={onLocationClick}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
}

// Export memoized version to prevent unnecessary re-renders
export const LocationList = memo(LocationListImpl, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Return true if props are equal (skip re-render), false otherwise
  return (
    prevProps.locations === nextProps.locations &&
    prevProps.position === nextProps.position &&
    prevProps.favorites === nextProps.favorites &&
    prevProps.showFavorites === nextProps.showFavorites &&
    prevProps.loading === nextProps.loading &&
    prevProps.facilitiesFilter === nextProps.facilitiesFilter &&
    prevProps.sortBy === nextProps.sortBy &&
    prevProps.searchQuery === nextProps.searchQuery
  );
});
