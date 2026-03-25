import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  loadAlerts,
  getUnreadAlertsCount,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  clearAllAlerts,
  loadAlertPreferences,
  saveAlertPreferences,
  getDefaultAlertPreferences,
  type Alert,
  type AlertPreferences,
} from '../utils/alertSystem';
import { useTranslation } from '../i18n/useTranslation';
import '../styles/AlertCenter.css';

interface AlertCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertCenter({ isOpen, onClose }: AlertCenterProps) {
  const { language } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<AlertPreferences>(
    getDefaultAlertPreferences()
  );
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>(
    'all'
  );

  // Load alerts on mount and when modal opens
  // Legitimate pattern: syncing with localStorage (external system) when modal opens.
  // Multiple setState calls are used to synchronize all alert-related data from storage with React state
  // when the user opens the modal. This is necessary for real-time data consistency.
  useEffect(() => {
    if (isOpen) {
      const loadedAlerts = loadAlerts();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAlerts(loadedAlerts);
       
      setUnreadCount(getUnreadAlertsCount());
       
      setPreferences(loadAlertPreferences());
    }
  }, [isOpen]);

  const handleMarkAsRead = useCallback(
    (alertId: string) => {
      markAlertAsRead(alertId);
      const updatedAlerts = loadAlerts();
      setAlerts(updatedAlerts);
      setUnreadCount(getUnreadAlertsCount());
    },
    []
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAlertsAsRead();
    const updatedAlerts = loadAlerts();
    setAlerts(updatedAlerts);
    setUnreadCount(0);
  }, []);

  const handleDeleteAlert = useCallback((alertId: string) => {
    deleteAlert(alertId);
    const updatedAlerts = loadAlerts();
    setAlerts(updatedAlerts);
    setUnreadCount(getUnreadAlertsCount());
  }, []);

  const handleClearAll = useCallback(() => {
    if (
      window.confirm(
        language === 'zh'
          ? '確定要清除所有警報嗎？'
          : 'Are you sure you want to clear all alerts?'
      )
    ) {
      clearAllAlerts();
      setAlerts([]);
      setUnreadCount(0);
    }
  }, [language]);

  const handlePreferenceChange = useCallback(
    (key: keyof AlertPreferences, value: unknown) => {
      const updatedPrefs = {
        ...preferences,
        [key]: value,
      };
      setPreferences(updatedPrefs);
      saveAlertPreferences(updatedPrefs);
    },
    [preferences]
  );

  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'urgent':
        return <AlertCircle className="alert-icon urgent" />;
      case 'warning':
        return <AlertTriangle className="alert-icon warning" />;
      default:
        return <Info className="alert-icon info" />;
    }
  };

  const getSeverityLabel = (severity: Alert['severity']) => {
    const labels = {
      urgent: { zh: '緊急', en: 'Urgent' },
      warning: { zh: '警告', en: 'Warning' },
      info: { zh: '訊息', en: 'Info' },
    };
    return labels[severity][language];
  };

  const getTypeLabel = (type: Alert['type']) => {
    const labels = {
      new_review: { zh: '新評論', en: 'New Review' },
      event: { zh: '活動', en: 'Event' },
      crowdedness: { zh: '人流狀態', en: 'Crowdedness' },
      weather: { zh: '天氣警告', en: 'Weather' },
      promotion: { zh: '優惠', en: 'Promotion' },
    };
    return labels[type][language];
  };

  const displayAlerts =
    activeTab === 'unread'
      ? alerts.filter((a) => !a.read)
      : activeTab === 'settings'
        ? []
        : alerts;

  const totalAlerts = alerts.length;

  return (
    <div className={`alert-center ${isOpen ? 'open' : 'closed'}`}>
      {/* Overlay */}
      {isOpen && <div className="alert-overlay" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} />}

      {/* Modal */}
      <div className="alert-modal">
        {/* Header */}
        <div className="alert-header">
          <div className="alert-title-section">
            <Bell className="header-icon" />
            <div className="title-text">
              <h2>{language === 'zh' ? '通知中心' : 'Alert Center'}</h2>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </div>
          </div>
          <button 
            className="close-btn" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="alert-tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {language === 'zh' ? '全部' : 'All'} ({totalAlerts})
          </button>
          <button
            className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            {language === 'zh' ? '未讀' : 'Unread'} ({unreadCount})
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            {language === 'zh' ? '設定' : 'Settings'}
          </button>
        </div>

        {/* Content */}
        <div className="alert-content">
          {activeTab === 'settings' ? (
            <div className="settings-panel">
              <div className="settings-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.newReviewsEnabled}
                    onChange={(e) =>
                      handlePreferenceChange(
                        'newReviewsEnabled',
                        e.target.checked
                      )
                    }
                  />
                  <span>
                    {language === 'zh' ? '新評論警報' : 'New Review Alerts'}
                  </span>
                </label>
                {preferences.newReviewsEnabled && (
                  <div className="setting-sub">
                    <label>
                      {language === 'zh' ? '最低評分：' : 'Minimum Rating:'}
                    </label>
                    <select
                      value={preferences.newReviewsMinRating}
                      onChange={(e) =>
                        handlePreferenceChange(
                          'newReviewsMinRating',
                          parseInt(e.target.value)
                        )
                      }
                    >
                      <option value={1}>1★</option>
                      <option value={2}>2★</option>
                      <option value={3}>3★</option>
                      <option value={4}>4★</option>
                      <option value={5}>5★</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="settings-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.eventsEnabled}
                    onChange={(e) =>
                      handlePreferenceChange('eventsEnabled', e.target.checked)
                    }
                  />
                  <span>
                    {language === 'zh' ? '活動警報' : 'Event Alerts'}
                  </span>
                </label>
              </div>

              <div className="settings-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.crowdednessAlertsEnabled}
                    onChange={(e) =>
                      handlePreferenceChange(
                        'crowdednessAlertsEnabled',
                        e.target.checked
                      )
                    }
                  />
                  <span>
                    {language === 'zh' ? '人流警報' : 'Crowdedness Alerts'}
                  </span>
                </label>
                {preferences.crowdednessAlertsEnabled && (
                  <div className="setting-sub">
                    <label>
                      {language === 'zh' ? '警報閾值：' : 'Alert Threshold:'}
                    </label>
                    <select
                      value={preferences.crowdednessThreshold}
                      onChange={(e) =>
                        handlePreferenceChange(
                          'crowdednessThreshold',
                          e.target.value as 'light' | 'moderate' | 'heavy'
                        )
                      }
                    >
                      <option value="light">
                        {language === 'zh' ? '任何時間' : 'Any Time'}
                      </option>
                      <option value="moderate">
                        {language === 'zh' ? '中等或以上' : 'Moderate+'}
                      </option>
                      <option value="heavy">
                        {language === 'zh' ? '只有擁擠' : 'Heavy Only'}
                      </option>
                    </select>
                  </div>
                )}
              </div>

              <div className="settings-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.weatherAlertsEnabled}
                    onChange={(e) =>
                      handlePreferenceChange(
                        'weatherAlertsEnabled',
                        e.target.checked
                      )
                    }
                  />
                  <span>
                    {language === 'zh' ? '天氣警報' : 'Weather Alerts'}
                  </span>
                </label>
              </div>

              <div className="settings-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.promotionAlertsEnabled}
                    onChange={(e) =>
                      handlePreferenceChange(
                        'promotionAlertsEnabled',
                        e.target.checked
                      )
                    }
                  />
                  <span>
                    {language === 'zh' ? '優惠警報' : 'Promotion Alerts'}
                  </span>
                </label>
              </div>

              <div className="settings-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.notificationQuietHours.enabled}
                    onChange={(e) =>
                      handlePreferenceChange('notificationQuietHours', {
                        ...preferences.notificationQuietHours,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  <span>
                    {language === 'zh' ? '寧靜時段' : 'Quiet Hours'}
                  </span>
                </label>
              </div>
            </div>
          ) : displayAlerts.length === 0 ? (
            <div className="no-alerts">
              <Bell size={48} />
              <p>
                {activeTab === 'unread'
                  ? language === 'zh'
                    ? '沒有未讀警報'
                    : 'No unread alerts'
                  : language === 'zh'
                    ? '沒有警報'
                    : 'No alerts'}
              </p>
            </div>
          ) : (
            <div className="alerts-list">
              {displayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`alert-item ${alert.severity} ${alert.read ? 'read' : 'unread'}`}
                >
                  <div className="alert-icon-wrapper">
                    {getAlertIcon(alert.severity)}
                  </div>

                  <div className="alert-content-wrapper">
                    <div className="alert-header-row">
                      <h4 className="alert-title">
                        {language === 'zh'
                          ? alert.title.zh
                          : alert.title.en}
                      </h4>
                      <span className="alert-type">
                        {getTypeLabel(alert.type)}
                      </span>
                    </div>

                    <p className="alert-message">
                      {language === 'zh'
                        ? alert.message.zh
                        : alert.message.en}
                    </p>

                    <div className="alert-meta">
                      <span className="severity-badge">
                        {getSeverityLabel(alert.severity)}
                      </span>
                      <span className="location-name">
                        {alert.locationName}
                      </span>
                    </div>
                  </div>

                  <div className="alert-actions">
                    {!alert.read && (
                      <button
                        className="action-btn"
                        onClick={() => handleMarkAsRead(alert.id)}
                        title={
                          language === 'zh'
                            ? '標記為已讀'
                            : 'Mark as read'
                        }
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {alert.read && (
                      <button
                        className="action-btn"
                        onClick={() => handleMarkAsRead(alert.id)}
                        title={
                          language === 'zh'
                            ? '標記為未讀'
                            : 'Mark as unread'
                        }
                      >
                        <EyeOff size={16} />
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteAlert(alert.id)}
                      title={language === 'zh' ? '刪除' : 'Delete'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab !== 'settings' && displayAlerts.length > 0 && (
          <div className="alert-footer">
            <button
              className="footer-btn secondary"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle2 size={16} />
              {language === 'zh' ? '全部標記為已讀' : 'Mark all as read'}
            </button>
            <button
              className="footer-btn danger"
              onClick={handleClearAll}
            >
              <Trash2 size={16} />
              {language === 'zh' ? '清除所有' : 'Clear all'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
