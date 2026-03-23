import React, { useEffect, useState } from 'react';
import {
  loadPreferences,
  savePreferences,
  recordLocationView,
  getPersonalizedRecommendations,
  getPreferenceSummary,
  setChildAgeRange,
} from '../utils/userPreferences';

interface Location {
  id: string;
  name: { en: string; zh: string };
  category: string;
  facilities?: string[];
  averageRating?: number;
}

interface PersonalizedRecommendationsProps {
  locations: Location[];
  onSelectLocation?: (locationId: string) => void;
  language?: 'en' | 'zh';
  showPreferenceSummary?: boolean;
  limit?: number;
}

/**
 * Personalized Recommendations Component
 * Uses user preference learning to show relevant locations
 */
export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  locations,
  onSelectLocation,
  language = 'en',
  showPreferenceSummary = true,
  limit = 5,
}) => {
  const [recommendedLocationIds, setRecommendedLocationIds] = useState<string[]>([]);
  const [preferenceSummary, setPreferenceSummary] = useState<any>(null);
  const [userChildAge, setUserChildAge] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load preferences and calculate recommendations
    const prefs = loadPreferences();
    const recs = getPersonalizedRecommendations(locations, prefs, limit);
    const summary = getPreferenceSummary(prefs);

    setRecommendedLocationIds(recs);
    setPreferenceSummary(summary);
    setUserChildAge(prefs.childAgeRange);
    setLoading(false);
  }, [locations, limit]);

  const handleSelectLocation = (locationId: string) => {
    // Record view in preferences
    const prefs = loadPreferences();
    const location = locations.find((l) => l.id === locationId);
    if (location) {
      const updated = recordLocationView(prefs, locationId, location);
      savePreferences(updated);
    }

    onSelectLocation?.(locationId);
  };

  const handleSetChildAge = (minAge: number, maxAge: number) => {
    const prefs = loadPreferences();
    const updated = setChildAgeRange(prefs, minAge, maxAge);
    savePreferences(updated);

    setUserChildAge([minAge, maxAge]);

    // Recalculate recommendations
    const newRecs = getPersonalizedRecommendations(locations, updated, limit);
    setRecommendedLocationIds(newRecs);
  };

  if (loading) {
    return <div style={{ padding: '16px', textAlign: 'center' }}>Loading recommendations...</div>;
  }

  const recommendedLocations = locations.filter((l) =>
    recommendedLocationIds.includes(l.id)
  );

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
          {language === 'zh' ? '個性化推薦' : 'Personalized for You'}
        </h2>

        {/* Preference Summary */}
        {showPreferenceSummary && preferenceSummary && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.85rem',
              color: '#666',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 500 }}>
              {language === 'zh' ? '您的偏好' : 'Your Preferences'}
            </h3>

            {preferenceSummary.topCategories.length > 0 && (
              <div style={{ marginBottom: '6px' }}>
                <strong>{language === 'zh' ? '喜歡的類別：' : 'Preferred types: '}</strong>
                {preferenceSummary.topCategories.join(', ')}
              </div>
            )}

            {preferenceSummary.topFacilities.length > 0 && (
              <div style={{ marginBottom: '6px' }}>
                <strong>{language === 'zh' ? '常用設施：' : 'Common facilities: '}</strong>
                {preferenceSummary.topFacilities.join(', ')}
              </div>
            )}

            {userChildAge && (
              <div>
                <strong>{language === 'zh' ? '孩子年齡：' : 'Child age: '}</strong>
                {userChildAge[0]}-{userChildAge[1]} years
              </div>
            )}

            {preferenceSummary.totalInteractions > 0 && (
              <div style={{ marginTop: '6px', fontSize: '0.8rem' }}>
                {language === 'zh'
                  ? `基於 ${preferenceSummary.totalInteractions} 次互動的推薦`
                  : `Recommendations based on ${preferenceSummary.totalInteractions} interactions`}
              </div>
            )}
          </div>
        )}

        {/* Child Age Selection */}
        {!userChildAge && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.85rem',
            }}
          >
            <p style={{ margin: '0 0 8px 0' }}>
              {language === 'zh'
                ? '告訴我們您孩子的年齡以獲得更好的推薦'
                : 'Tell us your child\'s age for better recommendations'}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                [0, 2],
                [3, 5],
                [6, 10],
                [11, 15],
              ].map(([min, max]) => (
                <button
                  key={`${min}-${max}`}
                  onClick={() => handleSetChildAge(min, max)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0056b3';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#007bff';
                  }}
                >
                  {min}-{max} {language === 'zh' ? '歲' : 'y'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations List */}
      {recommendedLocations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendedLocations.map((location, idx) => (
            <div
              key={location.id}
              onClick={() => handleSelectLocation(location.id)}
              style={{
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#fafafa',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 2px 8px rgba(0,0,0,0.1)';
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fafafa';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
                    #{idx + 1} {language === 'zh' ? location.name.zh : location.name.en}
                  </h4>
                  <p style={{ margin: '0', fontSize: '0.8rem', color: '#666' }}>
                    {location.category}
                  </p>
                </div>
                {location.averageRating && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ff6f61' }}>
                      ★ {location.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {location.facilities && location.facilities.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                    marginBottom: '8px',
                  }}
                >
                  {location.facilities.slice(0, 3).map((facility) => (
                    <span
                      key={facility}
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#e7f3ff',
                        color: '#0056b3',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {facility}
                    </span>
                  ))}
                  {location.facilities.length > 3 && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        padding: '2px 6px',
                      }}
                    >
                      +{location.facilities.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                {language === 'zh'
                  ? '點擊查看詳情 →'
                  : 'Click to see details →'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          {language === 'zh'
            ? '暫無推薦。與更多地點互動以獲得個性化推薦。'
            : 'No personalized recommendations yet. Interact with more locations to get recommendations.'}
        </div>
      )}
    </div>
  );
};
