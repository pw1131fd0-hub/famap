/**
 * Venue Quality Assessment Component
 * Displays credibility, suitability, and comparison data for venues
 * Helps families make informed decisions about which venues to visit
 */

import React, { useMemo } from 'react';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import {
  assessVenueCredibility,
  evaluateVenueSuitability,
  getVenueQualitySummary,
  type FamilyNeed,
} from '../utils/venueQualityAssessment';
import type { Location } from '../types';
import '../styles/VenueQualityAssessment.css';

interface VenueQualityAssessmentProps {
  venue: Location;
  familyNeeds?: FamilyNeed[];
  reviewCount?: number;
  recentReviewCount?: number;
  averageRating?: number;
  userContributionsCount?: number;
  lastUpdateDays?: number;
  onDismiss?: () => void;
}

export const VenueQualityAssessment: React.FC<VenueQualityAssessmentProps> = ({
  venue,
  familyNeeds = [],
  reviewCount = 0,
  recentReviewCount = 0,
  averageRating = 4.0,
  userContributionsCount = 0,
  lastUpdateDays = 30,
  onDismiss,
}) => {
  const assessment = useMemo(() => {
    const credibility = assessVenueCredibility(venue, {
      count: reviewCount,
      recentCount: recentReviewCount,
      averageRating,
    }, {
      contributionsCount: userContributionsCount,
      lastUpdateDays,
    });

    const suitability = evaluateVenueSuitability(
      venue,
      familyNeeds.length > 0 ? familyNeeds : [
        { category: 'restroom', importance: 'important', weight: 0.8 },
        { category: 'playground', importance: 'nice-to-have', weight: 0.5 },
        { category: 'picnic_area', importance: 'nice-to-have', weight: 0.5 },
      ],
      credibility
    );

    const summary = getVenueQualitySummary(venue, credibility, suitability);

    return { credibility, suitability, summary };
  }, [venue, familyNeeds, reviewCount, recentReviewCount, averageRating, userContributionsCount, lastUpdateDays]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4ade80'; // green
    if (score >= 60) return '#fbbf24'; // amber
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getGradeEmoji = (grade: string): string => {
    switch (grade) {
      case 'excellent': return '⭐';
      case 'good': return '👍';
      case 'fair': return '👌';
      case 'poor': return '⚠️';
      default: return '•';
    }
  };

  return (
    <div className="venue-quality-assessment">
      <div className="vqa-header">
        <h3 className="vqa-title">Venue Quality Assessment</h3>
        {onDismiss && (
          <button className="vqa-close" onClick={onDismiss} aria-label="Close">
            ✕
          </button>
        )}
      </div>

      <div className="vqa-content">
        {/* Overall Score */}
        <div className="vqa-section vqa-overall">
          <div className="vqa-score-display">
            <div
              className="vqa-score-circle"
              style={{
                background: `conic-gradient(${getScoreColor(assessment.summary.overallScore)} ${assessment.summary.overallScore * 3.6}deg, #e5e7eb ${assessment.summary.overallScore * 3.6}deg)`,
              }}
            >
              <div className="vqa-score-inner">
                <span className="vqa-score-number">{assessment.summary.overallScore}</span>
                <span className="vqa-score-label">Score</span>
              </div>
            </div>
            <div className="vqa-grade-display">
              <span className="vqa-grade-emoji">{getGradeEmoji(assessment.summary.qualityGrade)}</span>
              <span className="vqa-grade-text">{assessment.summary.qualityGrade.toUpperCase()}</span>
            </div>
          </div>

          <div className="vqa-recommendation">
            {assessment.summary.shouldVisit ? (
              <>
                <CheckCircle size={20} style={{ color: '#4ade80' }} />
                <span>This venue is recommended for your family</span>
              </>
            ) : (
              <>
                <AlertCircle size={20} style={{ color: '#f97316' }} />
                <span>Consider other options for your family needs</span>
              </>
            )}
          </div>
        </div>

        {/* Credibility Assessment */}
        <div className="vqa-section">
          <h4 className="vqa-subsection-title">
            <TrendingUp size={16} />
            Credibility Assessment
          </h4>
          <div className="vqa-metrics">
            <div className="vqa-metric">
              <span className="vqa-metric-label">Reviews:</span>
              <span className="vqa-metric-value">{assessment.credibility.reviewCount}</span>
            </div>
            <div className="vqa-metric">
              <span className="vqa-metric-label">User Contributions:</span>
              <span className="vqa-metric-value">{assessment.credibility.userContributions}</span>
            </div>
            <div className="vqa-metric">
              <span className="vqa-metric-label">Data Freshness:</span>
              <span className="vqa-metric-value">{assessment.credibility.dataRecency} days old</span>
            </div>
            <div className="vqa-metric">
              <span className="vqa-metric-label">Consistency:</span>
              <span className="vqa-metric-value">{assessment.credibility.consistencyIndex}%</span>
            </div>
          </div>
          <div className="vqa-factors">
            {assessment.credibility.factorsAnalyzed.map((factor, idx) => (
              <span key={idx} className="vqa-factor-badge">
                ✓ {factor}
              </span>
            ))}
          </div>
        </div>

        {/* Suitability Assessment */}
        {assessment.suitability.matchedNeeds.length > 0 || assessment.suitability.unmatchedNeeds.length > 0 ? (
          <div className="vqa-section">
            <h4 className="vqa-subsection-title">Family Needs Match</h4>
            {assessment.suitability.matchedNeeds.length > 0 && (
              <div className="vqa-matched-needs">
                <h5>✓ Your family's needs this venue meets:</h5>
                <div className="vqa-need-list">
                  {assessment.suitability.matchedNeeds.map((need, idx) => (
                    <span key={idx} className="vqa-need-badge vqa-need-matched">
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {assessment.suitability.unmatchedNeeds.length > 0 && (
              <div className="vqa-unmatched-needs">
                <h5>✗ Missing facilities:</h5>
                <div className="vqa-need-list">
                  {assessment.suitability.unmatchedNeeds.map((need, idx) => (
                    <span key={idx} className="vqa-need-badge vqa-need-unmatched">
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Assessment Reasoning */}
        <div className="vqa-section vqa-reasoning">
          <h4 className="vqa-subsection-title">Why this assessment?</h4>
          <ul className="vqa-reasoning-list">
            {assessment.suitability.reasoning.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>

        {/* Confidence Level */}
        <div className="vqa-confidence">
          <div className="vqa-confidence-label">Assessment Confidence</div>
          <div className="vqa-confidence-bar">
            <div
              className="vqa-confidence-fill"
              style={{
                width: `${assessment.suitability.confidence}%`,
                backgroundColor: getScoreColor(assessment.suitability.confidence),
              }}
            />
          </div>
          <span className="vqa-confidence-text">{assessment.suitability.confidence}%</span>
        </div>
      </div>
    </div>
  );
};

export default VenueQualityAssessment;
