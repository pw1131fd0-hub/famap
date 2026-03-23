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

// Collapsible section component for performance optimization
interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  emoji?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
  emoji = ''
}) => (
  <div className="detail-section">
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        padding: '8px 12px',
        background: isExpanded ? '#f0f8ff' : '#fafafa',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.95em',
        fontWeight: '600',
        transition: 'all 0.2s ease'
      }}
    >
      <span>{emoji} {title}</span>
      <span style={{
        display: 'inline-block',
        transition: 'transform 0.2s ease',
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
      }}>▼</span>
    </button>
    {isExpanded && (
      <div style={{ paddingTop: '8px' }}>
        {children}
      </div>
    )}
  </div>
);

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
type CityKey = 'taipei' | 'new_taipei' | 'keelung' | 'taoyuan';

interface City {
  key: CityKey;
  name: string;
  description: string;
  center: [number, number];
  defaultZoom: number;
}

const CITIES: City[] = [
  {
    key: 'taipei',
    name: '台北市',
    description: '首都核心，親子設施最密集',
    center: [25.0330, 121.5654],
    defaultZoom: 13
  },
  {
    key: 'new_taipei',
    name: '新北市',
    description: '大台北生活圈，山水景點多',
    center: [25.0169, 121.4628],
    defaultZoom: 12
  },
  {
    key: 'keelung',
    name: '基隆市',
    description: '北台灣門戶，山海親子景點',
    center: [25.1276, 121.7440],
    defaultZoom: 13
  },
  {
    key: 'taoyuan',
    name: '桃園市',
    description: '機場所在地，親子樂園豐富',
    center: [24.9937, 121.3000],
    defaultZoom: 12
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

// Custom glowing marker icon with category-specific symbols
const createGlowingIcon = (category: string) => {
  const iconConfig: Record<string, { color: string; emoji: string; label: string }> = {
    park: { color: '#22c55e', emoji: '🌳', label: 'Park' },
    nursing_room: { color: '#ec4899', emoji: '👶', label: 'Nursing' },
    restaurant: { color: '#f97316', emoji: '🍽️', label: 'Food' },
    medical: { color: '#ef4444', emoji: '🏥', label: 'Medical' },
    attraction: { color: '#8b5cf6', emoji: '🎪', label: 'Attraction' },
    other: { color: '#6b7280', emoji: '📍', label: 'Location' },
  };

  const config = iconConfig[category] || iconConfig.other;
  const { color, emoji } = config;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 0 12px ${color}, 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    ">
      <div style="transform: rotate(45deg);">${emoji}</div>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
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

function MapUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    const currentCenter = map.getCenter();
    const distance = Math.sqrt(
      Math.pow(currentCenter.lat - center[0], 2) +
      Math.pow(currentCenter.lng - center[1], 2)
    );
    // Only set view if the change is significant (e.g., more than 0.0001 degrees)
    if (distance > 0.0001) {
      const newZoom = zoom !== undefined ? zoom : map.getZoom();
      map.setView(center, newZoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, map]);
  return null;
}

function App() {
  const { language, setLanguage, t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState<CityKey>('taipei');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [position, setPosition] = useState<[number, number]>(CITIES[0].center); // Taipei
  const [zoom, setZoom] = useState<number>(CITIES[0].defaultZoom);
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
  // Age filtering disabled for mobile stability
  // const [childAge, setChildAge] = useState<number | undefined>(() => {
  //   const saved = localStorage.getItem('childAge');
  //   return saved ? parseInt(saved, 10) : undefined;
  // });
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'basic': true, // Always show basic info
    'facilities': true,
    'operating': true,
    'transit': false,
    'safety': false,
    'amenities': false,
    'comfort': false,
    'food': false,
    'bookings': false,
    'taiwan': false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationApi.getNearby({
        lat: position[0],
        lng: position[1],
        radius: 5000,
        category: selectedCategory,
        stroller_accessible: strollerOnly || undefined,
        limit: 150,
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
      setZoom(city.defaultZoom);
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

  // Age filtering disabled for mobile stability
  // const isAgeAppropriate = (location: Location): boolean => {
  //   if (childAge === undefined || !location.ageRange) return true;
  //   const { minAge, maxAge } = location.ageRange;
  //   if (minAge !== undefined && childAge < minAge) return false;
  //   if (maxAge !== undefined && childAge > maxAge) return false;
  //   return true;
  // };

  // const handleChildAgeChange = (age: number | undefined) => {
  //   setChildAge(age);
  //   if (age !== undefined) {
  //     localStorage.setItem('childAge', age.toString());
  //   } else {
  //     localStorage.removeItem('childAge');
  //   }
  // };

  const getFilteredLocations = (locs: Location[]) => {
    let filtered = locs;

    if (facilitiesFilter.length > 0) {
      filtered = filtered.filter(loc =>
        facilitiesFilter.every(facility => loc.facilities.includes(facility))
      );
    }

    // if (childAge !== undefined) {
    //   filtered = filtered.filter(isAgeAppropriate);
    // }

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
                {/* Basic Information - Always Expanded */}
                <CollapsibleSection
                  title={language === 'zh' ? '基本信息' : 'Basic Info'}
                  emoji="ℹ️"
                  isExpanded={expandedSections['basic']}
                  onToggle={() => toggleSection('basic')}
                >
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
                </CollapsibleSection>

                {/* Operating Hours & Facilities */}
                {(selectedLocation.operatingHours || selectedLocation.facilities) && (
                  <CollapsibleSection
                    title={language === 'zh' ? '設施與營業時間' : 'Facilities & Hours'}
                    emoji="🏢"
                    isExpanded={expandedSections['facilities']}
                    onToggle={() => toggleSection('facilities')}
                  >
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
                  </CollapsibleSection>
                )}
                {/* Transit & Parking */}
                {(selectedLocation.publicTransit || selectedLocation.parking) && (
                  <CollapsibleSection
                    title={language === 'zh' ? '交通與停車' : 'Transit & Parking'}
                    emoji="🚗"
                    isExpanded={expandedSections['transit']}
                    onToggle={() => toggleSection('transit')}
                  >
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
                  </CollapsibleSection>
                )}
                {/* Amenities */}
                {(selectedLocation.toilet || selectedLocation.hasWiFi || selectedLocation.allergens) && (
                  <CollapsibleSection
                    title={language === 'zh' ? '便利設施' : 'Amenities'}
                    emoji="🏪"
                    isExpanded={expandedSections['amenities']}
                    onToggle={() => toggleSection('amenities')}
                  >
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
                  </CollapsibleSection>
                )}
                {/* Comfort & Crowding */}
                {selectedLocation.crowding && (
                  <CollapsibleSection
                    title={language === 'zh' ? '舒適度與人潮' : 'Comfort & Crowding'}
                    emoji="👥"
                    isExpanded={expandedSections['comfort']}
                    onToggle={() => toggleSection('comfort')}
                  >
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
                  </CollapsibleSection>
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
                {selectedLocation.photoVideo && (
                  <div className="location-section" style={{ borderTop: '2px solid #f59e0b', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>📸 {language === 'zh' ? '拍照與錄影政策' : 'Photo & Video Policy'}</h3>
                    {selectedLocation.photoVideo.allowsPhotography && (
                      <p>✅ {language === 'zh' ? '可以拍照' : 'Photography Allowed'}</p>
                    )}
                    {selectedLocation.photoVideo.allowsVideoRecording && (
                      <p>✅ {language === 'zh' ? '可以錄影' : 'Video Recording Allowed'}</p>
                    )}
                    {selectedLocation.photoVideo.photographyRestrictions && (
                      <p><strong>{language === 'zh' ? '拍照限制' : 'Photography Restrictions'}</strong>: {selectedLocation.photoVideo.photographyRestrictions}</p>
                    )}
                    {selectedLocation.photoVideo.flashPhotographyAllowed && (
                      <p>✅ {language === 'zh' ? '允許閃光燈' : 'Flash Photography Allowed'}</p>
                    )}
                    {selectedLocation.photoVideo.tripodAllowed && (
                      <p>✅ {language === 'zh' ? '可以使用三腳架' : 'Tripod Allowed'}</p>
                    )}
                    {selectedLocation.photoVideo.photoVideoNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.photoVideo.photoVideoNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.visitDuration && (
                  <div className="location-section" style={{ borderTop: '2px solid #10b981', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>⏱️ {language === 'zh' ? '參訪時間建議' : 'Recommended Visit Duration'}</h3>
                    {selectedLocation.visitDuration.recommendedDurationText && (
                      <p><strong>{language === 'zh' ? '建議停留時間' : 'Recommended Duration'}</strong>: {selectedLocation.visitDuration.recommendedDurationText}</p>
                    )}
                    {selectedLocation.visitDuration.quickVisitMinutes && (
                      <p><strong>{language === 'zh' ? '快速參訪' : 'Quick Visit'}</strong>: {selectedLocation.visitDuration.quickVisitMinutes} {language === 'zh' ? '分鐘' : 'minutes'}</p>
                    )}
                    {selectedLocation.visitDuration.fullExperienceDurationMinutes && (
                      <p><strong>{language === 'zh' ? '完整體驗' : 'Full Experience'}</strong>: {selectedLocation.visitDuration.fullExperienceDurationMinutes} {language === 'zh' ? '分鐘' : 'minutes'}</p>
                    )}
                    {selectedLocation.visitDuration.includesMealTimeRecommendation && (
                      <p>✅ {language === 'zh' ? '需要預留用餐時間' : 'Plan Time for Meals'}</p>
                    )}
                    {selectedLocation.visitDuration.restTimeRecommendation && (
                      <p>✅ {language === 'zh' ? '建議安排休息時間' : 'Plan Rest Breaks'}</p>
                    )}
                    {selectedLocation.visitDuration.bestTimeToVisit && (
                      <p><strong>{language === 'zh' ? '最佳參訪時間' : 'Best Time to Visit'}</strong>: {selectedLocation.visitDuration.bestTimeToVisit}</p>
                    )}
                    {selectedLocation.visitDuration.durationNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.visitDuration.durationNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.schoolHolidays && (
                  <div className="location-section" style={{ borderTop: '2px solid #ef4444', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>🏫 {language === 'zh' ? '學期假期與人潮資訊' : 'School Holidays & Crowds'}</h3>
                    {selectedLocation.schoolHolidays.winterVacationDates && (
                      <p><strong>{language === 'zh' ? '寒假期間' : 'Winter Vacation'}</strong>: {selectedLocation.schoolHolidays.winterVacationDates}</p>
                    )}
                    {selectedLocation.schoolHolidays.winterVacationCrowding && (
                      <p><strong>{language === 'zh' ? '寒假人潮' : 'Winter Crowds'}</strong>: {language === 'zh' ? (selectedLocation.schoolHolidays.winterVacationCrowding === 'light' ? '清淡' : selectedLocation.schoolHolidays.winterVacationCrowding === 'moderate' ? '適中' : '眾多') : selectedLocation.schoolHolidays.winterVacationCrowding}</p>
                    )}
                    {selectedLocation.schoolHolidays.summerVacationDates && (
                      <p><strong>{language === 'zh' ? '暑假期間' : 'Summer Vacation'}</strong>: {selectedLocation.schoolHolidays.summerVacationDates}</p>
                    )}
                    {selectedLocation.schoolHolidays.summerVacationCrowding && (
                      <p><strong>{language === 'zh' ? '暑假人潮' : 'Summer Crowds'}</strong>: {language === 'zh' ? (selectedLocation.schoolHolidays.summerVacationCrowding === 'light' ? '清淡' : selectedLocation.schoolHolidays.summerVacationCrowding === 'moderate' ? '適中' : '眾多') : selectedLocation.schoolHolidays.summerVacationCrowding}</p>
                    )}
                    {selectedLocation.schoolHolidays.lunarNewYearDates && (
                      <p><strong>{language === 'zh' ? '農曆新年' : 'Lunar New Year'}</strong>: {selectedLocation.schoolHolidays.lunarNewYearDates}</p>
                    )}
                    {selectedLocation.schoolHolidays.lunarNewYearCrowding && (
                      <p><strong>{language === 'zh' ? '農曆新年人潮' : 'Lunar New Year Crowds'}</strong>: {language === 'zh' ? (selectedLocation.schoolHolidays.lunarNewYearCrowding === 'light' ? '清淡' : selectedLocation.schoolHolidays.lunarNewYearCrowding === 'moderate' ? '適中' : '眾多') : selectedLocation.schoolHolidays.lunarNewYearCrowding}</p>
                    )}
                    {selectedLocation.schoolHolidays.holidaySpecialEventsOrHours && (
                      <p><strong>{language === 'zh' ? '假期特別活動' : 'Holiday Events'}</strong>: {selectedLocation.schoolHolidays.holidaySpecialEventsOrHours}</p>
                    )}
                    {selectedLocation.schoolHolidays.holidayBookingRecommendation && (
                      <p><strong>{language === 'zh' ? '假期預約建議' : 'Holiday Booking Tips'}</strong>: {selectedLocation.schoolHolidays.holidayBookingRecommendation}</p>
                    )}
                    {selectedLocation.schoolHolidays.holidayNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.schoolHolidays.holidayNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.heightBasedPricing && (
                  <div className="section" style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                    <h3>📏 {language === 'zh' ? '身高定價資訊' : 'Height-Based Pricing'}</h3>
                    {selectedLocation.heightBasedPricing.hasHeightBasedPricing && (
                      <p><strong>{language === 'zh' ? '身高定價' : 'Height-Based Pricing'}</strong>: {language === 'zh' ? '有' : 'Yes'}</p>
                    )}
                    {selectedLocation.heightBasedPricing.childHeightThreshold && (
                      <p><strong>{language === 'zh' ? '兒童身高門檻' : 'Child Height Threshold'}</strong>: {selectedLocation.heightBasedPricing.childHeightThreshold}cm</p>
                    )}
                    {selectedLocation.heightBasedPricing.childPrice && (
                      <p><strong>{language === 'zh' ? '兒童票價' : 'Child Price'}</strong>: {selectedLocation.heightBasedPricing.childPrice}</p>
                    )}
                    {selectedLocation.heightBasedPricing.adultHeight && (
                      <p><strong>{language === 'zh' ? '成人身高門檻' : 'Adult Height Threshold'}</strong>: {selectedLocation.heightBasedPricing.adultHeight}cm</p>
                    )}
                    {selectedLocation.heightBasedPricing.freeHeightThreshold && (
                      <p><strong>{language === 'zh' ? '免費身高門檻' : 'Free Entry Height'}</strong>: {selectedLocation.heightBasedPricing.freeHeightThreshold}cm</p>
                    )}
                    {selectedLocation.heightBasedPricing.pricingNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.heightBasedPricing.pricingNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.drinkingWater && (
                  <div className="section" style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                    <h3>💧 {language === 'zh' ? '飲用水資訊' : 'Drinking Water'}</h3>
                    {selectedLocation.drinkingWater.hasDrinkingWater && (
                      <p><strong>{language === 'zh' ? '飲水機可用' : 'Drinking Water Available'}</strong>: {language === 'zh' ? '有' : 'Yes'}</p>
                    )}
                    {selectedLocation.drinkingWater.waterFountainQuantity && (
                      <p><strong>{language === 'zh' ? '飲水機數量' : 'Water Fountain Count'}</strong>: {selectedLocation.drinkingWater.waterFountainQuantity}</p>
                    )}
                    {selectedLocation.drinkingWater.waterQuality && (
                      <p><strong>{language === 'zh' ? '水質' : 'Water Quality'}</strong>: {language === 'zh' ? (selectedLocation.drinkingWater.waterQuality === 'excellent' ? '優良' : selectedLocation.drinkingWater.waterQuality === 'good' ? '良好' : '一般') : selectedLocation.drinkingWater.waterQuality}</p>
                    )}
                    {selectedLocation.drinkingWater.isWaterChilled && (
                      <p><strong>{language === 'zh' ? '冷飲水' : 'Chilled Water'}</strong>: {language === 'zh' ? '有' : 'Yes'}</p>
                    )}
                    {selectedLocation.drinkingWater.waterTemperature && (
                      <p><strong>{language === 'zh' ? '水溫' : 'Water Temperature'}</strong>: {selectedLocation.drinkingWater.waterTemperature}</p>
                    )}
                    {selectedLocation.drinkingWater.waterAccessibilityNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.drinkingWater.waterAccessibilityNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.diaperChanging && (
                  <div className="section" style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fdf2f8', borderRadius: '8px', borderLeft: '4px solid #ec4899' }}>
                    <h3>👶 {language === 'zh' ? '尿布台設施' : 'Diaper Changing Facilities'}</h3>
                    {selectedLocation.diaperChanging.hasDiaperChangingTables && (
                      <p><strong>{language === 'zh' ? '有尿布台' : 'Has Diaper Tables'}</strong>: {language === 'zh' ? '有' : 'Yes'}</p>
                    )}
                    {selectedLocation.diaperChanging.changingTableQuantity && (
                      <p><strong>{language === 'zh' ? '尿布台數量' : 'Table Count'}</strong>: {selectedLocation.diaperChanging.changingTableQuantity}</p>
                    )}
                    {selectedLocation.diaperChanging.changingTableLocations && selectedLocation.diaperChanging.changingTableLocations.length > 0 && (
                      <p><strong>{language === 'zh' ? '位置' : 'Locations'}</strong>: {selectedLocation.diaperChanging.changingTableLocations.join(', ')}</p>
                    )}
                    {selectedLocation.diaperChanging.hasDiaperDisposal && (
                      <p><strong>{language === 'zh' ? '尿布丟棄箱' : 'Diaper Disposal'}</strong>: {language === 'zh' ? '有' : 'Yes'}</p>
                    )}
                    {selectedLocation.diaperChanging.cleanlinessRating && (
                      <p><strong>{language === 'zh' ? '清潔度' : 'Cleanliness'}</strong>: {selectedLocation.diaperChanging.cleanlinessRating}/5</p>
                    )}
                    {selectedLocation.diaperChanging.changingFacilitiesNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.diaperChanging.changingFacilitiesNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.equipmentRental && (
                  <div className="location-detail-section">
                    <h4>🛴 {language === 'zh' ? '設備租賃' : 'Equipment Rental'}</h4>
                    {selectedLocation.equipmentRental.hasEquipmentRental === false ? (
                      <p><strong>{language === 'zh' ? '設施' : 'Services'}</strong>: {language === 'zh' ? '無提供設備租賃' : 'No equipment rental available'}</p>
                    ) : (
                      <>
                        {selectedLocation.equipmentRental.bikeRental && (
                          <p>✓ {language === 'zh' ? '腳踏車出租' : 'Bike Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.scooterRental && (
                          <p>✓ {language === 'zh' ? '滑板車出租' : 'Scooter Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.helmetRental && (
                          <p>✓ {language === 'zh' ? '安全帽出租' : 'Helmet Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.sunProtectionGearRental && (
                          <p>✓ {language === 'zh' ? '防曬帽/衣出租' : 'Sun Protection Gear Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.rainGearRental && (
                          <p>✓ {language === 'zh' ? '雨具出租' : 'Rain Gear Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.wheelchairRental && (
                          <p>✓ {language === 'zh' ? '輪椅出租' : 'Wheelchair Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.floatationDeviceRental && (
                          <p>✓ {language === 'zh' ? '浮力衣出租' : 'Flotation Device Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.lifejacketRental && (
                          <p>✓ {language === 'zh' ? '救生衣出租' : 'Lifejacket Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.coolerBoxRental && (
                          <p>✓ {language === 'zh' ? '保冷箱出租' : 'Cooler Box Rental'}</p>
                        )}
                        {selectedLocation.equipmentRental.rentalPriceRange && (
                          <p><strong>{language === 'zh' ? '租賃價格' : 'Rental Price'}</strong>: {selectedLocation.equipmentRental.rentalPriceRange}</p>
                        )}
                        {selectedLocation.equipmentRental.equipmentRentalNotes && (
                          <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.equipmentRental.equipmentRentalNotes}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
                {selectedLocation.membership && (
                  <div className="location-detail-section">
                    <h4>💳 {language === 'zh' ? '會員與年卡' : 'Membership & Passes'}</h4>
                    {selectedLocation.membership.hasMembership === false ? (
                      <p>{language === 'zh' ? '無會員或年卡方案' : 'No membership programs available'}</p>
                    ) : (
                      <>
                        {selectedLocation.membership.annualPassAvailable && (
                          <p>✓ {language === 'zh' ? '年卡' : 'Annual Pass'} {selectedLocation.membership.membershipCost && `: ${selectedLocation.membership.membershipCost}`}</p>
                        )}
                        {selectedLocation.membership.seasonalPassAvailable && (
                          <p>✓ {language === 'zh' ? '季卡' : 'Seasonal Pass'} {selectedLocation.membership.seasonalPassCost && `: ${selectedLocation.membership.seasonalPassCost}`}</p>
                        )}
                        {selectedLocation.membership.discountCardAvailable && (
                          <p>✓ {language === 'zh' ? '折扣卡' : 'Discount Card'} {selectedLocation.membership.discountCardCost && `: ${selectedLocation.membership.discountCardCost}`}</p>
                        )}
                        {selectedLocation.membership.membershipBenefits && selectedLocation.membership.membershipBenefits.length > 0 && (
                          <p><strong>{language === 'zh' ? '會員優惠' : 'Benefits'}</strong>: {selectedLocation.membership.membershipBenefits.join(', ')}</p>
                        )}
                        {selectedLocation.membership.visitsIncludedInPass && (
                          <p><strong>{language === 'zh' ? '訪問限制' : 'Visits'}</strong>: {selectedLocation.membership.visitsIncludedInPass}</p>
                        )}
                        {selectedLocation.membership.membershipNotes && (
                          <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.membership.membershipNotes}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
                {selectedLocation.onSiteDining && (
                  <div className="location-detail-section">
                    <h4>🍽️ {language === 'zh' ? '現場用餐' : 'On-Site Dining'}</h4>
                    {!selectedLocation.onSiteDining.hasFoodCourt && !selectedLocation.onSiteDining.hasRestaurant && !selectedLocation.onSiteDining.hasCafe ? (
                      <p>{language === 'zh' ? '無現場用餐設施' : 'No on-site dining available'}</p>
                    ) : (
                      <>
                        {selectedLocation.onSiteDining.hasFoodCourt && (
                          <p>✓ {language === 'zh' ? '美食廣場' : 'Food Court'}</p>
                        )}
                        {selectedLocation.onSiteDining.hasRestaurant && (
                          <p>✓ {language === 'zh' ? '餐廳' : 'Restaurant'}</p>
                        )}
                        {selectedLocation.onSiteDining.hasCafe && (
                          <p>✓ {language === 'zh' ? '咖啡廳' : 'Cafe'}</p>
                        )}
                        {selectedLocation.onSiteDining.hasSnackBar && (
                          <p>✓ {language === 'zh' ? '小食亭' : 'Snack Bar'}</p>
                        )}
                        {selectedLocation.onSiteDining.vegetarianOptionsAvailable && (
                          <p>✓ {language === 'zh' ? '素食選項' : 'Vegetarian Options'}</p>
                        )}
                        {selectedLocation.onSiteDining.veganOptionsAvailable && (
                          <p>✓ {language === 'zh' ? '純素選項' : 'Vegan Options'}</p>
                        )}
                        {selectedLocation.onSiteDining.glutenFreeOptionsAvailable && (
                          <p>✓ {language === 'zh' ? '無麩質選項' : 'Gluten-Free Options'}</p>
                        )}
                        {selectedLocation.onSiteDining.halalFoodAvailable && (
                          <p>✓ {language === 'zh' ? '清真食物' : 'Halal Food'}</p>
                        )}
                        {selectedLocation.onSiteDining.foodQualityRating && (
                          <p><strong>{language === 'zh' ? '食品質量' : 'Quality'}</strong>: {selectedLocation.onSiteDining.foodQualityRating}/5</p>
                        )}
                        {selectedLocation.onSiteDining.foodPriceRange && (
                          <p><strong>{language === 'zh' ? '價格範圍' : 'Price Range'}</strong>: {selectedLocation.onSiteDining.foodPriceRange}</p>
                        )}
                        {selectedLocation.onSiteDining.diningNotes && (
                          <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.onSiteDining.diningNotes}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
                {selectedLocation.queueWaitTime && (
                  <div className="location-detail-section">
                    <h4>⏳ {language === 'zh' ? '排隊等待時間' : 'Queue Wait Time'}</h4>
                    {selectedLocation.queueWaitTime.typicalWaitTimeMinutes !== undefined && (
                      <p><strong>{language === 'zh' ? '一般等待' : 'Typical Wait'}</strong>: {selectedLocation.queueWaitTime.typicalWaitTimeMinutes} {language === 'zh' ? '分鐘' : 'mins'}</p>
                    )}
                    {selectedLocation.queueWaitTime.peakHourWaitTimeMinutes !== undefined && (
                      <p><strong>{language === 'zh' ? '尖峰時段' : 'Peak Hours'}</strong>: {selectedLocation.queueWaitTime.peakHourWaitTimeMinutes} {language === 'zh' ? '分鐘' : 'mins'}</p>
                    )}
                    {selectedLocation.queueWaitTime.offPeakWaitTimeMinutes !== undefined && (
                      <p><strong>{language === 'zh' ? '非尖峰' : 'Off-Peak'}</strong>: {selectedLocation.queueWaitTime.offPeakWaitTimeMinutes} {language === 'zh' ? '分鐘' : 'mins'}</p>
                    )}
                    {selectedLocation.queueWaitTime.holidayWaitTimeMinutes !== undefined && (
                      <p><strong>{language === 'zh' ? '假日' : 'Holidays'}</strong>: {selectedLocation.queueWaitTime.holidayWaitTimeMinutes} {language === 'zh' ? '分鐘' : 'mins'}</p>
                    )}
                    {selectedLocation.queueWaitTime.fastPassAvailable && (
                      <p>✓ {language === 'zh' ? '快速通關票可用' : 'Fast Pass Available'} {selectedLocation.queueWaitTime.fastPassPrice && `: ${selectedLocation.queueWaitTime.fastPassPrice}`}</p>
                    )}
                    {selectedLocation.queueWaitTime.reservationSystemAvailable && (
                      <p>✓ {language === 'zh' ? '可預約時間' : 'Time Slots Available'}</p>
                    )}
                    {selectedLocation.queueWaitTime.quietTimesRecommendation && (
                      <p><strong>{language === 'zh' ? '建議時段' : 'Best Times'}</strong>: {selectedLocation.queueWaitTime.quietTimesRecommendation}</p>
                    )}
                    {selectedLocation.queueWaitTime.queueWaitTimeNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.queueWaitTime.queueWaitTimeNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.infantSpecific && (
                  <div className="location-detail-section">
                    <h4>👶 {language === 'zh' ? '嬰兒友善' : 'Infant Friendly'}</h4>
                    {selectedLocation.infantSpecific.suitableForNewborns && (
                      <p>✓ {language === 'zh' ? '適合新生兒' : 'Suitable for Newborns'}</p>
                    )}
                    {selectedLocation.infantSpecific.hasDarkQuietSpaces && (
                      <p>✓ {language === 'zh' ? '有暗靜空間' : 'Has Dark Quiet Spaces'}</p>
                    )}
                    {selectedLocation.infantSpecific.temperatureControlledNursingAreas && (
                      <p>✓ {language === 'zh' ? '溫度控制的哺乳區' : 'Temperature-Controlled Nursing Areas'}</p>
                    )}
                    {selectedLocation.infantSpecific.hasChangeTableAvailability !== undefined && selectedLocation.infantSpecific.hasChangeTableAvailability > 0 && (
                      <p>✓ {language === 'zh' ? '尿布台可用' : 'Changing Tables Available'}: {selectedLocation.infantSpecific.hasChangeTableAvailability}</p>
                    )}
                    {selectedLocation.infantSpecific.minimalLoudNoiseAreas && (
                      <p>✓ {language === 'zh' ? '有安靜區域' : 'Quiet Areas Available'}</p>
                    )}
                    {selectedLocation.infantSpecific.infantCarriageSpaceAvailable && (
                      <p>✓ {language === 'zh' ? '可置放嬰兒車' : 'Stroller Space Available'}</p>
                    )}
                    {selectedLocation.infantSpecific.hasInfantSpecificRestRooms && (
                      <p>✓ {language === 'zh' ? '嬰兒專用休息室' : 'Infant Rest Rooms'}</p>
                    )}
                    {selectedLocation.infantSpecific.infantCaregiversAvailable && (
                      <p>✓ {language === 'zh' ? '有受訓護理人員' : 'Trained Caregivers'}</p>
                    )}
                    {selectedLocation.infantSpecific.recommendedVisitDurationForInfants && (
                      <p><strong>{language === 'zh' ? '建議時長' : 'Recommended Duration'}</strong>: {selectedLocation.infantSpecific.recommendedVisitDurationForInfants}</p>
                    )}
                    {selectedLocation.infantSpecific.infantSpecificNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.infantSpecific.infantSpecificNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.storageLocker && (
                  <div className="location-detail-section">
                    <h4>🔒 {language === 'zh' ? '置物櫃與儲存' : 'Storage & Lockers'}</h4>
                    {selectedLocation.storageLocker.hasLockers && (
                      <p>✓ {language === 'zh' ? '有置物櫃' : 'Lockers Available'}  {selectedLocation.storageLocker.lockerQuantity && `(${selectedLocation.storageLocker.lockerQuantity})`}</p>
                    )}
                    {selectedLocation.storageLocker.lockerSize && (
                      <p><strong>{language === 'zh' ? '置物櫃大小' : 'Locker Sizes'}</strong>: {selectedLocation.storageLocker.lockerSize}</p>
                    )}
                    {selectedLocation.storageLocker.lockerCost && (
                      <p><strong>{language === 'zh' ? '置物櫃費用' : 'Cost'}</strong>: {selectedLocation.storageLocker.lockerCost}</p>
                    )}
                    {selectedLocation.storageLocker.hasLargeStorage && (
                      <p>✓ {language === 'zh' ? '大型行李儲存' : 'Large Luggage Storage'}</p>
                    )}
                    {selectedLocation.storageLocker.storageAttendantAvailable && (
                      <p>✓ {language === 'zh' ? '有工作人員看管' : 'Attendant Supervised'}</p>
                    )}
                    {selectedLocation.storageLocker.luggage && (
                      <p>✓ {language === 'zh' ? '可存放行李箱' : 'Can Store Luggage'}</p>
                    )}
                    {selectedLocation.storageLocker.storageNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.storageLocker.storageNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.childAgeCompatibility && (
                  <div className="location-detail-section">
                    <h4>👨‍👩‍👧‍👦 {language === 'zh' ? '年齡段相容性' : 'Age Compatibility'}</h4>
                    {selectedLocation.childAgeCompatibility.bestAgeCombination && (
                      <p><strong>{language === 'zh' ? '最佳年齡組合' : 'Best Age Mix'}</strong>: {selectedLocation.childAgeCompatibility.bestAgeCombination}</p>
                    )}
                    {selectedLocation.childAgeCompatibility.toddlerActivitiesAvailable && (
                      <p>✓ {language === 'zh' ? '幼兒活動可用' : 'Toddler Activities'}</p>
                    )}
                    {selectedLocation.childAgeCompatibility.preschoolActivitiesAvailable && (
                      <p>✓ {language === 'zh' ? '學前兒童活動可用' : 'Preschool Activities'}</p>
                    )}
                    {selectedLocation.childAgeCompatibility.schoolAgeActivitiesAvailable && (
                      <p>✓ {language === 'zh' ? '學齡兒童活動可用' : 'School-Age Activities'}</p>
                    )}
                    {selectedLocation.childAgeCompatibility.teenActivitiesAvailable && (
                      <p>✓ {language === 'zh' ? '青少年活動可用' : 'Teen Activities'}</p>
                    )}
                    {selectedLocation.childAgeCompatibility.siblingFriendlinessRating && (
                      <p><strong>{language === 'zh' ? '兄弟姐妹友善度' : 'Sibling-Friendly'}</strong>: {selectedLocation.childAgeCompatibility.siblingFriendlinessRating}</p>
                    )}
                    {selectedLocation.childAgeCompatibility.recommendedGroupSizes && (
                      <p><strong>{language === 'zh' ? '推薦團體大小' : 'Recommended Group Size'}</strong>: {selectedLocation.childAgeCompatibility.recommendedGroupSizes}</p>
                    )}
                    {selectedLocation.childAgeCompatibility.ageCompatibilityNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.childAgeCompatibility.ageCompatibilityNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.visitCost && (
                  <div className="location-detail-section">
                    <h4>💰 {language === 'zh' ? '完整造訪成本' : 'Visit Cost Breakdown'}</h4>
                    {selectedLocation.visitCost.entryFeePerAdult && (
                      <p><strong>{language === 'zh' ? '成人票' : 'Adult Entry'}</strong>: {selectedLocation.visitCost.entryFeePerAdult}</p>
                    )}
                    {selectedLocation.visitCost.entryFeePerChild && (
                      <p><strong>{language === 'zh' ? '兒童票' : 'Child Entry'}</strong>: {selectedLocation.visitCost.entryFeePerChild}</p>
                    )}
                    {selectedLocation.visitCost.entryFeePerToddler && (
                      <p><strong>{language === 'zh' ? '幼兒票' : 'Toddler Entry'}</strong>: {selectedLocation.visitCost.entryFeePerToddler}</p>
                    )}
                    {selectedLocation.visitCost.familyPackagePrice && (
                      <p><strong>{language === 'zh' ? '家庭套票' : 'Family Package'}</strong>: {selectedLocation.visitCost.familyPackagePrice}</p>
                    )}
                    {selectedLocation.visitCost.estimatedFoodCostPerFamily && (
                      <p><strong>{language === 'zh' ? '用餐預估' : 'Estimated Food'}</strong>: {selectedLocation.visitCost.estimatedFoodCostPerFamily}</p>
                    )}
                    {selectedLocation.visitCost.parkingCostForDay && (
                      <p><strong>{language === 'zh' ? '停車費用' : 'Parking'}</strong>: {selectedLocation.visitCost.parkingCostForDay}</p>
                    )}
                    {selectedLocation.visitCost.totalEstimatedCostPerFamily && (
                      <p><strong>{language === 'zh' ? '全家預估總成本' : 'Total Estimated Cost'}</strong>: {selectedLocation.visitCost.totalEstimatedCostPerFamily}</p>
                    )}
                    {selectedLocation.visitCost.costSavingTips && (
                      <p><strong>{language === 'zh' ? '省錢建議' : 'Money-Saving Tips'}</strong>: {selectedLocation.visitCost.costSavingTips}</p>
                    )}
                    {selectedLocation.visitCost.visitCostNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.visitCost.visitCostNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.healthDocumentation && (
                  <div className="location-detail-section">
                    <h4>🏥 {language === 'zh' ? '健康與疫苗要求' : 'Health & Vaccination'}</h4>
                    {selectedLocation.healthDocumentation.requiresCOVIDVaccination !== undefined && (
                      <p><strong>{language === 'zh' ? 'COVID 疫苗要求' : 'COVID Vaccination'}</strong>: {selectedLocation.healthDocumentation.requiresCOVIDVaccination ? (language === 'zh' ? '是' : 'Required') : (language === 'zh' ? '否' : 'Not Required')}</p>
                    )}
                    {selectedLocation.healthDocumentation.requiresCovidTestOnArrival !== undefined && (
                      <p><strong>{language === 'zh' ? '到達時需要檢測' : 'COVID Test on Arrival'}</strong>: {selectedLocation.healthDocumentation.requiresCovidTestOnArrival ? (language === 'zh' ? '是' : 'Required') : (language === 'zh' ? '否' : 'Not Required')}</p>
                    )}
                    {selectedLocation.healthDocumentation.requiresHealthCertificate !== undefined && (
                      <p><strong>{language === 'zh' ? '健康證明' : 'Health Certificate'}</strong>: {selectedLocation.healthDocumentation.requiresHealthCertificate ? (language === 'zh' ? '是' : 'Required') : (language === 'zh' ? '否' : 'Not Required')}</p>
                    )}
                    {selectedLocation.healthDocumentation.enforcementLevel && (
                      <p><strong>{language === 'zh' ? '實施等級' : 'Enforcement Level'}</strong>: {selectedLocation.healthDocumentation.enforcementLevel}</p>
                    )}
                    {selectedLocation.healthDocumentation.documentationNotes && (
                      <p><strong>{language === 'zh' ? '文件說明' : 'Documentation Info'}</strong>: {selectedLocation.healthDocumentation.documentationNotes}</p>
                    )}
                    {selectedLocation.healthDocumentation.healthRequirementNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.healthDocumentation.healthRequirementNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.playgroundAndActivity && (
                  <div className="location-detail-section">
                    <h4>🎪 {language === 'zh' ? '遊樂設施與活動' : 'Playground & Activities'}</h4>
                    {selectedLocation.playgroundAndActivity.hasPlayground !== undefined && (
                      <p><strong>{language === 'zh' ? '有遊樂設施' : 'Has Playground'}</strong>: {selectedLocation.playgroundAndActivity.hasPlayground ? (language === 'zh' ? '是' : 'Yes') : (language === 'zh' ? '否' : 'No')}</p>
                    )}
                    {selectedLocation.playgroundAndActivity.playgroundTypes && selectedLocation.playgroundAndActivity.playgroundTypes.length > 0 && (
                      <p><strong>{language === 'zh' ? '遊樂場類型' : 'Playground Types'}</strong>: {selectedLocation.playgroundAndActivity.playgroundTypes.join(', ')}</p>
                    )}
                    {selectedLocation.playgroundAndActivity.playgroundEquipment && selectedLocation.playgroundAndActivity.playgroundEquipment.length > 0 && (
                      <p><strong>{language === 'zh' ? '遊樂設備' : 'Equipment'}</strong>: {selectedLocation.playgroundAndActivity.playgroundEquipment.join(', ')}</p>
                    )}
                    {selectedLocation.playgroundAndActivity.activitiesByAgeGroup && (
                      <p><strong>{language === 'zh' ? '不同年齡活動' : 'Activities by Age'}</strong>: {selectedLocation.playgroundAndActivity.activitiesByAgeGroup}</p>
                    )}
                    {selectedLocation.playgroundAndActivity.costForActivities && (
                      <p><strong>{language === 'zh' ? '活動費用' : 'Activity Cost'}</strong>: {selectedLocation.playgroundAndActivity.costForActivities}</p>
                    )}
                    {selectedLocation.playgroundAndActivity.playgroundSafetyRating && (
                      <p><strong>{language === 'zh' ? '設施安全評分' : 'Safety Rating'}</strong>: {selectedLocation.playgroundAndActivity.playgroundSafetyRating}/5 ⭐</p>
                    )}
                    {selectedLocation.playgroundAndActivity.equipmentMaintenanceFrequency && (
                      <p><strong>{language === 'zh' ? '維護頻率' : 'Maintenance'}</strong>: {selectedLocation.playgroundAndActivity.equipmentMaintenanceFrequency}</p>
                    )}
                    {selectedLocation.playgroundAndActivity.suggestedDurationPerActivityType && (
                      <p><strong>{language === 'zh' ? '建議時間' : 'Suggested Duration'}</strong>: {selectedLocation.playgroundAndActivity.suggestedDurationPerActivityType}</p>
                    )}
                    {selectedLocation.playgroundAndActivity.outdoorVsIndoorActivities && (
                      <p><strong>{language === 'zh' ? '室內/戶外' : 'Indoor/Outdoor'}</strong>: {selectedLocation.playgroundAndActivity.outdoorVsIndoorActivities}</p>
                    )}
                    {selectedLocation.playgroundAndActivity.playgroundAndActivityNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.playgroundAndActivity.playgroundAndActivityNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.navigationFromTransit && (
                  <div className="detail-section">
                    <h4>🚇 {language === 'zh' ? '交通導航' : 'Navigation & Transit'}</h4>
                    {selectedLocation.navigationFromTransit.mrtDirections && (
                      <div>
                        <p><strong>🚇 {language === 'zh' ? 'MRT捷運' : 'MRT'}</strong></p>
                        <p>{language === 'zh' ? '站名' : 'Station'}: {selectedLocation.navigationFromTransit.mrtDirections.station}</p>
                        <p>{language === 'zh' ? '距離' : 'Distance'}: {selectedLocation.navigationFromTransit.mrtDirections.distance}m</p>
                        {selectedLocation.navigationFromTransit.mrtDirections.walkingTimeMinutes && (
                          <p>{language === 'zh' ? '步行時間' : 'Walking Time'}: {selectedLocation.navigationFromTransit.mrtDirections.walkingTimeMinutes} {language === 'zh' ? '分鐘' : 'min'}</p>
                        )}
                        {selectedLocation.navigationFromTransit.mrtDirections.exitNumber && (
                          <p>{language === 'zh' ? '出口' : 'Exit'}: {selectedLocation.navigationFromTransit.mrtDirections.exitNumber}</p>
                        )}
                        {selectedLocation.navigationFromTransit.mrtDirections.directions && (
                          <p>{language === 'zh' ? '方向' : 'Directions'}: {selectedLocation.navigationFromTransit.mrtDirections.directions}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.navigationFromTransit.busDirections && (
                      <div>
                        <p><strong>🚌 {language === 'zh' ? '公車' : 'Bus'}</strong></p>
                        {selectedLocation.navigationFromTransit.busDirections.busLines && selectedLocation.navigationFromTransit.busDirections.busLines.length > 0 && (
                          <p>{language === 'zh' ? '公車線號' : 'Bus Lines'}: {selectedLocation.navigationFromTransit.busDirections.busLines.join(', ')}</p>
                        )}
                        {selectedLocation.navigationFromTransit.busDirections.stopName && (
                          <p>{language === 'zh' ? '站點' : 'Stop'}: {selectedLocation.navigationFromTransit.busDirections.stopName}</p>
                        )}
                        {selectedLocation.navigationFromTransit.busDirections.walkingTimeMinutes && (
                          <p>{language === 'zh' ? '步行時間' : 'Walking Time'}: {selectedLocation.navigationFromTransit.busDirections.walkingTimeMinutes} {language === 'zh' ? '分鐘' : 'min'}</p>
                        )}
                        {selectedLocation.navigationFromTransit.busDirections.directions && (
                          <p>{language === 'zh' ? '方向' : 'Directions'}: {selectedLocation.navigationFromTransit.busDirections.directions}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.navigationFromTransit.driversLicenseAccess && selectedLocation.navigationFromTransit.driversLicenseAccess.drivingTimeFromCityCenter && (
                      <div>
                        <p><strong>🚗 {language === 'zh' ? '開車' : 'Driving'}</strong></p>
                        <p>{language === 'zh' ? '從市中心車程' : 'From City Center'}: {selectedLocation.navigationFromTransit.driversLicenseAccess.drivingTimeFromCityCenter} {language === 'zh' ? '分鐘' : 'min'}</p>
                        {selectedLocation.navigationFromTransit.driversLicenseAccess.parkingEntrance && (
                          <p>{language === 'zh' ? '停車入口' : 'Parking Entrance'}: {selectedLocation.navigationFromTransit.driversLicenseAccess.parkingEntrance}</p>
                        )}
                        {selectedLocation.navigationFromTransit.driversLicenseAccess.gpsCoordinates && (
                          <p>GPS: {selectedLocation.navigationFromTransit.driversLicenseAccess.gpsCoordinates.lat.toFixed(4)}, {selectedLocation.navigationFromTransit.driversLicenseAccess.gpsCoordinates.lng.toFixed(4)}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.navigationFromTransit.navigationNotes && (
                      <p><strong>{language === 'zh' ? '完整導航信息' : 'Complete Navigation Info'}</strong>: {selectedLocation.navigationFromTransit.navigationNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.photographySpotsAndServices && (
                  <div className="detail-section">
                    <h4>📸 {language === 'zh' ? '拍照景點與服務' : 'Photography Spots & Services'}</h4>
                    {selectedLocation.photographySpotsAndServices.bestPhotoSpots && selectedLocation.photographySpotsAndServices.bestPhotoSpots.length > 0 && (
                      <div>
                        <p><strong>{language === 'zh' ? '最佳拍照景點' : 'Best Photo Spots'}</strong></p>
                        {selectedLocation.photographySpotsAndServices.bestPhotoSpots.map((spot, idx) => (
                          <div key={idx} style={{ marginLeft: '10px', marginBottom: '8px', borderLeft: '3px solid #ffd700', paddingLeft: '10px' }}>
                            <p><strong>{spot.spotName}</strong></p>
                            {spot.description && <p>{spot.description}</p>}
                            {spot.bestTimeOfDay && <p>{language === 'zh' ? '最佳時間' : 'Best Time'}: {spot.bestTimeOfDay}</p>}
                            {spot.ageAppropriate && <p>{language === 'zh' ? '適合年齡' : 'Age Group'}: {spot.ageAppropriate}</p>}
                            {spot.photoTip && <p>{language === 'zh' ? '拍照建議' : 'Photo Tip'}: {spot.photoTip}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedLocation.photographySpotsAndServices.photoBooth && selectedLocation.photographySpotsAndServices.photoBooth.available && (
                      <div>
                        <p><strong>📷 {language === 'zh' ? '拍照機' : 'Photo Booth'}</strong></p>
                        {selectedLocation.photographySpotsAndServices.photoBooth.locations && selectedLocation.photographySpotsAndServices.photoBooth.locations.length > 0 && (
                          <p>{language === 'zh' ? '位置' : 'Locations'}: {selectedLocation.photographySpotsAndServices.photoBooth.locations.join(', ')}</p>
                        )}
                        {selectedLocation.photographySpotsAndServices.photoBooth.price && (
                          <p>{language === 'zh' ? '價格' : 'Price'}: {selectedLocation.photographySpotsAndServices.photoBooth.price}</p>
                        )}
                        {selectedLocation.photographySpotsAndServices.photoBooth.instantPrints && (
                          <p>✓ {language === 'zh' ? '可即時打印' : 'Instant Prints Available'}</p>
                        )}
                        {selectedLocation.photographySpotsAndServices.photoBooth.digitalCopies && (
                          <p>✓ {language === 'zh' ? '提供數位檔案' : 'Digital Copies Available'}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.photographySpotsAndServices.professionalPhotoServices && selectedLocation.photographySpotsAndServices.professionalPhotoServices.available && (
                      <div>
                        <p><strong>📸 {language === 'zh' ? '專業攝影服務' : 'Professional Photography'}</strong></p>
                        {selectedLocation.photographySpotsAndServices.professionalPhotoServices.types && selectedLocation.photographySpotsAndServices.professionalPhotoServices.types.length > 0 && (
                          <p>{language === 'zh' ? '服務類型' : 'Types'}: {selectedLocation.photographySpotsAndServices.professionalPhotoServices.types.join(', ')}</p>
                        )}
                        {selectedLocation.photographySpotsAndServices.professionalPhotoServices.pricing && (
                          <p>{language === 'zh' ? '價格' : 'Pricing'}: {selectedLocation.photographySpotsAndServices.professionalPhotoServices.pricing}</p>
                        )}
                        {selectedLocation.photographySpotsAndServices.professionalPhotoServices.booking && (
                          <p>{language === 'zh' ? '預訂方式' : 'Booking'}: {selectedLocation.photographySpotsAndServices.professionalPhotoServices.booking}</p>
                        )}
                        {selectedLocation.photographySpotsAndServices.professionalPhotoServices.turnaroundTime && (
                          <p>{language === 'zh' ? '交付時間' : 'Turnaround Time'}: {selectedLocation.photographySpotsAndServices.professionalPhotoServices.turnaroundTime}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.photographySpotsAndServices.scenicLocations && selectedLocation.photographySpotsAndServices.scenicLocations.length > 0 && (
                      <p><strong>{language === 'zh' ? '景觀地點' : 'Scenic Locations'}</strong>: {selectedLocation.photographySpotsAndServices.scenicLocations.join(', ')}</p>
                    )}
                    {selectedLocation.photographySpotsAndServices.allowedEquipment && selectedLocation.photographySpotsAndServices.allowedEquipment.length > 0 && (
                      <p><strong>{language === 'zh' ? '允許的設備' : 'Allowed Equipment'}</strong>: {selectedLocation.photographySpotsAndServices.allowedEquipment.join(', ')}</p>
                    )}
                    {selectedLocation.photographySpotsAndServices.photographyNotes && (
                      <p><strong>{language === 'zh' ? '拍照建議' : 'Photography Notes'}</strong>: {selectedLocation.photographySpotsAndServices.photographyNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.kidsClassesAndWorkshops && selectedLocation.kidsClassesAndWorkshops.hasClasses && (
                  <div className="detail-section">
                    <h4>🎨 {language === 'zh' ? '兒童課程與工作坊' : 'Kids Classes & Workshops'}</h4>
                    {selectedLocation.kidsClassesAndWorkshops.musicClasses && selectedLocation.kidsClassesAndWorkshops.musicClasses.available && (
                      <div style={{ marginBottom: '15px', paddingLeft: '10px', borderLeft: '3px solid #9333ea' }}>
                        <p><strong>🎵 {language === 'zh' ? '音樂課程' : 'Music Classes'}</strong></p>
                        {selectedLocation.kidsClassesAndWorkshops.musicClasses.types && selectedLocation.kidsClassesAndWorkshops.musicClasses.types.length > 0 && (
                          <p>{language === 'zh' ? '課程類型' : 'Types'}: {selectedLocation.kidsClassesAndWorkshops.musicClasses.types.join(', ')}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.musicClasses.ageGroup && (
                          <p>{language === 'zh' ? '適合年齡' : 'Age Group'}: {selectedLocation.kidsClassesAndWorkshops.musicClasses.ageGroup}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.musicClasses.schedule && (
                          <p>{language === 'zh' ? '課程時間' : 'Schedule'}: {selectedLocation.kidsClassesAndWorkshops.musicClasses.schedule}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.musicClasses.pricing && (
                          <p>{language === 'zh' ? '費用' : 'Pricing'}: {selectedLocation.kidsClassesAndWorkshops.musicClasses.pricing}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.kidsClassesAndWorkshops.artClasses && selectedLocation.kidsClassesAndWorkshops.artClasses.available && (
                      <div style={{ marginBottom: '15px', paddingLeft: '10px', borderLeft: '3px solid #ec4899' }}>
                        <p><strong>🎨 {language === 'zh' ? '美術課程' : 'Art Classes'}</strong></p>
                        {selectedLocation.kidsClassesAndWorkshops.artClasses.types && selectedLocation.kidsClassesAndWorkshops.artClasses.types.length > 0 && (
                          <p>{language === 'zh' ? '課程類型' : 'Types'}: {selectedLocation.kidsClassesAndWorkshops.artClasses.types.join(', ')}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.artClasses.ageGroup && (
                          <p>{language === 'zh' ? '適合年齡' : 'Age Group'}: {selectedLocation.kidsClassesAndWorkshops.artClasses.ageGroup}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.artClasses.schedule && (
                          <p>{language === 'zh' ? '課程時間' : 'Schedule'}: {selectedLocation.kidsClassesAndWorkshops.artClasses.schedule}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.artClasses.pricing && (
                          <p>{language === 'zh' ? '費用' : 'Pricing'}: {selectedLocation.kidsClassesAndWorkshops.artClasses.pricing}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.artClasses.materialsIncluded && (
                          <p>✓ {language === 'zh' ? '教材已含' : 'Materials Included'}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.kidsClassesAndWorkshops.sportClasses && selectedLocation.kidsClassesAndWorkshops.sportClasses.available && (
                      <div style={{ marginBottom: '15px', paddingLeft: '10px', borderLeft: '3px solid #f97316' }}>
                        <p><strong>⚽ {language === 'zh' ? '運動課程' : 'Sports Classes'}</strong></p>
                        {selectedLocation.kidsClassesAndWorkshops.sportClasses.types && selectedLocation.kidsClassesAndWorkshops.sportClasses.types.length > 0 && (
                          <p>{language === 'zh' ? '課程類型' : 'Types'}: {selectedLocation.kidsClassesAndWorkshops.sportClasses.types.join(', ')}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.sportClasses.ageGroup && (
                          <p>{language === 'zh' ? '適合年齡' : 'Age Group'}: {selectedLocation.kidsClassesAndWorkshops.sportClasses.ageGroup}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.sportClasses.schedule && (
                          <p>{language === 'zh' ? '課程時間' : 'Schedule'}: {selectedLocation.kidsClassesAndWorkshops.sportClasses.schedule}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.sportClasses.pricing && (
                          <p>{language === 'zh' ? '費用' : 'Pricing'}: {selectedLocation.kidsClassesAndWorkshops.sportClasses.pricing}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.kidsClassesAndWorkshops.parentChildClasses && selectedLocation.kidsClassesAndWorkshops.parentChildClasses.available && (
                      <div style={{ marginBottom: '15px', paddingLeft: '10px', borderLeft: '3px solid #22c55e' }}>
                        <p><strong>👪 {language === 'zh' ? '親子課程' : 'Parent-Child Classes'}</strong></p>
                        {selectedLocation.kidsClassesAndWorkshops.parentChildClasses.types && selectedLocation.kidsClassesAndWorkshops.parentChildClasses.types.length > 0 && (
                          <p>{language === 'zh' ? '課程類型' : 'Types'}: {selectedLocation.kidsClassesAndWorkshops.parentChildClasses.types.join(', ')}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.parentChildClasses.ageGroup && (
                          <p>{language === 'zh' ? '適合年齡' : 'Age Group'}: {selectedLocation.kidsClassesAndWorkshops.parentChildClasses.ageGroup}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.parentChildClasses.schedule && (
                          <p>{language === 'zh' ? '課程時間' : 'Schedule'}: {selectedLocation.kidsClassesAndWorkshops.parentChildClasses.schedule}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.parentChildClasses.pricing && (
                          <p>{language === 'zh' ? '費用' : 'Pricing'}: {selectedLocation.kidsClassesAndWorkshops.parentChildClasses.pricing}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.kidsClassesAndWorkshops.summitCamps && selectedLocation.kidsClassesAndWorkshops.summitCamps.available && (
                      <div style={{ marginBottom: '15px', paddingLeft: '10px', borderLeft: '3px solid #06b6d4' }}>
                        <p><strong>🏕️ {language === 'zh' ? '暑期/冬令營隊' : 'Summer/Winter Camps'}</strong></p>
                        {selectedLocation.kidsClassesAndWorkshops.summitCamps.types && selectedLocation.kidsClassesAndWorkshops.summitCamps.types.length > 0 && (
                          <p>{language === 'zh' ? '課程類型' : 'Types'}: {selectedLocation.kidsClassesAndWorkshops.summitCamps.types.join(', ')}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.summitCamps.seasonalAvailability && (
                          <p>{language === 'zh' ? '開放季節' : 'Seasonal Availability'}: {selectedLocation.kidsClassesAndWorkshops.summitCamps.seasonalAvailability}</p>
                        )}
                        {selectedLocation.kidsClassesAndWorkshops.summitCamps.pricing && (
                          <p>{language === 'zh' ? '費用' : 'Pricing'}: {selectedLocation.kidsClassesAndWorkshops.summitCamps.pricing}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.kidsClassesAndWorkshops.classesNotes && (
                      <p><strong>{language === 'zh' ? '課程說明' : 'Classes Notes'}</strong>: {selectedLocation.kidsClassesAndWorkshops.classesNotes}</p>
                    )}
                    {selectedLocation.kidsClassesAndWorkshops.bookingMethod && (
                      <p><strong>{language === 'zh' ? '預約方式' : 'Booking Method'}</strong>: {selectedLocation.kidsClassesAndWorkshops.bookingMethod}</p>
                    )}
                    {selectedLocation.kidsClassesAndWorkshops.classesPhoneNumber && (
                      <p><strong>{language === 'zh' ? '課程電話' : 'Classes Phone'}</strong>: {selectedLocation.kidsClassesAndWorkshops.classesPhoneNumber}</p>
                    )}
                  </div>
                )}
                {selectedLocation.weatherAndSunSafety && (
                  <div className="location-section" style={{ borderTop: '2px solid #f59e0b', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>☀️ {language === 'zh' ? '天氣與防曬安全' : 'Weather & Sun Safety'}</h3>
                    {selectedLocation.weatherAndSunSafety.hasOutdoorExposure !== undefined && (
                      <p><strong>{language === 'zh' ? '室外暴露' : 'Outdoor Exposure'}</strong>: {selectedLocation.weatherAndSunSafety.hasOutdoorExposure ? '✅ ' + (language === 'zh' ? '有' : 'Yes') : '❌ ' + (language === 'zh' ? '無' : 'No')}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.uvRiskLevel && (
                      <p><strong>{language === 'zh' ? '紫外線風險' : 'UV Risk Level'}</strong>: {
                        selectedLocation.weatherAndSunSafety.uvRiskLevel === 'extreme' ? '🔴 ' + (language === 'zh' ? '極端' : 'Extreme') :
                        selectedLocation.weatherAndSunSafety.uvRiskLevel === 'very high' ? '🔴 ' + (language === 'zh' ? '非常高' : 'Very High') :
                        selectedLocation.weatherAndSunSafety.uvRiskLevel === 'high' ? '🟠 ' + (language === 'zh' ? '高' : 'High') :
                        selectedLocation.weatherAndSunSafety.uvRiskLevel === 'moderate' ? '🟡 ' + (language === 'zh' ? '中等' : 'Moderate') :
                        '🟢 ' + (language === 'zh' ? '低' : 'Low')
                      }</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.peakUVMonth && selectedLocation.weatherAndSunSafety.peakUVMonth.length > 0 && (
                      <p><strong>{language === 'zh' ? '紫外線峰值月份' : 'Peak UV Months'}</strong>: {selectedLocation.weatherAndSunSafety.peakUVMonth.join(', ')}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.recommendedSunProtection && selectedLocation.weatherAndSunSafety.recommendedSunProtection.length > 0 && (
                      <p><strong>{language === 'zh' ? '防曬建議' : 'Sun Protection'}</strong>: {selectedLocation.weatherAndSunSafety.recommendedSunProtection.join(', ')}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.sunExposureRisk && (
                      <p><strong>{language === 'zh' ? '日曬風險' : 'Sun Exposure Risk'}</strong>: {selectedLocation.weatherAndSunSafety.sunExposureRisk}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.shadeAvailability && (
                      <p><strong>{language === 'zh' ? '遮蔭可用性' : 'Shade Availability'}</strong>: {
                        selectedLocation.weatherAndSunSafety.shadeAvailability === 'abundant' ? '🟢 ' + (language === 'zh' ? '充足' : 'Abundant') :
                        selectedLocation.weatherAndSunSafety.shadeAvailability === 'moderate' ? '🟡 ' + (language === 'zh' ? '中等' : 'Moderate') :
                        selectedLocation.weatherAndSunSafety.shadeAvailability === 'limited' ? '🟠 ' + (language === 'zh' ? '有限' : 'Limited') :
                        '🔴 ' + (language === 'zh' ? '最少' : 'Minimal')
                      }</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.umbrellaAllowed !== undefined && (
                      <p><strong>{language === 'zh' ? '允許使用傘' : 'Umbrella Allowed'}</strong>: {selectedLocation.weatherAndSunSafety.umbrellaAllowed ? '✅' : '❌'}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.sunriseToSunsetTiming && (
                      <p><strong>{language === 'zh' ? '日出日落時間' : 'Sunrise to Sunset'}</strong>: {selectedLocation.weatherAndSunSafety.sunriseToSunsetTiming}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.bestSafeTimeToVisit && (
                      <p><strong>{language === 'zh' ? '最安全造訪時間' : 'Best Safe Time to Visit'}</strong>: {selectedLocation.weatherAndSunSafety.bestSafeTimeToVisit}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.heatStressRisk && (
                      <p><strong>{language === 'zh' ? '熱應激風險' : 'Heat Stress Risk'}</strong>: {selectedLocation.weatherAndSunSafety.heatStressRisk}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.mosquitoSeasonInfo && (
                      <p><strong>{language === 'zh' ? '蚊子季節信息' : 'Mosquito Season'}</strong>: {selectedLocation.weatherAndSunSafety.mosquitoSeasonInfo}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.sunburnWarning && (
                      <p>⚠️ {language === 'zh' ? '曬傷警告：風險顯著' : 'Sunburn Warning: Significant Risk'}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.photosensitivityRisk && (
                      <p>⚠️ {language === 'zh' ? '光敏感風險：高強度眩光' : 'Photosensitivity Risk: High Glare'}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.recommendedClothing && selectedLocation.weatherAndSunSafety.recommendedClothing.length > 0 && (
                      <p><strong>{language === 'zh' ? '建議著裝' : 'Recommended Clothing'}</strong>: {selectedLocation.weatherAndSunSafety.recommendedClothing.join(', ')}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.sunscreenRecommendation && (
                      <p><strong>{language === 'zh' ? '防曬霜建議' : 'Sunscreen Recommendation'}</strong>: {selectedLocation.weatherAndSunSafety.sunscreenRecommendation}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.indoorAlternativesAvailable !== undefined && (
                      <p><strong>{language === 'zh' ? '室內替代方案' : 'Indoor Alternatives'}</strong>: {selectedLocation.weatherAndSunSafety.indoorAlternativesAvailable ? '✅ ' + (language === 'zh' ? '有' : 'Available') : '❌ ' + (language === 'zh' ? '無' : 'Not Available')}</p>
                    )}
                    {selectedLocation.weatherAndSunSafety.weatherProtectionNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.weatherAndSunSafety.weatherProtectionNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.walkingDistanceAndDifficulty && (
                  <div className="location-section" style={{ borderTop: '2px solid #06b6d4', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>🚶 {language === 'zh' ? '行走距離與難度' : 'Walking Distance & Difficulty'}</h3>
                    {selectedLocation.walkingDistanceAndDifficulty.totalWalkingDistance !== undefined && (
                      <p><strong>{language === 'zh' ? '總行走距離' : 'Total Walking Distance'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.totalWalkingDistance}m</p>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.mainAttractionsAccessibility && (
                      <p><strong>{language === 'zh' ? '主要景點易達性' : 'Main Attractions Accessibility'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.mainAttractionsAccessibility}</p>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.strollerWalking && (
                      <div style={{ marginLeft: '16px', paddingLeft: '12px', borderLeft: '2px solid #06b6d4' }}>
                        <p><strong>{language === 'zh' ? '嬰兒車使用' : 'Stroller Accessibility'}</strong>:</p>
                        {selectedLocation.walkingDistanceAndDifficulty.strollerWalking.isStrollerFriendly !== undefined && (
                          <p style={{ marginLeft: '12px' }}><strong>{language === 'zh' ? '嬰兒車友善' : 'Stroller-Friendly'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.strollerWalking.isStrollerFriendly ? '✅' : '❌'}</p>
                        )}
                        {selectedLocation.walkingDistanceAndDifficulty.strollerWalking.difficultSections && (
                          <p style={{ marginLeft: '12px' }}><strong>{language === 'zh' ? '困難路段' : 'Difficult Sections'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.strollerWalking.difficultSections}</p>
                        )}
                        {selectedLocation.walkingDistanceAndDifficulty.strollerWalking.flatPathPercentage !== undefined && (
                          <p style={{ marginLeft: '12px' }}><strong>{language === 'zh' ? '平坦路徑' : 'Flat Paths'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.strollerWalking.flatPathPercentage}%</p>
                        )}
                        {selectedLocation.walkingDistanceAndDifficulty.strollerWalking.maxSlopePercentage !== undefined && (
                          <p style={{ marginLeft: '12px' }}><strong>{language === 'zh' ? '最大坡度' : 'Max Slope'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.strollerWalking.maxSlopePercentage}%</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.carryingSmallChildrenDifficulty && (
                      <p><strong>{language === 'zh' ? '懷抱幼兒難度' : 'Carrying Children Difficulty'}</strong>: {
                        selectedLocation.walkingDistanceAndDifficulty.carryingSmallChildrenDifficulty === 'easy' ? '🟢 ' + (language === 'zh' ? '容易' : 'Easy') :
                        selectedLocation.walkingDistanceAndDifficulty.carryingSmallChildrenDifficulty === 'moderate' ? '🟡 ' + (language === 'zh' ? '中等' : 'Moderate') :
                        '🔴 ' + (language === 'zh' ? '困難' : 'Challenging')
                      }</p>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.ageGroupPhysicalDemands && (
                      <div style={{ marginLeft: '16px', paddingLeft: '12px', borderLeft: '2px solid #06b6d4' }}>
                        <p><strong>{language === 'zh' ? '年齡組體力要求' : 'Age Group Physical Demands'}</strong>:</p>
                        {selectedLocation.walkingDistanceAndDifficulty.ageGroupPhysicalDemands.toddlers && (
                          <p style={{ marginLeft: '12px' }}><strong>{language === 'zh' ? '幼兒' : 'Toddlers'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.ageGroupPhysicalDemands.toddlers}</p>
                        )}
                        {selectedLocation.walkingDistanceAndDifficulty.ageGroupPhysicalDemands.preschool && (
                          <p style={{ marginLeft: '12px' }}><strong>{language === 'zh' ? '學齡前' : 'Preschool'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.ageGroupPhysicalDemands.preschool}</p>
                        )}
                        {selectedLocation.walkingDistanceAndDifficulty.ageGroupPhysicalDemands.schoolAge && (
                          <p style={{ marginLeft: '12px' }}><strong>{language === 'zh' ? '學齡兒童' : 'School-Age'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.ageGroupPhysicalDemands.schoolAge}</p>
                        )}
                      </div>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.restAreaFrequency && (
                      <p><strong>{language === 'zh' ? '休息區頻率' : 'Rest Area Frequency'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.restAreaFrequency}</p>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.benchesToAmenitiesRatio && (
                      <p><strong>{language === 'zh' ? '座位與便利設施' : 'Benches & Amenities'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.benchesToAmenitiesRatio}</p>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.timeToMainAttraction !== undefined && (
                      <p><strong>{language === 'zh' ? '至主要景點時間' : 'Time to Main Attraction'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.timeToMainAttraction} {language === 'zh' ? '分鐘' : 'minutes'}</p>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.roundTripWalkingTime !== undefined && (
                      <p><strong>{language === 'zh' ? '往返行走時間' : 'Round-trip Walking Time'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.roundTripWalkingTime} {language === 'zh' ? '分鐘' : 'minutes'}</p>
                    )}
                    {selectedLocation.walkingDistanceAndDifficulty.walkingDifficultyNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.walkingDistanceAndDifficulty.walkingDifficultyNotes}</p>
                    )}
                  </div>
                )}
                {selectedLocation.noiseAndSensoryEnvironment && (
                  <div className="location-section" style={{ borderTop: '2px solid #a78bfa', paddingTop: '12px', marginTop: '12px' }}>
                    <h3>🔊 {language === 'zh' ? '音量與感官環境' : 'Noise & Sensory Environment'}</h3>
                    {selectedLocation.noiseAndSensoryEnvironment.overallNoiseLevel && (
                      <p><strong>{language === 'zh' ? '整體噪音水平' : 'Overall Noise Level'}</strong>: {
                        selectedLocation.noiseAndSensoryEnvironment.overallNoiseLevel === 'very_quiet' ? '🟢 ' + (language === 'zh' ? '非常安靜' : 'Very Quiet') :
                        selectedLocation.noiseAndSensoryEnvironment.overallNoiseLevel === 'quiet' ? '🟢 ' + (language === 'zh' ? '安靜' : 'Quiet') :
                        selectedLocation.noiseAndSensoryEnvironment.overallNoiseLevel === 'moderate' ? '🟡 ' + (language === 'zh' ? '中等' : 'Moderate') :
                        selectedLocation.noiseAndSensoryEnvironment.overallNoiseLevel === 'loud' ? '🟠 ' + (language === 'zh' ? '吵雜' : 'Loud') :
                        '🔴 ' + (language === 'zh' ? '非常吵雜' : 'Very Loud')
                      }</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.noiseSourcesDescription && (
                      <p><strong>{language === 'zh' ? '噪音來源' : 'Noise Sources'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.noiseSourcesDescription}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.peakNoiseHours && (
                      <p><strong>{language === 'zh' ? '尖峰噪音時段' : 'Peak Noise Hours'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.peakNoiseHours}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.quietestHours && (
                      <p><strong>{language === 'zh' ? '最安靜時段' : 'Quietest Hours'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.quietestHours}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.soundMitigation && selectedLocation.noiseAndSensoryEnvironment.soundMitigation.length > 0 && (
                      <p><strong>{language === 'zh' ? '降噪措施' : 'Sound Mitigation'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.soundMitigation.join(', ')}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.hasSoundproofing !== undefined && (
                      <p><strong>{language === 'zh' ? '隔音措施' : 'Soundproofing'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.hasSoundproofing ? '✅' : '❌'}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.quietZonesAvailable !== undefined && (
                      <p><strong>{language === 'zh' ? '安靜區域' : 'Quiet Zones'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.quietZonesAvailable ? '✅ ' + (language === 'zh' ? '有' : 'Available') : '❌ ' + (language === 'zh' ? '無' : 'Not Available')}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.quietZoneDescription && (
                      <p><strong>{language === 'zh' ? '安靜區域說明' : 'Quiet Zone Details'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.quietZoneDescription}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.sensoryFriendlyHours && (
                      <p><strong>{language === 'zh' ? '感官友善時段' : 'Sensory-Friendly Hours'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.sensoryFriendlyHours}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.sensoryAccommodations && selectedLocation.noiseAndSensoryEnvironment.sensoryAccommodations.length > 0 && (
                      <p><strong>{language === 'zh' ? '感官便利設施' : 'Sensory Accommodations'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.sensoryAccommodations.join(', ')}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.vibrationalActivities && (
                      <p><strong>{language === 'zh' ? '振動活動' : 'Vibrational Activities'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.vibrationalActivities}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.lightingSituation && (
                      <p><strong>{language === 'zh' ? '照明環境' : 'Lighting Situation'}</strong>: {
                        selectedLocation.noiseAndSensoryEnvironment.lightingSituation === 'very_bright' ? '🔆 ' + (language === 'zh' ? '非常明亮' : 'Very Bright') :
                        selectedLocation.noiseAndSensoryEnvironment.lightingSituation === 'bright' ? '☀️ ' + (language === 'zh' ? '明亮' : 'Bright') :
                        selectedLocation.noiseAndSensoryEnvironment.lightingSituation === 'moderate' ? '◐ ' + (language === 'zh' ? '中等' : 'Moderate') :
                        selectedLocation.noiseAndSensoryEnvironment.lightingSituation === 'dim' ? '🌙 ' + (language === 'zh' ? '昏暗' : 'Dim') :
                        '◔ ' + (language === 'zh' ? '混合' : 'Mixed')
                      }</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.hasAdjustableLighting !== undefined && (
                      <p><strong>{language === 'zh' ? '可調照明' : 'Adjustable Lighting'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.hasAdjustableLighting ? '✅' : '❌'}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.scents && (
                      <p><strong>{language === 'zh' ? '氣味環境' : 'Scents'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.scents}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.hasScent_freePolicies !== undefined && (
                      <p><strong>{language === 'zh' ? '無香料政策' : 'Scent-Free Policies'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.hasScent_freePolicies ? '✅' : '❌'}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.echoProblems !== undefined && (
                      <p><strong>{language === 'zh' ? '迴音問題' : 'Echo Problems'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.echoProblems ? '⚠️ ' + (language === 'zh' ? '有' : 'Yes') : '✅ ' + (language === 'zh' ? '無' : 'No')}</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.staffSensoryAwareness && (
                      <p><strong>{language === 'zh' ? '員工感官意識' : 'Staff Sensory Awareness'}</strong>: {
                        selectedLocation.noiseAndSensoryEnvironment.staffSensoryAwareness === 'comprehensive' ? '⭐⭐⭐ ' + (language === 'zh' ? '全面' : 'Comprehensive') :
                        selectedLocation.noiseAndSensoryEnvironment.staffSensoryAwareness === 'trained' ? '⭐⭐ ' + (language === 'zh' ? '已訓練' : 'Trained') :
                        selectedLocation.noiseAndSensoryEnvironment.staffSensoryAwareness === 'basic' ? '⭐ ' + (language === 'zh' ? '基礎' : 'Basic') :
                        '◯ ' + (language === 'zh' ? '最少' : 'Minimal')
                      }</p>
                    )}
                    {selectedLocation.noiseAndSensoryEnvironment.sensoryEnvironmentNotes && (
                      <p><strong>{language === 'zh' ? '詳情' : 'Details'}</strong>: {selectedLocation.noiseAndSensoryEnvironment.sensoryEnvironmentNotes}</p>
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
          <MapContainer center={position} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={position} zoom={zoom} />
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
                    <div className="popup-content" style={{ width: '300px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '1.1em' }}>{loc.name[language]}</strong>
                        <div style={{ fontSize: '0.75em', color: '#666', marginTop: '4px' }}>
                          {t.categories[loc.category]} {loc.averageRating > 0 && `⭐ ${loc.averageRating.toFixed(1)}`}
                        </div>
                      </div>
                      <p style={{fontSize: '0.85em', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.3', marginBottom: '8px', color: '#333'}}>{loc.description[language]}</p>
                      {loc.facilities && loc.facilities.length > 0 && (
                        <div style={{ fontSize: '0.75em', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {loc.facilities.slice(0, 3).map((f, i) => (
                              <span key={i} style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>{f}</span>
                            ))}
                            {loc.facilities.length > 3 && <span style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>+{loc.facilities.length - 3}</span>}
                          </div>
                        </div>
                      )}
                      <div style={{ fontSize: '0.75em', color: '#0066cc', textAlign: 'center', marginTop: '8px', fontWeight: '500' }}>
                        {language === 'zh' ? '👉 點擊查看完整資訊' : '👉 Click for details'}
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