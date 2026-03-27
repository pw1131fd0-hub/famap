/**
 * Best Time Visit Recommender Component
 * Shows users the best times to visit a location based on various factors
 */

import React, { useState, useMemo } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import type { Location } from '../types';
import { predictBestTimes, calculateFamilySuitabilityScore } from '../utils/bestTimeVisitPredictor';
import { useTranslation } from '../i18n/useTranslation';

interface BestTimeVisitRecommenderProps {
  location: Location;
  familyProfile?: {
    childrenAges: number[];
    preferredActivityType: string;
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'any';
    crowdTolerance: 'low' | 'medium' | 'high';
    mobilityNeeds: boolean;
  };
}

export const BestTimeVisitRecommender: React.FC<BestTimeVisitRecommenderProps> = ({
  location,
  familyProfile,
}) => {
  const { language } = useTranslation();
  const [expandedCard, setExpandedCard] = useState<number | null>(0);

  const recommendations = useMemo(() => {
    const locationType = (location.category || 'other').replace('_', '') as any;
    return predictBestTimes({
      locationId: location.id,
      locationCategory: location.category || 'other',
      locationType,
      familyProfile,
      historicalData: {
        averageCrowdByDayOfWeek: {
          'Monday': 40,
          'Tuesday': 35,
          'Wednesday': 38,
          'Thursday': 42,
          'Friday': 55,
          'Saturday': 75,
          'Sunday': 80,
        },
        averageCrowdByTime: {
          '09:00': 45,
          '12:00': 75,
          '15:00': 50,
          '18:00': 65,
        },
        popularTimes: ['Saturday 10:00-12:00', 'Sunday 14:00-16:00'],
        quietTimes: ['Tuesday 09:00-11:00', 'Wednesday 14:00-16:00'],
      },
    });
  }, [location, familyProfile]);

  const suitabilityScore = useMemo(
    () => calculateFamilySuitabilityScore(location, familyProfile),
    [location, familyProfile]
  );

  const formatDate = (date: Date): string => {
    if (language === 'zh') {
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeWindow: string): string => {
    return timeWindow.replace('-', ' - ');
  };

  const getCrowdColor = (level: string): string => {
    const colors: Record<string, string> = {
      'very_light': '#4ade80',
      'light': '#84cc16',
      'moderate': '#facc15',
      'busy': '#f97316',
      'very_busy': '#dc2626',
    };
    return colors[level] || '#gray';
  };

  const getCrowdLabel = (level: string): string => {
    const labels: Record<string, Record<string, string>> = {
      'en': {
        'very_light': 'Very Light',
        'light': 'Light',
        'moderate': 'Moderate',
        'busy': 'Busy',
        'very_busy': 'Very Busy',
      },
      'zh': {
        'very_light': '非常少',
        'light': '稍少',
        'moderate': '中等',
        'busy': '擁擠',
        'very_busy': '非常擁擠',
      },
    };
    return labels[language][level] || level;
  };

  const getWeatherIcon = (condition: string): string => {
    const icons: Record<string, string> = {
      'excellent': '☀️',
      'good': '🌤️',
      'fair': '☁️',
      'poor': '🌧️',
    };
    return icons[condition] || '🌤️';
  };

  const topRecommendation = recommendations[0];

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
        <Clock size={20} style={{ color: '#0066cc' }} />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
          {language === 'zh' ? '最佳訪問時間' : 'Best Times to Visit'}
        </h3>
      </div>

      {/* Suitability Score */}
      {familyProfile && (
        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fff', borderRadius: '6px', borderLeft: `4px solid ${suitabilityScore > 75 ? '#4ade80' : suitabilityScore > 50 ? '#facc15' : '#f97316'}` }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            {language === 'zh' ? '家庭適合度' : 'Family Suitability'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${suitabilityScore}%`,
                height: '100%',
                backgroundColor: suitabilityScore > 75 ? '#4ade80' : suitabilityScore > 50 ? '#facc15' : '#f97316',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333', minWidth: '40px' }}>
              {Math.round(suitabilityScore)}%
            </span>
          </div>
        </div>
      )}

      {/* Top Recommendation Card */}
      {topRecommendation && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          border: '2px solid #4ade80',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {topRecommendation.dayOfWeek} • {formatDate(topRecommendation.date)}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                {formatTime(topRecommendation.timeWindow)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px' }}>{getWeatherIcon(topRecommendation.weatherCondition)}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {language === 'zh' ? '推薦' : 'Recommended'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            <div style={{ fontSize: '13px', color: '#666' }}>
              <span style={{ fontWeight: '600' }}>{language === 'zh' ? '人潮' : 'Crowd'}</span>
              <div style={{
                display: 'inline-block',
                marginLeft: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: getCrowdColor(topRecommendation.crowdLevel),
                color: '#fff',
                fontSize: '12px',
              }}>
                {getCrowdLabel(topRecommendation.crowdLevel)}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              <span style={{ fontWeight: '600' }}>{language === 'zh' ? '等待時間' : 'Wait Time'}</span>
              <div style={{ marginLeft: '4px', display: 'inline-block' }}>
                ~{topRecommendation.expectedWaitTime} min
              </div>
            </div>
          </div>

          {topRecommendation.reasonsToVisit.length > 0 && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
              {topRecommendation.reasonsToVisit.map((reason, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#2e7d32', marginBottom: idx < topRecommendation.reasonsToVisit.length - 1 ? '4px' : 0 }}>
                  <CheckCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other Recommendations */}
      <div style={{ maxHeight: expandedCard === null ? '0' : 'none', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
        {recommendations.slice(1).map((rec, idx) => (
          <div
            key={idx + 1}
            style={{
              backgroundColor: '#fff',
              borderRadius: '6px',
              padding: '10px',
              marginBottom: '8px',
              border: '1px solid #ddd',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                  {rec.dayOfWeek} • {formatDate(rec.date)}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                  {formatTime(rec.timeWindow)} • {getCrowdLabel(rec.crowdLevel)}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '20px' }}>{getWeatherIcon(rec.weatherCondition)}</div>
                <div style={{
                  width: '40px',
                  height: '24px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: rec.suitabilityScore > 75 ? '#4ade80' : rec.suitabilityScore > 50 ? '#f97316' : '#dc2626',
                }}>
                  {Math.round(rec.suitabilityScore)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {recommendations.length > 1 && (
        <button
          onClick={() => setExpandedCard(expandedCard === null ? 0 : null)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#0066cc',
            cursor: 'pointer',
            marginTop: '8px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#e0e0e0';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0';
          }}
        >
          {expandedCard === null
            ? language === 'zh' ? '查看所有時間' : 'View All Times'
            : language === 'zh' ? '隱藏' : 'Hide'}
        </button>
      )}
    </div>
  );
};

export default BestTimeVisitRecommender;
