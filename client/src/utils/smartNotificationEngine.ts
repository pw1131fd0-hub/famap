/**
 * Smart Notification & Reminder Engine for FamMap
 * Provides intelligent notifications for families based on:
 * - Activity history and favorite locations
 * - Upcoming events at favorite venues
 * - Weather conditions suitable for outdoor activities
 * - Crowd predictions and best visit times
 * - Special occasions (birthdays, anniversaries)
 * - Budget recommendations and savings opportunities
 */

export interface Notification {
  id: string;
  type: 'event' | 'location' | 'weather' | 'crowds' | 'savings' | 'birthday' | 'recommendation';
  title: {
    zh: string;
    en: string;
  };
  message: {
    zh: string;
    en: string;
  };
  locationId?: string;
  locationName?: {
    zh: string;
    en: string;
  };
  actionUrl?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  read: boolean;
  expiresAt?: number;
}

export interface NotificationPreferences {
  enabledNotifications: {
    events: boolean;
    weatherAlerts: boolean;
    crowdAlerts: boolean;
    savingsOpportunities: boolean;
    birthdayReminders: boolean;
    personalizedRecommendations: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  };
  notificationFrequency: 'realtime' | 'daily' | 'weekly';
  preferredLanguage: 'zh' | 'en';
}

export interface ActivityData {
  locationId: string;
  locationName: {
    zh: string;
    en: string;
  };
  category?: string;
  visitDate: number;
  cost?: number;
  duration?: number;
  satisfactionRating?: number;
  familySize?: number;
  notes?: string;
}

export interface LocationEvent {
  id: string;
  locationId: string;
  title: {
    zh: string;
    en: string;
  };
  description?: {
    zh: string;
    en: string;
  };
  startDate: number;
  endDate: number;
  ageRange?: {
    min: number;
    max: number;
  };
  price?: number;
  category: string;
}

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  humidity: number;
  uvIndex?: number;
  windSpeed?: number;
  timestamp: number;
}

export interface CrowdPrediction {
  locationId: string;
  timestamp: number;
  predictedCrowdLevel: 'low' | 'medium' | 'high';
  confidence: number;
  estimatedWaitTime: number;
}

export class SmartNotificationEngine {
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences;
  private storageKey = 'fammap_notifications';
  private preferencesKey = 'fammap_notification_preferences';

  constructor(preferences?: Partial<NotificationPreferences>) {
    this.preferences = {
      enabledNotifications: {
        events: true,
        weatherAlerts: true,
        crowdAlerts: true,
        savingsOpportunities: true,
        birthdayReminders: true,
        personalizedRecommendations: true,
      },
      notificationFrequency: 'daily',
      preferredLanguage: 'zh',
      ...preferences,
    };

    this.loadNotifications();
  }

  /**
   * Generate event notifications for favorite locations
   */
  generateEventNotifications(
    favoriteLocations: ActivityData[],
    upcomingEvents: LocationEvent[],
  ): Notification[] {
    if (!this.preferences.enabledNotifications.events) {
      return [];
    }

    const locationIds = new Set(favoriteLocations.map((l) => l.locationId));
    const notifications: Notification[] = [];

    for (const event of upcomingEvents) {
      if (locationIds.has(event.locationId)) {
        const favoriteLocation = favoriteLocations.find((l) => l.locationId === event.locationId);
        notifications.push({
          id: `event_${event.id}_${Date.now()}`,
          type: 'event',
          title: {
            zh: `${favoriteLocation?.locationName.zh} 有新活動！`,
            en: `New event at ${favoriteLocation?.locationName.en}!`,
          },
          message: {
            zh: `${event.title.zh} 即將舉行。您喜歡的地點有新活動，不要錯過！`,
            en: `${event.title.en} is coming up. Don't miss this event at your favorite location!`,
          },
          locationId: event.locationId,
          locationName: favoriteLocation?.locationName,
          actionUrl: `/location/${event.locationId}`,
          icon: '🎉',
          priority: 'high',
          timestamp: Date.now(),
          read: false,
          expiresAt: event.startDate,
        });
      }
    }

    return notifications;
  }

