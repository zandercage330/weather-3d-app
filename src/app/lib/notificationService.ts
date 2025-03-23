// This service handles weather notifications and permissions
import { WeatherAlert, WeatherData, ForecastDay } from './weatherService';
import { 
  checkScheduledNotifications, 
  createNotificationFromScheduled, 
  checkNotificationRule,
  ScheduledNotification
} from './notificationScheduleService';
import { getRecommendedActivities } from './activityRecommendationService';

// Types for notifications
export interface WeatherNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

export type NotificationType = 
  | 'alert'        // Severe weather alerts
  | 'forecast'     // Daily forecast notifications
  | 'aqi'          // Air quality alerts
  | 'precipitation' // Rain/snow starting or stopping soon
  | 'temperature'  // Significant temperature changes
  | 'uv'           // High UV index warnings
  | 'activity'     // Activity recommendations
  | 'system';      // App-related notifications

export interface NotificationPreferences {
  enabled: boolean;
  notifyInBrowser: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  alertNotifications: boolean;
  forecastNotifications: boolean;
  precipitationNotifications: boolean;
  temperatureNotifications: boolean;
  aqiNotifications: boolean;
  uvNotifications: boolean;
  activityNotifications: boolean;
  // Notification frequency
  notificationFrequency: 'high' | 'medium' | 'low'; // How frequently to send notifications
  // New threshold settings
  temperatureChangeThreshold: number;
  precipitationThreshold: number;
  aqiThreshold: number;
  uvThreshold: number;
  dailyForecastTime: string;
  weekendNotifications: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  notifyInBrowser: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  alertNotifications: true,
  forecastNotifications: true,
  precipitationNotifications: true,
  temperatureNotifications: true,
  aqiNotifications: true,
  uvNotifications: true,
  activityNotifications: true,
  notificationFrequency: 'medium',
  // New threshold default values
  temperatureChangeThreshold: 5,
  precipitationThreshold: 30,
  aqiThreshold: 100,
  uvThreshold: 6,
  dailyForecastTime: '07:00',
  weekendNotifications: true
};

// Check if notification permission is granted
export async function checkNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Request permission to show notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Send a browser notification if allowed
export function sendBrowserNotification(notification: WeatherNotification): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  // Check if we're in quiet hours
  if (isInQuietHours()) {
    return false;
  }

  try {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/weather-icons/' + getIconForNotificationType(notification.type) + '.png',
    });

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
    };

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

