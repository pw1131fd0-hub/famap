/**
 * Smart Alert & Notification System
 * Keeps families informed about important venue updates and events
 * Enables proactive planning and discovery
 */

export interface Alert {
  id: string;
  type: 'new_review' | 'event' | 'crowdedness' | 'weather' | 'promotion';
  locationId: string;
  locationName: string;
  severity: 'info' | 'warning' | 'urgent';
  title: {
    zh: string;
    en: string;
  };
  message: {
    zh: string;
    en: string;
  };
  actionUrl?: string;
  createdAt: number;
  expiresAt: number;
  read: boolean;
}

export interface AlertPreferences {
  newReviewsEnabled: boolean;
  newReviewsMinRating: number; // 1-5
  eventsEnabled: boolean;
  eventTypesFilter: string[];
  crowdednessAlertsEnabled: boolean;
  crowdednessThreshold: 'light' | 'moderate' | 'heavy';
  weatherAlertsEnabled: boolean;
  weatherTypes: string[]; // e.g., ['rain', 'extreme_heat']
  promotionAlertsEnabled: boolean;
  notificationQuietHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  };
}

const STORAGE_KEY = 'fammap_alerts';
const PREFERENCES_KEY = 'fammap_alert_preferences';
const MAX_ALERTS = 50;
const ALERT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get default alert preferences
 */
export function getDefaultAlertPreferences(): AlertPreferences {
  return {
    newReviewsEnabled: true,
    newReviewsMinRating: 4,
    eventsEnabled: true,
    eventTypesFilter: ['birthday_party', 'workshop', 'performance'],
    crowdednessAlertsEnabled: true,
    crowdednessThreshold: 'heavy',
    weatherAlertsEnabled: true,
    weatherTypes: ['rain', 'extreme_heat', 'typhoon'],
    promotionAlertsEnabled: true,
    notificationQuietHours: {
      enabled: false,
      startHour: 22,
      endHour: 8,
    },
  };
}

/**
 * Load user's alert preferences
 */
export function loadAlertPreferences(): AlertPreferences {
  const data = localStorage.getItem(PREFERENCES_KEY);
  return data ? JSON.parse(data) : getDefaultAlertPreferences();
}

/**
 * Save user's alert preferences
 */
