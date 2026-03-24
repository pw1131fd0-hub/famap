/**
 * Location Insights Panel Component
 * Displays comprehensive analytics and insights about a location
 * Helps families make informed decisions with clear, actionable metrics
 */

import { TrendingUp, AlertCircle, CheckCircle, Award } from 'lucide-react';
import type { Location, Review, CrowdednessReport } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { generateLocationInsight, assessFamilyCompatibility } from '../utils/locationInsights';
import '../styles/LocationInsightsPanel.css';

interface LocationInsightsPanelProps {
  location: Location;
  reviews: Review[];
  crowdednessReports: CrowdednessReport[];
  familyProfile?: {
    childrenAges: number[];
    specialNeeds?: string[];
    budget?: 'low' | 'medium' | 'high';
    accessibilityNeeds?: string[];
  };
}

export function LocationInsightsPanel({
  location,
  reviews,
  crowdednessReports,
  familyProfile,
}: LocationInsightsPanelProps) {
  const { language } = useTranslation();
  const insights = generateLocationInsight(location, reviews, crowdednessReports);
  const compatibility = assessFamilyCompatibility(location, reviews, familyProfile);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Yellow
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return language === 'zh' ? '很好' : 'Excellent';
    if (score >= 60) return language === 'zh' ? '不錯' : 'Good';
    if (score >= 40) return language === 'zh' ? '尚可' : 'Fair';
    return language === 'zh' ? '需改進' : 'Needs Improvement';
  };

  return (
    <div className="location-insights-panel">
      <div className="insights-header">
        <h3>
          {language === 'zh' ? '地點評估' : 'Location Insights'} ✨
        </h3>
      </div>

      {/* Family Compatibility Score (if profile provided) */}
      {familyProfile && (
        <div className="compatibility-section">
          <h4>{language === 'zh' ? '家庭適合度' : 'Family Compatibility'}</h4>
          <div className="score-display">
            <div className="score-circle">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" className="score-bg" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  className="score-progress"
                  style={{
                    strokeDashoffset: 339.29 * (1 - compatibility.overallScore / 100),
                  }}
                />
                <text x="60" y="65" textAnchor="middle" className="score-text">
                  {compatibility.overallScore}%
                </text>
              </svg>
            </div>
            <div className="score-info">
              <p className="score-label">
                {getScoreLabel(compatibility.overallScore)}
              </p>
              <div className="compatibility-details">
                {compatibility.ageAppropriate && (
                  <div className="detail-item">
                    <CheckCircle size={16} />
                    <span>
                      {language === 'zh' ? '適合您孩子的年齡' : 'Suitable for your kids\' ages'}
                    </span>
                  </div>
                )}
                {compatibility.accessibilityMet && (
                  <div className="detail-item">
                    <CheckCircle size={16} />
                    <span>
                      {language === 'zh' ? '無障礙設施' : 'Accessible'}
                    </span>
                  </div>
                )}
                {compatibility.specialNeedsFriendly && (
                  <div className="detail-item">
                    <CheckCircle size={16} />
                    <span>
                      {language === 'zh' ? '特殊需求友善' : 'Special needs friendly'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {compatibility.reasons.length > 0 && (
            <div className="reasons-section">
              <h5>{language === 'zh' ? '為什麼適合' : 'Why it\'s suitable'}</h5>
              <ul>
                {compatibility.reasons.map((reason, idx) => (
                  <li key={idx}>
                    <CheckCircle size={14} />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {compatibility.improvements.length > 0 && (
            <div className="improvements-section">
              <h5>{language === 'zh' ? '可改進的地方' : 'Areas to consider'}</h5>
              <ul>
                {compatibility.improvements.map((improvement, idx) => (
                  <li key={idx}>
                    <AlertCircle size={14} />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-section">
        <h4>{language === 'zh' ? '關鍵指標' : 'Key Metrics'}</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">
              {language === 'zh' ? '家庭適合度' : 'Family Suitability'}
            </div>
            <div className="metric-value">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${insights.familySuitabilityScore}%`,
                    backgroundColor: getScoreColor(insights.familySuitabilityScore),
                  }}
                />
              </div>
              <span className="metric-number">{insights.familySuitabilityScore}%</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">
              {language === 'zh' ? '無障礙程度' : 'Accessibility'}
            </div>
            <div className="metric-value">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${insights.accessibilityScore}%`,
                    backgroundColor: getScoreColor(insights.accessibilityScore),
                  }}
                />
              </div>
              <span className="metric-number">{insights.accessibilityScore}%</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">
              {language === 'zh' ? '驗證程度' : 'Verification'}
            </div>
            <div className="metric-value">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${insights.verificationScore}%`,
                    backgroundColor: getScoreColor(insights.verificationScore),
                  }}
                />
              </div>
              <span className="metric-number">{insights.verificationScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best Time to Visit */}
      {insights.bestTimeToVisit !== 'No data available' && (
        <div className="best-time-section">
          <h4>
            <TrendingUp size={18} />
            {language === 'zh' ? '最佳訪問時間' : 'Best Time to Visit'}
          </h4>
          <p className="best-time-value">{insights.bestTimeToVisit}</p>
          {insights.averageCrowdiness !== 'unknown' && (
            <p className="crowdiness-info">
              {language === 'zh' ? '平均擁擠度: ' : 'Average crowdiness: '}
              <span className={`crowdiness-${insights.averageCrowdiness}`}>
                {language === 'zh'
                  ? {
                      light: '輕鬆',
                      moderate: '中等',
                      heavy: '繁忙',
                      unknown: '未知',
                    }[insights.averageCrowdiness]
                  : insights.averageCrowdiness}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Recommended Age Groups */}
      {insights.recommendedAgeGroups.length > 0 && (
        <div className="age-groups-section">
          <h4>
            <Award size={18} />
            {language === 'zh' ? '推薦年齡' : 'Recommended Ages'}
          </h4>
          <div className="age-groups-list">
            {insights.recommendedAgeGroups.map((ageGroup, idx) => (
              <span key={idx} className="age-group-tag">
                {ageGroup}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Strengths */}
      {insights.topStrengths.length > 0 && (
        <div className="strengths-section">
          <h4>{language === 'zh' ? '主要優勢' : 'Top Strengths'}</h4>
          <ul className="insights-list">
            {insights.topStrengths.map((strength, idx) => (
              <li key={idx}>
                <CheckCircle size={16} style={{ color: '#4CAF50' }} />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Concerns */}
      {insights.commonConcerns.length > 0 && (
        <div className="concerns-section">
          <h4>{language === 'zh' ? '常見疑慮' : 'Common Concerns'}</h4>
          <ul className="insights-list">
            {insights.commonConcerns.map((concern, idx) => (
              <li key={idx}>
                <AlertCircle size={16} style={{ color: '#FF9800' }} />
                {concern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Quality Info */}
      <div className="data-quality-section">
        <p className="data-quality-text">
          {language === 'zh'
            ? `基於 ${insights.totalReviews} 則評論分析`
            : `Based on analysis of ${insights.totalReviews} reviews`}
        </p>
        <p className="data-quality-text" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          {language === 'zh' ? '最後更新: ' : 'Last updated: '}
          {new Date(insights.lastUpdated).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US')}
        </p>
      </div>
    </div>
  );
}
