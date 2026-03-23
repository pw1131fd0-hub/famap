import { useState, useCallback, useMemo } from 'react';
import { MapPin, X, ArrowRight, Clock, Compass } from 'lucide-react';
import type { Location } from '../types';
import { useTranslation } from '../i18n/useTranslation';

export interface RouteStop {
  location_id: string;
  name: string;
  order: number;
  lat: number;
  lng: number;
  distance_from_previous: number;
  estimated_travel_time: number;
  category: string;
}

export interface OptimizedRoute {
  route_id: string;
  stops: RouteStop[];
  total_distance: number;
  total_travel_time: number;
  total_locations: number;
  created_at: string;
}

interface RoutePlannerProps {
  locations: Location[];
  userLocation: [number, number];
  onRouteSelected?: (route: OptimizedRoute) => void;
  onClose: () => void;
}

export function RoutePlanner({ locations, userLocation, onRouteSelected, onClose }: RoutePlannerProps) {
  const { language } = useTranslation();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLocationSelection = useCallback((locationId: string) => {
    setSelectedLocations(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId].slice(-15) // Max 15 locations
    );
  }, []);

  const handleOptimizeRoute = async () => {
    if (selectedLocations.length === 0) {
      setError(language === 'zh' ? '請選擇至少一個地點' : 'Please select at least one location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/route-planner/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_ids: selectedLocations,
          start_lat: userLocation[0],
          start_lng: userLocation[1],
        }),
      });

      if (!response.ok) throw new Error('Failed to optimize route');
      const route: OptimizedRoute = await response.json();
      setOptimizedRoute(route);
      onRouteSelected?.(route);
    } catch (err) {
      setError(language === 'zh' ? '無法優化路線' : 'Failed to optimize route');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedLocationObjects = useMemo(
    () => locations.filter(loc => selectedLocations.includes(loc.id)),
    [locations, selectedLocations]
  );

  if (optimizedRoute) {
    return (
      <div className="route-planner-results">
        <div className="detail-header">
          <h2>🗺️ {language === 'zh' ? '最優路線' : 'Optimized Route'}</h2>
          <button onClick={onClose} className="close-detail-button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="route-summary">
          <div className="route-stat">
            <Compass size={18} />
            <div>
              <span className="stat-label">{language === 'zh' ? '總距離' : 'Total Distance'}</span>
              <span className="stat-value">{optimizedRoute.total_distance} km</span>
            </div>
          </div>
          <div className="route-stat">
            <Clock size={18} />
            <div>
              <span className="stat-label">{language === 'zh' ? '預計時間' : 'Est. Travel Time'}</span>
              <span className="stat-value">{optimizedRoute.total_travel_time} min</span>
            </div>
          </div>
        </div>

        <div className="route-stops">
          {optimizedRoute.stops.map((stop, index) => (
            <div key={stop.location_id} className="route-stop">
              <div className="stop-number">{index + 1}</div>
              <div className="stop-info">
                <h3>{stop.name}</h3>
                <p className="stop-category">{stop.category}</p>
                {index < optimizedRoute.stops.length - 1 && (
                  <p className="stop-distance">
                    {language === 'zh' ? '距下一站' : 'To next'}: {stop.distance_from_previous} km ({stop.estimated_travel_time} min)
                  </p>
                )}
              </div>
              {index < optimizedRoute.stops.length - 1 && (
                <ArrowRight size={20} className="stop-arrow" />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setOptimizedRoute(null);
            setSelectedLocations([]);
          }}
          className="button button-secondary"
        >
          {language === 'zh' ? '計劃新路線' : 'Plan New Route'}
        </button>
      </div>
    );
  }

  return (
    <div className="route-planner">
      <div className="detail-header">
        <h2>🗺️ {language === 'zh' ? '規劃路線' : 'Plan a Route'}</h2>
        <button onClick={onClose} className="close-detail-button">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="route-planner-info">
        <p>
          {language === 'zh'
            ? `選擇 1-15 個地點來規劃您的完美家庭之旅（已選 ${selectedLocations.length}）`
            : `Select 1-15 locations to plan your perfect family outing (${selectedLocations.length} selected)`}
        </p>
      </div>

      <div className="location-selector">
        {locations.map(location => (
          <button
            key={location.id}
            onClick={() => toggleLocationSelection(location.id)}
            className={`location-selector-item ${selectedLocations.includes(location.id) ? 'selected' : ''}`}
            aria-pressed={selectedLocations.includes(location.id)}
          >
            <div className="selector-checkbox">
              {selectedLocations.includes(location.id) && '✓'}
            </div>
            <div className="selector-info">
              <h4>{location.name.en || location.name.zh}</h4>
              <p className="location-category">{location.category}</p>
            </div>
            <MapPin size={16} className="selector-icon" />
          </button>
        ))}
      </div>

      <div className="selected-locations-preview">
        {selectedLocationObjects.length > 0 && (
          <div>
            <h4 className="preview-title">
              {language === 'zh' ? '已選地點' : 'Selected Locations'}
            </h4>
            <div className="preview-list">
              {selectedLocationObjects.map((loc, idx) => (
                <div key={loc.id} className="preview-item">
                  <span>{idx + 1}. {loc.name.en || loc.name.zh}</span>
                  <button
                    onClick={() => setSelectedLocations(prev => prev.filter(id => id !== loc.id))}
                    className="preview-remove"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleOptimizeRoute}
        disabled={selectedLocations.length === 0 || loading}
        className="button button-primary"
      >
        {loading
          ? language === 'zh' ? '最優化中...' : 'Optimizing...'
          : language === 'zh' ? '規劃最優路線' : 'Optimize Route'}
      </button>
    </div>
  );
}
