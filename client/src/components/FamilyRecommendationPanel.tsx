import React, { useState, useMemo } from 'react';
import {
  getPersonalizedRecommendations,
} from '../utils/familyRecommender';
import type {
  RecommendationResult,
  LocationWithReviews,
  FamilyProfile,
  UserInteractionHistory,
} from '../utils/familyRecommender';
import { useLanguage } from '../i18n/LanguageContext';
import styles from '../styles/FamilyRecommendationPanel.module.css';

interface FamilyRecommendationPanelProps {
  venues: LocationWithReviews[];
  familyProfile?: FamilyProfile;
  userHistory?: UserInteractionHistory;
  isDarkMode?: boolean;
  onVenueSelect?: (venueId: string) => void;
}

const FamilyRecommendationPanel: React.FC<FamilyRecommendationPanelProps> = ({
  venues,
  familyProfile,
  userHistory,
  isDarkMode = false,
  onVenueSelect,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'top' | 'similar' | 'new'>('top');

  const isZh = language === 'zh';

  // Default family profile
  const defaultFamilyProfile: FamilyProfile = familyProfile || {
    childrenAges: [5],
    interests: ['playground', 'family'],
    accessibilityNeeds: ['stroller_accessible'],
    dietaryRestrictions: [],
    budgetLevel: 'moderate',
    preferredDistance: 15,
  };

  // Default user history
  const defaultUserHistory: UserInteractionHistory = userHistory || {
    searchTerms: [],
    viewedLocations: [],
    favoriteLocations: [],
    previousVisits: [],
  };

  // Get recommendations
  const recommendations = useMemo(() => {
    return getPersonalizedRecommendations(
      venues,
      defaultFamilyProfile,
      defaultUserHistory,
      {
        limit: 5,
        language: isZh ? 'zh' : 'en',
        includeNewVenues: true,
        boostTrending: true,
      }
    );
  }, [venues, defaultFamilyProfile, defaultUserHistory, isZh]);

  const translations = {
    title: isZh ? '個性化推薦' : 'Personalized Recommendations',
    topRecommendations: isZh ? '最佳推薦' : 'Top Recommendations',
    similarVenues: isZh ? '類似地點' : 'Similar Venues',
    newVenues: isZh ? '新發現' : 'New Discoveries',
    matchScore: isZh ? '匹配度' : 'Match Score',
    confidence: isZh ? '信心度' : 'Confidence',
    why: isZh ? '為什麼推薦' : 'Why recommended',
    location: isZh ? '地點' : 'Location',
    rating: isZh ? '評分' : 'Rating',
    reviews: isZh ? '評論數' : 'Reviews',
    distance: isZh ? '距離' : 'Distance',
    km: isZh ? '公里' : 'km',
    ageGroup: isZh ? '年齡組' : 'Age Group',
    budget: isZh ? '預算' : 'Budget',
    accessibility: isZh ? '無障礙' : 'Accessibility',
    empty: isZh ? '暫無推薦' : 'No recommendations',
    emptyMessage: isZh
      ? '新增地點或搜尋以獲得推薦'
      : 'Add locations or search to get recommendations',
  };

  const renderRecommendationCard = (rec: RecommendationResult) => {
    const bgColorClass =
      rec.score >= 80
        ? 'bg-green'
        : rec.score >= 60
          ? 'bg-yellow'
          : 'bg-orange';

    const venue = venues.find(v => v.id === rec.venueId);
    if (!venue) return null;

    return (
      <div
        key={rec.venueId}
        className={`${styles.recommendationCard} ${isDarkMode ? styles.dark : styles.light}`}
        onClick={() => onVenueSelect?.(rec.venueId)}
        role="button"
        tabIndex={0}
      >
        {/* Header with name and score */}
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.venueName}>
              {isZh ? venue.name.zh : venue.name.en}
            </h3>
            <p className={styles.venueCategory}>{venue.category}</p>
          </div>
          <div className={`${styles.scoreBox} ${styles[bgColorClass]}`}>
            <div className={styles.scoreValue}>{Math.round(rec.score)}</div>
            <div className={styles.scoreLabel}>{translations.matchScore}</div>
          </div>
        </div>

        {/* Venue details */}
        <div className={styles.venueDetails}>
          <div className={styles.detailRow}>
            <span className={styles.label}>{translations.rating}</span>
            <span className={styles.value}>⭐ {venue.averageRating.toFixed(1)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>{translations.reviews}</span>
            <span className={styles.value}>{venue.reviewCount}</span>
          </div>
          {venue.distance !== undefined && (
            <div className={styles.detailRow}>
              <span className={styles.label}>{translations.distance}</span>
              <span className={styles.value}>
                {venue.distance.toFixed(1)} {translations.km}
              </span>
            </div>
          )}
          {venue.price !== undefined && venue.price > 0 && (
            <div className={styles.detailRow}>
              <span className={styles.label}>{translations.budget}</span>
              <span className={styles.value}>NT${venue.price}</span>
            </div>
          )}
        </div>

        {/* Match factors visualization */}
        <div className={styles.matchFactors}>
          <div className={styles.factorRow}>
            <span className={styles.factorLabel}>Age Fit</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{
                  width: `${rec.matchFactors.ageCompatibility}%`,
                  backgroundColor:
                    rec.matchFactors.ageCompatibility >= 80
                      ? '#4CAF50'
                      : '#FFC107',
                }}
              />
            </div>
            <span className={styles.factorValue}>
              {rec.matchFactors.ageCompatibility}%
            </span>
          </div>

          <div className={styles.factorRow}>
            <span className={styles.factorLabel}>Interests</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{
                  width: `${rec.matchFactors.interestMatch}%`,
                  backgroundColor:
                    rec.matchFactors.interestMatch >= 80
                      ? '#4CAF50'
                      : '#FFC107',
                }}
              />
            </div>
            <span className={styles.factorValue}>
              {rec.matchFactors.interestMatch}%
            </span>
          </div>

          <div className={styles.factorRow}>
            <span className={styles.factorLabel}>Access</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{
                  width: `${rec.matchFactors.accessibilityMatch}%`,
                  backgroundColor:
                    rec.matchFactors.accessibilityMatch >= 80
                      ? '#4CAF50'
                      : '#FFC107',
                }}
              />
            </div>
            <span className={styles.factorValue}>
              {rec.matchFactors.accessibilityMatch}%
            </span>
          </div>

          <div className={styles.factorRow}>
            <span className={styles.factorLabel}>Quality</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{
                  width: `${rec.matchFactors.populityScore}%`,
                  backgroundColor:
                    rec.matchFactors.populityScore >= 80
                      ? '#4CAF50'
                      : '#FFC107',
                }}
              />
            </div>
            <span className={styles.factorValue}>
              {rec.matchFactors.populityScore}%
            </span>
          </div>
        </div>

        {/* Reasons */}
        {rec.reasons && (rec.reasons.en.length > 0 || rec.reasons.zh.length > 0) && (
          <div className={styles.reasons}>
            <h4 className={styles.reasonsTitle}>{translations.why}</h4>
            <ul className={styles.reasonsList}>
              {(isZh ? rec.reasons.zh : rec.reasons.en).map((reason, idx) => (
                <li key={idx} className={styles.reasonItem}>
                  ✓ {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confidence indicator */}
        <div className={styles.confidence}>
          <span className={styles.confidenceLabel}>
            {translations.confidence}: {rec.confidence}%
          </span>
          <div className={styles.confidenceBar}>
            <div
              className={styles.confidenceProgress}
              style={{ width: `${rec.confidence}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${styles.panel} ${isDarkMode ? styles.dark : styles.light}`}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>🎯 {translations.title}</h2>
        <p className={styles.subtitle}>
          {isZh
            ? '根據您的家庭信息量身定制'
            : 'Tailored to your family\'s needs'}
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'top' ? styles.active : ''}`}
          onClick={() => setActiveTab('top')}
        >
          ⭐ {translations.topRecommendations}
          {recommendations.topRecommendations.length > 0 && (
            <span className={styles.badge}>
              {recommendations.topRecommendations.length}
            </span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'similar' ? styles.active : ''}`}
          onClick={() => setActiveTab('similar')}
        >
          🔗 {translations.similarVenues}
          {recommendations.similarVenues.length > 0 && (
            <span className={styles.badge}>
              {recommendations.similarVenues.length}
            </span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'new' ? styles.active : ''}`}
          onClick={() => setActiveTab('new')}
        >
          ✨ {translations.newVenues}
          {recommendations.newVenues.length > 0 && (
            <span className={styles.badge}>
              {recommendations.newVenues.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'top' &&
          (recommendations.topRecommendations.length > 0 ? (
            <div className={styles.cards}>
              {recommendations.topRecommendations.map(renderRecommendationCard)}
            </div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyMessage}>{translations.empty}</p>
              <p className={styles.emptyHint}>{translations.emptyMessage}</p>
            </div>
          ))}

        {activeTab === 'similar' &&
          (recommendations.similarVenues.length > 0 ? (
            <div className={styles.similarList}>
              {recommendations.similarVenues.map(venue => (
                <div
                  key={venue.id}
                  className={styles.similarItem}
                  onClick={() => onVenueSelect?.(venue.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.similarInfo}>
                    <h4>{isZh ? venue.name.zh : venue.name.en}</h4>
                    <p>
                      ⭐ {venue.averageRating.toFixed(1)} ({venue.reviewCount}{' '}
                      reviews)
                    </p>
                  </div>
                  <div className={styles.similarArrow}>→</div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyMessage}>
                {isZh ? '暫無相似地點' : 'No similar venues'}
              </p>
            </div>
          ))}

        {activeTab === 'new' &&
          (recommendations.newVenues.length > 0 ? (
            <div className={styles.newList}>
              {recommendations.newVenues.map(venue => (
                <div
                  key={venue.id}
                  className={styles.newItem}
                  onClick={() => onVenueSelect?.(venue.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.newBadge}>NEW</div>
                  <div className={styles.newInfo}>
                    <h4>{isZh ? venue.name.zh : venue.name.en}</h4>
                    <p>
                      ⭐ {venue.averageRating.toFixed(1)} ({venue.reviewCount}{' '}
                      reviews)
                    </p>
                    {venue.trending > 0 && (
                      <p className={styles.trending}>
                        📈 {isZh ? '上升' : 'Trending up'} ({venue.trending > 0.5 ? '🔥' : '📊'})
                      </p>
                    )}
                  </div>
                  <div className={styles.newArrow}>→</div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyMessage}>
                {isZh ? '暫無新發現' : 'No new discoveries'}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FamilyRecommendationPanel;
