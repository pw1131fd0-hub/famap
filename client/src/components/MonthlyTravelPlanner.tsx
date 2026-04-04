import React, { useState, useCallback } from 'react';
import {
  generateMonthlyTravelPlan,
  exportMonthlyPlanAsText,
  type FamilyTravelProfile,
  type MonthlyTravelPlan,
} from '../utils/monthlyTravelPlanner';
import { useLanguage } from '../i18n/useLanguage';
import type { Location } from '../types';
import '../styles/MonthlyTravelPlanner.css';

interface MonthlyTravelPlannerProps {
  locations: Location[];
  onExport?: (plan: MonthlyTravelPlan) => void;
}

export const MonthlyTravelPlanner: React.FC<MonthlyTravelPlannerProps> = ({ locations, onExport }) => {
  const { language } = useLanguage();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentPlan, setCurrentPlan] = useState<MonthlyTravelPlan | null>(null);
  const [familyProfile, setFamilyProfile] = useState<FamilyTravelProfile>({
    childrenAges: [5],
    interests: ['outdoor', 'learning'],
    maxBudget: 500,
    preferredDays: ['Sat', 'Sun'],
    travelDistance: 'nearby',
    seasonPreference: 'any',
    activityPreference: 'mixed',
  });
  const [showSettings, setShowSettings] = useState(false);

  const labels = {
    en: {
      title: 'Monthly Family Travel Planner',
      generatePlan: 'Generate Plan',
      export: 'Export Plan',
      settings: 'Settings',
      childrenAges: 'Children Ages',
      budget: 'Monthly Budget',
      preferredDays: 'Preferred Days',
      travelDistance: 'Travel Distance',
      seasonPreference: 'Season Preference',
      activityType: 'Activity Type',
      weeklyBreakdown: 'Weekly Breakdown',
      savings: 'Savings Opportunities',
      summary: 'Plan Summary',
      totalVisits: 'Total Visits',
      uniqueLocations: 'Unique Locations',
      familyScore: 'Family-Friendliness',
      varietyScore: 'Variety Score',
      valueScore: 'Value for Money',
      recommendations: 'Recommendations',
      noLocations: 'No locations available for planning',
      generatingPlan: 'Generating plan...',
    },
    zh: {
      title: '每月家庭旅遊規劃師',
      generatePlan: '生成計畫',
      export: '匯出計畫',
      settings: '設定',
      childrenAges: '孩子年齡',
      budget: '月度預算',
      preferredDays: '偏好的日期',
      travelDistance: '旅遊距離',
      seasonPreference: '季節偏好',
      activityType: '活動類型',
      weeklyBreakdown: '週間詳細',
      savings: '省錢機會',
      summary: '計畫摘要',
      totalVisits: '總訪問次數',
      uniqueLocations: '獨特地點',
      familyScore: '家庭友善度',
      varietyScore: '多樣性評分',
      valueScore: '性價比',
      recommendations: '建議',
      noLocations: '沒有可用的地點進行規劃',
      generatingPlan: '正在生成計畫...',
    },
  };

  const t = labels[language as keyof typeof labels];

  const handleGeneratePlan = useCallback(() => {
    if (locations.length === 0) {
      return;
    }

    const plan = generateMonthlyTravelPlan(locations, familyProfile, year, month);
    setCurrentPlan(plan);
  }, [locations, familyProfile, year, month]);

  const handleExport = useCallback(() => {
    if (!currentPlan) return;

    const text = exportMonthlyPlanAsText(currentPlan);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `family-travel-plan-${year}-${month + 1}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    if (onExport) {
      onExport(currentPlan);
    }
  }, [currentPlan, year, month, onExport]);

  const handleAgeChange = (index: number, value: string) => {
    const newAges = [...familyProfile.childrenAges];
    newAges[index] = parseInt(value) || 0;
    setFamilyProfile({ ...familyProfile, childrenAges: newAges });
  };

  const handleAddAge = () => {
    const newAges = [...familyProfile.childrenAges, 0];
    setFamilyProfile({ ...familyProfile, childrenAges: newAges });
  };

  const handleRemoveAge = (index: number) => {
    const newAges = familyProfile.childrenAges.filter((_, i) => i !== index);
    setFamilyProfile({ ...familyProfile, childrenAges: newAges });
  };

  return (
    <div className="monthly-travel-planner">
      <div className="planner-header">
        <h2>{t.title}</h2>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title={t.settings}
        >
          ⚙️
        </button>
      </div>

      <div className="planner-controls">
        <div className="month-selector">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(year, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        {showSettings && (
          <div className="planner-settings">
            <div className="setting-group">
              <label>{t.childrenAges}</label>
              <div className="ages-input">
                {familyProfile.childrenAges.map((age, idx) => (
                  <div key={idx} className="age-input-row">
                    <input
                      type="number"
                      min="0"
                      max="18"
                      value={age}
                      onChange={(e) => handleAgeChange(idx, e.target.value)}
                    />
                    {familyProfile.childrenAges.length > 1 && (
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveAge(idx)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button className="add-btn" onClick={handleAddAge}>
                  + {language === 'en' ? 'Add' : '新增'}
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label>{t.budget}</label>
              <input
                type="number"
                min="50"
                step="50"
                value={familyProfile.maxBudget}
                onChange={(e) =>
                  setFamilyProfile({ ...familyProfile, maxBudget: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="setting-group">
              <label>{t.travelDistance}</label>
              <select
                value={familyProfile.travelDistance}
                onChange={(e) =>
                  setFamilyProfile({
                    ...familyProfile,
                    travelDistance: e.target.value as any,
                  })
                }
              >
                <option value="nearby">Nearby / 附近</option>
                <option value="moderate">Moderate / 中等距離</option>
                <option value="far">Far / 遠距離</option>
              </select>
            </div>

            <div className="setting-group">
              <label>{t.activityType}</label>
              <select
                value={familyProfile.activityPreference}
                onChange={(e) =>
                  setFamilyProfile({
                    ...familyProfile,
                    activityPreference: e.target.value as any,
                  })
                }
              >
                <option value="outdoor">Outdoor / 戶外</option>
                <option value="indoor">Indoor / 室內</option>
                <option value="mixed">Mixed / 混合</option>
              </select>
            </div>
          </div>
        )}

        <button
          className="generate-btn"
          onClick={handleGeneratePlan}
          disabled={locations.length === 0}
        >
          {t.generatePlan}
        </button>
      </div>

      {locations.length === 0 && (
        <div className="no-locations">{t.noLocations}</div>
      )}

      {currentPlan && (
        <div className="plan-display">
          <div className="plan-header">
            <h3>{currentPlan.month}</h3>
            <button className="export-btn" onClick={handleExport}>
              📥 {t.export}
            </button>
          </div>

          <div className="budget-summary">
            <div className="budget-card">
              <div className="label">{t.budget}</div>
              <div className="amount">${currentPlan.totalBudget}</div>
            </div>
            <div className="budget-card">
              <div className="label">{language === 'en' ? 'Estimated Cost' : '估計成本'}</div>
              <div className="amount">${currentPlan.estimatedCost.toFixed(2)}</div>
            </div>
            <div className="budget-card">
              <div className="label">{language === 'en' ? 'Remaining' : '剩餘'}</div>
              <div className={`amount ${currentPlan.totalBudget >= currentPlan.estimatedCost ? 'positive' : 'negative'}`}>
                ${(currentPlan.totalBudget - currentPlan.estimatedCost).toFixed(2)}
              </div>
            </div>
          </div>

          {currentPlan.savingsOpportunities.length > 0 && (
            <div className="savings-section">
              <h4>{t.savings} 💰</h4>
              <div className="savings-grid">
                {currentPlan.savingsOpportunities.map((opp, idx) => (
                  <div key={idx} className="savings-card">
                    <div className="savings-type">{opp.type}</div>
                    <div className="savings-desc">{opp.description}</div>
                    <div className="savings-amount">${opp.potentialSavings}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="summary-section">
            <h4>{t.summary}</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="label">{t.totalVisits}</div>
                <div className="value">{currentPlan.summary.totalVisits}</div>
              </div>
              <div className="summary-item">
                <div className="label">{t.uniqueLocations}</div>
                <div className="value">{currentPlan.summary.uniqueLocations}</div>
              </div>
              <div className="summary-item">
                <div className="label">{t.familyScore}</div>
                <div className="value score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${currentPlan.summary.familyFriendlinessScore}%`,
                    }}
                  />
                  <span>{currentPlan.summary.familyFriendlinessScore}/100</span>
                </div>
              </div>
              <div className="summary-item">
                <div className="label">{t.varietyScore}</div>
                <div className="value score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${currentPlan.summary.varietyScore}%`,
                    }}
                  />
                  <span>{currentPlan.summary.varietyScore}/100</span>
                </div>
              </div>
              <div className="summary-item">
                <div className="label">{t.valueScore}</div>
                <div className="value score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${currentPlan.summary.valueForMoneyScore}%`,
                    }}
                  />
                  <span>{currentPlan.summary.valueForMoneyScore}/100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="recommendations-section">
            <h4>{t.recommendations}</h4>
            <ul className="recommendations-list">
              {currentPlan.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="weekly-section">
            <h4>{t.weeklyBreakdown}</h4>
            {currentPlan.weeklyPlans.map((week) => (
              <div key={week.week} className="weekly-card">
                <div className="week-header">
                  <h5>Week {week.week}: {week.theme}</h5>
                  <span className="week-cost">${week.estimatedCost.toFixed(2)}</span>
                </div>
                <div className="week-visits">
                  {week.plannedVisits.map((visit, idx) => (
                    <div key={idx} className="visit-item">
                      <div className="visit-location">{visit.location.name.en}</div>
                      <div className="visit-date">
                        {visit.date.toLocaleDateString()} @ {visit.startTime}
                      </div>
                      <div className={`visit-priority priority-${visit.priority}`}>
                        {visit.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTravelPlanner;
