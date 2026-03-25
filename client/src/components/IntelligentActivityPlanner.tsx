import React, { useState, useMemo, useCallback } from 'react';
import { Clock, DollarSign, Users, AlertCircle, ChevronDown, Zap } from 'lucide-react';
import type { Activity } from '../utils/activityPlanner';
import { getActivityRecommendationsForFamily, formatActivityDuration } from '../utils/activityPlanner';
import type { Location } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface IntelligentActivityPlannerProps {
  locations: Location[];
  isDarkMode?: boolean;
  onActivitySelect?: (activity: Activity) => void;
}

const IntelligentActivityPlanner: React.FC<IntelligentActivityPlannerProps> = ({
  locations,
  isDarkMode = false,
  onActivitySelect,
}) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [selectedAges, setSelectedAges] = useState<number[]>([5]);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [preferences, setPreferences] = useState({
    educationalValue: false,
    adventurousness: 2,
  });

  const activities = useMemo(
    () => getActivityRecommendationsForFamily(locations, selectedAges, selectedDuration, preferences),
    [locations, selectedAges, selectedDuration, preferences]
  );

  const translations = {
    title: isZh ? '智能活動計劃' : 'Intelligent Activity Planner',
    subtitle: isZh
      ? '根據您的家庭需求自動規劃完美的一天'
      : 'Automatically plan your perfect day based on your family needs',
    childrenAges: isZh ? '孩子年齡' : 'Children Ages',
    duration: isZh ? '持續時間' : 'Duration',
    hours: isZh ? '小時' : 'hours',
    preferences: isZh ? '偏好' : 'Preferences',
    educational: isZh ? '教育價值' : 'Educational Value',
    adventurousness: isZh ? '冒險程度' : 'Adventurousness',
    noActivities: isZh ? '無法找到合適的活動' : 'No suitable activities found',
    tryAdjusting: isZh
      ? '請調整年齡或持續時間'
      : 'Please adjust ages or duration',
    overallScore: isZh ? '整體評分' : 'Overall Score',
    stops: isZh ? '站點' : 'Stops',
    estimatedCost: isZh ? '估計成本' : 'Estimated Cost',
    twd: isZh ? '元' : 'TWD',
    crowdLevel: isZh ? '人群水平' : 'Crowd Level',
    bestTime: isZh ? '最佳開始時間' : 'Best Start Time',
    duration_label: isZh ? '持續時間' : 'Duration',
    facilities: isZh ? '設施亮點' : 'Facility Highlights',
    arrivalTime: isZh ? '到達時間' : 'Arrival Time',
    travelTime: isZh ? '旅行時間' : 'Travel Time',
    minutes: isZh ? '分鐘' : 'minutes',
    addAge: isZh ? '+ 添加年齡' : '+ Add Age',
    removeAge: isZh ? '移除' : 'Remove',
  };

  const handleAddAge = () => {
    const newAge = Math.max(0, Math.min(18, Math.max(...selectedAges) + 1));
    setSelectedAges([...selectedAges, newAge]);
  };

  const handleRemoveAge = (index: number) => {
    if (selectedAges.length > 1) {
      setSelectedAges(selectedAges.filter((_, i) => i !== index));
    }
  };

  const handleActivitySelect = useCallback((activity: Activity) => {
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  }, [onActivitySelect]);

  const getCrowdLevelColor = (level: 'low' | 'moderate' | 'high') => {
    const colors = {
      low: isDarkMode ? 'bg-green-900' : 'bg-green-100',
      moderate: isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100',
      high: isDarkMode ? 'bg-red-900' : 'bg-red-100',
    };
    return colors[level];
  };

  const getCrowdLevelText = (level: 'low' | 'moderate' | 'high') => {
    const texts = {
      low: isZh ? '低' : 'Low',
      moderate: isZh ? '中等' : 'Moderate',
      high: isZh ? '高' : 'High',
    };
    return texts[level];
  };

  const containerBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const containerBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';

  return (
    <div className={`${containerBg} rounded-lg border ${containerBorder} p-6 shadow-lg`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className={`text-2xl font-bold ${textColor}`}>{translations.title}</h2>
        </div>
        <p className={`${secondaryText} text-sm`}>{translations.subtitle}</p>
      </div>

      {/* Family Configuration */}
      <div className="grid gap-4 mb-6 bg-gray-100 dark:bg-gray-700 rounded p-4">
        {/* Children Ages */}
        <div>
          <label className={`block text-sm font-semibold ${textColor} mb-2`}>
            {translations.childrenAges}
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedAges.map((age, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full"
              >
                <span>{age}</span>
                <button
                  onClick={() => handleRemoveAge(idx)}
                  className="text-white hover:text-gray-200"
                  aria-label={translations.removeAge}
                >
                  ×
                </button>
              </div>
            ))}
            {selectedAges.length < 4 && (
              <button
                onClick={handleAddAge}
                className={`text-sm ${inputBg} ${textColor} px-3 py-1 rounded-full hover:opacity-80`}
              >
                {translations.addAge}
              </button>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className={`block text-sm font-semibold ${textColor} mb-2`}>
            {translations.duration}
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
            className="w-full"
          />
          <p className={`text-sm ${secondaryText} mt-1`}>
            {selectedDuration} {translations.hours}
          </p>
        </div>

        {/* Preferences */}
        <div>
          <label className={`block text-sm font-semibold ${textColor} mb-2`}>
            {translations.preferences}
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.educationalValue}
                onChange={(e) =>
                  setPreferences({ ...preferences, educationalValue: e.target.checked })
                }
              />
              <span className={secondaryText}>{translations.educational}</span>
            </label>
            <div>
              <label className={`block text-xs ${secondaryText} mb-1`}>
                {translations.adventurousness}: {preferences.adventurousness}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={preferences.adventurousness}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    adventurousness: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className={`text-center py-8 ${secondaryText}`}>
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="font-semibold">{translations.noActivities}</p>
          <p className="text-sm">{translations.tryAdjusting}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`border ${containerBorder} rounded-lg overflow-hidden`}
            >
              {/* Activity Header */}
              <button
                onClick={() =>
                  setExpandedActivity(expandedActivity === activity.id ? null : activity.id)
                }
                className={`w-full p-4 flex items-start justify-between hover:opacity-80 transition ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex-1 text-left">
                  <h3 className={`font-bold ${textColor} mb-2`}>
                    {isZh ? activity.name.zh : activity.name.en}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className={secondaryText}>{formatActivityDuration(activity.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className={secondaryText}>{activity.estimatedCost} {translations.twd}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className={secondaryText}>
                        {activity.stops.length} {translations.stops}
                      </span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-semibold ${getCrowdLevelColor(
                        activity.crowdLevel
                      )}`}
                    >
                      {getCrowdLevelText(activity.crowdLevel)}
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end">
                  <div className="text-2xl font-bold text-blue-500">{activity.intelligenceScore}</div>
                  <span className={`text-xs ${secondaryText}`}>{translations.overallScore}</span>
                  <ChevronDown
                    className={`w-5 h-5 ${secondaryText} transition-transform ${
                      expandedActivity === activity.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Activity Details */}
              {expandedActivity === activity.id && (
                <div className={`border-t ${containerBorder} p-4 space-y-4`}>
                  <p className={secondaryText}>
                    {isZh ? activity.description.zh : activity.description.en}
                  </p>

                  {/* Recommendation Reason */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
                    <p className="text-sm">
                      {isZh
                        ? activity.recommendationReason.zh
                        : activity.recommendationReason.en}
                    </p>
                  </div>

                  {/* Best Time */}
                  <div>
                    <p className={`text-sm font-semibold ${textColor} mb-1`}>
                      {translations.bestTime}: {activity.bestTimeToStart.time}
                    </p>
                    <p className="text-sm">
                      {isZh
                        ? activity.bestTimeToStart.reason.zh
                        : activity.bestTimeToStart.reason.en}
                    </p>
                  </div>

                  {/* Stops Details */}
                  <div className="space-y-3">
                    <h4 className={`font-semibold ${textColor}`}>{translations.stops}</h4>
                    {activity.stops.map((stop) => (
                      <div
                        key={stop.location.id}
                        className={`p-3 rounded border ${containerBorder}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className={`font-semibold ${textColor}`}>
                              {stop.order}. {isZh ? stop.location.name?.zh : stop.location.name?.en}
                            </h5>
                            <p className={`text-sm ${secondaryText}`}>
                              {isZh ? stop.whyThisLocation.zh : stop.whyThisLocation.en}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className={secondaryText}>
                            {translations.arrivalTime}: {stop.suggestedArrivalTime}
                          </span>
                          <span className={secondaryText}>
                            {translations.duration_label}: {stop.suggestedDuration} min
                          </span>
                          <span className={secondaryText}>
                            {translations.travelTime}: {Math.round(stop.estimatedTravelTimeFromPrevious)} {translations.minutes}
                          </span>
                        </div>
                        {stop.facilityHighlights.length > 0 && (
                          <div className="mt-2">
                            <p className={`text-xs font-semibold ${textColor} mb-1`}>
                              {translations.facilities}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {stop.facilityHighlights.map((facility, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleActivitySelect(activity)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition"
                  >
                    {isZh ? '使用此計劃' : 'Use This Plan'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntelligentActivityPlanner;
