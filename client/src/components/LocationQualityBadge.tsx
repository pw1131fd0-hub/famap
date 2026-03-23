import React from 'react';

interface LocationQualityBadgeProps {
  score: number;
  trustLevel: 'high' | 'medium' | 'low';
  reviewCount: number;
}

/**
 * Displays a quality badge for a location based on community feedback.
 * Helps families quickly assess location trustworthiness.
 */
export const LocationQualityBadge: React.FC<LocationQualityBadgeProps> = ({
  score,
  trustLevel,
  reviewCount,
}) => {
  const getColor = () => {
    if (trustLevel === 'high') return '#4CAF50'; // Green
    if (trustLevel === 'medium') return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const getTrustLabel = () => {
    if (trustLevel === 'high') return 'Highly Trusted';
    if (trustLevel === 'medium') return 'Verified';
    return 'New';
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: `${getColor()}15`,
        border: `2px solid ${getColor()}`,
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}
    >
      <span style={{ color: getColor() }}>{score.toFixed(1)}</span>
      <span style={{ fontSize: '0.75rem', color: '#666' }}>
        {getTrustLabel()} • {reviewCount} reviews
      </span>
    </div>
  );
};
