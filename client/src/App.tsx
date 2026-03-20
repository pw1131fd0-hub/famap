import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Globe, Trees as Park, Baby, Utensils, Hospital, X, Plus, Filter, Heart, List } from 'lucide-react';
import { locationApi, reviewApi, favoriteApi } from './services/api';
import type { Location, Category, Review, ReviewCreateDTO, LocationCreateDTO } from './types';
import { useTranslation } from './i18n/LanguageContext';
import { ReviewList } from './components/ReviewList';
import { ReviewForm } from './components/ReviewForm';
import { LocationForm } from './components/LocationForm';

// Fix for default marker icons in Leaflet with React
// @ts-expect-error - Leaflet icon hack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hardcoded user ID for demonstration (MVP)
const MOCK_USER_ID = 'u1';

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
  const [position, setPosition] = useState<[number, number]>([25.0330, 121.5654]); // Taipei
  const [locations, setLocations] = useState<Location[]>([]);
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [strollerOnly, setStrollerOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchLocations = async () => {
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
  };

  useEffect(() => {
    fetchLocations();
  }, [position, selectedCategory, strollerOnly]);

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

  const categories: { key: Category | undefined; icon: any; label: string }[] = [
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
          <h1>FamMap</h1>
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
        <aside className="sidebar">
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
                </div>
                <div className="detail-section">
                  <h4>{t.locationDetail.facilities}</h4>
                  <div className="facility-chips">
                    {selectedLocation.facilities.map(f => (
                      <span key={f} className="chip">{t.facilities[f as keyof typeof t.facilities] || f}</span>
                    ))}
                  </div>
                </div>
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
                {(showFavorites ? favorites : locations).length === 0 ? (
                  <div className="empty-state">
                    {loading ? (
                      <p>{t.common.loading}</p>
                    ) : (
                      <p>{showFavorites ? t.common.noFavorites : t.common.noLocations}</p>
                    )}
                  </div>
                ) : (
                  (showFavorites ? favorites : locations).map((loc) => (
                    <div 
                      key={loc.id} 
                      className="location-card"
                      onClick={() => {
                        setPosition([loc.coordinates.lat, loc.coordinates.lng]);
                        setSelectedLocation(loc);
                      }}
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
                      <p className="category-label">{t.categories[loc.category]}</p>
                      <p className="address-text">{loc.address[language]}</p>
                      <div className="rating">⭐ {loc.averageRating}</div>
                    </div>
                  ))
                )}
              </div>
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