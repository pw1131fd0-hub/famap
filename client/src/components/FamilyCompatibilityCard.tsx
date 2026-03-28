import type { FamilyProfile, FamilyCompatibilityScore } from '../types';
import '../styles/components/FamilyCompatibilityCard.css';

interface FamilyCompatibilityCardProps {
  family: FamilyProfile;
  compatibility: FamilyCompatibilityScore;
  onConnect?: (family: FamilyProfile) => void;
  onLearnMore?: (family: FamilyProfile) => void;
  isDarkMode?: boolean;
}

export function FamilyCompatibilityCard({
  family,
  compatibility,
  onConnect,
  onLearnMore,
  isDarkMode = false,
}: FamilyCompatibilityCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  const scoreColor = getScoreColor(compatibility.compatibilityScore);
  const score = Math.round(compatibility.compatibilityScore);

  return (
    <div className={`compatibility-card ${scoreColor} ${isDarkMode ? 'dark' : ''}`}>
      <div className="card-header">
        <div className="family-basic-info">
          <h3 className="family-id">Family</h3>
          <p className="family-meta">
            {family.childrenCount} kids • {family.childrenCount > 0
              ? `Ages ${Math.min(...family.childrenAges)}-${Math.max(...family.childrenAges)}`
              : 'No children'}
          </p>
        </div>
        <div className="score-circle">
          <span className="score-number">{score}</span>
          <span className="score-percent">%</span>
        </div>
      </div>

      <div className="card-body">
        {compatibility.matchReasons.length > 0 && (
          <div className="match-reasons-section">
            <label className="section-label">Match Reasons</label>
            <div className="match-reasons-list">
              {compatibility.matchReasons.map((reason) => (
                <span key={reason} className="reason-badge">
                  ✓ {reason.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {compatibility.commonInterests.length > 0 && (
          <div className="interests-section">
            <label className="section-label">Common Interests</label>
            <div className="interests-list">
              {compatibility.commonInterests.map((interest) => (
                <span key={interest} className="interest-chip">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {compatibility.potentialGroupActivities.length > 0 && (
          <div className="activities-section">
            <label className="section-label">Suggested Activities</label>
            <div className="activities-list">
              {compatibility.potentialGroupActivities.map((activity) => (
                <span key={activity} className="activity-tag">
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        {onConnect && (
          <button
            className="btn btn-primary"
            onClick={() => onConnect(family)}
          >
            Connect
          </button>
        )}
        {onLearnMore && (
          <button
            className="btn btn-secondary"
            onClick={() => onLearnMore(family)}
          >
            Learn More
          </button>
        )}
      </div>
    </div>
  );
}