  /**
   * Generate weather-based recommendations
   */
  generateWeatherRecommendations(
    favoriteLocations: ActivityData[],
    weather: WeatherData,
    categoryWeatherMap: Record<string, string[]>,
  ): Notification[] {
    if (!this.preferences.enabledNotifications.weatherAlerts) {
      return [];
    }

    const notifications: Notification[] = [];
    const suitableConditions = categoryWeatherMap[weather.condition] || [];

    for (const location of favoriteLocations.slice(0, 3)) {
      if (suitableConditions.includes(location.category || '')) {
        const tempC = weather.temperature;
        const weatherIcon =
          weather.condition === 'sunny' ? '☀️' : weather.condition === 'rainy' ? '🌧️' : '⛅';

        notifications.push({
          id: `weather_${location.locationId}_${Date.now()}`,
          type: 'weather',
          title: {
            zh: `好天氣！${location.locationName.zh} 適合今日造訪`,
            en: `Perfect weather for ${location.locationName.en}!`,
          },
          message: {
            zh: `今天 ${tempC}°C，${weather.condition === 'sunny' ? '晴朗' : '多雲'}天氣，非常適合去 ${location.locationName.zh} 玩！`,
            en: `It's ${tempC}°C and ${weather.condition} - great day to visit ${location.locationName.en}!`,
          },
          locationId: location.locationId,
          locationName: location.locationName,
          actionUrl: `/location/${location.locationId}`,
          icon: weatherIcon,
          priority: 'medium',
          timestamp: Date.now(),
          read: false,
          expiresAt: weather.timestamp + 86400000, // 24 hours
        });
      }
    }

    return notifications;
  }

  /**
   * Generate crowd prediction alerts
   */
  generateCrowdAlerts(
    favoriteLocations: ActivityData[],
    crowdPredictions: CrowdPrediction[],
  ): Notification[] {
    if (!this.preferences.enabledNotifications.crowdAlerts) {
      return [];
    }

    const notifications: Notification[] = [];
    const locationIds = new Set(favoriteLocations.map((l) => l.locationId));

    for (const prediction of crowdPredictions) {
      if (locationIds.has(prediction.locationId) && prediction.predictedCrowdLevel === 'low') {
        const location = favoriteLocations.find((l) => l.locationId === prediction.locationId);
        notifications.push({
          id: `crowd_${prediction.locationId}_${Date.now()}`,
          type: 'crowds',
          title: {
            zh: `${location?.locationName.zh} 人潮稀少！`,
            en: `${location?.locationName.en} has low crowds right now!`,
          },
          message: {
            zh: `現在去 ${location?.locationName.zh} 是好時機，預計等待時間少於 ${prediction.estimatedWaitTime} 分鐘。`,
            en: `Now is a great time to visit ${location?.locationName.en}. Expected wait time: <${prediction.estimatedWaitTime} min`,
          },
          locationId: prediction.locationId,
          locationName: location?.locationName,
          actionUrl: `/location/${prediction.locationId}`,
          icon: '✅',
          priority: 'medium',
          timestamp: Date.now(),
          read: false,
          expiresAt: prediction.timestamp + 3600000, // 1 hour
        });
      }
    }

    return notifications;
  }

