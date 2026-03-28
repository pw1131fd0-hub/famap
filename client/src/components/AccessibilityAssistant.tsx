import React, { useState, useMemo } from 'react';
import {
  createSpecialNeedsProfile,
  assessVenueAccessibility,
  findBestAccessibleVenues,
  createAccessibilityOutingPlan,
  compareAccessibleVenues,
  type SpecialNeedsProfile,
  type VenueAccessibilityAssessment,
  type SpecialCondition,
  type AccessibilityRequirement,
  type SensoryProfile,
} from '../utils/accessibilityAssistant';
import '../styles/AccessibilityAssistant.css';

interface MockVenue {
  id: string;
  name: string;
  accessibilityFeatures: any[];
  noiseLevel: string;
  crowdExpectation: string;
  hasQuietZone: boolean;
  hasBreakRoom: boolean;
}

export function AccessibilityAssistant() {
  const [profiles, setProfiles] = useState<SpecialNeedsProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<SpecialNeedsProfile | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({
    childName: '',
    age: 5,
    conditions: [] as SpecialCondition['type'][],
    soundSensitivity: 'normal' as const,
    crowdTolerance: 'normal' as const,
  });

  // Mock venues for demonstration
  const mockVenues: MockVenue[] = [
    {
      id: 'v1',
      name: 'Peaceful Park',
      accessibilityFeatures: [
        { type: 'wheelchair_accessible', available: true, quality: 'good' },
        { type: 'accessible_bathroom', available: true, quality: 'good' },
        { type: 'quiet_space', available: true, quality: 'excellent' },
      ],
      noiseLevel: 'quiet',
      crowdExpectation: 'light',
      hasQuietZone: true,
      hasBreakRoom: true,
    },
    {
      id: 'v2',
      name: 'Urban Entertainment Center',
      accessibilityFeatures: [
        { type: 'wheelchair_accessible', available: true, quality: 'fair' },
        { type: 'elevator', available: true, quality: 'good' },
      ],
      noiseLevel: 'very_loud',
      crowdExpectation: 'very_busy',
      hasQuietZone: false,
      hasBreakRoom: false,
    },
    {
      id: 'v3',
      name: 'Family-Friendly Museum',
      accessibilityFeatures: [
        { type: 'wheelchair_accessible', available: true, quality: 'excellent' },
        { type: 'elevator', available: true, quality: 'excellent' },
        { type: 'accessible_bathroom', available: true, quality: 'excellent' },
        { type: 'quiet_space', available: true, quality: 'good' },
      ],
      noiseLevel: 'moderate',
      crowdExpectation: 'moderate',
      hasQuietZone: true,
      hasBreakRoom: true,
    },
  ];

  const handleCreateProfile = () => {
    const selectedConditions: SpecialCondition[] = formData.conditions.map((type) => ({
      type: type as any,
      severity: 'moderate',
      notes: '',
    }));

    const accessibilityRequirements: AccessibilityRequirement[] = [
      { type: 'wheelchair_accessible', priority: 'important' },
      { type: 'accessible_bathroom', priority: 'critical' },
    ];

    const profile = createSpecialNeedsProfile(
      formData.childName,
      formData.age,
      selectedConditions,
      accessibilityRequirements
    );

    profile.sensoryPreferences.soundSensitivity = formData.soundSensitivity as any;
    profile.sensoryPreferences.crowdTolerance = formData.crowdTolerance as any;

    setProfiles([...profiles, profile]);
    setSelectedProfile(profile);
    setShowProfileForm(false);
    setFormData({
      childName: '',
      age: 5,
      conditions: [],
      soundSensitivity: 'normal',
      crowdTolerance: 'normal',
    });
  };

  const handleConditionToggle = (condition: SpecialCondition['type']) => {
    if (formData.conditions.includes(condition)) {
      setFormData({
        ...formData,
        conditions: formData.conditions.filter((c) => c !== condition),
      });
    } else {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, condition],
      });
    }
  };

  const assessedVenues = useMemo(() => {
    if (!selectedProfile) return [];

    return mockVenues.map((venue) =>
      assessVenueAccessibility(
        venue.id,
        venue.name,
        selectedProfile,
        {
          accessibilityFeatures: venue.accessibilityFeatures,
          noiseLevel: venue.noiseLevel as any,
          crowdExpectation: venue.crowdExpectation as any,
          hasQuietZone: venue.hasQuietZone,
          hasBreakRoom: venue.hasBreakRoom,
        }
      )
    );
  }, [selectedProfile]);

  const bestVenues = useMemo(() => {
    if (!selectedProfile) return [];
    return findBestAccessibleVenues(selectedProfile, assessedVenues, 60);
  }, [selectedProfile, assessedVenues]);

  const comparisonData = useMemo(() => {
    if (!selectedProfile) return [];
    return compareAccessibleVenues(assessedVenues, selectedProfile);
  }, [selectedProfile, assessedVenues]);

  return (
    <div className="accessibility-assistant">
      <div className="aa-header">
        <h2>♿ Accessibility & Special Needs Assistant</h2>
        <p>Find the perfect venues for your family's unique needs</p>
      </div>

      {/* Profile Section */}
      <div className="aa-section">
        <div className="aa-section-header">
          <h3>👨‍👧‍👦 Special Needs Profiles</h3>
          <button
            className="aa-btn aa-btn-primary"
            onClick={() => setShowProfileForm(!showProfileForm)}
          >
            {showProfileForm ? '✕ Cancel' : '+ New Profile'}
          </button>
        </div>

        {showProfileForm && (
          <div className="aa-form">
            <div className="form-group">
              <label>Child's Name:</label>
              <input
                type="text"
                value={formData.childName}
                onChange={(e) =>
                  setFormData({ ...formData, childName: e.target.value })
                }
                placeholder="e.g., Alex"
              />
            </div>

            <div className="form-group">
              <label>Age:</label>
              <input
                type="number"
                min="0"
                max="18"
                value={formData.age}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age: parseInt(e.target.value) || 5,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Special Conditions (select all that apply):</label>
              <div className="checkbox-group">
                {[
                  'autism',
                  'adhd',
                  'anxiety',
                  'mobility_impairment',
                  'hearing_impairment',
                  'allergy',
                ].map((condition) => (
                  <label key={condition} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.conditions.includes(condition as any)}
                      onChange={() =>
                        handleConditionToggle(condition as any)
                      }
                    />
                    {condition.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Sound Sensitivity:</label>
              <select
                value={formData.soundSensitivity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    soundSensitivity: e.target.value as any,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Crowd Tolerance:</label>
              <select
                value={formData.crowdTolerance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    crowdTolerance: e.target.value as any,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              className="aa-btn aa-btn-primary"
              onClick={handleCreateProfile}
            >
              Create Profile
            </button>
          </div>
        )}

        {profiles.length > 0 && (
          <div className="aa-profiles-list">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`profile-card ${
                  selectedProfile?.id === profile.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedProfile(profile)}
              >
                <h4>{profile.childName}</h4>
                <p>Age: {profile.age}</p>
                <p>{profile.conditions.length} conditions</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Venue Assessment Section */}
      {selectedProfile && assessedVenues.length > 0 && (
        <div className="aa-section">
          <h3>🏢 Venue Accessibility Assessment</h3>

          <div className="aa-venues-grid">
            {assessedVenues.map((venue) => (
              <div key={venue.venueId} className="aa-venue-card">
                <div className="venue-header">
                  <h4>{venue.venueName}</h4>
                  <div className="venue-scores">
                    <div className="score-badge">
                      <span className="score-value">{venue.matchScore}</span>
                      <span className="score-label">Match</span>
                    </div>
                  </div>
                </div>

                <div className="venue-metrics">
                  <div className="metric">
                    <span className="metric-label">Accessibility:</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${venue.accessibilityScore}%`,
                        }}
                      ></div>
                    </div>
                    <span className="metric-value">{venue.accessibilityScore}%</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Suitability:</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${venue.suitabilityScore}%`,
                        }}
                      ></div>
                    </div>
                    <span className="metric-value">{venue.suitabilityScore}%</span>
                  </div>
                </div>

                <div className="venue-features">
                  <h5>Features:</h5>
                  <ul>
                    {venue.accessibilityFeatures
                      .filter((f) => f.available)
                      .slice(0, 3)
                      .map((feature) => (
                        <li key={feature.type}>
                          ✓ {feature.type.replace(/_/g, ' ')}
                        </li>
                      ))}
                  </ul>
                </div>

                {venue.warnings.length > 0 && (
                  <div className="venue-warnings">
                    <h5>⚠️ Warnings:</h5>
                    {venue.warnings.slice(0, 2).map((warning, idx) => (
                      <p key={idx} className={`warning-${warning.severity}`}>
                        {warning.message}
                      </p>
                    ))}
                  </div>
                )}

                <div className="venue-recommendation">
                  <p className="recommendation-text">
                    {comparisonData.find((c) => c.venueId === venue.venueId)
                      ?.recommendation || 'Review recommendations'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Venues Section */}
      {selectedProfile && bestVenues.length > 0 && (
        <div className="aa-section">
          <h3>🌟 Best Venues for {selectedProfile.childName}</h3>
          <div className="aa-best-venues">
            {bestVenues.map((venue, idx) => (
              <div key={venue.venueId} className="best-venue-item">
                <div className="rank">#{idx + 1}</div>
                <div className="venue-info">
                  <h4>{venue.venueName}</h4>
                  <p className="match-score">
                    Match Score: <strong>{venue.matchScore}%</strong>
                  </p>
                  {venue.recommendations.length > 0 && (
                    <div className="quick-tips">
                      <p className="tips-label">💡 Quick Tips:</p>
                      <ul>
                        {venue.recommendations.slice(0, 2).map((rec, idx) => (
                          <li key={idx}>{rec.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedProfile && profiles.length === 0 && (
        <div className="aa-empty-state">
          <p>👶 Create a special needs profile to get personalized venue recommendations</p>
        </div>
      )}
    </div>
  );
}

export default AccessibilityAssistant;
