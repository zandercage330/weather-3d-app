'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WeatherNotification, 
  NotificationPreferences, 
  defaultNotificationPreferences, 
  getNotificationPreferencesFromStorage, 
  saveNotificationPreferencesToStorage,
  checkNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification
} from '../lib/notificationService';
import {
  ScheduledNotification,
  NotificationRule,
  getScheduledNotifications,
  saveScheduledNotifications,
  checkScheduledNotifications
} from '../lib/notificationScheduleService';

// Notification context type
interface NotificationContextType {
  notifications: WeatherNotification[];
  notificationHistory: WeatherNotification[];
  scheduledNotifications: ScheduledNotification[];
  unreadCount: number;
  hasPermission: boolean;
  notificationPreferences: NotificationPreferences;
  addNotification: (notification: WeatherNotification) => void;
  addNotifications: (notifications: WeatherNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  archiveNotification: (id: string) => void;
  requestPermission: () => Promise<boolean>;
  updateNotificationPreferences: <K extends keyof NotificationPreferences>(
    key: K, 
    value: NotificationPreferences[K]
  ) => void;
  addScheduledNotification: (notification: ScheduledNotification) => void;
  updateScheduledNotification: (id: string, updates: Partial<ScheduledNotification>) => void;
  removeScheduledNotification: (id: string) => void;
  clearAllScheduledNotifications: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Provider component props
interface NotificationProviderProps {
  children: ReactNode;
}

// Maximum number of active notifications to keep
const MAX_ACTIVE_NOTIFICATIONS = 20;

// Maximum number of history notifications to keep
const MAX_HISTORY_NOTIFICATIONS = 50;

// Provider component
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<WeatherNotification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<WeatherNotification[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences
  );
  const [loaded, setLoaded] = useState(false);

  // Load notifications and preferences from localStorage on mount
  useEffect(() => {
    // Load notification preferences
    const savedPreferences = getNotificationPreferencesFromStorage();
    setNotificationPreferences(savedPreferences);

    // Load saved notifications
    try {
      const savedNotifications = localStorage.getItem('weatherAppNotifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        // Convert string timestamps back to Date objects
        const processedNotifications = parsedNotifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(processedNotifications);
        setUnreadCount(processedNotifications.filter((n: WeatherNotification) => !n.read).length);
      }
      
      // Load notification history
      const savedHistory = localStorage.getItem('weatherAppNotificationHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string timestamps back to Date objects
        const processedHistory = parsedHistory.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotificationHistory(processedHistory);
      }
      
      // Load scheduled notifications
      const savedScheduled = getScheduledNotifications();
      setScheduledNotifications(savedScheduled);
    } catch (error) {
      console.error('Failed to parse saved notifications:', error);
    }

    // Check notification permission
    checkNotificationPermission().then(setHasPermission);
    
    setLoaded(true);
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('weatherAppNotifications', JSON.stringify(notifications));
    }
  }, [notifications, loaded]);
  
  // Save notification history to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('weatherAppNotificationHistory', JSON.stringify(notificationHistory));
    }
  }, [notificationHistory, loaded]);
  
  // Save scheduled notifications to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      saveScheduledNotifications(scheduledNotifications);
    }
  }, [scheduledNotifications, loaded]);

  // Add a single notification
  const addNotification = (notification: WeatherNotification) => {
    // Check for duplicate (same type and similar timestamp within 1 minute)
    const isDuplicate = notifications.some(n => 
      n.type === notification.type && 
      Math.abs(n.timestamp.getTime() - notification.timestamp.getTime()) < 60000
    );

    if (!isDuplicate) {
      setNotifications(prev => [notification, ...prev.slice(0, MAX_ACTIVE_NOTIFICATIONS - 1)]); // Keep max notifications
      setUnreadCount(prev => prev + 1);

      // Show browser notification if enabled
      if (notificationPreferences.notifyInBrowser && hasPermission) {
        sendBrowserNotification(notification);
      }
    }
  };

  // Add multiple notifications at once
  const addNotifications = (newNotifications: WeatherNotification[]) => {
    if (newNotifications.length === 0) return;

    setNotifications(prev => {
      // Filter out duplicates
      const uniqueNotifications = newNotifications.filter(newNotif => 
        !prev.some(existingNotif => 
          existingNotif.type === newNotif.type && 
          Math.abs(existingNotif.timestamp.getTime() - newNotif.timestamp.getTime()) < 60000
        )
      );

      const combined = [...uniqueNotifications, ...prev];
      // Keep max notifications
      return combined.slice(0, MAX_ACTIVE_NOTIFICATIONS);
    });

    setUnreadCount(prev => prev + newNotifications.length);

    // Show browser notifications if enabled
    if (notificationPreferences.notifyInBrowser && hasPermission) {
      newNotifications.forEach(notification => {
        sendBrowserNotification(notification);
      });
    }
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(prev - 1, 0));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      const newNotifications = prev.filter(n => n.id !== id);
      
      // Update unread count if needed
      if (notification && !notification.read) {
        setUnreadCount(prevCount => Math.max(prevCount - 1, 0));
      }
      
      return newNotifications;
    });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  // Archive a notification by moving it to history
  const archiveNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    // Add to history
    setNotificationHistory(prev => {
      const withNewNotification = [notification, ...prev];
      // Keep max history notifications
      return withNewNotification.slice(0, MAX_HISTORY_NOTIFICATIONS);
    });
    
    // Remove from active notifications
    removeNotification(id);
  };

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    return granted;
  };

  // Update notification preferences
  const updateNotificationPreferences = <K extends keyof NotificationPreferences>(
    key: K, 
    value: NotificationPreferences[K]
  ) => {
    setNotificationPreferences(prev => {
      const updated = { ...prev, [key]: value };
      saveNotificationPreferencesToStorage(updated);
      return updated;
    });
  };
  
  // Add a scheduled notification
  const addScheduledNotification = (notification: ScheduledNotification) => {
    setScheduledNotifications(prev => [...prev, notification]);
  };
  
  // Update a scheduled notification
  const updateScheduledNotification = (id: string, updates: Partial<ScheduledNotification>) => {
    setScheduledNotifications(prev => 
      prev.map(notification => 
        notification.id === id
          ? { ...notification, ...updates }
          : notification
      )
    );
  };
  
  // Remove a scheduled notification
  const removeScheduledNotification = (id: string) => {
    setScheduledNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Clear all scheduled notifications
  const clearAllScheduledNotifications = () => {
    setScheduledNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notificationHistory,
        scheduledNotifications,
        unreadCount,
        hasPermission,
        notificationPreferences,
        addNotification,
        addNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        archiveNotification,
        requestPermission,
        updateNotificationPreferences,
        addScheduledNotification,
        updateScheduledNotification,
        removeScheduledNotification,
        clearAllScheduledNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Hook for using the notification context
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
} 