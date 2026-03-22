import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Globe, Trees as Park, Baby, Utensils, Hospital, X, Plus, Filter, Heart, List, Menu, ChevronDown } from 'lucide-react';
import { locationApi, reviewApi, favoriteApi } from './services/api';
import type { Location, Category, Review, ReviewCreateDTO, LocationCreateDTO, OperatingHours } from './types';
import { useTranslation } from './i18n/useTranslation';
import { ReviewList } from './components/ReviewList';
import { ReviewForm } from './components/ReviewForm';
import { LocationForm } from './components/LocationForm';

// Utility function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format distance for display
const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

// Day names mapping
const DAY_NAMES_ZH: Record<string, string> = {
  monday: '一',
  tuesday: '二',
  wednesday: '三',
  thursday: '四',
  friday: '五',
  saturday: '六',
  sunday: '日',
};

// City data with coordinates and descriptions
type CityKey = 'taipei' | 'new_taipei' | 'taoyuan';

interface City {
  key: CityKey;
  name: string;
  description: string;
  center: [number, number];
}

const CITIES: City[] = [
  { 
    key: 'taipei', 
    name: '台北市', 
    description: '首都核心，親子設施最密集',
    center: [25.0330, 121.5654] 
  },
  { 
    key: 'new_taipei', 
    name: '新北市', 
    description: '大台北生活圈，山水景點多',
    center: [25.0169, 121.4628] 
  },
  { 
    key: 'taoyuan', 
    name: '桃園市', 
    description: '機場所在地，親子樂園豐富',
    center: [24.9937, 121.3000] 
  },
];

