import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmartNotificationEngine } from '../utils/smartNotificationEngine';
import type {
  Notification,
  ActivityData,
  LocationEvent,
  WeatherData,
  CrowdPrediction,
} from '../utils/smartNotificationEngine';

describe('SmartNotificationEngine', () => {
  let engine: SmartNotificationEngine;
  let mockActivityData: ActivityData[];
  let mockLocations: ActivityData[];
  let mockEvents: LocationEvent[];
  let mockWeather: WeatherData;

  beforeEach(() => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    engine = new SmartNotificationEngine();

    // Setup mock data
    mockActivityData = [
      {
        locationId: 'loc1',
        locationName: { zh: '公園', en: 'Park' },
        category: 'park',
        visitDate: Date.now() - 86400000,
        cost: 50,
        duration: 120,
        satisfactionRating: 5,
        familySize: 4,
      },
      {
        locationId: 'loc2',
        locationName: { zh: '餐廳', en: 'Restaurant' },
        category: 'restaurant',
        visitDate: Date.now() - 172800000,
        cost: 300,
        duration: 90,
        satisfactionRating: 4,
        familySize: 4,
      },
    ];

    mockLocations = [
      ...mockActivityData,
      {
        locationId: 'loc3',
        locationName: { zh: '博物館', en: 'Museum' },
        category: 'park',
        visitDate: Date.now(),
        satisfactionRating: 4,
        familySize: 4,
      },
    ];

    mockEvents = [
      {
        id: 'event1',
        locationId: 'loc1',
        title: { zh: '兒童節活動', en: 'Kids Day Event' },
        description: { zh: '免費活動', en: 'Free event' },
        startDate: Date.now() + 604800000,
        endDate: Date.now() + 691200000,
        category: 'event',
        ageRange: { min: 3, max: 12 },
      },
    ];

    mockWeather = {
      temperature: 25,
      condition: 'sunny',
      humidity: 60,
      uvIndex: 6,
      windSpeed: 10,
      timestamp: Date.now(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Tests for Event Notifications
  describe('Event Notifications', () => {
    it('should generate event notifications for favorite locations', () => {
      const notifications = engine.generateEventNotifications(mockActivityData, mockEvents);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('event');
      expect(notifications[0].locationId).toBe('loc1');
    });

    it('should not generate notifications for non-favorite locations', () => {
      const otherEvent: LocationEvent = {
        id: 'event2',
        locationId: 'loc999',
        title: { zh: '其他活動', en: 'Other Event' },
        startDate: Date.now() + 604800000,
        endDate: Date.now() + 691200000,
        category: 'event',
      };

      const notifications = engine.generateEventNotifications(mockActivityData, [otherEvent]);
      expect(notifications).toHaveLength(0);
    });

    it('should not generate notifications when disabled', () => {
      engine.updatePreferences({
        enabledNotifications: { ...engine.getPreferences().enabledNotifications, events: false },
      });

      const notifications = engine.generateEventNotifications(mockActivityData, mockEvents);
      expect(notifications).toHaveLength(0);
    });

    it('should include correct notification details', () => {
      const notifications = engine.generateEventNotifications(mockActivityData, mockEvents);
      expect(notifications[0]).toMatchObject({
        type: 'event',
        priority: 'high',
        icon: '🎉',
        read: false,
      });
      expect(notifications[0].title.zh).toContain('新活動');
      expect(notifications[0].title.en).toContain('New event');
    });
  });

  // Tests for Weather Notifications
  describe('Weather Recommendations', () => {
    it('should generate weather recommendations for suitable locations', () => {
      const categoryWeatherMap = {
        sunny: ['park', 'outdoor'],
        cloudy: ['park', 'outdoor'],
        rainy: ['indoor', 'restaurant'],
        stormy: [],
      };

      const notifications = engine.generateWeatherRecommendations(
        mockActivityData,
        mockWeather,
        categoryWeatherMap,
      );

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe('weather');
      expect(notifications[0].priority).toBe('medium');
    });

    it('should not generate weather notifications when disabled', () => {
      engine.updatePreferences({
        enabledNotifications: {
          ...engine.getPreferences().enabledNotifications,
          weatherAlerts: false,
        },
      });

      const categoryWeatherMap = { sunny: ['park'] };
      const notifications = engine.generateWeatherRecommendations(
        mockActivityData,
        mockWeather,
        categoryWeatherMap,
      );

      expect(notifications).toHaveLength(0);
    });

    it('should include temperature in notification message', () => {
      const categoryWeatherMap = { sunny: ['park'] };
      const notifications = engine.generateWeatherRecommendations(
        mockActivityData,
        mockWeather,
        categoryWeatherMap,
      );

      expect(notifications[0].message.zh).toContain('25°C');
      expect(notifications[0].message.en).toContain('25°C');
    });

    it('should expire after 24 hours', () => {
      const categoryWeatherMap = { sunny: ['park'] };
      const notifications = engine.generateWeatherRecommendations(
        mockActivityData,
        mockWeather,
        categoryWeatherMap,
      );

      const expiresIn = (notifications[0].expiresAt || 0) - Date.now();
      expect(expiresIn).toBeGreaterThan(86400000 - 1000);
      expect(expiresIn).toBeLessThanOrEqual(86400000);
    });
  });

  // Tests for Crowd Alerts
  describe('Crowd Alerts', () => {
    it('should generate alerts for low crowd predictions', () => {
      const crowdPredictions: CrowdPrediction[] = [
        {
          locationId: 'loc1',
          timestamp: Date.now(),
          predictedCrowdLevel: 'low',
          confidence: 0.9,
          estimatedWaitTime: 15,
        },
      ];

      const notifications = engine.generateCrowdAlerts(mockActivityData, crowdPredictions);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('crowds');
      expect(notifications[0].priority).toBe('medium');
    });

    it('should not generate alerts for high crowd predictions', () => {
      const crowdPredictions: CrowdPrediction[] = [
        {
          locationId: 'loc1',
          timestamp: Date.now(),
          predictedCrowdLevel: 'high',
          confidence: 0.95,
          estimatedWaitTime: 60,
        },
      ];

      const notifications = engine.generateCrowdAlerts(mockActivityData, crowdPredictions);
      expect(notifications).toHaveLength(0);
    });

    it('should not generate alerts when disabled', () => {
      engine.updatePreferences({
        enabledNotifications: {
          ...engine.getPreferences().enabledNotifications,
          crowdAlerts: false,
        },
      });

      const crowdPredictions: CrowdPrediction[] = [
        {
          locationId: 'loc1',
          timestamp: Date.now(),
          predictedCrowdLevel: 'low',
          confidence: 0.9,
          estimatedWaitTime: 15,
        },
      ];

      const notifications = engine.generateCrowdAlerts(mockActivityData, crowdPredictions);
      expect(notifications).toHaveLength(0);
    });

    it('should include wait time in message', () => {
      const crowdPredictions: CrowdPrediction[] = [
        {
          locationId: 'loc1',
          timestamp: Date.now(),
          predictedCrowdLevel: 'low',
          confidence: 0.9,
          estimatedWaitTime: 20,
        },
      ];

      const notifications = engine.generateCrowdAlerts(mockActivityData, crowdPredictions);
      expect(notifications[0].message.zh).toContain('20');
      expect(notifications[0].message.en).toContain('20');
    });
  });

  // Tests for Savings Alerts
  describe('Savings Alerts', () => {
    it('should generate savings alerts when spending variance exists', () => {
      const activityData = [
        { ...mockActivityData[0], cost: 50 },
        { ...mockActivityData[0], cost: 100 },
        { ...mockActivityData[0], cost: 80 },
      ];

      const notifications = engine.generateSavingsAlerts(activityData);
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe('savings');
      expect(notifications[0].priority).toBe('low');
    });

    it('should not generate alerts for consistent spending', () => {
      const activityData = [
        { ...mockActivityData[0], cost: 50 },
        { ...mockActivityData[0], cost: 50 },
        { ...mockActivityData[0], cost: 50 },
      ];

      const notifications = engine.generateSavingsAlerts(activityData);
      expect(notifications).toHaveLength(0);
    });

    it('should not generate alerts when disabled', () => {
      engine.updatePreferences({
        enabledNotifications: {
          ...engine.getPreferences().enabledNotifications,
          savingsOpportunities: false,
        },
      });

      const activityData = [
        { ...mockActivityData[0], cost: 50 },
        { ...mockActivityData[0], cost: 100 },
      ];

      const notifications = engine.generateSavingsAlerts(activityData);
      expect(notifications).toHaveLength(0);
    });

    it('should calculate savings amount correctly', () => {
      const activityData = [
        { ...mockActivityData[0], cost: 50 },
        { ...mockActivityData[0], cost: 100 },
      ];

      const notifications = engine.generateSavingsAlerts(activityData);
      expect(notifications[0].message.zh).toContain('50');
      expect(notifications[0].message.en).toContain('50');
    });
  });

  // Tests for Birthday Notifications
  describe('Birthday/Anniversary Notifications', () => {
    it('should generate birthday notifications within 14 days', () => {
      const upcomingEvents = [
        {
          type: 'birthday' as const,
          name: '小明',
          date: Date.now() + 604800000,
          age: 5,
        },
      ];

      const notifications = engine.generateSpecialOccasionNotifications(
        upcomingEvents,
        mockActivityData,
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('birthday');
      expect(notifications[0].icon).toBe('🎂');
    });

    it('should not generate notifications for dates beyond 14 days', () => {
      const upcomingEvents = [
        {
          type: 'birthday' as const,
          name: '小明',
          date: Date.now() + 1296000000, // 15 days (14 days + 1 day buffer)
        },
      ];

      const notifications = engine.generateSpecialOccasionNotifications(
        upcomingEvents,
        mockActivityData,
      );

      expect(notifications).toHaveLength(0);
    });

    it('should handle anniversary type', () => {
      const upcomingEvents = [
        {
          type: 'anniversary' as const,
          name: '父母',
          date: Date.now() + 432000000,
        },
      ];

      const notifications = engine.generateSpecialOccasionNotifications(
        upcomingEvents,
        mockActivityData,
      );

      expect(notifications[0].icon).toBe('💑');
      expect(notifications[0].message.zh).toContain('周年紀念');
    });

    it('should not generate when disabled', () => {
      engine.updatePreferences({
        enabledNotifications: {
          ...engine.getPreferences().enabledNotifications,
          birthdayReminders: false,
        },
      });

      const upcomingEvents = [
        {
          type: 'birthday' as const,
          name: '小明',
          date: Date.now() + 604800000,
        },
      ];

      const notifications = engine.generateSpecialOccasionNotifications(
        upcomingEvents,
        mockActivityData,
      );

      expect(notifications).toHaveLength(0);
    });
  });

  // Tests for Personalized Recommendations
  describe('Personalized Recommendations', () => {
    it('should generate recommendations for unvisited locations', () => {
      const notifications = engine.generatePersonalizedRecommendations(
        mockActivityData,
        mockLocations,
        3,
      );

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe('recommendation');
      expect(notifications[0].icon).toBe('⭐');
    });

    it('should not recommend visited locations', () => {
      const notifications = engine.generatePersonalizedRecommendations(
        mockActivityData,
        mockActivityData,
      );

      expect(notifications).toHaveLength(0);
    });

    it('should respect maxRecommendations limit', () => {
      const notifications = engine.generatePersonalizedRecommendations(
        mockActivityData,
        mockLocations,
        1,
      );

      expect(notifications.length).toBeLessThanOrEqual(1);
    });

    it('should not generate when disabled', () => {
      engine.updatePreferences({
        enabledNotifications: {
          ...engine.getPreferences().enabledNotifications,
          personalizedRecommendations: false,
        },
      });

      const notifications = engine.generatePersonalizedRecommendations(
        mockActivityData,
        mockLocations,
      );

      expect(notifications).toHaveLength(0);
    });

    it('should prioritize based on satisfaction rating', () => {
      const activityData = [
        { ...mockActivityData[0], satisfactionRating: 5 },
        { ...mockActivityData[1], satisfactionRating: 2 },
      ];

      const notifications = engine.generatePersonalizedRecommendations(
        activityData,
        mockLocations,
        2,
      );

      if (notifications.length > 1) {
        expect(notifications[0].priority).toBe('high');
      }
    });
  });

  // Tests for Notification Management
  describe('Notification Management', () => {
    it('should add a single notification', () => {
      const notification: Notification = {
        id: 'test1',
        type: 'event',
        title: { zh: '測試', en: 'Test' },
        message: { zh: '測試通知', en: 'Test notification' },
        priority: 'medium',
        timestamp: Date.now(),
        read: false,
      };

      engine.addNotification(notification);
      const notifications = engine.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBe('test1');
    });

    it('should add multiple notifications', () => {
      const notifications = [
        {
          id: 'test1',
          type: 'event' as const,
          title: { zh: '測試1', en: 'Test 1' },
          message: { zh: '通知1', en: 'Notification 1' },
          priority: 'high' as const,
          timestamp: Date.now(),
          read: false,
        },
        {
          id: 'test2',
          type: 'weather' as const,
          title: { zh: '測試2', en: 'Test 2' },
          message: { zh: '通知2', en: 'Notification 2' },
          priority: 'medium' as const,
          timestamp: Date.now(),
          read: false,
        },
      ];

      engine.addNotifications(notifications);
      const all = engine.getNotifications();
      expect(all).toHaveLength(2);
    });

    it('should mark notification as read', () => {
      const notification: Notification = {
        id: 'test1',
        type: 'event',
        title: { zh: '測試', en: 'Test' },
        message: { zh: '測試通知', en: 'Test notification' },
        priority: 'medium',
        timestamp: Date.now(),
        read: false,
      };

      engine.addNotification(notification);
      engine.markAsRead('test1');

      const unread = engine.getNotifications({ read: false });
      expect(unread).toHaveLength(0);
    });

    it('should mark all notifications as read', () => {
      engine.addNotifications([
        {
          id: 'test1',
          type: 'event',
          title: { zh: '測試1', en: 'Test 1' },
          message: { zh: '通知1', en: 'Notification 1' },
          priority: 'high',
          timestamp: Date.now(),
          read: false,
        },
        {
          id: 'test2',
          type: 'weather',
          title: { zh: '測試2', en: 'Test 2' },
          message: { zh: '通知2', en: 'Notification 2' },
          priority: 'medium',
          timestamp: Date.now(),
          read: false,
        },
      ]);

      engine.markAllAsRead();
      const unread = engine.getNotifications({ read: false });
      expect(unread).toHaveLength(0);
    });

    it('should delete a notification', () => {
      const notification: Notification = {
        id: 'test1',
        type: 'event',
        title: { zh: '測試', en: 'Test' },
        message: { zh: '測試通知', en: 'Test notification' },
        priority: 'medium',
        timestamp: Date.now(),
        read: false,
      };

      engine.addNotification(notification);
      engine.deleteNotification('test1');

      const all = engine.getNotifications();
      expect(all).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      engine.addNotifications([
        {
          id: 'test1',
          type: 'event',
          title: { zh: '測試1', en: 'Test 1' },
          message: { zh: '通知1', en: 'Notification 1' },
          priority: 'high',
          timestamp: Date.now(),
          read: false,
        },
        {
          id: 'test2',
          type: 'weather',
          title: { zh: '測試2', en: 'Test 2' },
          message: { zh: '通知2', en: 'Notification 2' },
          priority: 'medium',
          timestamp: Date.now(),
          read: false,
        },
      ]);

      engine.clearAll();
      const all = engine.getNotifications();
      expect(all).toHaveLength(0);
    });

    it('should filter notifications by type', () => {
      engine.addNotifications([
        {
          id: 'test1',
          type: 'event',
          title: { zh: '事件', en: 'Event' },
          message: { zh: '事件通知', en: 'Event notification' },
          priority: 'high',
          timestamp: Date.now(),
          read: false,
        },
        {
          id: 'test2',
          type: 'weather',
          title: { zh: '天氣', en: 'Weather' },
          message: { zh: '天氣通知', en: 'Weather notification' },
          priority: 'medium',
          timestamp: Date.now(),
          read: false,
        },
      ]);

      const events = engine.getNotifications({ type: 'event' });
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('event');
    });

    it('should filter notifications by priority', () => {
      engine.addNotifications([
        {
          id: 'test1',
          type: 'event',
          title: { zh: '高優先級', en: 'High Priority' },
          message: { zh: '通知', en: 'Notification' },
          priority: 'high',
          timestamp: Date.now(),
          read: false,
        },
        {
          id: 'test2',
          type: 'weather',
          title: { zh: '低優先級', en: 'Low Priority' },
          message: { zh: '通知', en: 'Notification' },
          priority: 'low',
          timestamp: Date.now(),
          read: false,
        },
      ]);

      const high = engine.getNotifications({ priority: 'high' });
      expect(high).toHaveLength(1);
      expect(high[0].priority).toBe('high');
    });

    it('should get unread count', () => {
      engine.addNotifications([
        {
          id: 'test1',
          type: 'event',
          title: { zh: '測試1', en: 'Test 1' },
          message: { zh: '通知1', en: 'Notification 1' },
          priority: 'high',
          timestamp: Date.now(),
          read: false,
        },
        {
          id: 'test2',
          type: 'weather',
          title: { zh: '測試2', en: 'Test 2' },
          message: { zh: '通知2', en: 'Notification 2' },
          priority: 'medium',
          timestamp: Date.now(),
          read: true,
        },
      ]);

      expect(engine.getUnreadCount()).toBe(1);
    });
  });

  // Tests for Preferences
  describe('Preferences Management', () => {
    it('should get default preferences', () => {
      const prefs = engine.getPreferences();
      expect(prefs.enabledNotifications.events).toBe(true);
      expect(prefs.enabledNotifications.weatherAlerts).toBe(true);
      expect(prefs.notificationFrequency).toBe('daily');
    });

    it('should update preferences', () => {
      engine.updatePreferences({
        notificationFrequency: 'weekly',
      });

      const prefs = engine.getPreferences();
      expect(prefs.notificationFrequency).toBe('weekly');
    });

    it('should toggle notification type', () => {
      engine.updatePreferences({
        enabledNotifications: {
          events: false,
          weatherAlerts: true,
          crowdAlerts: true,
          savingsOpportunities: true,
          birthdayReminders: true,
          personalizedRecommendations: true,
        },
      });

      const prefs = engine.getPreferences();
      expect(prefs.enabledNotifications.events).toBe(false);
    });
  });

  // Tests for Quiet Hours
  describe('Quiet Hours', () => {
    it('should respect quiet hours setting', () => {
      engine.updatePreferences({
        quietHours: {
          enabled: true,
          startHour: 22,
          endHour: 8,
        },
      });

      const canNotify = engine.canNotifyNow();
      const currentHour = new Date().getHours();

      if (currentHour >= 22 || currentHour < 8) {
        expect(canNotify).toBe(false);
      } else {
        expect(canNotify).toBe(true);
      }
    });

    it('should allow notifications when quiet hours disabled', () => {
      engine.updatePreferences({
        quietHours: {
          enabled: false,
          startHour: 22,
          endHour: 8,
        },
      });

      expect(engine.canNotifyNow()).toBe(true);
    });
  });

  // Tests for Statistics
  describe('Statistics', () => {
    it('should calculate correct stats', () => {
      engine.addNotifications([
        {
          id: 'test1',
          type: 'event',
          title: { zh: '測試1', en: 'Test 1' },
          message: { zh: '通知1', en: 'Notification 1' },
          priority: 'high',
          timestamp: Date.now(),
          read: false,
        },
        {
          id: 'test2',
          type: 'event',
          title: { zh: '測試2', en: 'Test 2' },
          message: { zh: '通知2', en: 'Notification 2' },
          priority: 'high',
          timestamp: Date.now(),
          read: true,
        },
        {
          id: 'test3',
          type: 'weather',
          title: { zh: '測試3', en: 'Test 3' },
          message: { zh: '通知3', en: 'Notification 3' },
          priority: 'medium',
          timestamp: Date.now(),
          read: false,
        },
      ]);

      const stats = engine.getStats();
      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(2);
      expect(stats.byType['event']).toBe(2);
      expect(stats.byType['weather']).toBe(1);
      expect(stats.byPriority['high']).toBe(2);
      expect(stats.byPriority['medium']).toBe(1);
    });
  });

  // Tests for Persistence
  describe('Persistence', () => {
    it('should persist notifications to localStorage', () => {
      const notification: Notification = {
        id: 'test1',
        type: 'event',
        title: { zh: '測試', en: 'Test' },
        message: { zh: '測試通知', en: 'Test notification' },
        priority: 'medium',
        timestamp: Date.now(),
        read: false,
      };

      engine.addNotification(notification);

      const engine2 = new SmartNotificationEngine();
      const notifications = engine2.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBe('test1');
    });

    it('should remove expired notifications', () => {
      const expiredNotification: Notification = {
        id: 'test1',
        type: 'event',
        title: { zh: '過期通知', en: 'Expired Notification' },
        message: { zh: '已過期', en: 'Expired' },
        priority: 'medium',
        timestamp: Date.now() - 86400000,
        read: false,
        expiresAt: Date.now() - 1000,
      };

      engine.addNotification(expiredNotification);
      const notifications = engine.getNotifications();
      expect(notifications).toHaveLength(0);
    });
  });
});
