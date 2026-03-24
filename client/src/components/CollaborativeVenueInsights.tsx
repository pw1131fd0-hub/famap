import React, { useState, useEffect } from 'react';
import type { VenueInsight, InsightStats, InsightAuthor } from '../utils/venueInsights';
import {
  getLocationInsights,
  getVenueInsightStats,
  markInsightHelpfulness,
  addVenueInsight,
  getLocationTips,
  getLocationStatus,
} from '../utils/venueInsights';
import '../styles/CollaborativeVenueInsights.css';

interface CollaborativeVenueInsightsProps {
  locationId: string;
  locationName: string;
  currentUserId?: string;
}

/**
 * Collaborative Venue Insights Component
 * Displays crowd-sourced venue insights, tips, and real-time status updates
 * Allows parents to contribute and vote on the most helpful information
 */
export const CollaborativeVenueInsights: React.FC<CollaborativeVenueInsightsProps> = ({
  locationId,
  currentUserId = 'user_anonymous',
}) => {
  const [insights, setInsights] = useState<VenueInsight[]>([]);
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'tips' | 'status'>('all');
  const [newInsightType, setNewInsightType] = useState<'tip' | 'warning' | 'status_update' | 'observation'>('tip');
  const [newInsightTitle, setNewInsightTitle] = useState('');
  const [newInsightContent, setNewInsightContent] = useState('');
  const [newInsightTags, setNewInsightTags] = useState<string[]>([]);

  const availableTags = ['crowded', 'quiet', 'clean', 'staff-friendly', 'parking-full', 'parking-available', 'kid-friendly', 'toddler-friendly', 'good-food', 'limited-facilities'];

  // Legitimate pattern: loading location-specific data when prop changes.
  // Multiple setState calls load related venue data from localStorage based on the location ID.
  // This synchronizes external data with React state when the location changes.
  // eslint-disable react-hooks/set-state-in-effect
  useEffect(() => {
    // Load insights
    const loadedInsights = getLocationInsights(locationId, 24 * 30); // Last 30 days
    setInsights(loadedInsights);

    // Load stats
    const loadedStats = getVenueInsightStats(locationId);
    setStats(loadedStats);
  }, [locationId]);
  // eslint-enable react-hooks/set-state-in-effect

  const handleAddInsight = () => {
    if (!newInsightTitle.trim() || !newInsightContent.trim()) {
      return;
    }

    const mockAuthor: InsightAuthor = {
      id: currentUserId,
      name: 'Parent Contributor',
      verificationStatus: 'unverified',
      totalInsights: 5,
      averageTrustScore: 70,
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };

    const newInsight = addVenueInsight(locationId, mockAuthor, {
      type: newInsightType,
      title: newInsightTitle,
      content: newInsightContent,
      tags: newInsightTags,
      visibility: 'public',
    });

    setInsights([newInsight, ...insights]);
    setNewInsightTitle('');
    setNewInsightContent('');
    setNewInsightTags([]);
    setShowForm(false);

    // Refresh stats
    const updatedStats = getVenueInsightStats(locationId);
    setStats(updatedStats);
  };

  const handleToggleTag = (tag: string) => {
    setNewInsightTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleMarkHelpful = (insightId: string, helpful: boolean) => {
    markInsightHelpfulness(insightId, currentUserId, helpful);

    // Update local state
    setInsights(prevInsights =>
      prevInsights.map(insight => {
        if (insight.id === insightId) {
          return {
            ...insight,
            helpfulCount: helpful ? insight.helpfulCount + 1 : insight.helpfulCount,
            notHelpfulCount: !helpful ? insight.notHelpfulCount + 1 : insight.notHelpfulCount,
          };
        }
        return insight;
      })
    );
  };

  const getDisplayedInsights = () => {
    if (selectedTab === 'tips') {
      return getLocationTips(locationId, 5);
    } else if (selectedTab === 'status') {
      return getLocationStatus(locationId);
    }
    return insights;
  };

  const getTrustBadgeColor = (score: number): string => {
    if (score >= 80) return '#27ae60'; // Green
    if (score >= 60) return '#f39c12'; // Orange
    return '#e74c3c'; // Red
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'tip': return '💡';
      case 'warning': return '⚠️';
      case 'status_update': return '📍';
      case 'observation': return '👁️';
      default: return '📝';
    }
  };

  const displayedInsights = getDisplayedInsights();
  const crowdednessLevel = stats?.crowdednessHistory[stats.crowdednessHistory.length - 1];

  return (
    <div className="collaborative-insights">
      <div className="insights-header">
        <h3>Parent Community Insights</h3>
        <p className="insights-subtitle">Real-time tips and status from families</p>
      </div>

      {/* Statistics Bar */}
      {stats && (
        <div className="insights-stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Insights</span>
            <span className="stat-value">{stats.totalInsights}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Trust Score</span>
            <div className="trust-score" style={{ color: getTrustBadgeColor(stats.averageTrustScore) }}>
              {stats.averageTrustScore}%
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Latest Status</span>
            <span className="status-badge" style={{ backgroundColor: getStatusColor(crowdednessLevel?.level) }}>
              {crowdednessLevel?.level || 'N/A'}
            </span>
          </div>
          {stats.mostCommonTags.length > 0 && (
            <div className="stat-item">
              <span className="stat-label">Top Tags</span>
              <div className="tags-container">
                {stats.mostCommonTags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag-badge">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="insights-tabs">
        <button
          className={`tab-button ${selectedTab === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTab('all')}
        >
          All Insights ({insights.length})
        </button>
        <button
          className={`tab-button ${selectedTab === 'tips' ? 'active' : ''}`}
          onClick={() => setSelectedTab('tips')}
        >
          💡 Tips
        </button>
        <button
          className={`tab-button ${selectedTab === 'status' ? 'active' : ''}`}
          onClick={() => setSelectedTab('status')}
        >
          📍 Status
        </button>
      </div>

      {/* Add Insight Button */}
      <button
        className="add-insight-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '✕ Cancel' : '+ Share Your Experience'}
      </button>

      {/* Add Insight Form */}
      {showForm && (
        <div className="add-insight-form">
          <div className="form-group">
            <label>What kind of insight?</label>
            <div className="insight-type-selector">
              {(['tip', 'warning', 'status_update', 'observation'] as const).map(type => (
                <button
                  key={type}
                  className={`type-button ${newInsightType === type ? 'selected' : ''}`}
                  onClick={() => setNewInsightType(type)}
                >
                  {getTypeIcon(type)} {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="insight-title">Title</label>
            <input
              id="insight-title"
              type="text"
              className="form-input"
              placeholder="e.g., Great playground for toddlers"
              value={newInsightTitle}
              onChange={e => setNewInsightTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="insight-content">Your Insight</label>
            <textarea
              id="insight-content"
              className="form-textarea"
              placeholder="Share what you experienced, observed, or recommend..."
              value={newInsightContent}
              onChange={e => setNewInsightContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Add Tags (select relevant ones)</label>
            <div className="tags-selector">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-selector-button ${newInsightTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            className="submit-button"
            onClick={handleAddInsight}
            disabled={!newInsightTitle.trim() || !newInsightContent.trim()}
          >
            Share Insight
          </button>
        </div>
      )}

      {/* Insights List */}
      <div className="insights-list">
        {displayedInsights.length === 0 ? (
          <div className="no-insights">
            <p>No insights yet. Be the first to share your experience!</p>
          </div>
        ) : (
          displayedInsights.map(insight => (
            <div key={insight.id} className="insight-card">
              <div className="insight-header">
                <div className="insight-title-section">
                  <span className="insight-icon">{getTypeIcon(insight.type)}</span>
                  <h4 className="insight-title">{insight.title}</h4>
                </div>
                <div className="insight-trust-badge" style={{ backgroundColor: getTrustBadgeColor(insight.trustScore) }}>
                  {insight.trustScore}%
                </div>
              </div>

              <p className="insight-content">{insight.content}</p>

              {insight.tags.length > 0 && (
                <div className="insight-tags">
                  {insight.tags.map(tag => (
                    <span key={tag} className="insight-tag">{tag}</span>
                  ))}
                </div>
              )}

              <div className="insight-footer">
                <span className="insight-author">
                  👤 {insight.authorName}
                </span>
                <span className="insight-date">
                  {formatRelativeDate(insight.createdAt)}
                </span>
              </div>

              <div className="insight-actions">
                <button
                  className="helpful-button"
                  onClick={() => handleMarkHelpful(insight.id, true)}
                >
                  👍 Helpful ({insight.helpfulCount})
                </button>
                <button
                  className="not-helpful-button"
                  onClick={() => handleMarkHelpful(insight.id, false)}
                >
                  👎 Not helpful ({insight.notHelpfulCount})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Helper function to format relative dates
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Helper function to get color for crowdedness status
 */
function getStatusColor(status?: string): string {
  switch (status) {
    case 'empty': return '#27ae60';
    case 'quiet': return '#2ecc71';
    case 'moderate': return '#f39c12';
    case 'busy': return '#e67e22';
    case 'very_busy': return '#e74c3c';
    default: return '#95a5a6';
  }
}