// Determine if current time is within quiet hours
function isInQuietHours(): boolean {
  const preferences = getNotificationPreferencesFromStorage();
  if (!preferences.quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  // Handle the case where quiet hours span overnight
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
}

// Get notification preferences from storage
export function getNotificationPreferencesFromStorage(): NotificationPreferences {
  try {
    const savedPreferences = localStorage.getItem('weatherAppNotificationPreferences');
    if (savedPreferences) {
      return {
        ...defaultNotificationPreferences,
        ...JSON.parse(savedPreferences)
      };
    }
  } catch (error) {
    console.error('Failed to parse notification preferences:', error);
  }
  
  return defaultNotificationPreferences;
}

// Save notification preferences to storage
export function saveNotificationPreferencesToStorage(preferences: NotificationPreferences): void {
  localStorage.setItem('weatherAppNotificationPreferences', JSON.stringify(preferences));
}

// Generate weather notifications based on data
export function generateWeatherNotifications(
  weatherData: WeatherData,
  forecastData: ForecastDay[],
  alerts: WeatherAlert[],
  preferences: NotificationPreferences
): WeatherNotification[] {
  const notifications: WeatherNotification[] = [];

  if (!preferences.enabled) {
    return notifications;
  }

  // Check if we're within the notification frequency constraints
  if (shouldLimitNotificationFrequency(preferences.notificationFrequency)) {
    return notifications;
  }

  // Generate alert notifications
  if (preferences.alertNotifications && alerts.length > 0) {
    alerts.forEach(alert => {
      notifications.push({
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: `Weather Alert: ${alert.eventType}`,
        message: alert.headline,
        type: 'alert',
        timestamp: new Date(),
        read: false,
        priority: getSeverityPriority(alert.severity),
        data: alert
      });
    });
  }

  // Generate air quality notifications
  if (preferences.aqiNotifications && weatherData.airQuality) {
    const aqi = weatherData.airQuality;
    if (aqi.category === 'unhealthyForSensitive' || aqi.category === 'unhealthy' || 
        aqi.category === 'veryUnhealthy' || aqi.category === 'hazardous') {
      notifications.push({
        id: `aqi-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Air Quality Alert',
        message: `The air quality is currently ${aqi.category.replace(/([A-Z])/g, ' $1').toLowerCase()} with an index of ${aqi.index}.`,
        type: 'aqi',
        timestamp: new Date(),
        read: false,
        priority: getAqiPriority(aqi.category),
        data: aqi
      });
    }
  }

  // Generate UV index notifications
  if (preferences.uvNotifications && weatherData.uvIndex >= 6) {
    notifications.push({
      id: `uv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'High UV Index',
      message: `The UV index is currently ${weatherData.uvIndex}. Consider sun protection.`,
      type: 'uv',
      timestamp: new Date(),
      read: false,
      priority: getUvPriority(weatherData.uvIndex),
      data: { uvIndex: weatherData.uvIndex }
    });
  }

  // Generate forecast notifications (notable weather tomorrow)
  if (preferences.forecastNotifications && forecastData.length >= 2) {
    const tomorrow = forecastData[1];
    
    // Check for extreme temperatures
    if (tomorrow.highTemp >= 90 || tomorrow.lowTemp <= 32) {
      notifications.push({
        id: `forecast-temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Temperature Alert for Tomorrow',
        message: tomorrow.highTemp >= 90 
          ? `High heat expected tomorrow with temperatures reaching ${tomorrow.highTemp}°F.`
          : `Freezing temperatures expected tomorrow with a low of ${tomorrow.lowTemp}°F.`,
        type: 'forecast',
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        data: { forecast: tomorrow }
      });
    }
    
    // Check for high precipitation
    if (tomorrow.precipitation >= 0.5) {
      notifications.push({
        id: `forecast-precip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Rain/Snow Expected Tomorrow',
        message: `Expect ${tomorrow.condition.toLowerCase()} tomorrow with a ${Math.round(tomorrow.precipitation * 100)}% chance of precipitation.`,
        type: 'forecast',
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        data: { forecast: tomorrow }
      });
    }
  }

  // Temperature change notifications
  if (preferences.temperatureNotifications && forecastData.length >= 2) {
    const today = forecastData[0];
    const tomorrow = forecastData[1];
    
    // Check for significant temperature changes
    const tempDifference = tomorrow.highTemp - today.highTemp;
    if (Math.abs(tempDifference) >= 15) {
      notifications.push({
        id: `temperature-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: 'Temperature Change Alert',
        message: tempDifference > 0 
          ? `Warming trend: Temperature will increase by ${Math.abs(tempDifference)}°F tomorrow.`
          : `Cooling trend: Temperature will drop by ${Math.abs(tempDifference)}°F tomorrow.`,
        type: 'temperature',
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        data: { today, tomorrow }
      });
    }
  }

  // Add scheduled notifications
  const scheduledNotificationsToFire = checkScheduledNotifications();
  const scheduledNotifications = scheduledNotificationsToFire.map(scheduled => 
    createNotificationFromScheduled(scheduled)
  );
  
  // Check if any scheduled notifications have custom rules
  scheduledNotificationsToFire.forEach(scheduled => {
    if (scheduled.customRules && scheduled.customRules.length > 0) {
      // Check each rule against current weather data
      scheduled.customRules.forEach(rule => {
        let currentValue = 0;
        
        // Get the value to check based on rule type
        switch(rule.type) {
          case 'temperature':
            currentValue = weatherData.temperature;
            break;
          case 'precipitation':
            currentValue = forecastData?.[0]?.precipitation || 0;
            break;
          case 'uv':
            currentValue = weatherData.uvIndex || 0;
            break;
          case 'aqi':
            currentValue = weatherData.airQuality?.index || 0;
            break;
          case 'wind':
            currentValue = weatherData.windSpeed || 0;
            break;
        }
        
        // Check if rule is satisfied
        if (checkNotificationRule(rule, currentValue)) {
          notifications.push({
            id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: `${rule.type.charAt(0).toUpperCase() + rule.type.slice(1)} Alert`,
            message: rule.message || `${rule.type.charAt(0).toUpperCase() + rule.type.slice(1)} is ${getConditionText(rule.condition)} ${rule.value1}${getUnitForType(rule.type)}`,
            type: getNotificationTypeFromRuleType(rule.type),
            timestamp: new Date(),
            read: false,
            priority: rule.priority,
            data: { rule, currentValue }
          });
        }
      });
    }
  });

  // Generate activity recommendation notifications
  const activityNotifications = generateActivityNotifications(weatherData, forecastData, preferences);
  return [...notifications, ...scheduledNotifications, ...activityNotifications];
}

// Check if we should limit notifications based on frequency
function shouldLimitNotificationFrequency(frequency: 'high' | 'medium' | 'low'): boolean {
  const lastNotificationTime = localStorage.getItem('lastNotificationTime');
  if (!lastNotificationTime) {
    localStorage.setItem('lastNotificationTime', Date.now().toString());
    return false;
  }
  
  const now = Date.now();
  const last = parseInt(lastNotificationTime);
  const diffMinutes = (now - last) / (1000 * 60);
  
  // Set cooldown period based on frequency
  let cooldownMinutes = 60; // Default for medium
  if (frequency === 'high') {
    cooldownMinutes = 15;
  } else if (frequency === 'low') {
    cooldownMinutes = 180; // 3 hours
  }
  
  if (diffMinutes < cooldownMinutes) {
    return true; // Should limit (cooldown still active)
  }
  
  // Update last notification time
  localStorage.setItem('lastNotificationTime', now.toString());
  return false;
}

// Helper functions for priority
function getSeverityPriority(severity: string): 'low' | 'medium' | 'high' {
  switch (severity) {
    case 'Extreme': return 'high';
    case 'Severe': return 'high';
    case 'Moderate': return 'medium';
    default: return 'low';
  }
}

function getAqiPriority(category: string): 'low' | 'medium' | 'high' {
  switch (category) {
    case 'hazardous': return 'high';
    case 'veryUnhealthy': return 'high';
    case 'unhealthy': return 'medium';
    case 'unhealthyForSensitive': return 'medium';
    default: return 'low';
  }
}

function getUvPriority(uvIndex: number): 'low' | 'medium' | 'high' {
  if (uvIndex >= 11) return 'high';
  if (uvIndex >= 8) return 'medium';
  if (uvIndex >= 6) return 'medium';
  return 'low';
}

function getIconForNotificationType(type: NotificationType): string {
  switch (type) {
    case 'alert': return 'alert';
    case 'forecast': return 'cloudy';
    case 'aqi': return 'pollution';
    case 'precipitation': return 'rain';
    case 'temperature': return 'thermometer';
    case 'uv': return 'sun';
    case 'activity': return 'hiking';
    case 'system': return 'notification';
    default: return 'notification';
  }
}

// Helper function to get text representation of condition
function getConditionText(condition: string): string {
  switch (condition) {
    case 'above': return 'above';
    case 'below': return 'below';
    case 'equals': return 'exactly';
    case 'range': return 'between';
    case 'changes': return 'changing by';
    default: return '';
  }
}

// Helper function to get unit based on type
function getUnitForType(type: string): string {
  switch (type) {
    case 'temperature': return '°F';
    case 'precipitation': return '%';
    case 'wind': return ' mph';
    case 'uv': return '';
    case 'aqi': return '';
    default: return '';
  }
}

// Convert rule type to notification type
function getNotificationTypeFromRuleType(ruleType: string): NotificationType {
  switch (ruleType) {
    case 'temperature': return 'temperature';
    case 'precipitation': return 'precipitation';
    case 'uv': return 'uv';
    case 'aqi': return 'aqi';
    case 'wind': return 'system';
    default: return 'system';
  }
}

/**
 * Generate activity recommendation notifications
 */
function generateActivityNotifications(
  weather: WeatherData,
  forecast: ForecastDay[] = [],
  userPreferences: any
): WeatherNotification[] {
  const notifications: WeatherNotification[] = [];
  
  // Only generate if activity notifications are enabled in preferences
  if (!userPreferences?.activityNotifications) {
    return notifications;
  }

  try {
    // Get top activity recommendations
    const recommendations = getRecommendedActivities(weather, {
      forecast,
      maxResults: 3
    });
    
    // Only notify about high-scored activities (80%+)
    const highScoredActivities = recommendations.filter(rec => rec.score >= 80);
    
    if (highScoredActivities.length > 0) {
      const topActivity = highScoredActivities[0];
      
      notifications.push({
        id: `activity-${Date.now()}`,
        type: 'activity',
        title: `Perfect Weather for ${topActivity.activity.name}!`,
        message: topActivity.reason,
        timestamp: new Date(),
        priority: 'medium',
        read: false,
        data: {
          activityId: topActivity.activity.id,
          score: topActivity.score,
          category: topActivity.activity.category
        }
      });
      
      // If there are multiple good activities, add a summary notification
      if (highScoredActivities.length > 1) {
        const activityNames = highScoredActivities.map(a => a.activity.name).join(', ');
        
        notifications.push({
          id: `activity-summary-${Date.now()}`,
          type: 'activity',
          title: 'Great Day for Outdoor Activities',
          message: `Perfect conditions for: ${activityNames}`,
          timestamp: new Date(),
          priority: 'low',
          read: false,
          data: {
            count: highScoredActivities.length
          }
        });
      }
    }
  } catch (error) {
    console.error('Error generating activity notifications:', error);
  }
  
  return notifications;
} 