// Fix for default marker icons in Leaflet with React
// @ts-expect-error - Leaflet icon hack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom glowing marker icon
const createGlowingIcon = (category: string) => {
  const colors: Record<string, string> = {
    park: '#22c55e',
    nursing_room: '#ec4899',
    restaurant: '#f97316',
    medical: '#ef4444',
    attraction: '#8b5cf6',
    other: '#6b7280',
  };
  const color = colors[category] || colors.other;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 0 12px ${color}, 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Hardcoded user ID for demonstration (MVP)
const MOCK_USER_ID = 'u1';

// Function to check if location is currently open
const isLocationOpen = (operatingHours?: OperatingHours): { isOpen: boolean; message: string } => {
  if (!operatingHours) {
    return { isOpen: true, message: '營業時間未知' };
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[dayOfWeek];
  const todayHours = operatingHours[todayName as keyof typeof operatingHours];

  if (!todayHours || todayHours === '休息' || todayHours === 'Closed') {
    return { isOpen: false, message: '今日休息' };
  }

  // Simple check if hours contain typical time patterns
  if (todayHours.includes('24小時') || todayHours.includes('24 hours')) {
    return { isOpen: true, message: '24小時' };
  }

  return { isOpen: true, message: '營業中' };
};

// Calculate family-friendliness score
const getLocationFamilyScore = (location: Location): number => {
  let score = 0;
  const keyFacilities = [
    'nursing_room',
    'public_toilet',
    'stroller_accessible',
    'changing_table',
    'high_chair',
    'kids_menu',
    'air_conditioned',
    'parking',
    'drinking_water',
  ];

  keyFacilities.forEach(facility => {
    if (location.facilities.includes(facility)) {
      score += 1;
    }
  });

  return score;
};

// Component to handle map view updates
function MapEvents({ onPositionChange }: { onPositionChange: (pos: [number, number]) => void }) {
  const map = useMap();
  
  useEffect(() => {
    map.on('moveend', () => {
      const center = map.getCenter();
      onPositionChange([center.lat, center.lng]);
    });
  }, [map, onPositionChange]);

  return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const currentCenter = map.getCenter();
    const distance = Math.sqrt(
      Math.pow(currentCenter.lat - center[0], 2) +
      Math.pow(currentCenter.lng - center[1], 2)
    );
    // Only set view if the change is significant (e.g., more than 0.0001 degrees)
    if (distance > 0.0001) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function App() {
  const { language, setLanguage, t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState<CityKey>('taipei');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [position, setPosition] = useState<[number, number]>(CITIES[0].center); // Taipei
  const [locations, setLocations] = useState<Location[]>([]);
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [strollerOnly, setStrollerOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [facilitiesFilter, setFacilitiesFilter] = useState<string[]>([]);
  const [childAge, setChildAge] = useState<number | undefined>(() => {
    const saved = localStorage.getItem('childAge');
    return saved ? parseInt(saved, 10) : undefined;
  });
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationApi.getNearby({
        lat: position[0],
        lng: position[1],
        radius: 10000,
        category: selectedCategory,
        stroller_accessible: strollerOnly || undefined,
        limit: 500,
      });
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  }, [position, selectedCategory, strollerOnly]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await favoriteApi.getFavorites(MOCK_USER_ID);
        setFavorites(data);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (selectedLocation) {
        try {
          const data = await reviewApi.getByLocationId(selectedLocation.id);
          setReviews(data);
        } catch (error) {
          console.error('Failed to fetch reviews:', error);
        }
      } else {
        setReviews([]);
      }
    };

    fetchReviews();
  }, [selectedLocation]);

  const handleFindMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error('Geolocation error:', err);
          alert('Could not get your location. Defaulting to Taipei.');
        }
      );
    }
  };

  const handleCityChange = (cityKey: CityKey) => {
    const city = CITIES.find(c => c.key === cityKey);
    if (city) {
      setSelectedCity(cityKey);
      setPosition(city.center);
      setCityDropdownOpen(false);
    }
  };

  const handlePostReview = async (reviewDto: ReviewCreateDTO) => {
    if (!selectedLocation) return;
    try {
      const newReview = await reviewApi.create(selectedLocation.id, reviewDto);
      setReviews([newReview, ...reviews]);
    } catch (error) {
      console.error('Failed to post review:', error);
      throw error;
    }
  };

  const handleCreateLocation = async (locationDto: LocationCreateDTO) => {
    try {
      const newLocation = await locationApi.create(locationDto);
      setLocations([newLocation, ...locations]);
      setShowAddLocation(false);
      setSelectedLocation(newLocation);
    } catch (error) {
      console.error('Failed to create location:', error);
      throw error;
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation();
    const isFavorited = favorites.some(f => f.id === locationId);
    try {
      if (isFavorited) {
        await favoriteApi.remove(MOCK_USER_ID, locationId);
        setFavorites(favorites.filter(f => f.id !== locationId));
      } else {
        await favoriteApi.add(MOCK_USER_ID, locationId);
        const location = locations.find(l => l.id === locationId) || await locationApi.getById(locationId);
        if (location) {
          setFavorites([...favorites, location]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const toggleFacilityFilter = (facility: string) => {
    setFacilitiesFilter(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const isAgeAppropriate = (location: Location): boolean => {
    if (childAge === undefined || !location.ageRange) return true;
    const { minAge, maxAge } = location.ageRange;
    if (minAge !== undefined && childAge < minAge) return false;
    if (maxAge !== undefined && childAge > maxAge) return false;
    return true;
  };

  const handleChildAgeChange = (age: number | undefined) => {
    setChildAge(age);
    if (age !== undefined) {
      localStorage.setItem('childAge', age.toString());
    } else {
      localStorage.removeItem('childAge');
    }
  };

  const getFilteredLocations = (locs: Location[]) => {
    let filtered = locs;

    if (facilitiesFilter.length > 0) {
      filtered = filtered.filter(loc =>
        facilitiesFilter.every(facility => loc.facilities.includes(facility))
      );
    }

    if (childAge !== undefined) {
      filtered = filtered.filter(isAgeAppropriate);
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

  const categories: Array<{ key: Category | undefined; icon: React.ElementType; label: string }> = [
    { key: undefined, icon: MapPin, label: t.common.all },
    { key: 'park', icon: Park, label: t.categories.park },
    { key: 'nursing_room', icon: Baby, label: t.categories.nursing_room },
    { key: 'restaurant', icon: Utensils, label: t.categories.restaurant },
    { key: 'attraction', icon: Globe, label: t.categories.attraction },
    { key: 'medical', icon: Hospital, label: t.categories.medical },
    { key: 'other', icon: MapPin, label: t.categories.other },
  ];

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="logo-section">
          <button className="icon-button sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Menu">
            <Menu size={20} />
          </button>
          <h1>FamMap</h1>
        </div>
        <div className="city-selector">
          <button 
            className="city-selector-button"
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
          >
            <span className="city-name">{CITIES.find(c => c.key === selectedCity)?.name}</span>
            <ChevronDown size={16} className={cityDropdownOpen ? 'rotate' : ''} />
          </button>
          {cityDropdownOpen && (
            <div className="city-dropdown">
              {CITIES.map((city) => (
                <button
                  key={city.key}
                  className={`city-option ${selectedCity === city.key ? 'active' : ''}`}
                  onClick={() => handleCityChange(city.key)}
                >
                  <span className="city-option-name">{city.name}</span>
                  <span className="city-option-desc">{city.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="header-actions">
          <button onClick={handleFindMe} className="icon-button" title={t.common.findMe}>
            <Navigation size={20} />
          </button>
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="icon-button"
            title="Switch Language"
          >
            <Globe size={20} />
            <span className="lang-text">{language === 'zh' ? 'EN' : '中'}</span>
          </button>
        </div>
      </header>

      <div className="main-content">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
          {showAddLocation ? (
            <div className="location-form-container">
              <header className="detail-header">
                <h2>{t.common.addLocation}</h2>
                <button 
                  onClick={() => setShowAddLocation(false)} 
                  className="close-detail-button"
                >
                  <X size={20} />
                </button>
              </header>
              <LocationForm 
                onSubmit={handleCreateLocation} 
                onCancel={() => setShowAddLocation(false)} 
                initialCoordinates={{ lat: position[0], lng: position[1] }}
              />
            </div>
          ) : selectedLocation ? (
            <div className="location-detail-overlay">
              <header className="detail-header">
                <div>
                  <div className="detail-title-row">
                    <h2>{selectedLocation.name[language]}</h2>
                    <button 
                      className={`favorite-button ${favorites.some(f => f.id === selectedLocation.id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(e, selectedLocation.id)}
                      aria-label={favorites.some(f => f.id === selectedLocation.id) ? t.common.removeFromFavorites : t.common.addToFavorites}
                    >
                      <Heart size={24} fill={favorites.some(f => f.id === selectedLocation.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <p className="category-label">{t.categories[selectedLocation.category]}</p>
                </div>
                <button 
                  onClick={() => setSelectedLocation(null)} 
                  className="close-detail-button"
                >
                  <X size={20} />
                </button>
              </header>
              <div className="detail-content">
                <div className="detail-section">
                  <h4>{t.locationDetail.address}</h4>
                  <p>{selectedLocation.address[language]}</p>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(selectedLocation.name[language])},${encodeURIComponent(selectedLocation.address[language])}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="directions-button"
                    title={t.locationDetail.directions}
                  >
                    <MapPin size={16} />
                    <span>{t.locationDetail.directions}</span>
                  </a>
                </div>
                {selectedLocation.phoneNumber && (
                  <div className="detail-section">
                    <h4>{t.locationDetail.phone || 'Phone'}</h4>
                    <a
                      href={`tel:${selectedLocation.phoneNumber}`}
                      className="phone-button"
                      title="Call"
                    >
                      📞 {selectedLocation.phoneNumber}
                    </a>
                  </div>
                )}
                {selectedLocation.pricing && (
                  <div className="detail-section">
                    <h4>{t.locationDetail.pricing}</h4>
                    <p>{selectedLocation.pricing.isFree ? t.locationDetail.isFree : selectedLocation.pricing.priceRange || 'Paid'}</p>
                  </div>
                )}
                {selectedLocation.ageRange && (selectedLocation.ageRange.minAge !== undefined || selectedLocation.ageRange.maxAge !== undefined) && (
                  <div className="detail-section">
                    <h4>{t.locationDetail.ageRange}</h4>
                    <p>
                      {selectedLocation.ageRange.minAge && selectedLocation.ageRange.maxAge
                        ? `${selectedLocation.ageRange.minAge} - ${selectedLocation.ageRange.maxAge} ${language === 'zh' ? '歲' : 'years'}`
                        : selectedLocation.ageRange.minAge ? `${selectedLocation.ageRange.minAge}+ ${language === 'zh' ? '歲' : 'years'}`
                        : `Up to ${selectedLocation.ageRange.maxAge} ${language === 'zh' ? '歲' : 'years'}`}
                    </p>
                  </div>
                )}
                {selectedLocation.operatingHours && (
                  <div className="detail-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4>{t.locationDetail.openingHours}</h4>
                      {(() => {
                        const { isOpen, message } = isLocationOpen(selectedLocation.operatingHours);
                        return (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.8em',
                            fontWeight: '600',
                            background: isOpen ? '#d4edda' : '#f8d7da',
                            color: isOpen ? '#155724' : '#721c24',
                          }}>
                            {isOpen ? '🟢' : '🔴'} {message}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="hours-list">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const dayName = language === 'zh'
                          ? DAY_NAMES_ZH[day]
                          : day.substring(0, 3).toUpperCase();
                        const hours = selectedLocation.operatingHours![day as keyof typeof selectedLocation.operatingHours];
                        return hours ? (
                          <p key={day} className="hours-item">
                            <strong>{language === 'zh' ? `週${dayName}` : dayName}:</strong> {hours}
                          </p>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                <div className="detail-section">
                  <h4>{t.locationDetail.facilities}</h4>
                  <div className="facility-chips">
                    {selectedLocation.facilities.map(f => (
                      <span key={f} className="chip">{t.facilities[f as keyof typeof t.facilities] || f}</span>
                    ))}
                  </div>
                </div>
                {selectedLocation.publicTransit && (
                  <div className="detail-section">
                    <h4>🚇 {language === 'zh' ? '公共運輸' : 'Public Transit'}</h4>
                    {selectedLocation.publicTransit.nearestMRT && (
                      <p>
                        <strong>{language === 'zh' ? '最近捷運' : 'Nearest MRT'}:</strong> {selectedLocation.publicTransit.nearestMRT.station}
                        ({selectedLocation.publicTransit.nearestMRT.line}) - 約 {Math.round(selectedLocation.publicTransit.nearestMRT.distance / 100)}00m
                      </p>
                    )}
                    {selectedLocation.publicTransit.busLines && selectedLocation.publicTransit.busLines.length > 0 && (
                      <p>
                        <strong>{language === 'zh' ? '公車路線' : 'Bus Lines'}:</strong> {selectedLocation.publicTransit.busLines.join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.parking && (
                  <div className="detail-section">
                    <h4>🅿️ {language === 'zh' ? '停車資訊' : 'Parking'}</h4>
                    <p>
                      <strong>{language === 'zh' ? '停車' : 'Parking'}</strong>: {selectedLocation.parking.available ? (language === 'zh' ? '✅ 有停車位' : '✅ Available') : (language === 'zh' ? '❌ 無停車位' : '❌ Not Available')}
                    </p>
                    {selectedLocation.parking.cost && (
                      <p>
                        <strong>{language === 'zh' ? '費用' : 'Cost'}</strong>: {selectedLocation.parking.cost}
                      </p>
                    )}
                    {selectedLocation.parking.hasValidation && (
                      <p>
                        <strong>{language === 'zh' ? '停車驗證' : 'Validation'}</strong>: {language === 'zh' ? '✅ 有停車驗證' : '✅ Available'}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.toilet && (
                  <div className="detail-section">
                    <h4>🚽 {language === 'zh' ? '廁所設施' : 'Toilet Facilities'}</h4>
                    <p>
                      <strong>{language === 'zh' ? '廁所' : 'Toilet'}</strong>: {selectedLocation.toilet.available ? (language === 'zh' ? '✅ 有廁所' : '✅ Available') : (language === 'zh' ? '❌ 無廁所' : '❌ Not Available')}
                    </p>
                    {selectedLocation.toilet.childrenFriendly && (
                      <p>
                        <strong>{language === 'zh' ? '兒童友善' : 'Kid-Friendly'}</strong>: {language === 'zh' ? '✅ 是' : '✅ Yes'}
                      </p>
                    )}
                    {selectedLocation.toilet.hasChangingTable && (
                      <p>
                        <strong>{language === 'zh' ? '換尿布台' : 'Changing Table'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.hasWiFi && (
                  <div className="detail-section">
                    <h4>📶 WiFi</h4>
                    <p>{language === 'zh' ? '✅ 有免費WiFi' : '✅ Free WiFi Available'}</p>
                  </div>
                )}
                {selectedLocation.allergens && selectedLocation.allergens.commonAllergens && selectedLocation.allergens.commonAllergens.length > 0 && (
                  <div className="detail-section">
                    <h4>⚠️ {language === 'zh' ? '常見過敏原' : 'Common Allergens'}</h4>
                    <p>{selectedLocation.allergens.commonAllergens.join(', ')}</p>
                  </div>
                )}
                {selectedLocation.crowding && (
                  <div className="detail-section">
                    <h4>👥 {language === 'zh' ? '人氣資訊' : 'Crowding Info'}</h4>
                    {selectedLocation.crowding.quietHours && (
                      <p>
                        <strong>{language === 'zh' ? '安靜時段' : 'Quiet Hours'}</strong>: {selectedLocation.crowding.quietHours}
                      </p>
                    )}
                    {selectedLocation.crowding.peakHours && (
                      <p>
                        <strong>{language === 'zh' ? '尖峰時段' : 'Peak Hours'}</strong>: {selectedLocation.crowding.peakHours}
                      </p>
                    )}
                    {selectedLocation.crowding.averageCrowding && (
                      <p>
                        <strong>{language === 'zh' ? '平均人潮' : 'Average Crowding'}</strong>: {
                          selectedLocation.crowding.averageCrowding === 'light' ? (language === 'zh' ? '人少' : 'Light') :
                          selectedLocation.crowding.averageCrowding === 'moderate' ? (language === 'zh' ? '中等' : 'Moderate') :
                          (language === 'zh' ? '人多' : 'Heavy')
                        }
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.nursingAmenities && (
                  <div className="detail-section">
                    <h4>👶 {language === 'zh' ? '哺乳/換尿布設施' : 'Nursing & Diaper Facilities'}</h4>
                    {selectedLocation.nursingAmenities.hasDedicatedArea && (
                      <p>
                        <strong>{language === 'zh' ? '專用區域' : 'Dedicated Area'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.nursingAmenities.hasChangingTable && (
                      <p>
                        <strong>{language === 'zh' ? '換尿布台' : 'Changing Table'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.nursingAmenities.hasPowerOutlet && (
                      <p>
                        <strong>{language === 'zh' ? '電源' : 'Power Outlet'}</strong>: {language === 'zh' ? '✅ 有(可用溫奶器)' : '✅ Available (for warmers)'}
                      </p>
                    )}
                    {selectedLocation.nursingAmenities.hasRefrigerator && (
                      <p>
                        <strong>{language === 'zh' ? '冰箱' : 'Refrigerator'}</strong>: {language === 'zh' ? '✅ 有(可冷藏母乳)' : '✅ Available (for breast milk)'}
                      </p>
                    )}
                    {selectedLocation.nursingAmenities.hasWarmWater && (
                      <p>
                        <strong>{language === 'zh' ? '熱水' : 'Warm Water'}</strong>: {language === 'zh' ? '✅ 有(可泡奶粉)' : '✅ Available (for formula)'}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.weatherCoverage && (
                  <div className="detail-section">
                    <h4>🌦️ {language === 'zh' ? '天候保護' : 'Weather Coverage'}</h4>
                    <p>
                      <strong>{language === 'zh' ? '室內/戶外' : 'Indoor/Outdoor'}</strong>: {selectedLocation.weatherCoverage.isIndoor ? (language === 'zh' ? '🏢 室內' : '🏢 Indoor') : (language === 'zh' ? '🏞️ 戶外' : '🏞️ Outdoor')}
                    </p>
                    {selectedLocation.weatherCoverage.hasRoof && (
                      <p>
                        <strong>{language === 'zh' ? '有屋頂' : 'Has Roof'}</strong>: {language === 'zh' ? '✅ 是' : '✅ Yes'}
                      </p>
                    )}
                    {selectedLocation.weatherCoverage.hasShade && (
                      <p>
                        <strong>{language === 'zh' ? '有遮蔭' : 'Has Shade'}</strong>: {language === 'zh' ? '✅ 是' : '✅ Yes'}
                      </p>
                    )}
                    {selectedLocation.weatherCoverage.weatherProtection && (
                      <p>
                        <strong>{language === 'zh' ? '說明' : 'Details'}</strong>: {selectedLocation.weatherCoverage.weatherProtection}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.nearbyAmenities && (
                  <div className="detail-section">
                    <h4>🏪 {language === 'zh' ? '附近設施' : 'Nearby Amenities'}</h4>
                    {selectedLocation.nearbyAmenities.convenientStores !== undefined && selectedLocation.nearbyAmenities.convenientStores > 0 && (
                      <p>
                        <strong>{language === 'zh' ? '便利商店' : 'Convenient Stores'}</strong>: {selectedLocation.nearbyAmenities.convenientStores} {language === 'zh' ? '家(200m內)' : ' shops (within 200m)'}
                      </p>
                    )}
                    {selectedLocation.nearbyAmenities.nearbyRestrooms && (
                      <p>
                        <strong>{language === 'zh' ? '附近廁所' : 'Nearby Restrooms'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.nearbyAmenities.nearbyRestaurants && (
                      <p>
                        <strong>{language === 'zh' ? '附近餐廳' : 'Nearby Restaurants'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.nearbyAmenities.nearbyPublicTransit && (
                      <p>
                        <strong>{language === 'zh' ? '大眾運輸' : 'Public Transit'}</strong>: {selectedLocation.nearbyAmenities.nearbyPublicTransit}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.accessibility && (
                  <div className="detail-section">
                    <h4>♿ {language === 'zh' ? '無障礙設施' : 'Accessibility Features'}</h4>
                    {selectedLocation.accessibility.wheelchairAccessible && (
                      <p>
                        <strong>{language === 'zh' ? '輪椅可進入' : 'Wheelchair Accessible'}</strong>: {language === 'zh' ? '✅ 是' : '✅ Yes'}
                      </p>
                    )}
                    {selectedLocation.accessibility.accessibleToilet && (
                      <p>
                        <strong>{language === 'zh' ? '無障礙廁所' : 'Accessible Toilet'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.accessibility.disabledParking && (
                      <p>
                        <strong>{language === 'zh' ? '身心障礙停車位' : 'Disabled Parking'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.accessibility.hasElevator && (
                      <p>
                        <strong>{language === 'zh' ? '電梯' : 'Elevator'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.accessibility.hasRamp && (
                      <p>
                        <strong>{language === 'zh' ? '坡道' : 'Ramp'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.accessibility.accessibilityNotes && (
                      <p>
                        <strong>{language === 'zh' ? '說明' : 'Details'}</strong>: {selectedLocation.accessibility.accessibilityNotes}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.activity && (
                  <div className="detail-section">
                    <h4>🎪 {language === 'zh' ? '遊戲活動' : 'Activities & Equipment'}</h4>
                    {selectedLocation.activity.mainActivities && (
                      <p>
                        <strong>{language === 'zh' ? '主要活動' : 'Main Activities'}</strong>: {selectedLocation.activity.mainActivities}
                      </p>
                    )}
                    {selectedLocation.activity.activityTypes && selectedLocation.activity.activityTypes.length > 0 && (
                      <p>
                        <strong>{language === 'zh' ? '活動類型' : 'Activity Types'}</strong>: {selectedLocation.activity.activityTypes.join(', ')}
                      </p>
                    )}
                    {selectedLocation.activity.equipment && selectedLocation.activity.equipment.length > 0 && (
                      <p>
                        <strong>{language === 'zh' ? '設施設備' : 'Equipment'}</strong>: {selectedLocation.activity.equipment.join(', ')}
                      </p>
                    )}
                    {selectedLocation.activity.ageAppropriate && (
                      <p>
                        <strong>{language === 'zh' ? '適合年齡' : 'Age Range'}</strong>: {selectedLocation.activity.ageAppropriate.minAge || 0} - {selectedLocation.activity.ageAppropriate.maxAge || '18'} {language === 'zh' ? '歲' : ' years'}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.safety && (
                  <div className="detail-section">
                    <h4>🛡️ {language === 'zh' ? '安全信息' : 'Safety Information'}</h4>
                    {selectedLocation.safety.safetyRating && (
                      <p>
                        <strong>{language === 'zh' ? '安全評分' : 'Safety Rating'}</strong>: {'⭐'.repeat(Math.round(selectedLocation.safety.safetyRating))} ({selectedLocation.safety.safetyRating.toFixed(1)}/5)
                      </p>
                    )}
                    {selectedLocation.safety.playAreaSafety && (
                      <p>
                        <strong>{language === 'zh' ? '遊戲區安全' : 'Play Area Safety'}</strong>: {language === 'zh' ?
                          (selectedLocation.safety.playAreaSafety === 'excellent' ? '🟢 優良' :
                           selectedLocation.safety.playAreaSafety === 'good' ? '🟢 良好' :
                           selectedLocation.safety.playAreaSafety === 'fair' ? '🟡 普通' : '🔴 需改善') :
                          (selectedLocation.safety.playAreaSafety === 'excellent' ? '🟢 Excellent' :
                           selectedLocation.safety.playAreaSafety === 'good' ? '🟢 Good' :
                           selectedLocation.safety.playAreaSafety === 'fair' ? '🟡 Fair' : '🔴 Needs Improvement')}
                      </p>
                    )}
                    {selectedLocation.safety.firstAidAvailable && (
                      <p>
                        <strong>{language === 'zh' ? '急救設備' : 'First Aid Available'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Yes'}
                      </p>
                    )}
                    {selectedLocation.safety.supervisionAvailable && (
                      <p>
                        <strong>{language === 'zh' ? '工作人員監督' : 'Staff Supervision'}</strong>: {language === 'zh' ? '✅ 有' : '✅ Available'}
                      </p>
                    )}
                    {selectedLocation.safety.safetyNotes && (
                      <p>
                        <strong>{language === 'zh' ? '說明' : 'Details'}</strong>: {selectedLocation.safety.safetyNotes}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.qualityMetrics && (
                  <div className="detail-section">
                    <h4>✨ {language === 'zh' ? '清潔與維護' : 'Cleanliness & Maintenance'}</h4>
                    {selectedLocation.qualityMetrics.cleanlinessRating && (
                      <p>
                        <strong>{language === 'zh' ? '清潔度評分' : 'Cleanliness Rating'}</strong>: {'⭐'.repeat(Math.round(selectedLocation.qualityMetrics.cleanlinessRating))} ({selectedLocation.qualityMetrics.cleanlinessRating.toFixed(1)}/5)
                      </p>
                    )}
                    {selectedLocation.qualityMetrics.maintenanceStatus && (
                      <p>
                        <strong>{language === 'zh' ? '維護狀態' : 'Maintenance Status'}</strong>: {language === 'zh' ?
                          (selectedLocation.qualityMetrics.maintenanceStatus === 'excellent' ? '🟢 優良' :
                           selectedLocation.qualityMetrics.maintenanceStatus === 'good' ? '🟢 良好' :
                           selectedLocation.qualityMetrics.maintenanceStatus === 'fair' ? '🟡 普通' : '🔴 需改善') :
                          (selectedLocation.qualityMetrics.maintenanceStatus === 'excellent' ? '🟢 Excellent' :
                           selectedLocation.qualityMetrics.maintenanceStatus === 'good' ? '🟢 Good' :
                           selectedLocation.qualityMetrics.maintenanceStatus === 'fair' ? '🟡 Fair' : '🔴 Needs Improvement')}
                      </p>
                    )}
                    {selectedLocation.qualityMetrics.lastMaintenanceDate && (
                      <p>
                        <strong>{language === 'zh' ? '最後維護日期' : 'Last Maintenance'}</strong>: {new Date(selectedLocation.qualityMetrics.lastMaintenanceDate).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}
                      </p>
                    )}
                    {selectedLocation.qualityMetrics.cleanlinessNotes && (
                      <p>
                        <strong>{language === 'zh' ? '說明' : 'Details'}</strong>: {selectedLocation.qualityMetrics.cleanlinessNotes}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.seasonal && (
                  <div className="detail-section">
                    <h4>🌍 {language === 'zh' ? '季節信息' : 'Seasonal Information'}</h4>
                    {selectedLocation.seasonal.bestSeasons && selectedLocation.seasonal.bestSeasons.length > 0 && (
                      <p>
                        <strong>{language === 'zh' ? '最佳季節' : 'Best Seasons'}</strong>: {selectedLocation.seasonal.bestSeasons.map(s => language === 'zh' ?
                          (s === 'spring' ? '🌸 春季' : s === 'summer' ? '☀️ 夏季' : s === 'fall' ? '🍁 秋季' : '❄️ 冬季') :
                          (s === 'spring' ? '🌸 Spring' : s === 'summer' ? '☀️ Summer' : s === 'fall' ? '🍁 Fall' : '❄️ Winter')).join(', ')}
                      </p>
                    )}
                    {selectedLocation.seasonal.summerNotes && (
                      <p>
                        <strong>{language === 'zh' ? '夏季提示' : 'Summer Tips'}</strong>: {selectedLocation.seasonal.summerNotes}
                      </p>
                    )}
                    {selectedLocation.seasonal.winterNotes && (
                      <p>
                        <strong>{language === 'zh' ? '冬季提示' : 'Winter Tips'}</strong>: {selectedLocation.seasonal.winterNotes}
                      </p>
                    )}
                    {selectedLocation.seasonal.rainySeasonNotes && (
                      <p>
                        <strong>{language === 'zh' ? '雨季/颱風' : 'Rainy Season/Typhoon'}</strong>: {selectedLocation.seasonal.rainySeasonNotes}
                      </p>
                    )}
                    {selectedLocation.seasonal.seasonalActivities && (
                      <p>
                        <strong>{language === 'zh' ? '季節活動' : 'Seasonal Activities'}</strong>: {selectedLocation.seasonal.seasonalActivities}
                      </p>
                    )}
                    {selectedLocation.seasonal.schoolHolidayCrowding && (
                      <p>
                        <strong>{language === 'zh' ? '假期人潮' : 'School Holiday Crowds'}</strong>: {language === 'zh' ?
                          (selectedLocation.seasonal.schoolHolidayCrowding === 'light' ? '🟢 較少' :
                           selectedLocation.seasonal.schoolHolidayCrowding === 'moderate' ? '🟡 適中' : '🔴 很多') :
                          (selectedLocation.seasonal.schoolHolidayCrowding === 'light' ? '🟢 Light' :
                           selectedLocation.seasonal.schoolHolidayCrowding === 'moderate' ? '🟡 Moderate' : '🔴 Heavy')}
                      </p>
                    )}
                    {selectedLocation.seasonal.seasonalClosures && (
                      <p>
                        <strong>{language === 'zh' ? '季節性關閉' : 'Seasonal Closures'}</strong>: {selectedLocation.seasonal.seasonalClosures}
                      </p>
                    )}
                  </div>
                )}
                {selectedLocation.payment && (
                  <div className="detail-section">
                    <h4>💳 {language === 'zh' ? '付款方式' : 'Payment Methods'}</h4>
                    {selectedLocation.payment.acceptsCash && <p>✅ {language === 'zh' ? '現金' : 'Cash'}</p>}
                    {selectedLocation.payment.acceptsLinePay && <p>✅ LINE Pay</p>}
                    {selectedLocation.payment.acceptsWeChatPay && <p>✅ WeChat Pay</p>}
                    {selectedLocation.payment.acceptsAlipay && <p>✅ AliPay</p>}
                    {selectedLocation.payment.acceptsApplePay && <p>✅ Apple Pay</p>}
                    {selectedLocation.payment.acceptsSamsungPay && <p>✅ Samsung Pay</p>}
                    {selectedLocation.payment.acceptsCreditCard && <p>✅ {language === 'zh' ? '信用卡' : 'Credit Card'}</p>}
                    {selectedLocation.payment.acceptsDebitCard && <p>✅ {language === 'zh' ? '金融卡' : 'Debit Card'}</p>}
                    {selectedLocation.payment.paymentNotes && (
                      <p><strong>{language === 'zh' ? '備註' : 'Notes'}</strong>: {selectedLocation.payment.paymentNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.outsideFood && (
                  <div className="detail-section">
                    <h4>🍱 {language === 'zh' ? '飲食政策' : 'Food Policy'}</h4>
                    <p>
                      <strong>{language === 'zh' ? '可帶食物' : 'Bring Food'}</strong>: {selectedLocation.outsideFood.allowsOutsideFood ? '✅' : '❌'}
                    </p>
                    <p>
                      <strong>{language === 'zh' ? '可帶飲料' : 'Bring Beverages'}</strong>: {selectedLocation.outsideFood.allowsOutsideBeverages ? '✅' : '❌'}
                    </p>
                    {selectedLocation.outsideFood.hasPicnicAreas && (
                      <p>✅ {language === 'zh' ? '有野餐區' : 'Has Picnic Areas'}</p>
                    )}
                    {selectedLocation.outsideFood.hasRefrigeratedStorage && (
                      <p>✅ {language === 'zh' ? '冷藏儲存' : 'Refrigerated Storage'}</p>
                    )}
                    {selectedLocation.outsideFood.foodPolicyNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.outsideFood.foodPolicyNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.stroller && (
                  <div className="detail-section">
                    <h4>👶 {language === 'zh' ? '嬰兒車' : 'Stroller'}</h4>
                    <p>
                      <strong>{language === 'zh' ? '適合嬰兒車' : 'Stroller Friendly'}</strong>: {selectedLocation.stroller.strollerFriendly ? '✅' : '❌'}
                    </p>
                    {selectedLocation.stroller.hasStrollerStorage && (
                      <p>✅ {language === 'zh' ? '有停放區' : 'Has Storage Area'}</p>
                    )}
                    {selectedLocation.stroller.hasStrollerRental && (
                      <p>✅ {language === 'zh' ? '可租賃' : 'Stroller Rental Available'}</p>
                    )}
                    {selectedLocation.stroller.strollerStorageNotes && (
                      <p><strong>{language === 'zh' ? '停放說明' : 'Storage Info'}</strong>: {selectedLocation.stroller.strollerStorageNotes}</p>
                    )}
                    {selectedLocation.stroller.restrictedAreas && (
                      <p><strong>{language === 'zh' ? '限制區域' : 'Restricted Areas'}</strong>: {selectedLocation.stroller.restrictedAreas}</p>
                    )}
                  </div>
                )}
                {selectedLocation.reservedTimes && (
                  <div className="detail-section">
                    <h4>🕐 {language === 'zh' ? '預約時段' : 'Reserved Times'}</h4>
                    {selectedLocation.reservedTimes.parentChildHours && (
                      <p><strong>{language === 'zh' ? '親子時段' : 'Parent-Child Hours'}</strong>: {selectedLocation.reservedTimes.parentChildHours}</p>
                    )}
                    {selectedLocation.reservedTimes.toddlerSpecificTimes && (
                      <p><strong>{language === 'zh' ? '幼兒時段' : 'Toddler Times'}</strong>: {selectedLocation.reservedTimes.toddlerSpecificTimes}</p>
                    )}
                    {selectedLocation.reservedTimes.quietHours && (
                      <p><strong>{language === 'zh' ? '安靜時段' : 'Quiet Hours'}</strong>: {selectedLocation.reservedTimes.quietHours}</p>
                    )}
                    {selectedLocation.reservedTimes.reservedTimesNotes && (
                      <p><strong>{language === 'zh' ? '備註' : 'Notes'}</strong>: {selectedLocation.reservedTimes.reservedTimesNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.nursingRoom && (
                  <div className="detail-section">
                    <h4>👩‍🍼 {language === 'zh' ? '哺乳室' : 'Nursing Room'}</h4>
                    {selectedLocation.nursingRoom.hasDedicatedNursingRoom && (
                      <p><strong>{language === 'zh' ? '專門哺乳室' : 'Dedicated Room'}</strong>: ✅</p>
                    )}
                    {selectedLocation.nursingRoom.isPrivate && (
                      <p><strong>{language === 'zh' ? '隱私' : 'Privacy'}</strong>: {selectedLocation.nursingRoom.isPrivate ? `✅ ${language === 'zh' ? '獨立' : 'Private'}` : `❌ ${language === 'zh' ? '開放' : 'Shared'}`}</p>
                    )}
                    {selectedLocation.nursingRoom.hasSeating && (
                      <p>✅ {language === 'zh' ? '舒適座位' : 'Comfortable Seating'}</p>
                    )}
                    {selectedLocation.nursingRoom.hasChangingTable && (
                      <p>✅ {language === 'zh' ? '尿布台' : 'Changing Table'}</p>
                    )}
                    {selectedLocation.nursingRoom.hasAirConditioning && (
                      <p>✅ {language === 'zh' ? '空調' : 'Air Conditioning'}</p>
                    )}
                    {selectedLocation.nursingRoom.hasWifi && (
                      <p>✅ WiFi</p>
                    )}
                    {selectedLocation.nursingRoom.hasRefrigerator && (
                      <p>✅ {language === 'zh' ? '冰箱' : 'Refrigerator'}</p>
                    )}
                    {selectedLocation.nursingRoom.hasPowerOutlet && (
                      <p>✅ {language === 'zh' ? '插座' : 'Power Outlet'}</p>
                    )}
                    {selectedLocation.nursingRoom.cleanlinessRating && (
                      <p><strong>{language === 'zh' ? '清潔度' : 'Cleanliness'}</strong>: ⭐ {selectedLocation.nursingRoom.cleanlinessRating}/5</p>
                    )}
                    {selectedLocation.nursingRoom.roomCount && (
                      <p><strong>{language === 'zh' ? '房間數' : 'Number of Rooms'}</strong>: {selectedLocation.nursingRoom.roomCount}</p>
                    )}
                    {selectedLocation.nursingRoom.nursingRoomNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.nursingRoom.nursingRoomNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.petPolicy && (
                  <div className="detail-section">
                    <h4>🐕 {language === 'zh' ? '寵物政策' : 'Pet Policy'}</h4>
                    {selectedLocation.petPolicy.petsAllowed !== undefined && (
                      <p><strong>{language === 'zh' ? '寵物允許' : 'Pets Allowed'}</strong>: {selectedLocation.petPolicy.petsAllowed ? '✅' : '❌'}</p>
                    )}
                    {selectedLocation.petPolicy.dogsAllowed !== undefined && (
                      <p><strong>{language === 'zh' ? '狗狗允許' : 'Dogs Allowed'}</strong>: {selectedLocation.petPolicy.dogsAllowed ? '✅' : '❌'}</p>
                    )}
                    {selectedLocation.petPolicy.catsAllowed !== undefined && (
                      <p><strong>{language === 'zh' ? '貓咪允許' : 'Cats Allowed'}</strong>: {selectedLocation.petPolicy.catsAllowed ? '✅' : '❌'}</p>
                    )}
                    {selectedLocation.petPolicy.serviceAnimalsAllowed && (
                      <p>✅ {language === 'zh' ? '服務動物允許' : 'Service Animals Allowed'}</p>
                    )}
                    {selectedLocation.petPolicy.hasLeashRequirement && (
                      <p>⛓️ {language === 'zh' ? '需要繫牽繩' : 'Leash Required'}</p>
                    )}
                    {selectedLocation.petPolicy.hasDesignatedPetAreas && (
                      <p>🏞️ {language === 'zh' ? '專區' : 'Designated Pet Areas'}</p>
                    )}
                    {selectedLocation.petPolicy.hasOnSiteVeterinary && (
                      <p>⚕️ {language === 'zh' ? '現場獸醫' : 'On-site Veterinary'}</p>
                    )}
                    {selectedLocation.petPolicy.petRestrictionsDetails && (
                      <p><strong>{language === 'zh' ? '限制詳情' : 'Restrictions'}</strong>: {selectedLocation.petPolicy.petRestrictionsDetails}</p>
                    )}
                    {selectedLocation.petPolicy.petPolicyNotes && (
                      <p><strong>{language === 'zh' ? '備註' : 'Notes'}</strong>: {selectedLocation.petPolicy.petPolicyNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.climateComfort && (
                  <div className="detail-section">
                    <h4>🌡️ {language === 'zh' ? '氣候舒適度' : 'Climate Comfort'}</h4>
                    {selectedLocation.climateComfort.hasAirConditioning && (
                      <p>✅ {language === 'zh' ? '冷氣' : 'Air Conditioning'}</p>
                    )}
                    {selectedLocation.climateComfort.hasHeating && (
                      <p>✅ {language === 'zh' ? '暖氣' : 'Heating'}</p>
                    )}
                    {selectedLocation.climateComfort.hasShadedAreas && (
                      <p>✅ {language === 'zh' ? '遮蔭區' : 'Shaded Areas'}</p>
                    )}
                    {selectedLocation.climateComfort.indoorAreaPercentage !== undefined && (
                      <p><strong>{language === 'zh' ? '室內比例' : 'Indoor Area'}</strong>: {selectedLocation.climateComfort.indoorAreaPercentage}%</p>
                    )}
                    {selectedLocation.climateComfort.hasWaterStations && (
                      <p>✅ {language === 'zh' ? '飲水台' : 'Water Stations'}</p>
                    )}
                    {selectedLocation.climateComfort.hasRestAreas && (
                      <p>✅ {language === 'zh' ? '休息區' : 'Rest Areas'}</p>
                    )}
                    {selectedLocation.climateComfort.summerHeatMitigation && (
                      <p><strong>{language === 'zh' ? '夏季防熱' : 'Summer Heat'}</strong>: {selectedLocation.climateComfort.summerHeatMitigation}</p>
                    )}
                    {selectedLocation.climateComfort.winterColdProtection && (
                      <p><strong>{language === 'zh' ? '冬季防寒' : 'Winter Cold'}</strong>: {selectedLocation.climateComfort.winterColdProtection}</p>
                    )}
                    {selectedLocation.climateComfort.climateNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.climateComfort.climateNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.sanitationProtocols && (
                  <div className="detail-section">
                    <h4>🧼 {language === 'zh' ? '清潔衛生' : 'Sanitation Protocols'}</h4>
                    {selectedLocation.sanitationProtocols.cleaningFrequency && (
                      <p><strong>{language === 'zh' ? '清潔頻率' : 'Cleaning Frequency'}</strong>: {selectedLocation.sanitationProtocols.cleaningFrequency}</p>
                    )}
                    {selectedLocation.sanitationProtocols.airQualityRating && (
                      <p><strong>{language === 'zh' ? '空氣品質' : 'Air Quality'}</strong>: {selectedLocation.sanitationProtocols.airQualityRating === 'excellent' ? '⭐⭐⭐⭐⭐ 優秀' : selectedLocation.sanitationProtocols.airQualityRating === 'good' ? '⭐⭐⭐⭐ 良好' : selectedLocation.sanitationProtocols.airQualityRating === 'fair' ? '⭐⭐⭐ 一般' : '⭐⭐ 需改進'}</p>
                    )}
                    {selectedLocation.sanitationProtocols.hasAirFilters && (
                      <p>✅ {language === 'zh' ? 'HEPA空氣過濾系統' : 'HEPA Air Filters'}</p>
                    )}
                    {selectedLocation.sanitationProtocols.hasFrequentHandWashingStations && (
                      <p>✅ {language === 'zh' ? '兒童洗手區' : 'Kids Hand Washing Stations'}</p>
                    )}
                    {selectedLocation.sanitationProtocols.highTouchSurfaceDisinfection && (
                      <p>✅ {language === 'zh' ? '高接觸表面消毒' : 'High-Touch Surface Disinfection'}</p>
                    )}
                    {selectedLocation.sanitationProtocols.toySanitizationFrequency && (
                      <p><strong>{language === 'zh' ? '玩具消毒頻率' : 'Toy Sanitization'}</strong>: {selectedLocation.sanitationProtocols.toySanitizationFrequency}</p>
                    )}
                    {selectedLocation.sanitationProtocols.disinfectionMethods && selectedLocation.sanitationProtocols.disinfectionMethods.length > 0 && (
                      <p><strong>{language === 'zh' ? '消毒方法' : 'Disinfection Methods'}</strong>: {selectedLocation.sanitationProtocols.disinfectionMethods.join(', ')}</p>
                    )}
                    {selectedLocation.sanitationProtocols.sanitationNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.sanitationProtocols.sanitationNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.staffLanguage && (
                  <div className="detail-section">
                    <h4>🗣️ {language === 'zh' ? '語言支援' : 'Language Support'}</h4>
                    {selectedLocation.staffLanguage.englishStaffAvailable && (
                      <p>✅ {language === 'zh' ? '英文工作人員' : 'English-speaking Staff'}</p>
                    )}
                    {selectedLocation.staffLanguage.languagesSpoken && selectedLocation.staffLanguage.languagesSpoken.length > 0 && (
                      <p><strong>{language === 'zh' ? '支援語言' : 'Languages'}</strong>: {selectedLocation.staffLanguage.languagesSpoken.join(', ')}</p>
                    )}
                    {selectedLocation.staffLanguage.hasTranslationServices && (
                      <p>✅ {language === 'zh' ? '翻譯服務' : 'Translation Services'}</p>
                    )}
                    {selectedLocation.staffLanguage.multilingualSignage && (
                      <p>✅ {language === 'zh' ? '多語言標誌' : 'Multilingual Signage'}</p>
                    )}
                    {selectedLocation.staffLanguage.staffTrainingLevel && (
                      <p><strong>{language === 'zh' ? '工作人員訓練' : 'Staff Training'}</strong>: {selectedLocation.staffLanguage.staffTrainingLevel === 'certified' ? '認證' : selectedLocation.staffLanguage.staffTrainingLevel === 'trained' ? '已訓練' : selectedLocation.staffLanguage.staffTrainingLevel === 'basic' ? '基礎' : '最少'}</p>
                    )}
                    {selectedLocation.staffLanguage.languageSupportNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.staffLanguage.languageSupportNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.waterSafety && (
                  <div className="detail-section">
                    <h4>🌊 {language === 'zh' ? '水上安全與活動' : 'Water Safety & Activities'}</h4>
                    {selectedLocation.waterSafety.hasWaterActivities && (
                      <p>✅ {language === 'zh' ? '水上活動' : 'Water Activities Available'}</p>
                    )}
                    {selectedLocation.waterSafety.lifeguardAvailable && (
                      <p>✅ {language === 'zh' ? '救生員在場' : 'Lifeguard Available'}</p>
                    )}
                    {selectedLocation.waterSafety.lifeguardRatio && (
                      <p><strong>{language === 'zh' ? '救生員比例' : 'Lifeguard Ratio'}</strong>: {selectedLocation.waterSafety.lifeguardRatio}</p>
                    )}
                    {selectedLocation.waterSafety.waterQualityTesting && (
                      <p><strong>{language === 'zh' ? '水質測試' : 'Water Quality Testing'}</strong>: {selectedLocation.waterSafety.waterQualityTesting}</p>
                    )}
                    {selectedLocation.waterSafety.maxWaterDepth !== undefined && (
                      <p><strong>{language === 'zh' ? '最大深度' : 'Max Water Depth'}</strong>: {selectedLocation.waterSafety.maxWaterDepth}m</p>
                    )}
                    {selectedLocation.waterSafety.hasShallowAreas && (
                      <p>✅ {language === 'zh' ? '淺水區' : 'Shallow Areas'}</p>
                    )}
                    {selectedLocation.waterSafety.poolTemperature && (
                      <p><strong>{language === 'zh' ? '池溫度' : 'Pool Temperature'}</strong>: {selectedLocation.waterSafety.poolTemperature}</p>
                    )}
                    {selectedLocation.waterSafety.hasLifeJacketRental && (
                      <p>✅ {language === 'zh' ? '救生衣租賃' : 'Life Jacket Rental'}</p>
                    )}
                    {selectedLocation.waterSafety.swimLessonAvailable && (
                      <p>✅ {language === 'zh' ? '游泳課程' : 'Swim Lessons Available'}</p>
                    )}
                    {selectedLocation.waterSafety.waterSafetyRulesEnforced && (
                      <p>✅ {language === 'zh' ? '水上安全規則執行' : 'Water Safety Rules Enforced'}</p>
                    )}
                    {selectedLocation.waterSafety.waterSafetyNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.waterSafety.waterSafetyNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.highChair && (
                  <div className="detail-section">
                    <h4>👶 {language === 'zh' ? '嬰兒餐椅與嬰兒用品' : 'High-Chairs & Baby Gear'}</h4>
                    {selectedLocation.highChair.hasHighChairs && (
                      <p>✅ {language === 'zh' ? '嬰兒餐椅' : 'High Chairs Available'}</p>
                    )}
                    {selectedLocation.highChair.highChairQuantity !== undefined && (
                      <p><strong>{language === 'zh' ? '餐椅數量' : 'Quantity'}</strong>: {selectedLocation.highChair.highChairQuantity}</p>
                    )}
                    {selectedLocation.highChair.minimumAgeMonths !== undefined && (
                      <p><strong>{language === 'zh' ? '最小年齡' : 'Minimum Age'}</strong>: {selectedLocation.highChair.minimumAgeMonths} {language === 'zh' ? '個月' : 'months'}</p>
                    )}
                    {selectedLocation.highChair.maximumAgeMonths !== undefined && (
                      <p><strong>{language === 'zh' ? '最大年齡' : 'Maximum Age'}</strong>: {selectedLocation.highChair.maximumAgeMonths} {language === 'zh' ? '個月' : 'months'}</p>
                    )}
                    {selectedLocation.highChair.cleanlinessRating !== undefined && (
                      <p><strong>{language === 'zh' ? '清潔度' : 'Cleanliness'}</strong>: {selectedLocation.highChair.cleanlinessRating === 5 ? '⭐⭐⭐⭐⭐ 優秀' : selectedLocation.highChair.cleanlinessRating === 4 ? '⭐⭐⭐⭐ 良好' : selectedLocation.highChair.cleanlinessRating === 3 ? '⭐⭐⭐ 一般' : '⭐⭐ 需改進'}</p>
                    )}
                    {selectedLocation.highChair.hasBoosterSeats && (
                      <p>✅ {language === 'zh' ? '加高座椅' : 'Booster Seats'}</p>
                    )}
                    {selectedLocation.highChair.hasChangingStations && (
                      <p>✅ {language === 'zh' ? '尿布台' : 'Changing Stations'}</p>
                    )}
                    {selectedLocation.highChair.hasBottleWarmingFacilities && (
                      <p>✅ {language === 'zh' ? '奶瓶溫暖設施' : 'Bottle Warming Facilities'}</p>
                    )}
                    {selectedLocation.highChair.babyGearRentalAvailable && (
                      <p>✅ {language === 'zh' ? '嬰兒用品租賃' : 'Baby Gear Rental Available'}</p>
                    )}
                    {selectedLocation.highChair.highChairNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.highChair.highChairNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.ageSpecificBathroom && (
                  <div className="detail-section">
                    <h4>🚽 {language === 'zh' ? '幼兒浴室' : 'Bathrooms for Toddlers'}</h4>
                    {selectedLocation.ageSpecificBathroom.hasToddlerToilets && (
                      <p>✅ {language === 'zh' ? '幼兒馬桶' : 'Toddler Toilets'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.hasStepStools && (
                      <p>✅ {language === 'zh' ? '踏腳凳' : 'Step Stools'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.hasToiletTrainingFacilities && (
                      <p>✅ {language === 'zh' ? '如廁訓練設施' : 'Toilet Training Facilities'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.hasChildHeightHandWashing && (
                      <p>✅ {language === 'zh' ? '兒童洗手設施' : 'Child-Height Hand Washing'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.hasPrivacyFamilyBathroom && (
                      <p>✅ {language === 'zh' ? '親子浴室' : 'Private Family Bathroom'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.hasHandDryersChildSafe && (
                      <p>✅ {language === 'zh' ? '兒童安全烘手機' : 'Child-Safe Hand Dryers'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.parentSupervisionVisiblity && (
                      <p>✅ {language === 'zh' ? '家長監督可見性' : 'Parent Supervision Visibility'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.genderSpecificFacilityEducation && (
                      <p>✅ {language === 'zh' ? '性別教育設施' : 'Gender Facility Education'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.bathroomCleanlinessRating !== undefined && (
                      <p><strong>{language === 'zh' ? '清潔度' : 'Cleanliness'}</strong>: {selectedLocation.ageSpecificBathroom.bathroomCleanlinessRating === 5 ? '⭐⭐⭐⭐⭐ 優秀' : selectedLocation.ageSpecificBathroom.bathroomCleanlinessRating === 4 ? '⭐⭐⭐⭐ 良好' : selectedLocation.ageSpecificBathroom.bathroomCleanlinessRating === 3 ? '⭐⭐⭐ 一般' : '⭐⭐ 需改進'}</p>
                    )}
                    {selectedLocation.ageSpecificBathroom.bathroomNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.ageSpecificBathroom.bathroomNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.lostChildProtocol && (
                  <div className="detail-section">
                    <h4>🆘 {language === 'zh' ? '失蹤兒童協議' : 'Lost Child Protocol'}</h4>
                    {selectedLocation.lostChildProtocol.hasLostChildProtocol && (
                      <p>✅ {language === 'zh' ? '已建立失蹤兒童協議' : 'Lost Child Protocol Established'}</p>
                    )}
                    {selectedLocation.lostChildProtocol.staffIdentificationSystem && (
                      <p>✅ {language === 'zh' ? '員工識別系統' : 'Staff Identification System'}</p>
                    )}
                    {selectedLocation.lostChildProtocol.hasEmergencyPaging && (
                      <p>✅ {language === 'zh' ? '緊急尋人廣播' : 'Emergency Paging System'}</p>
                    )}
                    {selectedLocation.lostChildProtocol.hasIDWristbandSystem && (
                      <p>✅ {language === 'zh' ? 'ID手環系統' : 'ID Wristband System'}</p>
                    )}
                    {selectedLocation.lostChildProtocol.meetingPointDesignated && (
                      <p>✅ {language === 'zh' ? '指定集合點' : 'Designated Meeting Point'}</p>
                    )}
                    {selectedLocation.lostChildProtocol.hasEmergencyPhoneNumbers && (
                      <p>✅ {language === 'zh' ? '緊急電話號碼' : 'Emergency Phone Numbers'}</p>
                    )}
                    {selectedLocation.lostChildProtocol.staffTrainingLevel && (
                      <p><strong>{language === 'zh' ? '員工培訓級別' : 'Staff Training Level'}</strong>: {selectedLocation.lostChildProtocol.staffTrainingLevel === 'comprehensive' ? '全面' : selectedLocation.lostChildProtocol.staffTrainingLevel === 'standard' ? '標準' : selectedLocation.lostChildProtocol.staffTrainingLevel === 'basic' ? '基礎' : '最小'}</p>
                    )}
                    {selectedLocation.lostChildProtocol.incidentDocumentation && (
                      <p>✅ {language === 'zh' ? '事件文件記錄' : 'Incident Documentation'}</p>
                    )}
                    {selectedLocation.lostChildProtocol.lostChildProtocolNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.lostChildProtocol.lostChildProtocolNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.parentRestArea && (
                  <div className="location-section" style={{ borderTop: '2px solid #f9a825', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>👪 {language === 'zh' ? '家長休息區' : 'Parent Rest Area'}</h3>
                    {selectedLocation.parentRestArea.hasRestAreas && (
                      <p>✅ {language === 'zh' ? '有舒適休息區' : 'Comfortable Rest Areas Available'}</p>
                    )}
                    {selectedLocation.parentRestArea.restAreaQuantity && (
                      <p><strong>{language === 'zh' ? '休息區數量' : 'Number of Rest Areas'}</strong>: {selectedLocation.parentRestArea.restAreaQuantity}</p>
                    )}
                    {selectedLocation.parentRestArea.restAreaCleanlinessRating && (
                      <p><strong>{language === 'zh' ? '清潔度評分' : 'Cleanliness Rating'}</strong>: ⭐ {selectedLocation.parentRestArea.restAreaCleanlinessRating}/5</p>
                    )}
                    {selectedLocation.parentRestArea.restAreaNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.parentRestArea.restAreaNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.eventSpace && (
                  <div className="location-section" style={{ borderTop: '2px solid #ec4899', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>🎉 {language === 'zh' ? '派對與活動空間' : 'Event & Party Spaces'}</h3>
                    {selectedLocation.eventSpace.hasEventSpaces && (
                      <p>✅ {language === 'zh' ? '有派對空間' : 'Event Spaces Available'}</p>
                    )}
                    {selectedLocation.eventSpace.birthdayPartyPackages && (
                      <p>✅ {language === 'zh' ? '提供生日派對套餐' : 'Birthday Party Packages Available'}</p>
                    )}
                    {selectedLocation.eventSpace.eventSpaceCapacity && (
                      <p><strong>{language === 'zh' ? '容納人數' : 'Capacity'}</strong>: {selectedLocation.eventSpace.eventSpaceCapacity}</p>
                    )}
                    {selectedLocation.eventSpace.partyPriceRange && (
                      <p><strong>{language === 'zh' ? '派對價格' : 'Party Price Range'}</strong>: {selectedLocation.eventSpace.partyPriceRange}</p>
                    )}
                    {selectedLocation.eventSpace.eventNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.eventSpace.eventNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.specialNeeds && (
                  <div className="location-section" style={{ borderTop: '2px solid #8b5cf6', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>🤝 {language === 'zh' ? '特殊需求服務' : 'Special Needs Services'}</h3>
                    {selectedLocation.specialNeeds.hasAutismFriendlyHours && (
                      <p>✅ {language === 'zh' ? '有自閉症友善時段' : 'Autism-Friendly Hours Available'}</p>
                    )}
                    {selectedLocation.specialNeeds.sensoryFriendlyEnvironment && (
                      <p>✅ {language === 'zh' ? '感官友善環境' : 'Sensory-Friendly Environment'}</p>
                    )}
                    {selectedLocation.specialNeeds.quietZonesAvailable && (
                      <p>✅ {language === 'zh' ? '有安靜區域' : 'Quiet Zones Available'}</p>
                    )}
                    {selectedLocation.specialNeeds.specialNeedsSchedule && (
                      <p><strong>{language === 'zh' ? '特殊時段' : 'Special Schedule'}</strong>: {selectedLocation.specialNeeds.specialNeedsSchedule}</p>
                    )}
                    {selectedLocation.specialNeeds.specialNeedsNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.specialNeeds.specialNeedsNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.medicalServices && (
                  <div className="location-section" style={{ borderTop: '2px solid #ef4444', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>🏥 {language === 'zh' ? '醫療與急救服務' : 'Medical & First Aid Services'}</h3>
                    {selectedLocation.medicalServices.hasAED && (
                      <p>✅ {language === 'zh' ? '有AED自動除顫器' : 'AED Available'}</p>
                    )}
                    {selectedLocation.medicalServices.aedLocation && (
                      <p><strong>{language === 'zh' ? 'AED位置' : 'AED Location'}</strong>: {selectedLocation.medicalServices.aedLocation}</p>
                    )}
                    {selectedLocation.medicalServices.hasFirstAidKit && (
                      <p>✅ {language === 'zh' ? '有急救箱' : 'First Aid Kit Available'}</p>
                    )}
                    {selectedLocation.medicalServices.hasMedicalStaff && (
                      <p>✅ {language === 'zh' ? '有醫療人員駐守' : 'Medical Staff On-Site'}</p>
                    )}
                    {selectedLocation.medicalServices.nearbyHospital && (
                      <p><strong>{language === 'zh' ? '最近醫院' : 'Nearby Hospital'}</strong>: {selectedLocation.medicalServices.nearbyHospital} ({selectedLocation.medicalServices.hospitalDistance}m)</p>
                    )}
                    {selectedLocation.medicalServices.medicalNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.medicalServices.medicalNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.entertainmentSchedule && (
                  <div className="location-section" style={{ borderTop: '2px solid #8b5cf6', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>🎭 {language === 'zh' ? '表演與娛樂活動' : 'Entertainment & Performances'}</h3>
                    {selectedLocation.entertainmentSchedule.hasPerformances && (
                      <p>✅ {language === 'zh' ? '有表演和娛樂活動' : 'Performances Available'}</p>
                    )}
                    {selectedLocation.entertainmentSchedule.performanceTypes && selectedLocation.entertainmentSchedule.performanceTypes.length > 0 && (
                      <p><strong>{language === 'zh' ? '表演類型' : 'Performance Types'}</strong>: {selectedLocation.entertainmentSchedule.performanceTypes.join(', ')}</p>
                    )}
                    {selectedLocation.entertainmentSchedule.performanceSchedule && (
                      <p><strong>{language === 'zh' ? '表演時間' : 'Schedule'}</strong>: {selectedLocation.entertainmentSchedule.performanceSchedule}</p>
                    )}
                    {selectedLocation.entertainmentSchedule.showDuration && (
                      <p><strong>{language === 'zh' ? '表演時長' : 'Duration'}</strong>: {selectedLocation.entertainmentSchedule.showDuration}</p>
                    )}
                    {selectedLocation.entertainmentSchedule.minAgeForShow !== undefined && selectedLocation.entertainmentSchedule.maxAgeForShow !== undefined && (
                      <p><strong>{language === 'zh' ? '適合年齡' : 'Age Range'}</strong>: {selectedLocation.entertainmentSchedule.minAgeForShow}-{selectedLocation.entertainmentSchedule.maxAgeForShow} {language === 'zh' ? '歲' : 'years'}</p>
                    )}
                    {selectedLocation.entertainmentSchedule.hasInteractiveActivities && (
                      <p>✅ {language === 'zh' ? '有互動式活動' : 'Interactive Activities Available'}</p>
                    )}
                    {selectedLocation.entertainmentSchedule.performanceLocation && (
                      <p><strong>{language === 'zh' ? '表演地點' : 'Location'}</strong>: {selectedLocation.entertainmentSchedule.performanceLocation}</p>
                    )}
                    {selectedLocation.entertainmentSchedule.seasonalPerformances && (
                      <p><strong>{language === 'zh' ? '季節特別表演' : 'Seasonal Shows'}</strong>: {selectedLocation.entertainmentSchedule.seasonalPerformances}</p>
                    )}
                    {selectedLocation.entertainmentSchedule.entertainmentNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.entertainmentSchedule.entertainmentNotes}</p>
                    )}
                  </div>
                )}
                <ReviewList reviews={reviews} />
                <ReviewForm onSubmit={handlePostReview} />
              </div>
            </div>
          ) : (
            <>
              <div className="sidebar-tabs">
                <button
                  className={`tab-button ${!showFavorites ? 'active' : ''}`}
                  onClick={() => setShowFavorites(false)}
                >
                  <List size={18} />
                  <span>{t.common.all}</span>
                </button>
                <button
                  className={`tab-button ${showFavorites ? 'active' : ''}`}
                  onClick={() => setShowFavorites(true)}
                >
                  <Heart size={18} />
                  <span>{t.common.favorites}</span>
                </button>
                <button
                  className="tab-button sidebar-close-btn"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {!showFavorites ? (
                <>
                  <div className="sidebar-tools">
                    <button
                      className={`tool-button ${strollerOnly ? 'active' : ''}`}
                      onClick={() => setStrollerOnly(!strollerOnly)}
                      title={t.common.filterStroller}
                    >
                      <Filter size={18} />
                      <span>{t.common.filterStroller}</span>
                    </button>
                    <button
                      className="tool-button primary"
                      onClick={() => setShowAddLocation(true)}
                      title={t.common.addLocation}
                    >
                      <Plus size={18} />
                      <span>{t.common.addLocation}</span>
                    </button>
                  </div>
                  <div className="age-filter-section">
                    <label htmlFor="child-age" style={{ fontSize: '0.9em', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                      👶 {language === 'zh' ? '孩子年齡' : "Child's Age"}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        id="child-age"
                        type="number"
                        min="0"
                        max="18"
                        value={childAge ?? ''}
                        onChange={(e) => handleChildAgeChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        placeholder={language === 'zh' ? '輸入年齡' : 'Enter age'}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.9em',
                        }}
                      />
                      {childAge !== undefined && (
                        <button
                          onClick={() => handleChildAgeChange(undefined)}
                          style={{
                            padding: '6px 10px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85em',
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                    <label style={{ fontSize: '0.9em', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                      🔀 {language === 'zh' ? '排序' : 'Sort by'}
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSortBy('distance')}
                        style={{
                          padding: '6px 10px',
                          background: sortBy === 'distance' ? '#3b82f6' : '#f0f0f0',
                          color: sortBy === 'distance' ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85em',
                          fontWeight: sortBy === 'distance' ? '600' : '400',
                        }}
                      >
                        📍 {language === 'zh' ? '距離' : 'Distance'}
                      </button>
                      <button
                        onClick={() => setSortBy('rating')}
                        style={{
                          padding: '6px 10px',
                          background: sortBy === 'rating' ? '#3b82f6' : '#f0f0f0',
                          color: sortBy === 'rating' ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85em',
                          fontWeight: sortBy === 'rating' ? '600' : '400',
                        }}
                      >
                        ⭐ {language === 'zh' ? '評分' : 'Rating'}
                      </button>
                      <button
                        onClick={() => setSortBy('name')}
                        style={{
                          padding: '6px 10px',
                          background: sortBy === 'name' ? '#3b82f6' : '#f0f0f0',
                          color: sortBy === 'name' ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85em',
                          fontWeight: sortBy === 'name' ? '600' : '400',
                        }}
                      >
                        A-Z {language === 'zh' ? '名稱' : 'Name'}
                      </button>
                    </div>
                  </div>
                  <div className="quick-facility-filters">
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('public_toilet') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('public_toilet')}
                      title={t.facilities.public_toilet}
                    >
                      🚽 {t.facilities.public_toilet}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('nursing_room') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('nursing_room')}
                      title={t.facilities.nursing_room}
                    >
                      🧴 {t.facilities.nursing_room}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('drinking_water') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('drinking_water')}
                      title={t.facilities.drinking_water}
                    >
                      💧 {t.facilities.drinking_water}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('wheelchair_accessible') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('wheelchair_accessible')}
                      title={t.facilities.wheelchair_accessible}
                    >
                      ♿ {t.facilities.wheelchair_accessible}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('air_conditioned') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('air_conditioned')}
                      title={t.facilities.air_conditioned}
                    >
                      ❄️ {t.facilities.air_conditioned}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('swimming_pool') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('swimming_pool')}
                      title={t.facilities.swimming_pool}
                    >
                      🏊 {t.facilities.swimming_pool}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('kids_menu') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('kids_menu')}
                      title={t.facilities.kids_menu}
                    >
                      🍽️ {t.facilities.kids_menu}
                    </button>
                  </div>
                  <nav className="category-list">
                    {categories.map((cat) => (
                      <button
                        key={cat.key || 'all'}
                        className={`category-item ${selectedCategory === cat.key ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.key)}
                      >
                        <cat.icon size={20} />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </nav>
                </>
              ) : null}

              {loading && <div className="loading-overlay">{t.common.loading}</div>}

              <div className="locations-list">
                {getFilteredLocations(showFavorites ? favorites : locations).length === 0 ? (
                  <div className="empty-state">
                    {loading ? (
                      <p>{t.common.loading}</p>
                    ) : (
                      <p>{showFavorites ? t.common.noFavorites : t.common.noLocations}</p>
                    )}
                  </div>
                ) : (
                  getFilteredLocations(showFavorites ? favorites : locations).map((loc) => {
                    const criticalFacilities = loc.facilities.filter(f =>
                      ['public_toilet', 'nursing_room', 'medical'].includes(f) ||
                      (loc.category === 'medical')
                    );
                    const hasCriticalFacility = criticalFacilities.length > 0 || loc.category === 'medical';

                    return (
                      <div
                        key={loc.id}
                        className="location-card"
                        onClick={() => {
                          setPosition([loc.coordinates.lat, loc.coordinates.lng]);
                          setSelectedLocation(loc);
                          setSidebarOpen(false);
                        }}
                        style={hasCriticalFacility ? { borderLeft: '3px solid #ff6b6b' } : {}}
                      >
                        <div className="card-header">
                          <h3>{loc.name[language]}</h3>
                          <button
                            className={`favorite-icon-button ${favorites.some(f => f.id === loc.id) ? 'active' : ''}`}
                            onClick={(e) => toggleFavorite(e, loc.id)}
                            aria-label={favorites.some(f => f.id === loc.id) ? t.common.removeFromFavorites : t.common.addToFavorites}
                          >
                            <Heart size={18} fill={favorites.some(f => f.id === loc.id) ? "currentColor" : "none"} />
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
                  })
                )}
              </div>
              <button className="view-map-btn" onClick={() => setSidebarOpen(false)}>
                <MapPin size={18} />
                <span>{t.common.viewMap}</span>
              </button>
            </>
          )}
        </aside>

        <main className="map-view">
          <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={position} />
            <MapEvents onPositionChange={setPosition} />
            <MarkerClusterGroup chunkedLoading>
              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.coordinates.lat, loc.coordinates.lng]}
                  icon={createGlowingIcon(loc.category)}
                  eventHandlers={{
                    click: () => setSelectedLocation(loc),
                  }}
                >
                  <Popup>
                    <div className="popup-content">
                      <strong>{loc.name[language]}</strong>
                      <p>{loc.description[language]}</p>
                      <div className="facility-chips">
                        {loc.facilities.map(f => (
                          <span key={f} className="chip">{t.facilities[f as keyof typeof t.facilities] || f}</span>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
          <div className="map-controls">
            {!loading && (
              <button className="search-here-button" onClick={fetchLocations}>
                <Filter size={16} />
                <span>{t.common.searchArea}</span>
              </button>
            )}
            {loading && (
              <div className="map-loading-indicator">
                <span className="spinner"></span>
                <span>{t.common.loading}</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;