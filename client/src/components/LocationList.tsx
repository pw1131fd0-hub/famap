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
}

export function LocationList({
  locations,
  position,
  favorites,
  showFavorites,
  loading,
  onLocationClick,
  onFavoriteToggle,
  facilitiesFilter = [],
  sortBy = 'distance',
}: LocationListProps) {
  const { language, t } = useTranslation();

  const getFilteredLocations = (locs: Location[]) => {
    let filtered = locs;

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
  };

  const filteredLocations = getFilteredLocations(showFavorites ? favorites : locations);

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
      {filteredLocations.map((loc) => {
        const criticalFacilities = loc.facilities.filter(f =>
          ['public_toilet', 'nursing_room', 'medical'].includes(f) ||
          (loc.category === 'medical')
        );
        const hasCriticalFacility = criticalFacilities.length > 0 || loc.category === 'medical';
        const isFavorite = favorites.some(f => f.id === loc.id);

        return (
          <div
            key={loc.id}
            className="location-card"
            onClick={() => onLocationClick(loc)}
            style={hasCriticalFacility ? { borderLeft: '3px solid #ff6b6b' } : {}}
          >
            <div className="card-header">
              <h3>{loc.name[language]}</h3>
              <button
                className={`favorite-icon-button ${isFavorite ? 'active' : ''}`}
                onClick={(e) => onFavoriteToggle(e, loc.id)}
                aria-label={isFavorite ? t.common.removeFromFavorites : t.common.addToFavorites}
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="card-meta">
              <p className="category-label">{t.categories[loc.category]}</p>
              <p className="distance-text">📍 {formatDistance(calculateDistance(position[0], position[1], loc.coordinates.lat, loc.coordinates.lng))}</p>
            </div>
            <p className="address-text">{loc.address[language]}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '8px', flexWrap: 'wrap' }}>
              <div className="rating">⭐ {loc.averageRating}</div>
              {(() => {
                const familyScore = getLocationFamilyScore(loc);
                if (familyScore >= 6) {
                  return (
                    <div style={{ fontSize: '0.75em', background: '#c3e6cb', color: '#155724', padding: '2px 6px', borderRadius: '3px', fontWeight: '600' }}>
                      👨‍👩‍👧‍👦 {language === 'zh' ? '親子友善' : 'Family-Friendly'}
                    </div>
                  );
                }
                return null;
              })()}
              {loc.pricing?.isFree && (
                <div style={{ fontSize: '0.75em', background: '#d4edda', color: '#155724', padding: '2px 6px', borderRadius: '3px', fontWeight: '600' }}>
                  💚 {language === 'zh' ? '免費' : 'FREE'}
                </div>
              )}
              {loc.pricing?.priceRange && !loc.pricing?.isFree && (
                <div style={{ fontSize: '0.75em', background: '#fff3cd', color: '#856404', padding: '2px 6px', borderRadius: '3px', fontWeight: '600' }}>
                  💳 {loc.pricing.priceRange}
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
      })}
    </div>
  );
}
