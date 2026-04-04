import React, { useEffect, useState } from 'react';
import { Navigation, Zap, Users, MapPin } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface GoNowLocation {
  location: {
    id: string;
    name: { en: string; zh: string };
    category: string;
    averageRating: number;
    facilities: string[];
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  goNowScore: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  estimatedCrowdPercentage: number;
  distance: number;
  reason: string;
  qualityScore: {
    overallScore: number;
    trustLevel: 'high' | 'medium' | 'low';
    reviewCount: number;
  };
  bestTimeUntil: string;
}

interface GoNowSuggestionsProps {
  lat: number;
  lng: number;
  onSelectLocation?: (locationId: string) => void;
  onNavigate?: (lat: number, lng: number, name: string) => void;
}

/**
 * Smart "Go Now" suggestions component.
 * Shows the best family-friendly venues to visit RIGHT NOW based on:
 * - Current time and predicted crowd levels
 * - Quality scores and ratings
 * - Real-time availability
 * - Distance and travel time
 */
export const GoNowSuggestions: React.FC<GoNowSuggestionsProps> = ({
  lat,
  lng,
  onSelectLocation,
  onNavigate,
}) => {
  const { language } = useTranslation();
  const [suggestions, setSuggestions] = useState<GoNowLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/suggestions/go-now?lat=${lat}&lng=${lng}&radius=5000&limit=5`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch Go Now suggestions');
        }
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (lat && lng) {
      fetchSuggestions();
    }
  }, [lat, lng]);

  const getCrowdColor = (level: string): string => {
    switch (level) {
      case 'low':
        return '#4CAF50';
      case 'moderate':
        return '#FFC107';
      case 'high':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getCrowdLabel = (level: string): string => {
    switch (level) {
      case 'low':
        return language === 'zh' ? '少' : 'Low';
      case 'moderate':
        return language === 'zh' ? '中' : 'Moderate';
      case 'high':
        return language === 'zh' ? '多' : 'High';
      default:
        return level;
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: { zh: string; en: string } } = {
      park: { zh: '公園', en: 'Park' },
      restaurant: { zh: '餐廳', en: 'Restaurant' },
      nursing_room: { zh: '哺乳室', en: 'Nursing Room' },
      medical: { zh: '醫療', en: 'Medical' },
      attraction: { zh: '景點', en: 'Attraction' },
      other: { zh: '其他', en: 'Other' },
    };
    const label = labels[category] || { zh: category, en: category };
    return language === 'zh' ? label.zh : label.en;
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '16px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}
      >
        <Zap size={20} style={{ display: 'inline', marginRight: '8px', color: '#FF9800' }} />
        {language === 'zh' ? '載入建議...' : 'Loading suggestions...'}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '12px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          fontSize: '0.9rem',
        }}
      >
        {language === 'zh' ? '無法載入建議' : 'Failed to load suggestions'}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div
        style={{
          padding: '12px',
          textAlign: 'center',
          color: '#999',
          fontSize: '0.9rem',
        }}
      >
        {language === 'zh' ? '附近沒有建議' : 'No suggestions found'}
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={18} style={{ color: '#FF9800' }} />
        <h3 style={{ margin: '0', fontSize: '1rem', fontWeight: 700 }}>
          {language === 'zh' ? '現在去哪裡' : 'Go Now'}
        </h3>
        <span
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#FF9800',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 600,
          }}
        >
          {language === 'zh' ? '精選' : 'TOP'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {suggestions.map((sugg, index) => (
          <div
            key={sugg.location.id}
            onClick={() => onSelectLocation?.(sugg.location.id)}
            style={{
              padding: '12px',
              border: '2px solid #FF9800',
              borderRadius: '8px',
              backgroundColor: index === 0 ? 'rgba(255, 152, 0, 0.05)' : '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 4px 12px rgba(255, 152, 0, 0.2)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            {index === 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                🔥 {language === 'zh' ? '最推薦' : 'BEST NOW'}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    marginTop: index === 0 ? '16px' : '0',
                  }}
                >
                  <h4 style={{ margin: '0', fontSize: '0.95rem', fontWeight: 600 }}>
                    {language === 'zh'
                      ? sugg.location.name.zh
                      : sugg.location.name.en}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      backgroundColor: '#E3F2FD',
                      color: '#1976D2',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontWeight: 600,
                    }}
                  >
                    {getCategoryLabel(sugg.location.category)}
                  </span>
                </div>

                <p
                  style={{
                    margin: '4px 0',
                    fontSize: '0.85rem',
                    color: '#666',
                    lineHeight: '1.4',
                  }}
                >
                  {sugg.reason}
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users
                      size={14}
                      style={{ color: getCrowdColor(sugg.crowdLevel) }}
                    />
                    <span style={{ color: getCrowdColor(sugg.crowdLevel), fontWeight: 600 }}>
                      {getCrowdLabel(sugg.crowdLevel)} ({sugg.estimatedCrowdPercentage}%)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} style={{ color: '#666' }} />
                    <span>{sugg.distance}m</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⭐ <span>{sugg.qualityScore.overallScore.toFixed(0)}/100</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(sugg.location.coordinates.lat, sugg.location.coordinates.lng, language === 'zh' ? sugg.location.name.zh : sugg.location.name.en);
                }}
                style={{
                  marginLeft: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F57C00';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FF9800';
                }}
              >
                <Navigation size={14} />
                {language === 'zh' ? '去' : 'Go'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#EFF7FF',
          borderLeft: '3px solid #1976D2',
          borderRadius: '4px',
          fontSize: '0.85rem',
          color: '#1565C0',
          fontStyle: 'italic',
        }}
      >
        💡 {language === 'zh' ? '根據目前時間和預測人數推薦' : 'Based on current time & crowd predictions'}
      </div>
    </div>
  );
};
