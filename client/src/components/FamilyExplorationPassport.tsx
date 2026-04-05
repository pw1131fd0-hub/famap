import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import {
  loadCheckIns,
  addCheckIn,
  hasCheckedInToday,
  getExplorationStats,
  getNewlyEarnedBadges,
  ALL_BADGES,
  type CheckIn,
  type ExplorationBadge,
} from '../utils/checkInSystem';
import '../styles/FamilyExplorationPassport.css';

interface FamilyExplorationPassportProps {
  location?: Location; // If provided, shows check-in button for this location
  showHistory?: boolean; // Whether to show recent check-ins
  compact?: boolean; // Compact mode for inline display
}

const CATEGORY_ICONS: Record<string, string> = {
  park: '🌳',
  nursing_room: '🍼',
  restaurant: '🍜',
  medical: '🏥',
};

function formatDate(iso: string, language: 'zh' | 'en'): string {
  const d = new Date(iso);
  if (language === 'zh') {
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function BadgeToast({ badges, onDismiss }: { badges: ExplorationBadge[]; onDismiss: () => void }) {
  const badge = badges[0];
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="badge-toast" role="status" aria-live="polite">
      <span>{badge.icon}</span>
      <span>
        {badge.name_zh} / {badge.name_en}
      </span>
    </div>
  );
}

export function FamilyExplorationPassport({
  location,
  showHistory = true,
  compact = false,
}: FamilyExplorationPassportProps) {
  const { language } = useTranslation();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [newBadges, setNewBadges] = useState<ExplorationBadge[]>([]);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const reload = useCallback(() => {
    const loaded = loadCheckIns();
    setCheckIns(loaded);
    if (location) {
      setCheckedInToday(hasCheckedInToday(location.id));
    }
  }, [location]);

  // Load initial data and react to location changes
  useEffect(() => {
    const loaded = loadCheckIns();
    setCheckIns(loaded);
    if (location) {
      setCheckedInToday(hasCheckedInToday(location.id));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [location]);

  const handleCheckIn = useCallback(() => {
    if (!location) return;
    const previousCheckIns = loadCheckIns();
    const locationName = language === 'zh' ? location.name.zh : location.name.en;
    addCheckIn(location.id, locationName, location.category);
    const updatedCheckIns = loadCheckIns();
    const earned = getNewlyEarnedBadges(previousCheckIns, updatedCheckIns);
    if (earned.length > 0) {
      setNewBadges(earned);
    }
    reload();
  }, [location, language, reload]);

  const stats = getExplorationStats(checkIns);
  const recentHistory = [...checkIns]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const earnedBadgeIds = new Set(stats.earnedBadges.map((b) => b.id));

  if (compact) {
    return (
      <div className="passport-container">
        <div className="passport-header">
          <span className="passport-icon">📔</span>
          <div>
            <h3 className="passport-title">
              {language === 'zh' ? '探索護照' : 'Exploration Passport'}
            </h3>
            <p className="passport-subtitle">
              {language === 'zh'
                ? `${stats.totalCheckIns} 次打卡 · ${stats.earnedBadges.length} 個徽章`
                : `${stats.totalCheckIns} check-ins · ${stats.earnedBadges.length} badges`}
            </p>
          </div>
        </div>
        {location && (
          <button
            className={`checkin-btn${checkedInToday ? ' checked-today' : ''}`}
            onClick={handleCheckIn}
            disabled={checkedInToday}
          >
            {checkedInToday
              ? language === 'zh'
                ? '✅ 今日已打卡'
                : '✅ Checked in today'
              : language === 'zh'
              ? '📍 在此打卡'
              : '📍 Check In Here'}
          </button>
        )}
        {newBadges.length > 0 && (
          <BadgeToast badges={newBadges} onDismiss={() => setNewBadges([])} />
        )}
      </div>
    );
  }

  return (
    <div className="passport-container">
      <div className="passport-header">
        <span className="passport-icon">📔</span>
        <div>
          <h3 className="passport-title">
            {language === 'zh' ? '家庭探索護照' : 'Family Exploration Passport'}
          </h3>
          <p className="passport-subtitle">
            {language === 'zh' ? '打卡地點，解鎖徽章！' : 'Check in to locations and earn badges!'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCheckIns}</div>
          <div className="stat-label">{language === 'zh' ? '打卡次數' : 'Check-ins'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.uniqueLocations}</div>
          <div className="stat-label">{language === 'zh' ? '不同地點' : 'Locations'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.earnedBadges.length}</div>
          <div className="stat-label">{language === 'zh' ? '已獲徽章' : 'Badges'}</div>
        </div>
      </div>

      {/* Weekly streak */}
      {stats.weeklyStreak > 0 && (
        <div className="streak-banner">
          <span className="streak-icon">🔥</span>
          <span className="streak-text">
            {language === 'zh'
              ? `連續 ${stats.weeklyStreak} 週打卡！`
              : `${stats.weeklyStreak}-week streak!`}
          </span>
        </div>
      )}

      {/* Check-in button for current location */}
      {location && (
        <div style={{ marginBottom: '16px' }}>
          <button
            className={`checkin-btn${checkedInToday ? ' checked-today' : ''}`}
            onClick={handleCheckIn}
            disabled={checkedInToday}
          >
            {checkedInToday
              ? language === 'zh'
                ? '✅ 今日已打卡'
                : '✅ Checked in today'
              : language === 'zh'
              ? '📍 在此打卡'
              : '📍 Check In Here'}
          </button>
        </div>
      )}

      {/* Badges */}
      <div className="badges-section">
        <h4 className="section-title">
          {language === 'zh' ? `🏅 成就徽章 (${stats.earnedBadges.length}/${ALL_BADGES.length})` : `🏅 Achievement Badges (${stats.earnedBadges.length}/${ALL_BADGES.length})`}
        </h4>
        <div className="badges-grid">
          {ALL_BADGES.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const earnedData = stats.earnedBadges.find((b) => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`badge-item ${isEarned ? 'earned' : 'locked'}`}
                title={isEarned
                  ? (language === 'zh' ? badge.description_zh : badge.description_en)
                  : (language === 'zh' ? '尚未解鎖' : 'Not yet earned')}
              >
                <span className="badge-emoji">{badge.icon}</span>
                <span className="badge-name">
                  {language === 'zh' ? badge.name_zh : badge.name_en}
                </span>
                {isEarned && earnedData?.earnedAt && (
                  <span className="badge-date">{formatDate(earnedData.earnedAt, language)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      {showHistory && (
        <div className="history-section">
          <h4 className="section-title">
            {language === 'zh' ? '📍 最近打卡記錄' : '📍 Recent Check-ins'}
          </h4>
          {recentHistory.length === 0 ? (
            <div className="no-checkins">
              <div className="no-checkins-icon">🗺️</div>
              <p>{language === 'zh' ? '還沒有打卡記錄，開始探索吧！' : 'No check-ins yet. Start exploring!'}</p>
            </div>
          ) : (
            <div className="history-list">
              {recentHistory.map((ci) => (
                <div key={ci.id} className="history-item">
                  <span className="history-cat-icon">{CATEGORY_ICONS[ci.locationCategory] ?? '📍'}</span>
                  <div className="history-info">
                    <div className="history-name">{ci.locationName}</div>
                    <div className="history-date">{formatDate(ci.timestamp, language)}</div>
                    {ci.notes && <div className="history-notes">{ci.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Badge earned toast */}
      {newBadges.length > 0 && (
        <BadgeToast badges={newBadges} onDismiss={() => setNewBadges([])} />
      )}
    </div>
  );
}

export default FamilyExplorationPassport;