  /**
   * Generate savings opportunity alerts
   */
  generateSavingsAlerts(activityHistory: ActivityData[]): Notification[] {
    if (!this.preferences.enabledNotifications.savingsOpportunities) {
      return [];
    }

    const notifications: Notification[] = [];

    // Group by category and calculate average
    const categorySpending: Record<string, number[]> = {};
    for (const activity of activityHistory) {
      if (activity.category && activity.cost) {
        if (!categorySpending[activity.category]) {
          categorySpending[activity.category] = [];
        }
        categorySpending[activity.category].push(activity.cost);
      }
    }

    // Identify categories where savings are possible
    for (const [category, costs] of Object.entries(categorySpending)) {
      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);

      if (maxCost > minCost * 1.3) {
        // 30% variance suggests savings opportunity
        notifications.push({
          id: `savings_${category}_${Date.now()}`,
          type: 'savings',
          title: {
            zh: `${category} 類別可以節省開支`,
            en: `Potential savings in ${category} category`,
          },
          message: {
            zh: `您在 ${category} 類別的花費差異較大（最低 $${minCost}，最高 $${maxCost}）。選擇更經濟的選項可以節省約 $${(maxCost - minCost).toFixed(0)}。`,
            en: `Your ${category} spending varies from $${minCost} to $${maxCost}. Choosing more affordable options could save ~$${(maxCost - minCost).toFixed(0)}.`,
          },
          icon: '💰',
          priority: 'low',
          timestamp: Date.now(),
          read: false,
          expiresAt: Date.now() + 604800000, // 7 days
        });
      }
    }

