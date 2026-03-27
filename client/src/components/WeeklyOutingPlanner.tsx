import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, DollarSign, TrendingUp, AlertCircle, Lightbulb, ChevronRight } from 'lucide-react';
import type { Location, ActivityHistoryEntry } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import {
  generateWeeklyOutingSuggestions,
  calculateWeeklyScore,
  type DetailedWeeklySuggestion,
} from '../utils/weeklyOutingPlanner';
import '../styles/WeeklyOutingPlanner.css';

interface WeeklyOutingPlannerProps {
  locations: Location[];
  activityHistory?: ActivityHistoryEntry[];
  onSelectLocation?: (location: Location) => void;
}

export function WeeklyOutingPlanner({
  locations,
  activityHistory = [],
  onSelectLocation,
}: WeeklyOutingPlannerProps) {
  const { language } = useTranslation();
  const [suggestions, setSuggestions] = useState<DetailedWeeklySuggestion[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    // Simulate async operation for suggestions
    setTimeout(() => {
      const newSuggestions = generateWeeklyOutingSuggestions(
        locations,
        activityHistory
      );
      setSuggestions(newSuggestions);
      setOverallScore(calculateWeeklyScore(newSuggestions));
      setIsLoading(false);
    }, 500);
  }, [locations, activityHistory]);

  if (isLoading) {
    return (
      <div className="weekly-outing-planner loading">
        <div className="loading-spinner" />
        <p>{language === 'zh' ? '正在規劃您的週末...' : 'Planning your week...'}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="weekly-outing-planner empty-state">
        <AlertCircle size={48} />
        <h3>{language === 'zh' ? '暫無建議' : 'No Suggestions'}</h3>
        <p>{language === 'zh' ? '造訪更多地點以獲得個人化建議' : 'Visit more locations to get personalized suggestions'}</p>
      </div>
    );
  }

  const totalBudget = suggestions.reduce((sum, s) => sum + s.costEstimate, 0);

  return (
    <div className="weekly-outing-planner">
      <div className="planner-header">
        <div className="header-content">
          <h2>
            <Calendar size={24} />
            {language === 'zh' ? '本週推薦' : 'Weekly Suggestions'}
          </h2>
          <p className="subtitle">
            {language === 'zh' ? '為您的家庭規劃完美的週末' : 'Perfect outings planned for your family'}
          </p>
        </div>
        <div className="quality-badge">
          <TrendingUp size={20} />
          <span className="score">{overallScore}/100</span>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h4>{language === 'zh' ? '總預算' : 'Total Budget'}</h4>
          <p className="amount">NT${totalBudget.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>{language === 'zh' ? '推薦數' : 'Suggestions'}</h4>
          <p className="amount">{suggestions.length}</p>
        </div>
        <div className="summary-card">
          <h4>{language === 'zh' ? '平均評分' : 'Avg Rating'}</h4>
          <p className="amount">⭐{(overallScore / 20).toFixed(1)}</p>
        </div>
      </div>

      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.dayOfWeek}-${index}`}
            className={`suggestion-card ${expandedDay === suggestion.dayOfWeek ? 'expanded' : ''}`}
          >
            <div
              className="suggestion-header"
              onClick={() => setExpandedDay(
                expandedDay === suggestion.dayOfWeek ? null : suggestion.dayOfWeek
              )}
            >
              <div className="day-info">
                <h3>{suggestion.dayOfWeek}</h3>
                <div className="location-name">{suggestion.suggestedLocation.name.en}</div>
              </div>
              <div className="suggestion-meta">
                <div className="score-badge">
                  <span className="score-value">{suggestion.score}</span>
                  <span className="score-label">{language === 'zh' ? '分' : 'pts'}</span>
                </div>
                <ChevronRight size={20} className={`chevron ${expandedDay === suggestion.dayOfWeek ? 'open' : ''}`} />
              </div>
            </div>

            {expandedDay === suggestion.dayOfWeek && (
              <div className="suggestion-details">
                <div className="detail-section">
                  <h4>{language === 'zh' ? '地點詳情' : 'Location Details'}</h4>
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{suggestion.suggestedLocation.address?.en || 'Address TBD'}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{suggestion.recommendedTimeOfDay} {language === 'zh' ? '時段最佳' : 'is best'}</span>
                  </div>
                  <div className="detail-item">
                    <DollarSign size={16} />
                    <span>NT${suggestion.costEstimate.toLocaleString()}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>{language === 'zh' ? '為什麼是好選擇？' : 'Why a Great Choice?'}</h4>
                  <ul className="reasons-list">
                    {suggestion.whyGoodChoice.map((reason, idx) => (
                      <li key={idx}>
                        <Lightbulb size={14} />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>{language === 'zh' ? '家族滿意度預估' : 'Expected Satisfaction'}</h4>
                  <div className="satisfaction-bar">
                    <div
                      className="satisfaction-fill"
                      style={{
                        width: `${suggestion.expectedSatisfaction}%`,
                        backgroundColor: `hsl(${120 - suggestion.expectedSatisfaction}, 70%, 50%)`,
                      }}
                    />
                  </div>
                  <p className="satisfaction-text">{suggestion.expectedSatisfaction}% 滿意度</p>
                </div>

                {suggestion.alternativeOptions.length > 0 && (
                  <div className="detail-section">
                    <h4>{language === 'zh' ? '替代選項' : 'Alternatives'}</h4>
                    <div className="alternatives-list">
                      {suggestion.alternativeOptions.map((alt) => (
                        <div
                          key={alt.id}
                          className="alternative-item"
                          onClick={() => onSelectLocation?.(alt)}
                        >
                          <span className="alt-name">{alt.name.en}</span>
                          <span className="alt-rating">⭐{(alt.averageRating || 3).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="action-button"
                  onClick={() => onSelectLocation?.(suggestion.suggestedLocation)}
                >
                  {language === 'zh' ? '選擇此地點' : 'Select This Location'} →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
