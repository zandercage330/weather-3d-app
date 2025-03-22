import { WeatherNotification, NotificationType } from './notificationService';

export interface ScheduledNotification {
  id: string;
  title: string;
  type: NotificationType;
  frequency: 'once' | 'daily' | 'weekly' | 'custom';
  time?: string; // Format: "HH:MM"
  days?: number[]; // 0 = Sunday, 1 = Monday, etc.
  enabled: boolean;
  lastSent?: Date;
  customRules?: NotificationRule[];
}

export interface NotificationRule {
  id: string;
  type: 'temperature' | 'precipitation' | 'uv' | 'aqi' | 'wind' | 'custom';
  condition: 'above' | 'below' | 'equals' | 'changes' | 'range';
  value1: number;
  value2?: number; // For range conditions
  message?: string;
  priority: 'low' | 'medium' | 'high';
}

const STORAGE_KEY = 'weatherAppScheduledNotifications';

// Get all scheduled notifications
export function getScheduledNotifications(): ScheduledNotification[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((notification: any) => ({
        ...notification,
        lastSent: notification.lastSent ? new Date(notification.lastSent) : undefined
      }));
    }
  } catch (error) {
    console.error('Failed to parse scheduled notifications:', error);
  }
  
  return [];
}

// Save scheduled notifications
export function saveScheduledNotifications(notifications: ScheduledNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

// Add a new scheduled notification
export function addScheduledNotification(notification: ScheduledNotification): ScheduledNotification[] {
  const current = getScheduledNotifications();
  const updated = [...current, notification];
  saveScheduledNotifications(updated);
  return updated;
}

// Update an existing scheduled notification
export function updateScheduledNotification(
  id: string, 
  updates: Partial<ScheduledNotification>
): ScheduledNotification[] {
  const current = getScheduledNotifications();
  const updated = current.map(notification => 
    notification.id === id 
      ? { ...notification, ...updates } 
      : notification
  );
  saveScheduledNotifications(updated);
  return updated;
}

// Delete a scheduled notification
export function deleteScheduledNotification(id: string): ScheduledNotification[] {
  const current = getScheduledNotifications();
  const updated = current.filter(notification => notification.id !== id);
  saveScheduledNotifications(updated);
  return updated;
}

// Toggle a scheduled notification
export function toggleScheduledNotification(id: string): ScheduledNotification[] {
  const current = getScheduledNotifications();
  const updated = current.map(notification => 
    notification.id === id 
      ? { ...notification, enabled: !notification.enabled } 
      : notification
  );
  saveScheduledNotifications(updated);
  return updated;
}

// Check if any scheduled notifications should be fired
export function checkScheduledNotifications(): ScheduledNotification[] {
  const now = new Date();
  const current = getScheduledNotifications();
  const toFire: ScheduledNotification[] = [];
  
  current.forEach(notification => {
    if (!notification.enabled) return;
    
    // Check time-based conditions
    if (notification.frequency === 'daily' && notification.time) {
      const [hours, minutes] = notification.time.split(':').map(Number);
      if (isTimeMatching(now, hours, minutes)) {
        if (!wasNotificationRecentlySent(notification, now)) {
          toFire.push(notification);
          // Update last sent time
          updateScheduledNotification(notification.id, { lastSent: now });
        }
      }
    }
    
    // Check day-based conditions for weekly notifications
    if (notification.frequency === 'weekly' && notification.time && notification.days) {
      const dayOfWeek = now.getDay();
      if (notification.days.includes(dayOfWeek)) {
        const [hours, minutes] = notification.time.split(':').map(Number);
        if (isTimeMatching(now, hours, minutes)) {
          if (!wasNotificationRecentlySent(notification, now)) {
            toFire.push(notification);
            // Update last sent time
            updateScheduledNotification(notification.id, { lastSent: now });
          }
        }
      }
    }
    
    // One-time notifications
    if (notification.frequency === 'once' && notification.time) {
      const [hours, minutes] = notification.time.split(':').map(Number);
      if (isTimeMatching(now, hours, minutes)) {
        if (!wasNotificationRecentlySent(notification, now)) {
          toFire.push(notification);
          // Update last sent time and disable
          updateScheduledNotification(notification.id, { 
            lastSent: now,
            enabled: false // Disable after firing once
          });
        }
      }
    }
  });
  
  return toFire;
}

// Check if a notification rule is satisfied by the weather data
export function checkNotificationRule(
  rule: NotificationRule, 
  weatherValue: number
): boolean {
  switch(rule.condition) {
    case 'above':
      return weatherValue > rule.value1;
    case 'below':
      return weatherValue < rule.value1;
    case 'equals':
      return weatherValue === rule.value1;
    case 'range':
      return rule.value2 !== undefined && 
        weatherValue >= rule.value1 && 
        weatherValue <= rule.value2;
    case 'changes':
      // This would need previous values stored and compared
      return false;
    default:
      return false;
  }
}

// Helper: Check if current time matches the target hours and minutes
function isTimeMatching(now: Date, targetHours: number, targetMinutes: number): boolean {
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  return currentHours === targetHours && currentMinutes === targetMinutes;
}

// Helper: Check if notification was recently sent (within 5 minutes)
function wasNotificationRecentlySent(notification: ScheduledNotification, now: Date): boolean {
  if (!notification.lastSent) return false;
  
  const diffMs = now.getTime() - notification.lastSent.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  return diffMinutes < 5; // Within 5 minutes
}

// Convert scheduled notification to actual notification
export function createNotificationFromScheduled(
  scheduled: ScheduledNotification
): WeatherNotification {
  return {
    id: `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: scheduled.title,
    message: getMessageForScheduledNotification(scheduled),
    type: scheduled.type,
    timestamp: new Date(),
    read: false,
    priority: 'medium',
    data: { scheduledNotificationId: scheduled.id }
  };
}

// Helper: Generate appropriate message for the scheduled notification
function getMessageForScheduledNotification(notification: ScheduledNotification): string {
  switch (notification.type) {
    case 'forecast':
      return `Here's your scheduled weather update for today.`;
    case 'alert':
      return `Checking for any weather alerts in your area.`;
    case 'temperature':
      return `Here's your scheduled temperature update.`;
    case 'precipitation':
      return `Here's your scheduled precipitation forecast.`;
    default:
      return `Scheduled weather update`;
  }
} 