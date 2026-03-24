import React, { useState, useCallback } from 'react';
import { Clock, DollarSign, Users, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import {
  createOutingPlan,
  optimizeOutingForBudget,
  optimizeOutingForTime,
  type FamilyProfile,
  type OutingPlan,
} from '../utils/outingPlanner';
import type { Location } from '../types';

interface OutingPlannerProps {
  locations: Location[];
  onSelectLocation?: (location: Location) => void;
  userLocation?: { lat: number; lng: number };
}

export default function OutingPlanner({ locations, onSelectLocation, userLocation }: OutingPlannerProps) {
  const [plan, setPlan] = useState<OutingPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [profile, setProfile] = useState<FamilyProfile>({
    childrenAges: [5, 8],
    specialNeeds: [],
    interests: ['park', 'play'],
    budget: 500,
    maxTravelTime: 60,
    duration: 4,
  });

  const handleGeneratePlan = useCallback(() => {
    if (locations.length < 2) {
      alert('Need at least 2 locations to create a plan');
      return;
    }

    const newPlan = createOutingPlan(locations, profile, userLocation);
    setPlan(newPlan);
    setShowForm(false);
  }, [locations, profile, userLocation]);

  const handleOptimizeForTime = useCallback(() => {
    if (!plan) return;
    const optimized = optimizeOutingForTime(plan, profile.duration * 60);
    setPlan(optimized);
  }, [plan, profile.duration]);

  const handleOptimizeForBudget = useCallback(() => {
    if (!plan) return;
    const optimized = optimizeOutingForBudget(plan, profile.budget);
    setPlan(optimized);
  }, [plan, profile.budget]);

  const handleAgesChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newAges = [...profile.childrenAges];
    newAges[index] = parseInt(e.target.value) || 0;
    setProfile({ ...profile, childrenAges: newAges });
  };

  const handleAddAge = () => {
    setProfile({
      ...profile,
      childrenAges: [...profile.childrenAges, 0],
    });
  };

  const handleRemoveAge = (index: number) => {
    if (profile.childrenAges.length > 1) {
      const newAges = profile.childrenAges.filter((_, i) => i !== index);
      setProfile({ ...profile, childrenAges: newAges });
    }
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      interests: e.target.value.split(',').map((i) => i.trim()),
    });
  };

  const getCrowdnessColor = (level: string) => {
    switch (level) {
      case 'low':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={24} color="#fbbf24" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
            Smart Outing Planner
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#fbbf24',
            border: 'none',
            borderRadius: '6px',
            color: '#111827',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {showForm ? 'Hide Form' : 'New Plan'}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #fbbf24' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
            Family Profile
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '6px' }}>
              Children's Ages
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {profile.childrenAges.map((age, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => handleAgesChange(e, index)}
                    min="0"
                    max="18"
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '13px',
                    }}
                  />
                  {profile.childrenAges.length > 1 && (
                    <button
                      onClick={() => handleRemoveAge(index)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#fee2e2',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#991b1b',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddAge}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#dbeafe',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#1e40af',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                }}
              >
                + Add Child
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '6px' }}>
              Budget: ${profile.budget}
            </label>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={profile.budget}
              onChange={(e) => setProfile({ ...profile, budget: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '6px' }}>
              Duration: {profile.duration} hours
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={profile.duration}
              onChange={(e) => setProfile({ ...profile, duration: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '6px' }}>
              Interests (comma-separated)
            </label>
            <input
              type="text"
              value={profile.interests.join(', ')}
              onChange={handleInterestsChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
              }}
              placeholder="e.g., park, play, learn"
            />
          </div>

          <button
            onClick={handleGeneratePlan}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#fbbf24',
              border: 'none',
              borderRadius: '6px',
              color: '#111827',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Generate Plan
          </button>
        </div>
      )}

      {plan && (
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
            {plan.name}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>Duration</div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: 'bold', marginTop: '4px' }}>
                {Math.round(plan.totalDuration)} min
              </div>
            </div>

            <div style={{ backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>Cost</div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: 'bold', marginTop: '4px' }}>
                ${plan.totalCost}
              </div>
            </div>

            <div style={{ backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>Crowdiness</div>
              <div style={{ fontSize: '16px', color: getCrowdnessColor(plan.crowdnessLevel), fontWeight: 'bold', marginTop: '4px' }}>
                {plan.crowdnessLevel.charAt(0).toUpperCase() + plan.crowdnessLevel.slice(1)}
              </div>
            </div>

            <div style={{ backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>Age Range</div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: 'bold', marginTop: '4px' }}>
                {plan.ageRecommendation}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '6px' }}>
              Best Time to Visit
            </div>
            <div style={{ fontSize: '13px', color: '#374151', backgroundColor: '#fffbeb', padding: '8px', borderRadius: '4px', borderLeft: '3px solid #fbbf24' }}>
              {plan.bestTimeToGo}
            </div>
          </div>

          {plan.weatherConsiderations.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} />
                Weather Considerations
              </div>
              <ul style={{ fontSize: '13px', color: '#374151', margin: '0', paddingLeft: '20px' }}>
                {plan.weatherConsiderations.map((consideration, idx) => (
                  <li key={idx}>{consideration}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>
              Itinerary ({plan.locations.length} locations)
            </h4>
            {plan.locations.map((planLoc, idx) => (
              <div
                key={idx}
                onClick={() => onSelectLocation?.(planLoc.location)}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#efefef';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div
                    style={{
                      backgroundColor: '#fbbf24',
                      color: '#111827',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#111827', marginBottom: '4px' }}>
                      {typeof planLoc.location.name === 'string'
                        ? planLoc.location.name
                        : planLoc.location.name.en}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      {planLoc.recommendationReason}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#374151', flexWrap: 'wrap' }}>
                      {planLoc.travelTimeFromPrevious > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {planLoc.travelTimeFromPrevious} min travel
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {planLoc.estimatedStayTime} min stay
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={12} />
                        ${planLoc.estimatedCost}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} />
                        Age {planLoc.ageMatch}%
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={16} color="#9ca3af" style={{ flexShrink: 0, marginTop: '2px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleOptimizeForTime}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '6px',
                color: '#1e40af',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Optimize for Time
            </button>
            <button
              onClick={handleOptimizeForBudget}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '6px',
                color: '#166534',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Optimize for Budget
            </button>
            <button
              onClick={() => setPlan(null)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                color: '#991b1b',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
