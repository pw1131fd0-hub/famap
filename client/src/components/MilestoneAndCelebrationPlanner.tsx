/**
 * Family Milestone & Celebration Planner Component
 * Helps families find perfect venues and plan celebrations for important milestones
 */

import React, { useState, useMemo } from 'react';
import {
  type FamilyMilestone,
  type CelebrationVenueSuggestion,
  type CelebrationPlan,
  type MilestoneType,
  type VenueStyle,
  analyzeMilestoneContext,
  generateCelebrationTips,
  createBudgetBreakdown,
  generateCelebrationTimeline,
  createCelebrationPlan,
  getStyleRecommendations,
  checkMilestoneUrgency,
  calculateCelebrationSuccessScore,
  calculateCelebrationScore
} from '../utils/milestonePlanner';
import { useLanguage } from '../i18n/useLanguage';
import '../styles/MilestoneAndCelebrationPlanner.css';

const MILESTONE_TYPES: { value: MilestoneType; labelEn: string; labelZh: string }[] = [
  { value: 'birthday', labelEn: 'Birthday', labelZh: '生日' },
  { value: 'anniversary', labelEn: 'Anniversary', labelZh: '周年紀念' },
  { value: 'graduation', labelEn: 'Graduation', labelZh: '畢業' },
  { value: 'achievement', labelEn: 'Achievement', labelZh: '成就慶祝' },
  { value: 'holiday', labelEn: 'Holiday', labelZh: '假日慶祝' },
  { value: 'school-milestone', labelEn: 'School Milestone', labelZh: '學校里程碑' },
  { value: 'family-reunion', labelEn: 'Family Reunion', labelZh: '家庭聚會' },
  { value: 'new-baby', labelEn: 'New Baby', labelZh: '新生兒慶祝' }
];

const VENUE_STYLES: { value: VenueStyle; labelEn: string; labelZh: string }[] = [
  { value: 'casual', labelEn: 'Casual', labelZh: '輕鬆' },
  { value: 'formal', labelEn: 'Formal', labelZh: '正式' },
  { value: 'outdoor', labelEn: 'Outdoor', labelZh: '戶外' },
  { value: 'adventure', labelEn: 'Adventure', labelZh: '冒險' },
  { value: 'educational', labelEn: 'Educational', labelZh: '教育' },
  { value: 'dining', labelEn: 'Dining', labelZh: '用餐' },
  { value: 'entertainment', labelEn: 'Entertainment', labelZh: '娛樂' }
];

interface MilestoneAndCelebrationPlannerProps {
  onPlanCreated?: (plan: CelebrationPlan) => void;
  suggestedVenues?: CelebrationVenueSuggestion[];
  darkMode?: boolean;
}

