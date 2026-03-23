import { useState, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Globe, Trees as Park, Baby, Utensils, Hospital, X, Plus, Menu, ChevronDown, Filter, Heart, List } from 'lucide-react';
import { locationApi, reviewApi, favoriteApi } from './services/api';
import type { Location, Category, Review, ReviewCreateDTO, LocationCreateDTO } from './types';
import { useTranslation } from './i18n/useTranslation';
import { LocationForm } from './components/LocationForm';
import { LocationDetailPanel } from './components/LocationDetailPanel';
import { LocationList } from './components/LocationList';
import { MapPanel } from './components/MapPanel';
import { CITIES, initializeLeafletIcons } from './config/mapConfig';
import type { CityKey } from './config/mapConfig';

console.log('Famap loaded');

// Initialize Leaflet icons
initializeLeafletIcons();

// Hardcoded user ID for demonstration (MVP)
const MOCK_USER_ID = 'u1';

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
            <LocationDetailPanel
              location={selectedLocation}
              isFavorite={favorites.some(f => f.id === selectedLocation.id)}
              onFavoriteToggle={(e) => toggleFavorite(e, selectedLocation.id)}
              onClose={() => setSelectedLocation(null)}
              reviews={reviews}
              onReviewSubmit={handlePostReview}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
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

              <LocationList
                locations={locations}
                position={position}
                favorites={favorites}
                showFavorites={showFavorites}
                loading={loading}
                facilitiesFilter={facilitiesFilter}
                sortBy={sortBy}
                onLocationClick={(loc) => {
                  setPosition([loc.coordinates.lat, loc.coordinates.lng]);
                  setSelectedLocation(loc);
                  setSidebarOpen(false);
                }}
                onFavoriteToggle={toggleFavorite}
              />
              <button className="view-map-btn" onClick={() => setSidebarOpen(false)}>
                <MapPin size={18} />
                <span>{t.common.viewMap}</span>
              </button>
            </>
          )}
        </aside>

        <MapPanel
          position={position}
          zoom={zoom}
          locations={locations}
          loading={loading}
          onLocationClick={setSelectedLocation}
          onSearchAreaClick={fetchLocations}
          onPositionChange={setPosition}
        />
      </div>
    </div>
  );
}

export default App;