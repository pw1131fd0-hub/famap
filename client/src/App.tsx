import { useState, useEffect, useCallback, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Globe, Trees as Park, Baby, Utensils, Hospital, X, Plus, Menu, ChevronDown, Filter, Heart, List, Moon, Sun } from 'lucide-react';
import { locationApi, reviewApi, favoriteApi, crowdinessApi, eventsApi } from './services/api';
import type { Location, Category, Review, ReviewCreateDTO, LocationCreateDTO, CrowdednessReport, CrowdednessReportCreateDTO, Event } from './types';
import { useTranslation } from './i18n/useTranslation';
import { LocationForm } from './components/LocationForm';
import { LocationDetailPanel } from './components/LocationDetailPanel';
import { LocationList } from './components/LocationList';
import { MapPanel } from './components/MapPanel';
import { CITIES, initializeLeafletIcons } from './config/mapConfig';
import type { CityKey } from './config/mapConfig';

// Initialize Leaflet icons
initializeLeafletIcons();

// Hardcoded user ID for demonstration (MVP)
const MOCK_USER_ID = 'u1';

function App() {
  const { language, setLanguage, t } = useTranslation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
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
  const [crowdednessReports, setCrowdednessReports] = useState<CrowdednessReport[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [facilitiesFilter, setFacilitiesFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Age filtering disabled for mobile stability
  // const [childAge, setChildAge] = useState<number | undefined>(() => {
  //   const saved = localStorage.getItem('childAge');
  //   return saved ? parseInt(saved, 10) : undefined;
  // });
  
const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      if (newMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
      return newMode;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

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

  useEffect(() => {
    const fetchCrowdednessReports = async () => {
      if (selectedLocation) {
        try {
          const data = await crowdinessApi.getByLocationId(selectedLocation.id);
          setCrowdednessReports(data);
        } catch (error) {
          console.error('Failed to fetch crowdedness reports:', error);
        }
      } else {
        setCrowdednessReports([]);
      }
    };

    fetchCrowdednessReports();
  }, [selectedLocation]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (selectedLocation) {
        try {
          const data = await eventsApi.getByLocationId(selectedLocation.id);
          setEvents(data);
        } catch (error) {
          console.error('Failed to fetch events:', error);
        }
      } else {
        setEvents([]);
      }
    };

    fetchEvents();
  }, [selectedLocation]);

  const handleFindMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setErrorMessage(null);
        },
        (err) => {
          console.error('Geolocation error:', err);
          const message = language === 'zh'
            ? '無法獲取您的位置，使用台北作為預設位置。'
            : 'Could not get your location. Defaulting to Taipei.';
          setErrorMessage(message);
          setTimeout(() => setErrorMessage(null), 3000);
        }
      );
    } else {
      const message = language === 'zh'
        ? '您的瀏覽器不支援地理定位。'
        : 'Geolocation is not supported by your browser.';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 3000);
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

  const handlePostCrowdednessReport = async (reportDto: CrowdednessReportCreateDTO) => {
    if (!selectedLocation) return;
    try {
      const newReport = await crowdinessApi.create(selectedLocation.id, reportDto);
      setCrowdednessReports([newReport, ...crowdednessReports]);
    } catch (error) {
      console.error('Failed to post crowdedness report:', error);
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

  const categories = useMemo(() => [
    { key: undefined, icon: MapPin, label: t.common.all },
    { key: 'park', icon: Park, label: t.categories.park },
    { key: 'nursing_room', icon: Baby, label: t.categories.nursing_room },
    { key: 'restaurant', icon: Utensils, label: t.categories.restaurant },
    { key: 'attraction', icon: Globe, label: t.categories.attraction },
    { key: 'medical', icon: Hospital, label: t.categories.medical },
    { key: 'other', icon: MapPin, label: t.categories.other },
  ], [t]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="logo-section">
          <button
            className="icon-button sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Menu"
            aria-expanded={sidebarOpen}
            aria-label="Toggle sidebar menu"
          >
            <Menu size={20} />
          </button>
          <h1>FamMap</h1>
        </div>
        <div className="city-selector">
          <button
            className="city-selector-button"
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            aria-expanded={cityDropdownOpen}
            aria-haspopup="true"
            aria-label={`City selector, currently ${CITIES.find(c => c.key === selectedCity)?.name}`}
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
          <button
            onClick={toggleDarkMode}
            className="icon-button"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="error-banner" role="alert">
          <button
            onClick={() => setErrorMessage(null)}
            className="error-banner-close"
            aria-label="Close error message"
          >
            <X size={16} />
          </button>
          <span className="error-banner-text">{errorMessage}</span>
        </div>
      )}

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
              crowdednessReports={crowdednessReports}
              onCrowdednessReportSubmit={handlePostCrowdednessReport}
              events={events}
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
                  <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <input
                      type="text"
                      placeholder={t.common.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      aria-label="Search locations"
                    />
                  </div>
                  <div className="sidebar-tools">
                    <button
                      className={`tool-button ${strollerOnly ? 'active' : ''}`}
                      onClick={() => setStrollerOnly(!strollerOnly)}
                      title={t.common.filterStroller}
                      aria-pressed={strollerOnly}
                      aria-label={strollerOnly ? `Disable ${t.common.filterStroller}` : `Enable ${t.common.filterStroller}`}
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
                  <div className="sort-buttons-container">
                    <label className="sort-buttons-label">
                      🔀 {language === 'zh' ? '排序' : 'Sort by'}
                    </label>
                    <div className="sort-buttons">
                      <button
                        onClick={() => setSortBy('distance')}
                        className={`sort-button ${sortBy === 'distance' ? 'active' : ''}`}
                      >
                        📍 {language === 'zh' ? '距離' : 'Distance'}
                      </button>
                      <button
                        onClick={() => setSortBy('rating')}
                        className={`sort-button ${sortBy === 'rating' ? 'active' : ''}`}
                      >
                        ⭐ {language === 'zh' ? '評分' : 'Rating'}
                      </button>
                      <button
                        onClick={() => setSortBy('name')}
                        className={`sort-button ${sortBy === 'name' ? 'active' : ''}`}
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
                      aria-pressed={facilitiesFilter.includes('public_toilet')}
                    >
                      🚽 {t.facilities.public_toilet}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('nursing_room') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('nursing_room')}
                      title={t.facilities.nursing_room}
                      aria-pressed={facilitiesFilter.includes('nursing_room')}
                    >
                      🧴 {t.facilities.nursing_room}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('drinking_water') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('drinking_water')}
                      title={t.facilities.drinking_water}
                      aria-pressed={facilitiesFilter.includes('drinking_water')}
                    >
                      💧 {t.facilities.drinking_water}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('wheelchair_accessible') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('wheelchair_accessible')}
                      title={t.facilities.wheelchair_accessible}
                      aria-pressed={facilitiesFilter.includes('wheelchair_accessible')}
                    >
                      ♿ {t.facilities.wheelchair_accessible}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('air_conditioned') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('air_conditioned')}
                      title={t.facilities.air_conditioned}
                      aria-pressed={facilitiesFilter.includes('air_conditioned')}
                    >
                      ❄️ {t.facilities.air_conditioned}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('swimming_pool') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('swimming_pool')}
                      title={t.facilities.swimming_pool}
                      aria-pressed={facilitiesFilter.includes('swimming_pool')}
                    >
                      🏊 {t.facilities.swimming_pool}
                    </button>
                    <button
                      className={`quick-facility-btn ${facilitiesFilter.includes('kids_menu') ? 'active' : ''}`}
                      onClick={() => toggleFacilityFilter('kids_menu')}
                      title={t.facilities.kids_menu}
                      aria-pressed={facilitiesFilter.includes('kids_menu')}
                    >
                      🍽️ {t.facilities.kids_menu}
                    </button>
                  </div>
                  <nav className="category-list" aria-label="Location categories">
                    {categories.map((cat) => (
                      <button
                        key={cat.key || 'all'}
                        className={`category-item ${selectedCategory === cat.key ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.key as Category | undefined)}
                        aria-current={selectedCategory === cat.key ? 'page' : undefined}
                        aria-label={`Filter by ${cat.label}`}
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
                searchQuery={searchQuery}
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