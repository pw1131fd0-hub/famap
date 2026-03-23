import React, { useEffect, useState } from 'react';
import { LocationQualityBadge } from './LocationQualityBadge';

interface TrendingLocation {
  location: {
    id: string;
    name: { en: string; zh: string };
    category: string;
    averageRating: number;
  };
  trendingScore: number;
  qualityScore: {
    overallScore: number;
    trustLevel: 'high' | 'medium' | 'low';
    reviewCount: number;
  };
  reason: string;
}

interface TrendingLocationsProps {
  limit?: number;
  onSelectLocation?: (locationId: string) => void;
  language?: 'en' | 'zh';
}

/**
 * Displays trending locations based on recent activity.
 * Shows families what other parents are enjoying right now.
 */
export const TrendingLocations: React.FC<TrendingLocationsProps> = ({
  limit = 8,
  onSelectLocation,
  language = 'en',
}) => {
  const [trending, setTrending] = useState<TrendingLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recommendations/trending?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trending locations');
        }
        const data = await response.json();
        setTrending(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [limit]);

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        Loading trending locations...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
        }}
      >
        Error: {error}
      </div>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600 }}>
        🔥 Trending Now
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '10px',
        }}
      >
        {trending.map((item) => (
          <div
            key={item.location.id}
            onClick={() => onSelectLocation?.(item.location.id)}
            style={{
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: '#fff8e1',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 2px 8px rgba(255, 152, 0, 0.3)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>
              {language === 'zh'
                ? item.location.name.zh
                : item.location.name.en}
            </h4>
            <div style={{ marginBottom: '8px' }}>
              <LocationQualityBadge
                score={item.qualityScore.overallScore}
                trustLevel={item.qualityScore.trustLevel}
                reviewCount={item.qualityScore.reviewCount}
              />
            </div>
            <p
              style={{
                margin: '0',
                fontSize: '0.75rem',
                color: '#555',
              }}
            >
              {item.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
