import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Filter } from 'lucide-react';
import type { Location } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { createGlowingIcon } from '../config/mapConfig';

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

interface MapPanelProps {
  position: [number, number];
  zoom: number;
  locations: Location[];
  loading: boolean;
  onLocationClick: (location: Location) => void;
  onSearchAreaClick: () => void;
  onPositionChange?: (pos: [number, number]) => void;
}

export function MapPanel({
  position,
  zoom,
  locations,
  loading,
  onLocationClick,
  onSearchAreaClick,
  onPositionChange,
}: MapPanelProps) {
  const { language, t } = useTranslation();

  return (
    <main className="map-view">
      <MapContainer center={position} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={position} zoom={zoom} />
        <MapEvents onPositionChange={onPositionChange || (() => {})} />
        <MarkerClusterGroup chunkedLoading>
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={createGlowingIcon(loc.category)}
              eventHandlers={{
                click: () => onLocationClick(loc),
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
          <button className="search-here-button" onClick={onSearchAreaClick}>
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
  );
}
