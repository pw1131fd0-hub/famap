import { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import {
  generateVenueAnalytics,
} from '../utils/venueAnalytics';
import styles from '../styles/VenueOperatorDashboard.module.css';

interface VenueOperatorDashboardProps {
  venueId: string;
  venueName: { zh: string; en: string };
  isDarkMode?: boolean;
}

type DashboardTab = 'overview' | 'demographics' | 'reviews' | 'competitive' | 'settings';

const VenueOperatorDashboard: React.FC<VenueOperatorDashboardProps> = ({
  venueId,
  venueName,
  isDarkMode = false,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const isZh = language === 'zh';

  // Generate analytics data
  const analyticsData = useMemo(
    () => generateVenueAnalytics(venueId, venueName, 'claimed'),
    [venueId, venueName]
  );

  const translations = {
    title: isZh ? '場所管理員儀表板' : 'Venue Operator Dashboard',
    welcome: isZh ? '歡迎回來' : 'Welcome back',
    overview: isZh ? '概覽' : 'Overview',
    demographics: isZh ? '訪客統計' : 'Visitor Demographics',
    reviews: isZh ? '評論' : 'Reviews',
    competitive: isZh ? '競爭分析' : 'Competitive Analysis',
    settings: isZh ? '設定' : 'Settings',
    viewCount: isZh ? '個資料檢覽' : 'Profile Views',
    favorites: isZh ? '加入最愛次數' : 'Added to Favorites',
    searchImpression: isZh ? '搜尋展示' : 'Search Impressions',
    reviews_title: isZh ? '評論' : 'Reviews',
    averageRating: isZh ? '平均評分' : 'Average Rating',
    totalReviews: isZh ? '總評論數' : 'Total Reviews',
    respondRate: isZh ? '回應率' : 'Response Rate',
    ageGroup: isZh ? '年齡組' : 'Age Group',
    interests: isZh ? '興趣' : 'Interests',
    accessibility: isZh ? '無障礙需求' : 'Accessibility Needs',
    budget: isZh ? '預算水準' : 'Budget Level',
    peakDay: isZh ? '尖峰日期' : 'Peak Days',
    seasonalTrend: isZh ? '季節趨勢' : 'Seasonal Trends',
    rank: isZh ? '排名' : 'Rank',
    strength: isZh ? '優勢' : 'Strengths',
    improvement: isZh ? '改進區域' : 'Areas for Improvement',
    updateInfo: isZh ? '更新資訊' : 'Update Information',
    claimVenue: isZh ? '認領此場所' : 'Claim This Venue',
    lastUpdated: isZh ? '最後更新' : 'Last Updated',
  };

  const renderOverviewTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3>{translations.welcome}，{isZh ? venueName.zh : venueName.en}！</h3>
      </div>

      <div className={styles.metricsGrid}>
        <div className={`${styles.metricCard} ${isDarkMode ? styles.dark : ''}`}>
          <div className={styles.metricLabel}>{translations.viewCount}</div>
          <div className={styles.metricValue}>
            {analyticsData.metrics.viewCount.toLocaleString()}
          </div>
          <div className={styles.metricTrend}>↑ 12% this month</div>
        </div>

        <div className={`${styles.metricCard} ${isDarkMode ? styles.dark : ''}`}>
          <div className={styles.metricLabel}>{translations.favorites}</div>
          <div className={styles.metricValue}>
            {analyticsData.metrics.favoriteCount.toLocaleString()}
          </div>
          <div className={styles.metricTrend}>↑ 8% this month</div>
        </div>

        <div className={`${styles.metricCard} ${isDarkMode ? styles.dark : ''}`}>
          <div className={styles.metricLabel}>{translations.searchImpression}</div>
          <div className={styles.metricValue}>
            {analyticsData.metrics.searchImpression.toLocaleString()}
          </div>
          <div className={styles.metricTrend}>↑ 15% this month</div>
        </div>

        <div className={`${styles.metricCard} ${isDarkMode ? styles.dark : ''}`}>
          <div className={styles.metricLabel}>{translations.reviews_title}</div>
          <div className={styles.metricValue}>
            {analyticsData.metrics.reviewCount}
          </div>
          <div className={styles.metricRating}>
            {'⭐'.repeat(Math.floor(analyticsData.metrics.averageRating))}
            {' '}
            {analyticsData.metrics.averageRating.toFixed(1)}
          </div>
        </div>
      </div>

      <div className={styles.ratingDistribution}>
        <h4>{translations.averageRating}</h4>
        <div className={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map((rating) => {
            const ratingKey = (rating === 5 ? 'five' :
                             rating === 4 ? 'four' :
                             rating === 3 ? 'three' :
                             rating === 2 ? 'two' : 'one') as keyof typeof analyticsData.metrics.ratingDistribution;
            const count = analyticsData.metrics.ratingDistribution[ratingKey];
            return (
              <div key={rating} className={styles.ratingBar}>
                <div className={styles.ratingLabel}>{rating}⭐</div>
                <div className={styles.barContainer}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${
                        (count /
                          analyticsData.metrics.reviewCount) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className={styles.barLabel}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderDemographicsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.demographicsGrid}>
        <div className={styles.demographicSection}>
          <h4>🧒 {translations.ageGroup}</h4>
          <ul className={styles.list}>
            {analyticsData.demographics.mostCommonAgeGroups.map((group) => (
              <li key={group.ageGroup} className={styles.listItem}>
                <span>{group.ageGroup}</span>
                <span className={styles.percentage}>{group.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.demographicSection}>
          <h4>💝 {translations.interests}</h4>
          <ul className={styles.list}>
            {analyticsData.demographics.mostVisitedInterests.slice(0, 5).map(
              (interest) => (
                <li key={interest.interest} className={styles.listItem}>
                  <span>{interest.interest}</span>
                  <span className={styles.count}>({interest.count})</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div className={styles.demographicSection}>
          <h4>♿ {translations.accessibility}</h4>
          <ul className={styles.list}>
            {analyticsData.demographics.accessibilityNeedsRequested
              .slice(0, 4)
              .map((need) => (
                <li key={need.need} className={styles.listItem}>
                  <span>{need.need}</span>
                  <span className={styles.percentage}>{need.percentage}%</span>
                </li>
              ))}
          </ul>
        </div>

        <div className={styles.demographicSection}>
          <h4>💰 {translations.budget}</h4>
          <div className={styles.budgetChart}>
            <div className={styles.budgetBar}>
              <div
                className={styles.budgetSegment}
                style={{
                  width: '30%',
                  backgroundColor: '#ff9999',
                }}
              >
                Budget
              </div>
              <div
                className={styles.budgetSegment}
                style={{
                  width: '50%',
                  backgroundColor: '#a7c7e7',
                }}
              >
                Moderate
              </div>
              <div
                className={styles.budgetSegment}
                style={{
                  width: '20%',
                  backgroundColor: '#fdfd96',
                }}
              >
                Premium
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.reviewsSection}>
        <div className={styles.reviewStats}>
          <div className={styles.stat}>
            <span className={styles.label}>{translations.totalReviews}</span>
            <span className={styles.value}>{analyticsData.reviews.totalReviews}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>{translations.respondRate}</span>
            <span className={styles.value}>
              {Math.round(analyticsData.reviews.responseRate * 100)}%
            </span>
          </div>
        </div>

        <div className={styles.reviewThemes}>
          <h4>{isZh ? '常見評論主題' : 'Common Review Themes'}</h4>
          {analyticsData.reviews.commonThemes.map((theme) => (
            <div key={theme.theme} className={styles.themeItem}>
              <div className={styles.themeName}>{theme.theme}</div>
              <div className={styles.themeMeter}>
                <div
                  className={styles.themeFill}
                  style={{
                    width: `${theme.frequency}%`,
                    backgroundColor:
                      theme.sentiment === 'positive'
                        ? '#66bb6a'
                        : theme.sentiment === 'negative'
                          ? '#ef5350'
                          : '#ffa726',
                  }}
                />
              </div>
              <div className={styles.themeStats}>
                {theme.frequency} {theme.sentiment}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.recentReviews}>
          <h4>{isZh ? '最近評論' : 'Recent Reviews'}</h4>
          {analyticsData.reviews.recentReviews.map((review) => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.rating}>
                  {'⭐'.repeat(review.rating)}
                </span>
                <span className={styles.date}>
                  {new Date(review.date).toLocaleDateString(
                    isZh ? 'zh-TW' : 'en-US'
                  )}
                </span>
              </div>
              <p className={styles.reviewText}>{review.comment}</p>
              {review.responded && (
                <div className={styles.responseIndicator}>
                  ✓ {isZh ? '已回應' : 'Responded'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompetitiveTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.competitiveSection}>
        <div className={styles.rankCard}>
          <h4>{translations.rank}</h4>
          <div className={styles.rankDisplay}>
            <span className={styles.rankNumber}>
              #{analyticsData.competitive.categoryRank}
            </span>
            <span className={styles.rankOf}>
              {isZh ? '在' : 'out of'}{' '}
              {analyticsData.competitive.categoryTotal}{' '}
              {isZh ? '個類似場所' : 'similar venues'}
            </span>
          </div>
          <div className={styles.percentile}>
            {isZh ? '評分百分位數' : 'Rating Percentile'}: {analyticsData.competitive.ratingPercentile}%
          </div>
        </div>

        <div className={styles.strengthsList}>
          <h4>💪 {translations.strength}</h4>
          <ul className={styles.list}>
            {analyticsData.competitive.strengths.map((strength) => (
              <li key={strength} className={styles.strengthItem}>
                ✓ {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.improvementList}>
          <h4>🎯 {translations.improvement}</h4>
          <ul className={styles.list}>
            {analyticsData.competitive.improvementAreas.map((area) => (
              <li key={area} className={styles.improvementItem}>
                → {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.settingsSection}>
        <h4>{isZh ? '場所聲明' : 'Venue Claim Status'}</h4>
        <div className={`${styles.claimStatus} ${styles.claimed}`}>
          <span className={styles.statusBadge}>✓ {isZh ? '已認領' : 'Claimed'}</span>
          {analyticsData.venue.claimedBy && (
            <p>
              {isZh ? '認領者' : 'Claimed by'}: {analyticsData.venue.claimedBy.name} (
              {analyticsData.venue.claimedBy.email})
            </p>
          )}
        </div>

        <h4>{translations.updateInfo}</h4>
        <div className={styles.updateInfo}>
          <p>
            {isZh ? '最後更新' : 'Last Updated'}:{' '}
            {new Date(analyticsData.lastUpdated).toLocaleDateString(
              isZh ? 'zh-TW' : 'en-US'
            )}
          </p>
          <button className={styles.updateButton}>
            {isZh ? '編輯場所資訊' : 'Edit Venue Information'}
          </button>
        </div>

        <h4>{isZh ? '支援' : 'Support'}</h4>
        <div className={styles.supportSection}>
          <p>
            {isZh
              ? '對於任何問題或建議，請聯繫我們的支援團隊'
              : 'For any questions or suggestions, please contact our support team'}
          </p>
          <p>📧 support@fammap.com</p>
          <p>🔗 help.fammap.com</p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'demographics':
        return renderDemographicsTab();
      case 'reviews':
        return renderReviewsTab();
      case 'competitive':
        return renderCompetitiveTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h2>{translations.title}</h2>
        <p className={styles.subtitle}>
          {isZh ? '管理您的場所，查看家庭的洞察' : 'Manage your venue and view family insights'}
        </p>
      </div>

      <div className={styles.tabs}>
        {(['overview', 'demographics', 'reviews', 'competitive', 'settings'] as const).map(
          (tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {translations[tab as keyof typeof translations]}
            </button>
          )
        )}
      </div>

      {renderTabContent()}

      <div className={styles.footer}>
        <p>
          {translations.lastUpdated}: {new Date(analyticsData.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default VenueOperatorDashboard;
