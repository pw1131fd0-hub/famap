/**
 * Smart Trip Suggestion Panel Component
 * Displays proactive trip recommendations to families
 * Integrates with weather, history, and family preferences
 */

import { useState, useEffect, useCallback } from 'react';
import {
  generateSmartTripSuggestions,
  type TripSuggestion,
} from '../utils/smartTripSuggester';
import { useLanguage } from '../i18n/useLanguage';
import '../styles/SmartTripSuggestionPanel.css';

interface SmartTripSuggestionPanelProps {
  familyProfile: any;
  activityHistory: any[];
  availableVenues: any[];
  currentWeather?: any;
  onTripSelect?: (trip: TripSuggestion) => void;
  onDismiss?: () => void;
}

export function SmartTripSuggestionPanel({
  familyProfile,
  activityHistory,
  availableVenues,
  currentWeather,
  onTripSelect,
  onDismiss,
}: SmartTripSuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<TripSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<TripSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Smart Trip Ideas for Your Family',
      subtitle: 'Personalized suggestions based on your preferences and patterns',
      confidence: 'Confidence',
      satisfaction: 'Expected Satisfaction',
      budget: 'Estimated Budget',
      duration: 'Duration',
      days: 'days',
      venues: 'Venues',
      reasons: 'Why we recommend this',
      when: 'Best time to visit',
      weather: 'Weather outlook',
      crowd: 'Expected crowd',
      packing: 'Packing tips',
      travel_time: 'Travel time',
      minutes: 'minutes',
      plan_trip: 'Plan This Trip',
      dismiss: 'Dismiss',
      no_suggestions: 'No trip suggestions available',
      try_again: 'Try again',
      light: 'Light',
      moderate: 'Moderate',
      heavy: 'Heavy',
    },
    zh: {
      title: '為您的家庭推薦的聰明旅遊想法',
      subtitle: '根據您的偏好和模式的個性化建議',
      confidence: '信心度',
      satisfaction: '預期滿意度',
      budget: '預計預算',
      duration: '行程時長',
      days: '天',
      venues: '場地',
      reasons: '我們推薦的原因',
      when: '最佳造訪時間',
      weather: '天氣前景',
      crowd: '預期人群',
      packing: '行李打包提示',
      travel_time: '旅行時間',
      minutes: '分鐘',
      plan_trip: '計劃這次旅行',
      dismiss: '關閉',
      no_suggestions: '沒有可用的旅行建議',
      try_again: '重試',
      light: '輕微',
      moderate: '中等',
      heavy: '繁重',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const generateSuggestions = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const context = {
        familyProfile,
        recentHistory: activityHistory || [],
        currentWeather: currentWeather || {
          temperature: 25,
          condition: 'sunny',
          humidity: 60,
        },
        upcomingEvents: [],
        budget: familyProfile?.preferences?.budget || 300,
        preferredDuration: 1,
      };

      const newSuggestions = generateSmartTripSuggestions(
        context,
        availableVenues || [],
        3
      );

      setSuggestions(newSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  }, [familyProfile, activityHistory, availableVenues, currentWeather]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  const handleTripSelect = (trip: TripSuggestion) => {
    setSelectedSuggestion(trip);
    onTripSelect?.(trip);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    };
    return date.toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'zh' ? 'zh-TW' : 'en-US', {
      style: 'currency',
      currency: 'TWD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="smart-trip-panel loading">
        <div className="spinner" />
        <p>{language === 'zh' ? '正在生成建議...' : 'Generating suggestions...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="smart-trip-panel error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={generateSuggestions} className="retry-button">
          {t.try_again}
        </button>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="smart-trip-panel empty">
        <div className="empty-icon">🗺️</div>
        <p>{t.no_suggestions}</p>
        <button onClick={generateSuggestions} className="retry-button">
          {t.try_again}
        </button>
      </div>
    );
  }

  return (
    <div className="smart-trip-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{t.title}</h2>
          <p className="panel-subtitle">{t.subtitle}</p>
        </div>
        <button className="close-button" onClick={onDismiss} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="suggestions-container">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.tripId}
            className={`suggestion-card ${selectedSuggestion?.tripId === suggestion.tripId ? 'selected' : ''}`}
            onClick={() => handleTripSelect(suggestion)}
          >
            <div className="suggestion-header">
              <h3 className="suggestion-title">
                {index + 1}. {suggestion.title}
              </h3>
              <span className="confidence-badge">{t.confidence}: {suggestion.confidenceScore}%</span>
            </div>

            <div className="suggestion-meta">
              <div className="meta-item">
                <span className="meta-label">{t.when}</span>
                <span className="meta-value">
                  {formatDate(suggestion.startDate)} - {formatDate(suggestion.endDate)}
                </span>
              </div>

              <div className="meta-row">
                <div className="meta-item">
                  <span className="meta-label">{t.duration}</span>
                  <span className="meta-value">
                    {suggestion.duration} {t.days}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">{t.budget}</span>
                  <span className="meta-value">{formatCurrency(suggestion.estimatedBudget)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">{t.satisfaction}</span>
                  <span className="meta-value">{suggestion.expectedSatisfaction}%</span>
                </div>
              </div>
            </div>

            <div className="suggestion-details">
              <div className="detail-section">
                <h4 className="detail-title">📍 {t.venues}</h4>
                <ul className="venues-list">
                  {suggestion.venues.map(venue => (
                    <li key={venue.id} className="venue-item">
                      <span className="venue-name">
                        {language === 'zh' ? venue.name?.zh : venue.name?.en}
                      </span>
                      <span className="venue-category">{venue.category}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h4 className="detail-title">💭 {t.reasons}</h4>
                <ul className="reasons-list">
                  {suggestion.reasons.map((reason, idx) => (
                    <li key={idx} className="reason-item">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="detail-row">
                <div className="detail-section">
                  <h4 className="detail-title">🌤️ {t.weather}</h4>
                  <p className="detail-value">{suggestion.weatherOutlook}</p>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">👥 {t.crowd}</h4>
                  <p className="detail-value">
                    {t[suggestion.crowdPrediction as 'light' | 'moderate' | 'heavy']}
                  </p>
                </div>
              </div>

              <div className="detail-section">
                <h4 className="detail-title">🎒 {t.packing}</h4>
                <ul className="tips-list">
                  {suggestion.packingTips.slice(0, 3).map((tip, idx) => (
                    <li key={idx} className="tip-item">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h4 className="detail-title">⏱️ {t.travel_time}</h4>
                <p className="detail-value">
                  {Math.round(suggestion.estimatedTravelTime / 60)} {t.minutes}
                </p>
              </div>
            </div>

            <button
              className="plan-button"
              onClick={e => {
                e.stopPropagation();
                handleTripSelect(suggestion);
              }}
            >
              {t.plan_trip} →
            </button>
          </div>
        ))}
      </div>

      <div className="panel-footer">
        <button className="secondary-button" onClick={generateSuggestions}>
          {language === 'zh' ? '刷新建議' : 'Refresh suggestions'}
        </button>
        <button className="secondary-button" onClick={onDismiss}>
          {t.dismiss}
        </button>
      </div>
    </div>
  );
}

export default SmartTripSuggestionPanel;