    return notifications;
  }

  /**
   * Generate birthday/anniversary location suggestions
   */
  generateSpecialOccasionNotifications(
    upcomingEvents: Array<{
      type: 'birthday' | 'anniversary';
      name: string;
      date: number;
      age?: number;
    }>,
    suitableLocations: ActivityData[],
  ): Notification[] {
    if (!this.preferences.enabledNotifications.birthdayReminders) {
      return [];
    }

    const notifications: Notification[] = [];
    const now = Date.now();

    for (const event of upcomingEvents) {
      const daysUntil = Math.floor((event.date - now) / 86400000);

      if (daysUntil > 0 && daysUntil <= 14) {
        const topLocation = suitableLocations[0];
        const ageText = event.age ? ` (${event.age} 歲)` : '';

        notifications.push({
          id: `birthday_${event.name}_${Date.now()}`,
          type: 'birthday',
          title: {
            zh: `${event.name}${ageText} 即將生日，計劃去哪裡慶祝？`,
            en: `Plan a celebration for ${event.name}'s ${event.type}!`,
          },
          message: {
            zh: `距離 ${event.name} 的 ${event.type === 'birthday' ? '生日' : '周年紀念'} 還有 ${daysUntil} 天。${topLocation?.locationName.zh} 是個不錯的慶祝地點！`,
            en: `${daysUntil} days until ${event.name}'s ${event.type}! Consider celebrating at ${topLocation?.locationName.en}.`,
          },
          locationId: topLocation?.locationId,
          locationName: topLocation?.locationName,
          actionUrl: topLocation ? `/location/${topLocation.locationId}` : undefined,
          icon: event.type === 'birthday' ? '🎂' : '💑',
          priority: 'high',
          timestamp: Date.now(),
          read: false,
          expiresAt: event.date + 86400000,
        });
      }
    }

    return notifications;
  }

  /**
   * Generate personalized location recommendations
   */
  generatePersonalizedRecommendations(
    activityHistory: ActivityData[],
    allLocations: ActivityData[],
    maxRecommendations: number = 3,
  ): Notification[] {
    if (!this.preferences.enabledNotifications.personalizedRecommendations) {
      return [];
    }

    const notifications: Notification[] = [];

    // Calculate preference score for each category
    const categoryPreferences: Record<string, number> = {};
    const visitedLocationIds = new Set(activityHistory.map((a) => a.locationId));

    for (const activity of activityHistory) {
      const category = activity.category || 'general';
      const satisfaction = activity.satisfactionRating || 3;
      if (!categoryPreferences[category]) {
        categoryPreferences[category] = 0;
      }
      categoryPreferences[category] += satisfaction;
    }

    // Find similar unvisited locations
    const recommendedLocations = allLocations
      .filter((loc) => !visitedLocationIds.has(loc.locationId))
      .sort((a, b) => {
        const scoreA = categoryPreferences[a.category || 'general'] || 0;
        const scoreB = categoryPreferences[b.category || 'general'] || 0;
        return scoreB - scoreA;
      })
      .slice(0, maxRecommendations);

    for (let i = 0; i < recommendedLocations.length; i++) {
      const location = recommendedLocations[i];
      const reason = this.getRecommendationReason(location, categoryPreferences);

      notifications.push({
        id: `recommend_${location.locationId}_${Date.now()}`,
        type: 'recommendation',
        title: {
          zh: `發現新地點：${location.locationName.zh}`,
          en: `Discovery: ${location.locationName.en}`,
        },
        message: {
          zh: `基於您的興趣喜好，${location.locationName.zh} 可能是個不錯的選擇。${reason}`,
          en: `Based on your preferences, you might enjoy ${location.locationName.en}. ${reason}`,
        },
        locationId: location.locationId,
        locationName: location.locationName,
        actionUrl: `/location/${location.locationId}`,
        icon: '⭐',
        priority: i === 0 ? 'high' : 'medium',
        timestamp: Date.now(),
        read: false,
        expiresAt: Date.now() + 1209600000, // 14 days
      });
    }

    return notifications;
  }

  /**
   * Get reason for recommendation
   */
  private getRecommendationReason(
    location: ActivityData,
    preferences: Record<string, number>,
  ): string {
    const category = location.category || 'general';
    const score = preferences[category] || 0;

    if (score >= 12) {
      return '因為您很喜歡這類地點。';
    } else if (score >= 8) {
      return '這類地點很適合您的家庭。';
    }
    return '這可能是個有趣的新體驗。';
  }

  /**
   * Add notification and save to storage
   */
  addNotification(notification: Notification): void {
    this.notifications.push(notification);
    this.saveNotifications();
  }

  /**
   * Add multiple notifications
   */
  addNotifications(notifications: Notification[]): void {
    this.notifications.push(...notifications);
    this.saveNotifications();
  }

  /**
   * Get all notifications
   */
  getNotifications(filters?: {
    type?: Notification['type'];
    read?: boolean;
    priority?: Notification['priority'];
  }): Notification[] {
    let filtered = this.notifications;

    if (filters?.type) {
      filtered = filtered.filter((n) => n.type === filters.type);
    }

    if (filters?.read !== undefined) {
      filtered = filtered.filter((n) => n.read === filters.read);
    }

    if (filters?.priority) {
      filtered = filtered.filter((n) => n.priority === filters.priority);
    }

    // Remove expired notifications
    filtered = filtered.filter((n) => !n.expiresAt || n.expiresAt > Date.now());

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.saveNotifications();
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== notificationId);
    this.saveNotifications();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
  }

  /**
   * Get preferences
   */
  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  /**
   * Check if should notify (respects quiet hours)
   */
  canNotifyNow(): boolean {
    if (!this.preferences.quietHours?.enabled) {
      return true;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const start = this.preferences.quietHours.startHour;
    const end = this.preferences.quietHours.endHour;

    if (start < end) {
      return currentHour < start || currentHour >= end;
    }
    return currentHour < start && currentHour >= end;
  }

  /**
   * Save notifications to localStorage
   */
  private saveNotifications(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
      } catch (e) {
        console.error('Failed to save notifications:', e);
      }
    }
  }

  /**
   * Load notifications from localStorage
   */
  private loadNotifications(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
          this.notifications = JSON.parse(data);
        }
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.preferencesKey, JSON.stringify(this.preferences));
      } catch (e) {
        console.error('Failed to save preferences:', e);
      }
    }
  }

  /**
   * Get notification summary stats
   */
  getStats() {
    const all = this.notifications;
    const unread = all.filter((n) => !n.read);

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    all.forEach((n) => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
    });

    return {
      total: all.length,
      unread: unread.length,
      byType,
      byPriority,
    };
  }
}

export default SmartNotificationEngine;
