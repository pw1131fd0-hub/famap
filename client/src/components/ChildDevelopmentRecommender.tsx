/**
 * Child Development Recommender Component
 * Displays venue suitability for different child development stages
 * Helps families understand age appropriateness
 */

import React, { useMemo } from 'react';
import {
  calculateFamilySuitability,
  getDevelopmentStageInfo
} from '../utils/childDevelopmentStages';

interface ChildDevelopmentRecommenderProps {
  childAges: number[];
  venueData: {
    category?: string;
    facilities?: string[];
    crowdingLevel?: number;
    ageRange?: { minAge?: number; maxAge?: number };
    accessibility?: {
      stroller?: boolean;
      wheelchair?: boolean;
      nursing?: boolean;
    };
    atmosphere?: {
      noise?: 'quiet' | 'moderate' | 'loud';
      crowds?: 'quiet' | 'moderate' | 'busy';
    };
  };
  isDarkMode?: boolean;
  language?: 'zh' | 'en';
  expandedByDefault?: boolean;
}

export default function ChildDevelopmentRecommender({
  childAges,
  venueData,
  isDarkMode = false,
  language = 'en',
  expandedByDefault = false
}: ChildDevelopmentRecommenderProps) {
  const [isExpanded, setIsExpanded] = React.useState(expandedByDefault);

  const suitability = useMemo(
    () => calculateFamilySuitability(childAges, venueData),
    [childAges, venueData]
  );

  if (childAges.length === 0) {
    return null;
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Orange
    if (score >= 40) return '#FF9800'; // Orange-Red
    return '#F44336'; // Red
  };

  const getScoreBadge = (score: number): string => {
    if (score >= 80) return '✓ Excellent';
    if (score >= 60) return '◐ Good';
    if (score >= 40) return '△ Fair';
    return '✗ Poor';
  };

  return (
    <div
      className={`child-development-recommender ${isDarkMode ? 'dark' : 'light'}`}
      style={{
        backgroundColor: isDarkMode ? '#2c2c2c' : '#f9f9f9',
        border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
        borderRadius: '8px',
        padding: '12px',
        marginTop: '12px',
        fontFamily: "'Noto Sans TC', sans-serif"
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          padding: '8px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          color: isDarkMode ? '#ffffff' : '#333'
        }}
      >
        <span>
          {language === 'zh' ? '開發階段適配度' : 'Development Stage Fit'}{' '}
          <span style={{ color: getScoreColor(suitability.overallScore) }}>
            {suitability.overallScore}%
          </span>
        </span>
        <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Overall Score */}
          <div
            style={{
              backgroundColor: isDarkMode ? '#353535' : '#ffffff',
              padding: '8px 12px',
              borderRadius: '6px',
              borderLeft: `4px solid ${getScoreColor(suitability.overallScore)}`
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: isDarkMode ? '#aaa' : '#666',
                marginBottom: '4px'
              }}
            >
              {language === 'zh' ? '整體評分' : 'Overall Score'}
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: getScoreColor(suitability.overallScore)
              }}
            >
              {getScoreBadge(suitability.overallScore)}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: isDarkMode ? '#999' : '#999',
                marginTop: '4px'
              }}
            >
              {language === 'zh'
                ? `適合${suitability.bestForStages.length}個發展階段`
                : `Suitable for ${suitability.bestForStages.length} development stage(s)`}
            </div>
          </div>

          {/* By Stage Breakdown */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '8px',
                color: isDarkMode ? '#ddd' : '#333'
              }}
            >
              {language === 'zh' ? '各階段評分' : 'By Stage'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suitability.byStage.map(stage => {
                const stageInfo = getDevelopmentStageInfo(stage.stage);
                return (
                  <div
                    key={stage.stage}
                    style={{
                      backgroundColor: isDarkMode ? '#353535' : '#f5f5f5',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          color: isDarkMode ? '#ddd' : '#333',
                          fontWeight: '500'
                        }}
                      >
                        {stageInfo.label[language]} ({stageInfo.ageRange.min}-{stageInfo.ageRange.max} yrs)
                      </span>
                      <span
                        style={{
                          color: getScoreColor(stage.suitabilityScore),
                          fontWeight: '600'
                        }}
                      >
                        {stage.suitabilityScore}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        backgroundColor: isDarkMode ? '#2c2c2c' : '#e0e0e0',
                        height: '4px',
                        borderRadius: '2px',
                        marginTop: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: getScoreColor(stage.suitabilityScore),
                          height: '100%',
                          width: `${stage.suitabilityScore}%`,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>

                    {/* Reasoning */}
                    {stage.reasoning.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        {stage.reasoning.map((reason, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: '11px',
                              color: isDarkMode ? '#bbb' : '#666',
                              marginTop: idx > 0 ? '2px' : '0'
                            }}
                          >
                            ✓ {reason}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cautions */}
                    {stage.cautions.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        {stage.cautions.map((caution, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: '11px',
                              color: '#FF9800',
                              marginTop: idx > 0 ? '2px' : '0'
                            }}
                          >
                            ⚠ {caution}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tips */}
                    {stage.tips.length > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: '500',
                            color: isDarkMode ? '#aaa' : '#666',
                            marginBottom: '3px'
                          }}
                        >
                          {language === 'zh' ? '提示' : 'Tips:'}
                        </div>
                        {stage.tips.map((tip, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: '10px',
                              color: isDarkMode ? '#999' : '#777',
                              marginTop: '2px',
                              paddingLeft: '4px',
                              borderLeft: '2px solid #A7C7E7'
                            }}
                          >
                            • {tip}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Age Appropriateness Summary */}
          {suitability.ageApprpriateness.length > 0 && (
            <div
              style={{
                backgroundColor: isDarkMode ? '#353535' : '#f5f5f5',
                padding: '8px 10px',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            >
              <div
                style={{
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: isDarkMode ? '#ddd' : '#333'
                }}
              >
                {language === 'zh' ? '適齡性摘要' : 'Age Appropriateness'}
              </div>
              {suitability.ageApprpriateness.map((note, idx) => (
                <div
                  key={idx}
                  style={{
                    color: isDarkMode ? '#bbb' : '#666',
                    marginTop: idx > 0 ? '3px' : '0',
                    lineHeight: '1.4'
                  }}
                >
                  • {note}
                </div>
              ))}
            </div>
          )}

          {/* Recommended Visit Conditions */}
          {suitability.recommendedVisitConditions.length > 0 && (
            <div
              style={{
                backgroundColor: isDarkMode ? '#353535' : '#f5f5f5',
                padding: '8px 10px',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            >
              <div
                style={{
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: isDarkMode ? '#ddd' : '#333'
                }}
              >
                {language === 'zh' ? '推薦訪問條件' : 'Recommended Visit Conditions'}
              </div>
              {suitability.recommendedVisitConditions.map((condition, idx) => (
                <div
                  key={idx}
                  style={{
                    color: isDarkMode ? '#bbb' : '#666',
                    marginTop: idx > 0 ? '3px' : '0',
                    lineHeight: '1.4'
                  }}
                >
                  ◆ {condition}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