export function saveAlertPreferences(preferences: AlertPreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

/**
 * Create a new alert
 */
export function createAlert(
  type: Alert['type'],
  locationId: string,
  locationName: string,
  title: { zh: string; en: string },
  message: { zh: string; en: string },
  severity: Alert['severity'] = 'info',
  actionUrl?: string
): Alert {
  const now = Date.now();
  return {
    id: `alert_${now}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    locationId,
    locationName,
    severity,
    title,
    message,
    actionUrl,
    createdAt: now,
    expiresAt: now + ALERT_TTL,
    read: false,
  };
}

/**
 * Add alert to the system
 */
export function addAlert(alert: Alert): void {
  const alerts = loadAlerts();

  // Prevent duplicate alerts from the same location in the last hour
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const isDuplicate = alerts.some(
    (a) =>
      a.type === alert.type &&
      a.locationId === alert.locationId &&
      a.createdAt > oneHourAgo
  );

  if (isDuplicate) return;

  // Add new alert
  alerts.unshift(alert);

  // Remove expired alerts and keep only MAX_ALERTS
  const validAlerts = alerts
    .filter((a) => a.expiresAt > now)
    .slice(0, MAX_ALERTS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(validAlerts));
}

/**
 * Load all alerts
 */
export function loadAlerts(): Alert[] {
  const data = localStorage.getItem(STORAGE_KEY);
  const alerts: Alert[] = data ? JSON.parse(data) : [];
  const now = Date.now();

  // Filter expired alerts
  return alerts.filter((a) => a.expiresAt > now);
}

/**
 * Get unread alerts count
 */
export function getUnreadAlertsCount(): number {
  return loadAlerts().filter((a) => !a.read).length;
}

/**
 * Mark alert as read
 */
export function markAlertAsRead(alertId: string): void {
  const alerts = loadAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.read = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }
}

/**
 * Mark all alerts as read
 */
export function markAllAlertsAsRead(): void {
  const alerts = loadAlerts();
  alerts.forEach((a) => {
    a.read = true;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

/**
 * Delete alert
 */
export function deleteAlert(alertId: string): void {
  const alerts = loadAlerts();
  const filtered = alerts.filter((a) => a.id !== alertId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Clear all alerts
 */
export function clearAllAlerts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get alerts by type
 */
export function getAlertsByType(type: Alert['type']): Alert[] {
  return loadAlerts().filter((a) => a.type === type);
}

/**
 * Get alerts for a specific location
 */
export function getLocationAlerts(locationId: string): Alert[] {
  return loadAlerts().filter((a) => a.locationId === locationId);
}

/**
 * Check if current time is during quiet hours
 */
export function isQuietHours(preferences: AlertPreferences): boolean {
  if (!preferences.notificationQuietHours.enabled) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const { startHour, endHour } = preferences.notificationQuietHours;

  if (startHour < endHour) {
    return currentHour >= startHour && currentHour < endHour;
  } else {
    // Quiet hours wrap around midnight
    return currentHour >= startHour || currentHour < endHour;
  }
}

/**
 * Should show notification based on preferences
 */
export function shouldShowNotification(
  alert: Alert,
  preferences: AlertPreferences
): boolean {
  // Check quiet hours
  if (isQuietHours(preferences)) {
    // Only show urgent alerts during quiet hours
    return alert.severity === 'urgent';
  }

  // Check alert type preferences
  switch (alert.type) {
    case 'new_review':
      return preferences.newReviewsEnabled;
    case 'event':
      return preferences.eventsEnabled;
    case 'crowdedness':
      return preferences.crowdednessAlertsEnabled;
    case 'weather':
      return preferences.weatherAlertsEnabled;
    case 'promotion':
      return preferences.promotionAlertsEnabled;
    default:
      return true;
  }
}

/**
 * Generate review alert
 */
export function generateReviewAlert(
  locationId: string,
  locationName: string,
  reviewRating: number,
  reviewerName?: string
): Alert | null {
  const preferences = loadAlertPreferences();

  if (!preferences.newReviewsEnabled || reviewRating < preferences.newReviewsMinRating) {
    return null;
  }

  const rating = Math.round(reviewRating * 2) / 2; // Round to nearest 0.5
  return createAlert(
    'new_review',
    locationId,
    locationName,
    {
      zh: `新的評論：${rating}星`,
      en: `New Review: ${rating} Stars`,
    },
    {
      zh: `${locationName}獲得了新的${rating}星評論${reviewerName ? `來自 ${reviewerName}` : ''}`,
      en: `${locationName} received a new ${rating}-star review${reviewerName ? ` from ${reviewerName}` : ''}`,
    },
    'info',
    `/location/${locationId}`
  );
}

/**
 * Generate event alert
 */
export function generateEventAlert(
  locationId: string,
  locationName: string,
  eventTitle: string,
  eventDate: number,
  ageMin?: number,
  ageMax?: number
): Alert | null {
  const preferences = loadAlertPreferences();

  if (!preferences.eventsEnabled) {
    return null;
  }

  const daysUntil = Math.floor((eventDate - Date.now()) / (24 * 60 * 60 * 1000));

  return createAlert(
    'event',
    locationId,
    locationName,
    {
      zh: `新活動：${eventTitle}`,
      en: `New Event: ${eventTitle}`,
    },
    {
      zh: `${locationName}即將舉辦「${eventTitle}」，在${daysUntil}天後${ageMin ? `（建議年齡${ageMin}-${ageMax}歲）` : ''}`,
      en: `${locationName} is hosting "${eventTitle}" in ${daysUntil} days${ageMin ? ` (Recommended age ${ageMin}-${ageMax})` : ''}`,
    },
    daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'warning' : 'info',
    `/location/${locationId}`
  );
}

/**
 * Generate crowdedness alert
 */
export function generateCrowdednessAlert(
  locationId: string,
  locationName: string,
  crowdLevel: 'light' | 'moderate' | 'heavy'
): Alert | null {
  const preferences = loadAlertPreferences();

  if (!preferences.crowdednessAlertsEnabled) {
    return null;
  }

  // Only alert if crowdedness matches threshold
  const levels = ['light', 'moderate', 'heavy'];
  const currentLevelIndex = levels.indexOf(crowdLevel);
  const thresholdIndex = levels.indexOf(preferences.crowdednessThreshold);

  if (currentLevelIndex < thresholdIndex) {
    return null;
  }

  const crowdEmoji = {
    light: '😊',
    moderate: '😐',
    heavy: '😰',
  };

  const crowdLabel = {
    light: { zh: '人流少', en: 'Light Crowd' },
    moderate: { zh: '人流中等', en: 'Moderate Crowd' },
    heavy: { zh: '人流擁擠', en: 'Heavy Crowd' },
  };

  return createAlert(
    'crowdedness',
    locationId,
    locationName,
    {
      zh: `${crowdLabel[crowdLevel].zh} ${crowdEmoji[crowdLevel]}`,
      en: `${crowdLabel[crowdLevel].en} ${crowdEmoji[crowdLevel]}`,
    },
    {
      zh: `${locationName}目前${crowdLabel[crowdLevel].zh}`,
      en: `${locationName} is currently ${crowdLabel[crowdLevel].en.toLowerCase()}`,
    },
    crowdLevel === 'heavy' ? 'warning' : 'info',
    `/location/${locationId}`
  );
}

/**
 * Generate weather alert
 */
export function generateWeatherAlert(
  locationId: string,
  locationName: string,
  weatherType: string,
  details: string
): Alert | null {
  const preferences = loadAlertPreferences();

  if (!preferences.weatherAlertsEnabled) {
    return null;
  }

  if (!preferences.weatherTypes.includes(weatherType)) {
    return null;
  }

  const weatherIcon = {
    rain: '🌧️',
    extreme_heat: '🥵',
    extreme_cold: '❄️',
    typhoon: '🌀',
    air_quality: '😷',
  };

  const weatherLabel = {
    rain: { zh: '下雨', en: 'Rain' },
    extreme_heat: { zh: '高溫警告', en: 'Extreme Heat' },
    extreme_cold: { zh: '寒流警告', en: 'Extreme Cold' },
    typhoon: { zh: '颱風警告', en: 'Typhoon' },
    air_quality: { zh: '空氣品質不良', en: 'Poor Air Quality' },
  };

  return createAlert(
    'weather',
    locationId,
    locationName,
    {
      zh: `${weatherLabel[weatherType as keyof typeof weatherLabel]?.zh || weatherType} ${weatherIcon[weatherType as keyof typeof weatherIcon] || '⚠️'}`,
      en: `${weatherLabel[weatherType as keyof typeof weatherLabel]?.en || weatherType} ${weatherIcon[weatherType as keyof typeof weatherIcon] || '⚠️'}`,
    },
    {
      zh: `${locationName}：${details}`,
      en: `${locationName}: ${details}`,
    },
    'warning',
    `/location/${locationId}`
  );
}

/**
 * Generate promotion alert
 */
export function generatePromotionAlert(
  locationId: string,
  locationName: string,
  promotionTitle: string,
  promotionDetails: string,
  expiryDate?: number
): Alert {

  const daysUntil = expiryDate
    ? Math.floor((expiryDate - Date.now()) / (24 * 60 * 60 * 1000))
    : undefined;

  return createAlert(
    'promotion',
    locationId,
    locationName,
    {
      zh: `優惠：${promotionTitle}`,
      en: `Promotion: ${promotionTitle}`,
    },
    {
      zh: `${locationName}：${promotionDetails}${daysUntil ? `（倒數${daysUntil}天）` : ''}`,
      en: `${locationName}: ${promotionDetails}${daysUntil ? ` (${daysUntil} days left)` : ''}`,
    },
    daysUntil && daysUntil <= 3 ? 'urgent' : 'info',
    `/location/${locationId}`
  );
}

/**
 * Get alerts that should be displayed to user
 */
export function getDisplayableAlerts(limit = 10): Alert[] {
  const preferences = loadAlertPreferences();
  const alerts = loadAlerts();

  return alerts
    .filter((alert) => shouldShowNotification(alert, preferences))
    .slice(0, limit);
}

/**
 * Get alerts grouped by type
 */
export function groupAlertsByType(): Record<Alert['type'], Alert[]> {
  const alerts = loadAlerts();
  return {
    new_review: alerts.filter((a) => a.type === 'new_review'),
    event: alerts.filter((a) => a.type === 'event'),
    crowdedness: alerts.filter((a) => a.type === 'crowdedness'),
    weather: alerts.filter((a) => a.type === 'weather'),
    promotion: alerts.filter((a) => a.type === 'promotion'),
  };
}
