/**
 * FamilyGroupOptimizer Component
 * Displays family group matching and optimization recommendations
 * Helps families find compatible group outings
 */

import React, { useState, useMemo } from 'react';
import type { FamilyProfile, Location } from '../types';
import {
  findFamilyMatches,
  optimizeGroupForOuting,
  generateGroupRecommendations,
  type FamilyGroupMatch,
  type GroupOptimizationResult,
} from '../utils/familyGroupOptimizer';
import '../styles/FamilyGroupOptimizer.css';

interface FamilyGroupOptimizerProps {
  currentFamily: FamilyProfile;
  availableFamilies?: FamilyProfile[];
  availableVenues?: Location[];
  onSelectMatch?: (family: FamilyGroupMatch) => void;
  darkMode?: boolean;
}

export const FamilyGroupOptimizer: React.FC<FamilyGroupOptimizerProps> = ({
  currentFamily,
  availableFamilies = [],
  availableVenues = [],
  onSelectMatch,
  darkMode = false,
}) => {
  const [filterByBudget, setFilterByBudget] = useState(true);
  const [minimumScore, setMinimumScore] = useState(60);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  // Find matching families
  const matches = useMemo(() => {
    return findFamilyMatches(
      currentFamily,
      availableFamilies,
      filterByBudget,
      minimumScore
    );
  }, [currentFamily, availableFamilies, filterByBudget, minimumScore]);

  // Get selected families for group optimization
  const selectedFamilies = useMemo(() => {
    const selected = [
      currentFamily,
      ...matches.filter((m) => selectedMatches.includes(m.familyId)),
    ];
    return selected.map((f) => f as FamilyProfile);
  }, [currentFamily, matches, selectedMatches]);

  // Optimize group for outing
  const groupOptimization = useMemo(() => {
    return optimizeGroupForOuting(selectedFamilies, availableVenues);
  }, [selectedFamilies, availableVenues]);

  // Get recommendations
  const recommendations = useMemo(() => {
    return generateGroupRecommendations(selectedFamilies);
  }, [selectedFamilies]);

  const handleSelectMatch = (familyId: string) => {
    setSelectedMatches((prev) =>
      prev.includes(familyId)
        ? prev.filter((id) => id !== familyId)
        : [...prev, familyId]
    );

    const match = matches.find((m) => m.familyId === familyId);
    if (match && onSelectMatch) {
      onSelectMatch(match);
    }
  };

  const containerClass = `family-group-optimizer ${darkMode ? 'dark-mode' : ''}`;

  return (
    <div className={containerClass}>
      <div className="fgo-header">
        <h2>Family Group Outing Optimizer</h2>
        <p>Find compatible families and plan group adventures</p>
      </div>

      {/* Current Family Info */}
      <div className="fgo-current-family">
        <div className="fgo-family-card">
          <h3>{currentFamily.displayName || 'Your Family'}</h3>
          <div className="fgo-family-details">
            <div className="fgo-detail">
              <span className="label">Children:</span>
              <span className="value">
                {currentFamily.childrenAges?.length || 0} (
                {currentFamily.childrenAges?.join(', ') || 'N/A'} years)
              </span>
            </div>
            {currentFamily.interests && currentFamily.interests.length > 0 && (
              <div className="fgo-detail">
                <span className="label">Interests:</span>
                <div className="fgo-interests">
                  {currentFamily.interests.slice(0, 3).map((interest) => (
                    <span key={interest} className="fgo-tag">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="fgo-filters">
        <div className="fgo-filter-group">
          <label className="fgo-checkbox">
            <input
              type="checkbox"
              checked={filterByBudget}
              onChange={(e) => setFilterByBudget(e.target.checked)}
            />
            <span>Filter by Similar Budget</span>
          </label>
        </div>

        <div className="fgo-filter-group">
          <label className="fgo-slider-label">
            Minimum Compatibility: {minimumScore}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={minimumScore}
            onChange={(e) => setMinimumScore(Number(e.target.value))}
            className="fgo-slider"
          />
        </div>
      </div>

      {/* Matches List */}
      <div className="fgo-matches-section">
        <h3>Compatible Families ({matches.length})</h3>

        {matches.length === 0 ? (
          <div className="fgo-no-matches">
            <p>No compatible families found with current filters.</p>
            <p>Try lowering the compatibility threshold or disabling budget filter.</p>
          </div>
        ) : (
          <div className="fgo-matches-list">
            {matches.map((match) => (
              <div
                key={match.familyId}
                className={`fgo-match-card ${selectedMatches.includes(match.familyId) ? 'selected' : ''}`}
              >
                <div className="fgo-match-header">
                  <input
                    type="checkbox"
                    checked={selectedMatches.includes(match.familyId)}
                    onChange={() => handleSelectMatch(match.familyId)}
                    className="fgo-match-checkbox"
                  />
                  <h4>{match.familyName}</h4>
                  <div className="fgo-compatibility-score">
                    {Math.round(match.compatibilityScore)}%
                  </div>
                </div>

                <div className="fgo-match-metrics">
                  <div className="fgo-metric">
                    <span className="metric-label">Age Match:</span>
                    <div className="metric-bar">
                      <div
                        className="metric-fill"
                        style={{
                          width: `${Math.min(match.ageGroupMatch, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="metric-value">
                      {Math.round(match.ageGroupMatch)}%
                    </span>
                  </div>

                  <div className="fgo-metric">
                    <span className="metric-label">Interest Overlap:</span>
                    <div className="metric-bar">
                      <div
                        className="metric-fill"
                        style={{
                          width: `${Math.min(match.interestOverlap, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="metric-value">
                      {Math.round(match.interestOverlap)}%
                    </span>
                  </div>

                  <div className="fgo-metric">
                    <span className="metric-label">Budget Alignment:</span>
                    <div className="metric-bar">
                      <div
                        className="metric-fill"
                        style={{
                          width: `${Math.min(match.budgetAlignment, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="metric-value">
                      {Math.round(match.budgetAlignment)}%
                    </span>
                  </div>
                </div>

                <div className="fgo-match-reasons">
                  {match.reasonsForMatch.map((reason, idx) => (
                    <span key={idx} className="fgo-reason-tag">
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group Optimization Results */}
      {selectedMatches.length > 0 && (
        <div className="fgo-optimization-section">
          <h3>Group Configuration</h3>

          <div className="fgo-group-info">
            <div className="fgo-info-card">
              <h4>Group Composition</h4>
              <p className="fgo-composition">
                {groupOptimization.suggestedGroupComposition}
              </p>
              <p className="fgo-group-size">
                {selectedFamilies.length} families, ~
                {selectedFamilies.reduce(
                  (sum, f) => sum + (f.childrenAges?.length || 0),
                  0
                )}{' '}
                children
              </p>
            </div>

            <div className="fgo-info-card">
              <h4>Estimated Budget</h4>
              <p className="fgo-budget">
                ₹{groupOptimization.estimatedGroupBudget.toLocaleString()}
              </p>
              <p className="fgo-budget-note">for group outing</p>
            </div>

            {groupOptimization.bestOutingTypes.length > 0 && (
              <div className="fgo-info-card">
                <h4>Best Outing Types</h4>
                <div className="fgo-outing-types">
                  {groupOptimization.bestOutingTypes.map((type) => (
                    <span key={type} className="fgo-type-tag">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="fgo-recommendations">
            <h4>Group Success Tips</h4>
            <ul className="fgo-recommendations-list">
              {recommendations.map((rec, idx) => (
                <li key={idx}>
                  <span className="fgo-tip-icon">💡</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyGroupOptimizer;
