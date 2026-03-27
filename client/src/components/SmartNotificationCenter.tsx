/**
 * Smart Notification Center Component
 * Displays and manages family notifications
 */

import React, { useEffect, useState, useCallback } from 'react';
import { SmartNotificationEngine } from '../utils/smartNotificationEngine';
import type { Notification } from '../utils/smartNotificationEngine';
import { useLanguage } from '../i18n/useLanguage';
import '../styles/SmartNotificationCenter.css';

interface SmartNotificationCenterProps {
  engine: SmartNotificationEngine;
  maxVisible?: number;
}

const SmartNotificationCenter: React.FC<SmartNotificationCenterProps> = ({
  engine,
  maxVisible = 5,
}) => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = useCallback(() => {
    const allNotifications = engine.getNotifications();
    setNotifications(allNotifications);
    setUnreadCount(engine.getUnreadCount());
  }, [engine]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAsRead = (id: string) => {
    engine.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    engine.markAllAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (id: string) => {
    engine.deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    if (window.confirm(language === 'zh' ? '確定要清除所有通知？' : 'Clear all notifications?')) {
      engine.clearAll();
      loadNotifications();
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    return notification.icon || '📢';
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    const labels: Record<'zh' | 'en', Record<string, string>> = {
      zh: {
        event: '活動',
        location: '地點',
        weather: '天氣',
        crowds: '人潮',
        savings: '節省',
        birthday: '生日',
        recommendation: '推薦',
      },
      en: {
        event: 'Event',
        location: 'Location',
        weather: 'Weather',
        crowds: 'Crowds',
        savings: 'Savings',
        birthday: 'Birthday',
        recommendation: 'Recommendation',
      },
    };
    return labels[language as 'zh' | 'en'][type];
  };

  const visibleNotifications = notifications.slice(0, maxVisible);
  const stats = engine.getStats();

  return (
    <div className="smart-notification-center">
      {/* Notification Bell */}
      <div className="notification-bell-wrapper">
        <button
          className="notification-bell"
          onClick={() => setShowPanel(!showPanel)}
          aria-label={language === 'zh' ? '通知中心' : 'Notifications'}
          title={language === 'zh' ? '通知中心' : 'Notifications'}
        >
          🔔
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className="notification-panel">
          {/* Header */}
          <div className="notification-header">
            <h3>{language === 'zh' ? '通知中心' : 'Notifications'}</h3>
            <button
              className="close-btn"
              onClick={() => setShowPanel(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Controls */}
          <div className="notification-controls">
            <div className="stats">
              <span>{language === 'zh' ? '未讀' : 'Unread'}: {unreadCount}</span>
              <span>{language === 'zh' ? '總數' : 'Total'}: {stats.total}</span>
            </div>
            {unreadCount > 0 && (
              <button className="btn-text" onClick={handleMarkAllAsRead}>
                {language === 'zh' ? '全部標記為已讀' : 'Mark all as read'}
              </button>
            )}
            {stats.total > 0 && (
              <button className="btn-text btn-danger" onClick={handleClearAll}>
                {language === 'zh' ? '清除全部' : 'Clear all'}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>{language === 'zh' ? '沒有通知' : 'No notifications'}</p>
              </div>
            ) : (
              <>
                {visibleNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${getPriorityClass(notification.priority)} ${notification.read ? 'read' : 'unread'}`}
                  >
                    <div
                      className="notification-header-row"
                      onClick={() => setExpandedId(expandedId === notification.id ? null : notification.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="notification-icon">{getNotificationIcon(notification)}</span>
                      <div className="notification-main">
                        <div className="notification-title">
                          {language === 'zh' ? notification.title.zh : notification.title.en}
                        </div>
                        <div className="notification-meta">
                          <span className="notification-type">{getTypeLabel(notification.type)}</span>
                          <span className="notification-time">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      {!notification.read && <span className="read-indicator"></span>}
                    </div>

                    {/* Expanded Content */}
                    {expandedId === notification.id && (
                      <div className="notification-expanded">
                        <p className="notification-message">
                          {language === 'zh'
                            ? notification.message.zh
                            : notification.message.en}
                        </p>

                        {notification.locationName && (
                          <div className="notification-location">
                            📍{' '}
                            {language === 'zh'
                              ? notification.locationName.zh
                              : notification.locationName.en}
                          </div>
                        )}

                        <div className="notification-actions">
                          {!notification.read && (
                            <button
                              className="btn-small"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              {language === 'zh' ? '標記為已讀' : 'Mark as read'}
                            </button>
                          )}

                          {notification.actionUrl && (
                            <a href={notification.actionUrl} className="btn-small btn-primary">
                              {language === 'zh' ? '查看' : 'View'}
                            </a>
                          )}

                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            {language === 'zh' ? '刪除' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {notifications.length > maxVisible && (
                  <div className="more-notifications">
                    <a href="#all-notifications">
                      {language === 'zh'
                        ? `查看全部 ${notifications.length - maxVisible} 條通知`
                        : `View ${notifications.length - maxVisible} more`}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Statistics */}
          {stats.total > 0 && (
            <div className="notification-stats">
              <h4>{language === 'zh' ? '統計' : 'Statistics'}</h4>
              <div className="stats-grid">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="stat-item">
                    <span className="stat-label">{getTypeLabel(type as any)}</span>
                    <span className="stat-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Link */}
          <div className="notification-footer">
            <a href="#notification-settings">
              {language === 'zh' ? '通知設定' : 'Notification Settings'}
            </a>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showPanel && (
        <div className="notification-backdrop" onClick={() => setShowPanel(false)} />
      )}
    </div>
  );
};

export default SmartNotificationCenter;
