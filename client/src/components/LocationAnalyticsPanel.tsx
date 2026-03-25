import React, { useMemo } from 'react';
import {
  calculateRatingDistribution,
  calculateAverageRating,
  calculateTrendScore,
  calculateRecommenderScore,
  calculateCommunityEngagement,
  generateAnalyticsInsights,
  getAnalyticsRecommendationText,
  type LocationAnalytics,
  type TrendData,
  type AnalyticsInsight,
} from '../utils/analyticsEngine';
import { useI18n } from '../hooks/useI18n';

interface LocationAnalyticsPanelProps {
  locationId: string;
  locationName: string;
  ratings: number[];
  reviewCount: number;
  trendData?: TrendData[];
}

/**
 * LocationAnalyticsPanel - Displays comprehensive analytics and insights for a location
 * Shows rating distribution, trends, community engagement, and recommendations
 */
const LocationAnalyticsPanel: React.FC<LocationAnalyticsPanelProps> = ({
  locationId,
  locationName,
  ratings,
  reviewCount,
  trendData = [],
}) => {
  const { isZh } = useI18n();

  const analytics = useMemo<LocationAnalytics>(() => {
    const avgRating = calculateAverageRating(ratings);
    const distribution = calculateRatingDistribution(ratings);
    const trend = calculateTrendScore(trendData);
    const recommenderScore = calculateRecommenderScore(avgRating, reviewCount, trend);
    const engagement = calculateCommunityEngagement(reviewCount, distribution);

    return {
      locationId,
      totalReviews: reviewCount,
      averageRating: avgRating,
      ratingDistribution: distribution,
      trendScore: trend,
      visitSentiment: avgRating >= 4 ? 'very_positive' : avgRating >= 3 ? 'neutral' : 'negative',
      recommenderScore,
      communityEngagement: engagement,
      lastUpdated: new Date().toISOString(),
    };
  }, [locationId, ratings, reviewCount, trendData]);

  const insights = useMemo<AnalyticsInsight[]>(
    () => generateAnalyticsInsights(analytics),
    [analytics]
  );

  const recommendationText = useMemo(
    () => getAnalyticsRecommendationText(analytics),
    [analytics]
  );

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'very_positive':
        return '#4CAF50';
      case 'positive':
        return '#8BC34A';
      case 'neutral':
        return '#FFC107';
      case 'negative':
        return '#FF9800';
      case 'very_negative':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getRatingBarColor = (rating: number): string => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 4) return '#8BC34A';
    if (rating >= 3) return '#FFC107';
    if (rating >= 2) return '#FF9800';
    return '#F44336';
  };

  const renderRatingDistribution = (): React.ReactNode => {
    const maxCount = Math.max(...Object.values(analytics.ratingDistribution), 1);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = analytics.ratingDistribution[rating];
          const percentage = ((count / analytics.totalReviews) * 100).toFixed(0);

          return (
            <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '30px', textAlign: 'right', fontSize: '14px' }}>
                {rating}⭐
              </span>
              <div
                style={{
                  flex: 1,
                  height: '20px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: getRatingBarColor(rating),
                    width: `${(count / maxCount) * 100}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span
                style={{
                  width: '50px',
                  textAlign: 'right',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderInsights = (): React.ReactNode => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {insights.map((insight, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px',
              backgroundColor:
                insight.type === 'positive' ? '#f1f8e9' : insight.type === 'neutral' ? '#fff3e0' : '#f3e5f5',
              border: `1px solid ${insight.type === 'positive' ? '#c5e1a5' : insight.type === 'neutral' ? '#ffe0b2' : '#ce93d8'}`,
              borderRadius: '8px',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{insight.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
              {insight.title}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {insight.value}
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              {insight.description}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrendIndicator = (): React.ReactNode => {
    const trendPercent = (analytics.trendScore * 100).toFixed(0);
    const trendColor = analytics.trendScore > 0 ? '#4CAF50' : analytics.trendScore < 0 ? '#F44336' : '#FFC107';
    const trendIcon = analytics.trendScore > 0 ? '📈' : analytics.trendScore < 0 ? '📉' : '➡️';

    return (
      <div
        style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderLeft: `4px solid ${trendColor}`,
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>{trendIcon}</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {isZh ? '趨勢' : 'Trend'}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {analytics.trendScore > 0.3
            ? isZh
              ? '評分上升中'
              : 'Ratings improving'
            : analytics.trendScore < -0.3
              ? isZh
                ? '評分下降中'
                : 'Ratings declining'
              : isZh
                ? '評分穩定'
                : 'Ratings stable'}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: trendColor }}>
          {trendPercent}%
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#fff' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>
          {isZh ? '位置分析' : 'Location Analytics'}
        </h2>
        <p style={{ margin: '0', color: '#999', fontSize: '14px' }}>{locationName}</p>
      </div>

      {/* Overall Rating Card */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: getRatingBarColor(analytics.averageRating) }}>
          {analytics.averageRating.toFixed(1)}/5 ⭐
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {isZh ? '基於' : 'Based on'} {analytics.totalReviews} {isZh ? '則評論' : 'reviews'}
        </div>
        <div
          style={{
            fontSize: '13px',
            color: getSentimentColor(analytics.visitSentiment),
            fontWeight: 'bold',
            marginTop: '8px',
          }}
        >
          {recommendationText}
        </div>
      </div>

      {/* Rating Distribution */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
          {isZh ? '評分分佈' : 'Rating Distribution'}
        </h3>
        {renderRatingDistribution()}
      </div>

      {/* Trend */}
      {trendData.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {renderTrendIndicator()}
        </div>
      )}

      {/* Key Metrics */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
          {isZh ? '關鍵指標' : 'Key Metrics'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {isZh ? '推薦分數' : 'Recommender Score'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2', marginTop: '4px' }}>
              {analytics.recommenderScore}
            </div>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {isZh ? '社區參與度' : 'Engagement'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2', marginTop: '4px' }}>
              {analytics.communityEngagement}%
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
          {isZh ? '智慧洞察' : 'Smart Insights'}
        </h3>
        {renderInsights()}
      </div>
    </div>
  );
};

export default LocationAnalyticsPanel;
