import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Location } from '../types';
import { extractComparisonMetrics, calculateComparisonScores, getComparisonSummary } from '../utils/locationComparison';
import { useTranslation } from '../i18n/useTranslation';

interface LocationComparisonProps {
  locations: Location[];
  onClose: () => void;
}

export const LocationComparison: React.FC<LocationComparisonProps> = ({ locations, onClose }) => {
  const { language } = useTranslation();
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  if (locations.length === 0) {
    return null;
  }

  const metrics = extractComparisonMetrics(locations);
  const scores = calculateComparisonScores(locations);
  const summary = getComparisonSummary(locations);

  const toggleMetric = (metric: string) => {
    setExpandedMetric(expandedMetric === metric ? null : metric);
  };

  return (
    <div className="location-comparison-modal">
      <div className="comparison-overlay" onClick={onClose} />
      <div className="comparison-container">
        <div className="comparison-header">
          <h2>{language === 'en' ? 'Compare Locations' : '比較位置'}</h2>
          <button
            onClick={onClose}
            className="close-button"
            aria-label={language === 'en' ? 'Close comparison' : '關閉比較'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Location Cards with Scores */}
        <div className="comparison-cards">
          {scores.map((scoreInfo) => {
            const location = locations.find(l => l.id === scoreInfo.locationId)!;
            return (
              <div key={scoreInfo.locationId} className="comparison-card">
                <div className="card-header">
                  <h3>{scoreInfo.locationName}</h3>
                  <div className="score-badge" aria-label={`Score: ${scoreInfo.score.toFixed(1)} out of 100`}>
                    {scoreInfo.score.toFixed(0)}
                    <span className="score-max">/100</span>
                  </div>
                </div>
                <div className="card-rating">
                  {location.averageRating && (
                    <>
                      <span className="stars">
                        {'⭐'.repeat(Math.round(location.averageRating))}
                      </span>
                      <span className="rating-value">
                        {location.averageRating.toFixed(1)}/5
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Insights */}
        {summary.length > 0 && (
          <div className="comparison-summary">
            <h3>{language === 'en' ? 'Quick Insights' : '快速見解'}</h3>
            <ul>
              {summary.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Metrics Comparison */}
        <div className="comparison-metrics">
          <h3>{language === 'en' ? 'Detailed Comparison' : '詳細比較'}</h3>
          {metrics.map((metric) => (
            <div key={metric.category} className="metric-row">
              <div
                className="metric-header"
                onClick={() => toggleMetric(metric.category)}
              >
                <span className="metric-name">{metric.category}</span>
                {expandedMetric === metric.category ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {expandedMetric === metric.category && (
                <div className="metric-content">
                  <div className="metric-values">
                    {locations.map((location) => (
                      <div key={location.id} className="metric-value">
                        <span className="location-label">
                          {location.name.en || location.name.zh}
                        </span>
                        <span className="value">
                          {metric.locations[location.id] !== undefined
                            ? String(metric.locations[location.id])
                            : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .location-comparison-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.5);
        }

        .comparison-overlay {
          position: absolute;
          inset: 0;
          cursor: pointer;
        }

        .comparison-container {
          position: relative;
          background: white;
          border-radius: 20px 20px 0 0;
          max-height: 85vh;
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
          overflow-y: auto;
        }

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
          flex-shrink: 0;
        }

        .comparison-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: color 0.2s;
        }

        .close-button:hover {
          color: #000;
        }

        .comparison-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          padding: 16px 20px;
          background: #fafafa;
        }

        .comparison-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }

        .card-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 0.95rem;
          color: #333;
          line-height: 1.3;
        }

        .score-badge {
          background: linear-gradient(135deg, #A7C7E7, #FDFD96);
          color: #333;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .score-max {
          font-size: 0.8rem;
          font-weight: normal;
        }

        .card-rating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 0.9rem;
        }

        .rating-value {
          color: #666;
        }

        .comparison-summary {
          padding: 16px 20px;
          background: #f0f8ff;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }

        .comparison-summary h3 {
          margin: 0 0 12px 0;
          font-size: 0.95rem;
          color: #333;
        }

        .comparison-summary ul {
          margin: 0;
          padding-left: 20px;
          list-style: none;
        }

        .comparison-summary li {
          margin: 6px 0;
          color: #555;
          font-size: 0.9rem;
          padding-left: 12px;
          position: relative;
        }

        .comparison-summary li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #4CAF50;
          font-weight: bold;
        }

        .comparison-metrics {
          padding: 20px;
          flex: 1;
          overflow-y: auto;
        }

        .comparison-metrics h3 {
          margin: 0 0 12px 0;
          font-size: 0.95rem;
          color: #333;
        }

        .metric-row {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9f9f9;
          cursor: pointer;
          transition: background-color 0.2s;
          border: none;
          width: 100%;
          text-align: left;
        }

        .metric-header:hover {
          background-color: #f0f0f0;
        }

        .metric-name {
          font-weight: 500;
          color: #333;
          font-size: 0.95rem;
        }

        .metric-content {
          padding: 12px;
          background: white;
        }

        .metric-values {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .metric-value {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: #f9f9f9;
          border-radius: 6px;
        }

        .location-label {
          font-weight: 500;
          color: #666;
          font-size: 0.9rem;
        }

        .value {
          color: #333;
          font-size: 0.9rem;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        @media (prefers-color-scheme: dark) {
          .comparison-container {
            background: #1a1a1a;
            color: #e0e0e0;
          }

          .comparison-header h2 {
            color: #e0e0e0;
          }

          .comparison-cards {
            background: #0a0a0a;
          }

          .comparison-card {
            background: #2a2a2a;
            border-color: #444;
          }

          .card-header h3 {
            color: #e0e0e0;
          }

          .metric-row {
            border-color: #444;
          }

          .metric-header {
            background: #222;
          }

          .metric-header:hover {
            background-color: #333;
          }

          .metric-name {
            color: #e0e0e0;
          }

          .metric-value {
            background: #222;
          }

          .location-label {
            color: #aaa;
          }

          .value {
            color: #e0e0e0;
          }

          .comparison-summary {
            background: #0a2540;
            border-color: #444;
          }

          .comparison-summary h3 {
            color: #e0e0e0;
          }

          .comparison-summary li {
            color: #aaa;
          }

          .comparison-metrics h3 {
            color: #e0e0e0;
          }
        }
      `}</style>
    </div>
  );
};
