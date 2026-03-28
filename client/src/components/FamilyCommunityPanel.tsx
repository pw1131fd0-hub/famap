import { useState, useEffect } from 'react';
import type { FamilyProfile, FamilyCompatibilityScore, FamilyDiscoveryRecommendation } from '../types';
import { calculateFamilyCompatibility, findCompatibleFamilies, generateFamilyRecommendations } from '../utils/familyCommunity';
import { useLanguage } from '../i18n/useLanguage';
import '../styles/components/FamilyCommunityPanel.css';

interface FamilyCommunityPanelProps {
  currentFamily: FamilyProfile;
  allFamilies: FamilyProfile[];
  onFamilySelect?: (family: FamilyProfile) => void;
  isDarkMode?: boolean;
}

export function FamilyCommunityPanel({
  currentFamily,
  allFamilies,
  onFamilySelect,
  isDarkMode = false,
}: FamilyCommunityPanelProps) {
  const { t } = useLanguage();
  const [compatibleFamilies, setCompatibleFamilies] = useState<FamilyCompatibilityScore[]>([]);
  const [recommendations, setRecommendations] = useState<FamilyDiscoveryRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'compatible' | 'recommendations'>('compatible');
  const [expandedFamilyId, setExpandedFamilyId] = useState<string | null>(null);

  useEffect(() => {
    // Calculate compatible families
    const compatible = findCompatibleFamilies(currentFamily, allFamilies, 60);
    setCompatibleFamilies(compatible);

    // Generate recommendations
    const recs = generateFamilyRecommendations(
      currentFamily,
      allFamilies,
      [],
      [],
    );
    setRecommendations(recs);
  }, [currentFamily, allFamilies]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  };

  const getFamilyById = (familyId: string): FamilyProfile | undefined => {
    return allFamilies.find(f => f.id === familyId);
  };

  const formatInterests = (interests: string[]): string => {
    return interests.slice(0, 3).join(', ');
  };

  const formatAges = (ages: number[]): string => {
    if (ages.length === 0) return '-';
    if (ages.length === 1) return `${ages[0]} years`;
    return `${Math.min(...ages)}-${Math.max(...ages)} years`;
  };

  return (
    <div className={`family-community-panel ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="community-header">
        <h2 className="community-title">
          {currentFamily.childrenCount > 0 ? 'Family Community' : 'Connect with Families'}
        </h2>
        <p className="community-subtitle">
          Discover compatible families and join group outings
        </p>
      </div>

      <div className="community-tabs">
        <button
          className={`tab-button ${activeTab === 'compatible' ? 'active' : ''}`}
          onClick={() => setActiveTab('compatible')}
        >
          Compatible Families ({compatibleFamilies.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </button>
      </div>

      <div className="community-content">
        {activeTab === 'compatible' && (
          <div className="compatible-families-section">
            {compatibleFamilies.length === 0 ? (
              <div className="empty-state">
                <p>No compatible families found yet.</p>
                <p className="empty-hint">Try adjusting your preferences or add more families to the community.</p>
              </div>
            ) : (
              <div className="families-list">
                {compatibleFamilies.map((compatibility) => {
                  const otherFamily = getFamilyById(compatibility.otherFamilyProfileId);
                  if (!otherFamily) return null;

                  return (
                    <div
                      key={compatibility.otherFamilyProfileId}
                      className={`family-card ${getScoreColor(compatibility.compatibilityScore)}`}
                      onClick={() => setExpandedFamilyId(
                        expandedFamilyId === otherFamily.id ? null : otherFamily.id
                      )}
                    >
                      <div className="family-card-header">
                        <div className="family-info">
                          <h3 className="family-name">Family {otherFamily.id.slice(0, 8)}</h3>
                          <div className="family-stats">
                            <span className="stat">{otherFamily.childrenCount} kids</span>
                            <span className="stat">{formatAges(otherFamily.childrenAges)}</span>
                          </div>
                        </div>
                        <div className="compatibility-score">
                          <div className="score-badge">{Math.round(compatibility.compatibilityScore)}%</div>
                          <p className="score-label">Compatible</p>
                        </div>
                      </div>

                      {expandedFamilyId === otherFamily.id && (
                        <div className="family-card-details">
                          <div className="details-section">
                            <h4>Match Reasons</h4>
                            <div className="match-reasons">
                              {compatibility.matchReasons.map((reason) => (
                                <span key={reason} className="reason-badge">
                                  {reason.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="details-section">
                            <h4>Shared Interests</h4>
                            <div className="shared-interests">
                              {compatibility.commonInterests.length > 0 ? (
                                compatibility.commonInterests.map((interest) => (
                                  <span key={interest} className="interest-tag">
                                    {interest}
                                  </span>
                                ))
                              ) : (
                                <p className="no-data">No common interests</p>
                              )}
                            </div>
                          </div>

                          <div className="details-section">
                            <h4>Suggested Activities</h4>
                            <div className="suggested-activities">
                              {compatibility.potentialGroupActivities.length > 0 ? (
                                compatibility.potentialGroupActivities.map((activity) => (
                                  <span key={activity} className="activity-chip">
                                    {activity}
                                  </span>
                                ))
                              ) : (
                                <p className="no-data">No suggested activities</p>
                              )}
                            </div>
                          </div>

                          <button
                            className="action-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFamilySelect?.(otherFamily);
                            }}
                          >
                            Connect with Family
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            {recommendations.length === 0 ? (
              <div className="empty-state">
                <p>No recommendations available yet.</p>
                <p className="empty-hint">Share your family profile to get personalized recommendations.</p>
              </div>
            ) : (
              <div className="recommendations-list">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation-card">
                    <div className="rec-header">
                      <span className="rec-type">{rec.recommendationType.replace(/_/g, ' ')}</span>
                      <span className="confidence">
                        {Math.round(rec.confidence * 100)}% match
                      </span>
                    </div>
                    <p className="rec-reason">{rec.reason}</p>
                    {rec.action && (
                      <button className="rec-action-button">
                        {rec.action.replace(/_/g, ' ')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
