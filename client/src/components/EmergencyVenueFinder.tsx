/**
 * Emergency & Last-Minute Venue Finder Component
 * Helps families quickly find venues for urgent needs
 */

import React, { useState } from 'react';
import {
  findEmergencyVenue,
  generateLastMinuteOutingPlans,
  type EmergencyNeed,
  type EmergencyVenueScore,
  type LastMinutePlans,
} from '../utils/emergencyVenueFinder';
import { useLanguage } from '../i18n/useLanguage';
import type { Location } from '../types';
import '../styles/EmergencyVenueFinder.css';

interface EmergencyVenueFinderProps {
  locations: Location[];
  userLat: number;
  userLng: number;
  onVenueSelected?: (venue: EmergencyVenueScore) => void;
}

type EmergencyType =
  | 'nursing_room'
  | 'bathroom'
  | 'medical'
  | 'shelter_rain'
  | 'meal'
  | 'activity'
  | 'parking'
  | 'rest_area';

export const EmergencyVenueFinder: React.FC<EmergencyVenueFinderProps> = ({
  locations,
  userLat,
  userLng,
  onVenueSelected,
}) => {
  const { language } = useLanguage();
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('bathroom');
  const [urgency, setUrgency] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [timeAvailable, setTimeAvailable] = useState(30);
  const [childAges, setChildAges] = useState<number[]>([5]);
  const [familySize, setFamilySize] = useState(2);
  const [results, setResults] = useState<EmergencyVenueScore[]>([]);
  const [lastMinutePlans, setLastMinutePlans] = useState<LastMinutePlans | null>(null);
  const [showLastMinute, setShowLastMinute] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const translations = {
    en: {
      title: 'Emergency & Quick Venue Finder',
      subtitle: 'Find what you need right now',
      needType: 'What do you need?',
      urgency: 'How urgent?',
      timeAvailable: 'Time available (minutes)',
      childAges: 'Child ages (comma-separated)',
      familySize: 'Family size',
      search: 'Find Venue',
      lastMinute: 'Last-Minute Outing Plan',
      results: 'Available Venues',
      noResults: 'No suitable venues found',
      score: 'Score',
      travelTime: 'Travel time',
      waitTime: 'Est. wait',
      crowding: 'Crowding',
      reasons: 'Why recommended',
      selectVenue: 'Select Venue',
      mins: 'mins',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      activity: 'Activity',
      bathroom: 'Bathroom',
      medical: 'Medical',
      nursing: 'Nursing Room',
      shelter: 'Weather Shelter',
      meal: 'Meal',
      parking: 'Parking',
      rest: 'Rest Area',
      weatherCondition: 'Weather',
      sunny: 'Sunny',
      rainy: 'Rainy',
      cloudy: 'Cloudy',
      estimatedCost: 'Est. cost',
      bestTime: 'Best time',
      activities: 'Activities',
      nearbyVenues: 'Nearby venues',
    },
    zh: {
      title: '緊急與快速地點查找器',
      subtitle: '立即找到您需要的地方',
      needType: '您需要什麼?',
      urgency: '多緊急?',
      timeAvailable: '可用時間 (分鐘)',
      childAges: '孩子年齡 (逗號分隔)',
      familySize: '家庭人數',
      search: '找尋地點',
      lastMinute: '臨時出遊計畫',
      results: '可用地點',
      noResults: '未找到合適地點',
      score: '評分',
      travelTime: '旅行時間',
      waitTime: '預計等待',
      crowding: '擁擠度',
      reasons: '推薦原因',
      selectVenue: '選擇地點',
      mins: '分鐘',
      critical: '緊急',
      high: '高',
      medium: '中等',
      low: '低',
      activity: '活動',
      bathroom: '浴室',
      medical: '醫療',
      nursing: '哺乳室',
      shelter: '遮蔽處',
      meal: '用餐',
      parking: '停車場',
      rest: '休息區',
      weatherCondition: '天氣',
      sunny: '晴天',
      rainy: '雨天',
      cloudy: '陰天',
      estimatedCost: '預計費用',
      bestTime: '最佳時間',
      activities: '活動',
      nearbyVenues: '附近地點',
    },
  };

  const t = translations[language];

  const handleSearch = () => {
    setIsSearching(true);
    const need: EmergencyNeed = {
      type: emergencyType,
      urgency,
      timeAvailable,
      preferredDistance: 10,
      familySize,
      childAges,
    };

    const venueResults = findEmergencyVenue(locations, need, userLat, userLng);
    setResults(venueResults);
    setIsSearching(false);
  };

  const handleLastMinutePlan = () => {
    const plans = generateLastMinuteOutingPlans(
      locations,
      timeAvailable,
      userLat,
      userLng,
      familySize,
      childAges,
      'sunny'
    );
    setLastMinutePlans(plans);
    setShowLastMinute(true);
  };

  const handleVenueSelect = (venue: EmergencyVenueScore) => {
    if (onVenueSelected) {
      onVenueSelected(venue);
    }
  };

  const getCrowdingColor = (level: string): string => {
    if (level === 'low') return 'green';
    if (level === 'moderate') return 'orange';
    return 'red';
  };

  const getCrowdingLabel = (level: string): string => {
    if (level === 'low') return 'Low';
    if (level === 'moderate') return 'Moderate';
    return 'High';
  };

  return (
    <div className="emergency-venue-finder">
      <div className="evf-header">
        <h2>{t.title}</h2>
        <p className="evf-subtitle">{t.subtitle}</p>
      </div>

      <div className="evf-form">
        <div className="evf-form-group">
          <label htmlFor="evf-need-type">{t.needType}</label>
          <select id="evf-need-type" value={emergencyType} onChange={(e) => setEmergencyType(e.target.value as EmergencyType)}>
            <option value="bathroom">{t.bathroom}</option>
            <option value="nursing_room">{t.nursing}</option>
            <option value="medical">{t.medical}</option>
            <option value="meal">{t.meal}</option>
            <option value="shelter_rain">{t.shelter}</option>
            <option value="activity">{t.activity}</option>
            <option value="parking">{t.parking}</option>
            <option value="rest_area">{t.rest}</option>
          </select>
        </div>

        <div className="evf-form-group">
          <label htmlFor="evf-urgency">{t.urgency}</label>
          <select id="evf-urgency" value={urgency} onChange={(e) => setUrgency(e.target.value as any)}>
            <option value="critical">{t.critical}</option>
            <option value="high">{t.high}</option>
            <option value="medium">{t.medium}</option>
            <option value="low">{t.low}</option>
          </select>
        </div>

        <div className="evf-form-group">
          <label htmlFor="evf-time-available">
            {t.timeAvailable}: <span className="evf-value">{timeAvailable}</span>
          </label>
          <input
            id="evf-time-available"
            type="range"
            aria-label={t.timeAvailable}
            min="5"
            max="240"
            step="5"
            value={timeAvailable}
            onChange={(e) => setTimeAvailable(Number(e.target.value))}
          />
        </div>

        <div className="evf-form-group">
          <label htmlFor="evf-family-size">
            {t.familySize}: <span className="evf-value">{familySize}</span>
          </label>
          <input
            id="evf-family-size"
            type="range"
            aria-label={t.familySize}
            min="1"
            max="10"
            value={familySize}
            onChange={(e) => setFamilySize(Number(e.target.value))}
          />
        </div>

        <div className="evf-form-group">
          <label>{t.childAges}</label>
          <input
            type="text"
            placeholder="e.g., 3, 5, 8"
            defaultValue={childAges.join(', ')}
            onChange={(e) => {
              const ages = e.target.value
                .split(',')
                .map((a) => parseInt(a.trim()))
                .filter((a) => !isNaN(a));
              if (ages.length > 0) {
                setChildAges(ages);
              }
            }}
          />
        </div>

        <div className="evf-button-group">
          <button className="evf-btn evf-btn-primary" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : t.search}
          </button>
          <button className="evf-btn evf-btn-secondary" onClick={handleLastMinutePlan}>
            ⏱️ {t.lastMinute}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="evf-results">
          <h3>{t.results}</h3>
          <div className="evf-results-list">
            {results.map((venue) => (
              <div key={venue.locationId} className="evf-result-card">
                <div className="evf-result-header">
                  <div className="evf-result-title">
                    <h4>{venue.locationName}</h4>
                    <div className="evf-result-score">{venue.score}/100</div>
                  </div>
                </div>

                <div className="evf-result-metrics">
                  <div className="evf-metric">
                    <span className="evf-label">⏱️ {t.travelTime}:</span>
                    <span className="evf-value">{venue.travelTime} {t.mins}</span>
                  </div>
                  <div className="evf-metric">
                    <span className="evf-label">⏳ {t.waitTime}:</span>
                    <span className="evf-value">{venue.estimatedWaitTime} {t.mins}</span>
                  </div>
                  <div className="evf-metric">
                    <span className="evf-label">👥 {t.crowding}:</span>
                    <span className={`evf-crowding evf-crowding-${getCrowdingColor(venue.crowdingLevel)}`}>
                      {getCrowdingLabel(venue.crowdingLevel)}
                    </span>
                  </div>
                </div>

                {venue.recommendationReason && venue.recommendationReason.length > 0 && (
                  <div className="evf-result-reasons">
                    <p className="evf-label">{t.reasons}:</p>
                    <ul>
                      {venue.recommendationReason.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="evf-btn evf-btn-select"
                  onClick={() => handleVenueSelect(venue)}
                >
                  {t.selectVenue}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !isSearching && (
        <div className="evf-empty">
          <p>{t.noResults}</p>
        </div>
      )}

      {/* Last-Minute Plans Section */}
      {showLastMinute && lastMinutePlans && (
        <div className="evf-last-minute">
          <h3>{t.lastMinute}</h3>

          {lastMinutePlans.nearbyVenues.length > 0 && (
            <div className="evf-nearby">
              <h4>{t.nearbyVenues}</h4>
              <div className="evf-nearby-list">
                {lastMinutePlans.nearbyVenues.slice(0, 3).map((venue) => (
                  <div key={venue.locationId} className="evf-nearby-item">
                    <div className="evf-nearby-name">{venue.locationName}</div>
                    <div className="evf-nearby-time">⏱️ {venue.travelTime} {t.mins}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastMinutePlans.quickActivities.length > 0 && (
            <div className="evf-activities">
              <h4>{t.activities}</h4>
              <div className="evf-activities-list">
                {lastMinutePlans.quickActivities.map((activity, idx) => (
                  <div key={idx} className="evf-activity-item">
                    <div className="evf-activity-category">{activity.category}</div>
                    <div className="evf-activity-duration">
                      {activity.duration} {t.mins}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="evf-plan-info">
            <div className="evf-plan-item">
              <span className="evf-label">{t.estimatedCost}:</span>
              <span className="evf-value">
                NT${lastMinutePlans.estimatedCost}
              </span>
            </div>
            {lastMinutePlans.weatherConsiderations && (
              <div className="evf-plan-item">
                <span className="evf-label">{t.weatherCondition}:</span>
                <span className="evf-value">{lastMinutePlans.weatherConsiderations}</span>
              </div>
            )}
            {lastMinutePlans.bestTimeWindow && (
              <div className="evf-plan-item">
                <span className="evf-label">{t.bestTime}:</span>
                <span className="evf-value">
                  {lastMinutePlans.bestTimeWindow.startTime.toLocaleTimeString()} -{' '}
                  {lastMinutePlans.bestTimeWindow.endTime.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyVenueFinder;
