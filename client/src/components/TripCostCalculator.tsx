/**
 * Trip Cost Calculator Component
 * Helps families estimate and plan financial aspects of their outings
 * Features: Cost breakdown, budget recommendations, savings tips, payment optimization
 */

import React, { useState, useMemo } from 'react';
import { Wallet, TrendingDown, DollarSign, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Location } from '../types';
import {
  calculateTotalTripCost,
  calculateCostPerPerson,
  formatCurrency,
  getCostPercentages,
  generateBudgetReport,
  isWithinBudget,
} from '../utils/tripCostCalculator';
import { useTranslation } from '../i18n/useTranslation';
import '../styles/TripCostCalculator.css';

interface Props {
  locations: Location[];
  darkMode?: boolean;
  onBudgetPlanCreated?: (report: string) => void;
}

export function TripCostCalculator({ locations, darkMode = false, onBudgetPlanCreated }: Props) {
  const { language, t } = useTranslation();
  const [familySize, setFamilySize] = useState(4);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(2);
  const [hasCar, setHasCar] = useState(true);
  const [budget, setBudget] = useState<number | null>(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState(false);
  const [expandedTips, setExpandedTips] = useState(false);
  const [expandedPayment, setExpandedPayment] = useState(false);

  const analysis = useMemo(() => {
    return calculateTotalTripCost(locations, familySize, adults, children, hasCar);
  }, [locations, familySize, adults, children, hasCar]);

  const costPercentages = useMemo(() => {
    return getCostPercentages(analysis.breakdown);
  }, [analysis]);

  const withBudget = budget ? isWithinBudget(analysis, budget) : true;

  const handleGenerateReport = () => {
    const report = generateBudgetReport(analysis);
    onBudgetPlanCreated?.(report);
  };

  const labels = {
    en: {
      title: 'Trip Cost Calculator',
      subtitle: 'Plan your family outing budget',
      familyComposition: 'Family Composition',
      adults: 'Adults',
      children: 'Children',
      familySize: 'Total Family Size',
      transportation: 'Transportation',
      withCar: 'With Car (has parking)',
      withoutCar: 'Public Transit Only',
      budget: 'Your Budget',
      costBreakdown: 'Cost Breakdown',
      admission: 'Admission',
      parking: 'Parking',
      meals: 'Meals',
      activities: 'Activities',
      miscellaneous: 'Miscellaneous',
      total: 'Total',
      perPerson: 'Per Person',
      budgetEstimates: 'Budget Estimates',
      low: 'Budget Friendly',
      moderate: 'Comfortable',
      premium: 'Premium',
      savingsTips: 'Money-Saving Tips',
      paymentMethods: 'Payment Opportunities',
      savings: 'Potential Savings',
      availability: 'Where Available',
      generateReport: 'Generate Budget Report',
      budgetStatus: 'Budget Status',
      withinBudget: '✅ Within Budget',
      overBudget: '⚠️ Over Budget',
      suggestedBudget: 'Suggested Budget',
      noLocations: 'Please select locations first',
    },
    zh: {
      title: '旅行成本計算器',
      subtitle: '規劃您的家庭出遊預算',
      familyComposition: '家庭成員',
      adults: '成人',
      children: '孩童',
      familySize: '家庭總人數',
      transportation: '交通方式',
      withCar: '開車（計停車費）',
      withoutCar: '大眾交通工具',
      budget: '您的預算',
      costBreakdown: '成本明細',
      admission: '門票',
      parking: '停車',
      meals: '餐飲',
      activities: '活動',
      miscellaneous: '雜支',
      total: '總計',
      perPerson: '人均',
      budgetEstimates: '預算估計',
      low: '節省預算',
      moderate: '中等預算',
      premium: '豪華預算',
      savingsTips: '省錢建議',
      paymentMethods: '支付優惠機會',
      savings: '潛在省錢',
      availability: '可用範圍',
      generateReport: '生成預算報告',
      budgetStatus: '預算狀態',
      withinBudget: '✅ 符合預算',
      overBudget: '⚠️ 超過預算',
      suggestedBudget: '建議預算',
      noLocations: '請先選擇景點',
    },
  };

  const lang = language === 'en' ? labels.en : labels.zh;

  if (!locations || locations.length === 0) {
    return (
      <div className={`trip-cost-calculator ${darkMode ? 'dark-mode' : ''}`}>
        <div className="tcc-empty">
          <Wallet className="tcc-icon" />
          <p>{lang.noLocations}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`trip-cost-calculator ${darkMode ? 'dark-mode' : ''}`}>
      <div className="tcc-header">
        <h2>{lang.title}</h2>
        <p>{lang.subtitle}</p>
      </div>

      {/* Family Composition */}
      <div className="tcc-section">
        <h3>{lang.familyComposition}</h3>
        <div className="tcc-inputs">
          <div className="tcc-input-group">
            <label>{lang.adults}</label>
            <input
              type="number"
              min="1"
              max="10"
              value={adults}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setAdults(val);
                setFamilySize(val + children);
              }}
            />
          </div>
          <div className="tcc-input-group">
            <label>{lang.children}</label>
            <input
              type="number"
              min="0"
              max="10"
              value={children}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setChildren(val);
                setFamilySize(adults + val);
              }}
            />
          </div>
          <div className="tcc-input-group">
            <label>{lang.familySize}</label>
            <input type="number" disabled value={familySize} />
          </div>
        </div>
      </div>

      {/* Transportation */}
      <div className="tcc-section">
        <h3>{lang.transportation}</h3>
        <div className="tcc-radio-group">
          <label>
            <input
              type="radio"
              checked={hasCar}
              onChange={() => setHasCar(true)}
            />
            {lang.withCar}
          </label>
          <label>
            <input
              type="radio"
              checked={!hasCar}
              onChange={() => setHasCar(false)}
            />
            {lang.withoutCar}
          </label>
        </div>
      </div>

      {/* Budget Target */}
      <div className="tcc-section">
        <h3>{lang.budget}</h3>
        <div className="tcc-input-group">
          <input
            type="number"
            placeholder={`e.g., ${formatCurrency(analysis.budgetEstimates.moderateBudget)}`}
            value={budget || ''}
            onChange={e => setBudget(e.target.value ? parseInt(e.target.value, 10) : null)}
          />
        </div>
      </div>

      {/* Cost Summary */}
      <div className="tcc-summary">
        <div className="tcc-total-card">
          <div className="tcc-total-amount">
            <DollarSign size={24} />
            <div>
              <p>{lang.total}</p>
              <h3>{formatCurrency(analysis.breakdown.total)}</h3>
            </div>
          </div>
          <div className="tcc-per-person">
            <p>{lang.perPerson}</p>
            <h4>{formatCurrency(calculateCostPerPerson(analysis))}</h4>
          </div>
        </div>

        {budget && (
          <div className={`tcc-budget-status ${withBudget ? 'within' : 'over'}`}>
            <AlertCircle size={18} />
            <span>
              {withBudget
                ? `${lang.withinBudget} (${formatCurrency(budget - analysis.breakdown.total)} left)`
                : `${lang.overBudget} (${formatCurrency(analysis.breakdown.total - budget)} over)`}
            </span>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="tcc-section">
        <div
          className="tcc-section-header"
          onClick={() => setExpandedBreakdown(!expandedBreakdown)}
        >
          <h3>{lang.costBreakdown}</h3>
          {expandedBreakdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {expandedBreakdown && (
          <div className="tcc-breakdown">
            {[
              { key: 'admission', label: lang.admission },
              { key: 'parking', label: lang.parking },
              { key: 'meals', label: lang.meals },
              { key: 'activities', label: lang.activities },
              { key: 'miscellaneous', label: lang.miscellaneous },
            ].map(item => (
              <div key={item.key} className="tcc-breakdown-item">
                <div className="tcc-breakdown-info">
                  <span>{item.label}</span>
                  <span className="tcc-percentage">
                    {costPercentages[item.key as keyof typeof costPercentages]}%
                  </span>
                </div>
                <div className="tcc-breakdown-bar">
                  <div
                    className="tcc-breakdown-fill"
                    style={{
                      width: `${costPercentages[item.key as keyof typeof costPercentages]}%`,
                    }}
                  />
                </div>
                <span className="tcc-breakdown-amount">
                  {formatCurrency(
                    analysis.breakdown[item.key as keyof typeof analysis.breakdown]
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Estimates */}
      <div className="tcc-section">
        <h3>{lang.budgetEstimates}</h3>
        <div className="tcc-estimates">
          {[
            { key: 'lowBudget', label: lang.low, icon: '💰' },
            { key: 'moderateBudget', label: lang.moderate, icon: '💳' },
            { key: 'premiumBudget', label: lang.premium, icon: '✨' },
          ].map(item => (
            <div key={item.key} className="tcc-estimate-card">
              <div className="tcc-estimate-icon">{item.icon}</div>
              <p>{item.label}</p>
              <h4>{formatCurrency(analysis.budgetEstimates[item.key as keyof typeof analysis.budgetEstimates])}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Tips */}
      <div className="tcc-section">
        <div
          className="tcc-section-header"
          onClick={() => setExpandedTips(!expandedTips)}
        >
          <h3>{lang.savingsTips}</h3>
          {expandedTips ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {expandedTips && (
          <div className="tcc-tips">
            {analysis.savingsTips.map((tip, idx) => (
              <div key={idx} className="tcc-tip">
                <span className="tcc-tip-icon">
                  {tip.includes('💡')
                    ? '💡'
                    : tip.includes('✨')
                      ? '✨'
                      : tip.includes('🚌')
                        ? '🚌'
                        : '💰'}
                </span>
                <span>{tip.replace(/^[💡✨🚌💰]\s*/, '')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="tcc-section">
        <div
          className="tcc-section-header"
          onClick={() => setExpandedPayment(!expandedPayment)}
        >
          <h3>{lang.paymentMethods}</h3>
          {expandedPayment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {expandedPayment && (
          <div className="tcc-payment-methods">
            {analysis.paymentMethods.map((method, idx) => (
              <div key={idx} className="tcc-payment-card">
                <div className="tcc-payment-header">
                  <h4>{method.method}</h4>
                  <span className="tcc-discount-badge">{method.discount}%</span>
                </div>
                <p className="tcc-payment-savings">
                  {lang.savings}: <strong>{formatCurrency(method.savings)}</strong>
                </p>
                <p className="tcc-payment-availability">{method.availability}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="tcc-actions">
        <button className="tcc-btn-primary" onClick={handleGenerateReport}>
          <TrendingDown size={18} />
          {lang.generateReport}
        </button>
      </div>
    </div>
  );
}
