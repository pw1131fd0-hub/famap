import React, { useEffect, useState } from 'react';
import { LocationQualityBadge } from './LocationQualityBadge';

interface LocationQualityScore {
  locationId: string;
  overallScore: number;
  ratingScore: number;
  recencyScore: number;
  verificationScore: number;
  communityTrustScore: number;
  trustLevel: 'high' | 'medium' | 'low';
  reviewCount: number;
  isVerified: boolean;
  recommendationReason: string;
}

interface RecommendedLocation {
  location: {
    id: string;
    name: { en: string; zh: string };
    category: string;
    averageRating: number;
    facilities: string[];
  };
  qualityScore: LocationQualityScore;
  recommendationScore: number;
  matchReason: string;
}

interface RecommendedLocationsProps {
  lat: number;
  lng: number;
  onSelectLocation?: (locationId: string) => void;
  limit?: number;
  language?: 'en' | 'zh';
}

/**
 * Displays a list of recommended locations based on quality scores.
 * Helps families discover trusted and well-reviewed venues.
 */
export const RecommendedLocations: React.FC<RecommendedLocationsProps> = ({
  lat,
  lng,
  onSelectLocation,
  limit = 5,
  language = 'en',
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/recommendations/nearby?lat=${lat}&lng=${lng}&radius=2000&limit=${limit}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        const data = await response.json();
        setRecommendations(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (lat && lng) {
      fetchRecommendations();
    }
  }, [lat, lng, limit]);

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        Loading recommendations...
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

  if (recommendations.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
        No recommendations found in this area.
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600 }}>
        Recommended for Families
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recommendations.map((rec) => (
          <div
            key={rec.location.id}
            onClick={() => onSelectLocation?.(rec.location.id)}
            style={{
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: '#fafafa',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 2px 8px rgba(0,0,0,0.1)';
              (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fafafa';
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
                  {language === 'zh'
                    ? rec.location.name.zh
                    : rec.location.name.en}
                </h4>
                <p
                  style={{
                    margin: '0',
                    fontSize: '0.75rem',
                    color: '#666',
                  }}
                >
                  {rec.matchReason}
                </p>
              </div>
              <LocationQualityBadge
                score={rec.qualityScore.overallScore}
                trustLevel={rec.qualityScore.trustLevel}
                reviewCount={rec.qualityScore.reviewCount}
              />
            </div>
            <p
              style={{
                margin: '8px 0 0 0',
                fontSize: '0.8rem',
                color: '#555',
                fontStyle: 'italic',
              }}
            >
              💡 {rec.qualityScore.recommendationReason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