export const MilestoneAndCelebrationPlanner: React.FC<MilestoneAndCelebrationPlannerProps> = ({
  onPlanCreated,
  suggestedVenues = [],
  darkMode = false
}) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [milestone, setMilestone] = useState<FamilyMilestone>({
    type: 'birthday',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    title: '',
    description: '',
    celebrant: { name: '', age: 0 },
    attendees: 10,
    budget: 3000,
    preferredStyle: ['casual'],
    specialRequirements: []
  });

  const [showResults, setShowResults] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<CelebrationVenueSuggestion | null>(null);

  const urgencyCheck = useMemo(() => checkMilestoneUrgency(milestone), [milestone]);
  const contextAnalysis = useMemo(() => analyzeMilestoneContext(milestone), [milestone]);
  const styleRecommendations = useMemo(
    () => getStyleRecommendations(milestone.celebrant.age, milestone.preferredStyle),
    [milestone.celebrant.age, milestone.preferredStyle]
  );

  const celebrationPlan = useMemo<CelebrationPlan | null>(() => {
    if (!selectedVenue || suggestedVenues.length === 0) return null;
    return createCelebrationPlan(milestone, [selectedVenue]);
  }, [milestone, selectedVenue, suggestedVenues]);

  const handleMilestoneChange = (field: keyof FamilyMilestone, value: any) => {
    setMilestone(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (dateString: string) => {
    const date = new Date(dateString);
    handleMilestoneChange('date', date);
  };

  const handleToggleStyle = (style: VenueStyle) => {
    setMilestone(prev => ({
      ...prev,
      preferredStyle: prev.preferredStyle.includes(style)
        ? prev.preferredStyle.filter(s => s !== style)
        : [...prev.preferredStyle, style]
    }));
  };

  const handleToggleRequirement = (req: string) => {
    setMilestone(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements?.includes(req)
        ? prev.specialRequirements.filter(r => r !== req)
        : [...(prev.specialRequirements || []), req]
    }));
  };

  const handleGeneratePlan = () => {
    setShowResults(true);
    if (selectedVenue && onPlanCreated) {
      const plan = createCelebrationPlan(milestone, [selectedVenue]);
      onPlanCreated(plan);
    }
  };

  const milestoneName = MILESTONE_TYPES.find(m => m.value === milestone.type);
  const urgencyColor = urgencyCheck.isUrgent ? '#FF6F61' : '#A7C7E7';
  const urgencyLabel = isZh ? '緊急程度' : 'Urgency';
  const daysLabel = isZh ? '天' : 'days';

  return (
    <div className={`milestone-planner ${darkMode ? 'dark-mode' : ''}`}>
      <div className="planner-header">
        <h2>{isZh ? '里程碑與慶祝計劃' : 'Milestone & Celebration Planner'}</h2>
        <p>{isZh ? '為特殊時刻規劃完美的慶祝活動' : 'Plan the perfect celebration for special moments'}</p>
      </div>

      <div className="planner-container">
        {/* Left Panel: Milestone Input */}
        <div className="input-panel">
          <div className="form-section">
            <label htmlFor="milestone-type">{isZh ? '里程碑類型' : 'Milestone Type'}</label>
            <select
              id="milestone-type"
              value={milestone.type}
              onChange={e => handleMilestoneChange('type', e.target.value)}
              className="form-select"
            >
              {MILESTONE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {isZh ? type.labelZh : type.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label htmlFor="milestone-title">{isZh ? '里程碑名稱' : 'Milestone Title'}</label>
            <input
              id="milestone-title"
              type="text"
              placeholder={isZh ? '例：Sarah的5歲生日派對' : 'e.g., Sarah\'s 5th Birthday'}
              value={milestone.title}
              onChange={e => handleMilestoneChange('title', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-section">
              <label htmlFor="celebrant-name">{isZh ? '主人公名字' : 'Celebrant Name'}</label>
              <input
                id="celebrant-name"
                type="text"
                placeholder={isZh ? '名字' : 'Name'}
                value={milestone.celebrant.name}
                onChange={e =>
                  handleMilestoneChange('celebrant', {
                    ...milestone.celebrant,
                    name: e.target.value
                  })
                }
                className="form-input"
              />
            </div>
            <div className="form-section">
              <label htmlFor="celebrant-age">{isZh ? '年齡' : 'Age'}</label>
              <input
                id="celebrant-age"
                type="number"
                min="0"
                max="120"
                value={milestone.celebrant.age}
                onChange={e =>
                  handleMilestoneChange('celebrant', {
                    ...milestone.celebrant,
                    age: parseInt(e.target.value)
                  })
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="celebration-date">{isZh ? '慶祝日期' : 'Celebration Date'}</label>
            <input
              id="celebration-date"
              type="date"
              value={milestone.date.toISOString().split('T')[0]}
              onChange={e => handleDateChange(e.target.value)}
              className="form-input"
            />
            <div className={`urgency-indicator ${urgencyCheck.isUrgent ? 'urgent' : ''}`}>
              <span className="urgency-label">{urgencyLabel}:</span>
              <span className="urgency-value">
                {urgencyCheck.daysRemaining} {daysLabel}
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-section">
              <label htmlFor="attendees">{isZh ? '參加人數' : 'Attendees'}</label>
              <input
                id="attendees"
                type="number"
                min="1"
                max="500"
                value={milestone.attendees}
                onChange={e => handleMilestoneChange('attendees', parseInt(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-section">
              <label htmlFor="budget">{isZh ? '預算（台幣）' : 'Budget (TWD)'}</label>
              <input
                id="budget"
                type="number"
                min="0"
                step="100"
                value={milestone.budget}
                onChange={e => handleMilestoneChange('budget', parseInt(e.target.value))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <label>{isZh ? '偏好的場地風格' : 'Preferred Venue Styles'}</label>
            <div className="style-selector">
              {VENUE_STYLES.map(style => (
                <button
                  key={style.value}
                  className={`style-button ${milestone.preferredStyle.includes(style.value) ? 'selected' : ''}`}
                  onClick={() => handleToggleStyle(style.value)}
                >
                  {isZh ? style.labelZh : style.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>{isZh ? '特殊要求' : 'Special Requirements'}</label>
            <div className="requirements-selector">
              {[
                { key: 'dietary-restrictions', labelEn: 'Dietary Restrictions', labelZh: '飲食限制' },
                { key: 'wheelchair-accessible', labelEn: 'Wheelchair Accessible', labelZh: '輪椅無障礙' },
                { key: 'sensory-friendly', labelEn: 'Sensory Friendly', labelZh: '感官友善' }
              ].map(req => (
                <button
                  key={req.key}
                  className={`requirement-button ${milestone.specialRequirements?.includes(req.key) ? 'selected' : ''}`}
                  onClick={() => handleToggleRequirement(req.key)}
                >
                  {isZh ? req.labelZh : req.labelEn}
                </button>
              ))}
            </div>
          </div>

          <button className="generate-button" onClick={handleGeneratePlan}>
            {isZh ? '生成慶祝計劃' : 'Generate Celebration Plan'}
          </button>
        </div>

        {/* Right Panel: Analysis & Results */}
        <div className="results-panel">
          {/* Context Analysis */}
          <div className="analysis-section">
            <h3>{isZh ? '活動分析' : 'Event Analysis'}</h3>
            <div className="analysis-item">
              <span className="label">{isZh ? '慶祝規模' : 'Scale'}:</span>
              <span className="value">{isZh ? contextAnalysis.celebrationIntensity === 'intimate' ? '親密' : contextAnalysis.celebrationIntensity === 'moderate' ? '中等' : '盛大' : contextAnalysis.celebrationIntensity}</span>
            </div>
            <div className="analysis-item">
              <span className="label">{isZh ? '預算級別' : 'Budget'}:</span>
              <span className="value">{contextAnalysis.budgetGuideline}</span>
            </div>
            <div className="analysis-item">
              <span className="label">{isZh ? '建議風格' : 'Recommended Style'}:</span>
              <span className="value">{isZh ? VENUE_STYLES.find(s => s.value === styleRecommendations.recommendedStyle)?.labelZh : styleRecommendations.recommendedStyle}</span>
            </div>
          </div>

          {/* Urgency Alert */}
          {urgencyCheck.isUrgent && (
            <div className="urgency-alert">
              <h4>⚠️ {isZh ? '緊急提醒' : 'Urgent Notice'}</h4>
              <p>{urgencyCheck.recommendedAction}</p>
            </div>
          )}

          {/* Venue Suggestions */}
          {suggestedVenues.length > 0 && (
            <div className="venues-section">
              <h3>{isZh ? '建議場地' : 'Suggested Venues'}</h3>
              <div className="venue-list">
                {suggestedVenues.map((venue, idx) => (
                  <div
                    key={idx}
                    className={`venue-card ${selectedVenue?.venueId === venue.venueId ? 'selected' : ''}`}
                    onClick={() => setSelectedVenue(venue)}
                  >
                    <div className="venue-header">
                      <h4>{venue.venueName}</h4>
                      <div className="match-score">{venue.matchScore}%</div>
                    </div>
                    <p className="venue-reason">{venue.celebrationReason}</p>
                    <div className="venue-details">
                      <span>💰 ${venue.estimatedCost.perPerson}/人</span>
                      <span>👥 {venue.capacity.minGroup}-{venue.capacity.maxGroup}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Celebration Plan Display */}
          {showResults && celebrationPlan && (
            <div className="plan-results">
              <h3>{isZh ? '慶祝計劃總結' : 'Celebration Plan Summary'}</h3>

              {/* Success Score */}
              <div className="success-score">
                <span className="score-label">{isZh ? '計劃成功度' : 'Success Score'}:</span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{ width: `${celebrationPlan.successScore}%` }}
                  />
                </div>
                <span className="score-value">{celebrationPlan.successScore}%</span>
              </div>

              {/* Budget Breakdown */}
              <div className="budget-section">
                <h4>{isZh ? '預算明細' : 'Budget Breakdown'}</h4>
                <div className="budget-items">
                  <div className="budget-item">
                    <span>{isZh ? '場地租賃' : 'Venue'}:</span>
                    <span>${celebrationPlan.budgetBreakdown.venueRental.toFixed(0)}</span>
                  </div>
                  <div className="budget-item">
                    <span>{isZh ? '食物' : 'Food'}:</span>
                    <span>${celebrationPlan.budgetBreakdown.food.toFixed(0)}</span>
                  </div>
                  <div className="budget-item">
                    <span>{isZh ? '娛樂' : 'Entertainment'}:</span>
                    <span>${celebrationPlan.budgetBreakdown.entertainment.toFixed(0)}</span>
                  </div>
                  <div className="budget-item">
                    <span>{isZh ? '裝飾' : 'Decorations'}:</span>
                    <span>${celebrationPlan.budgetBreakdown.decorations.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Savings Opportunities */}
              {celebrationPlan.budgetBreakdown.savingsOpportunities.length > 0 && (
                <div className="savings-section">
                  <h4>💡 {isZh ? '節省機會' : 'Savings Opportunities'}</h4>
                  <ul>
                    {celebrationPlan.budgetBreakdown.savingsOpportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              <div className="tips-section">
                <h4>{isZh ? '慶祝提示' : 'Celebration Tips'}</h4>
                <div className="tips-list">
                  {celebrationPlan.celebrationTips.slice(0, 5).map((tip, idx) => (
                    <div key={idx} className={`tip ${tip.importance}`}>
                      <strong>{tip.category}:</strong> {tip.tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Preview */}
              <div className="timeline-section">
                <h4>{isZh ? '準備時間表' : 'Preparation Timeline'}</h4>
                <div className="timeline-preview">
                  {celebrationPlan.timelineRecommendation.slice(-5).map((item, idx) => (
                    <div key={idx} className="timeline-item">
                      <span className="days">{item.daysBeforeEvent} {isZh ? '天前' : 'days before'}</span>
                      <span className="task">{item.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneAndCelebrationPlanner;
