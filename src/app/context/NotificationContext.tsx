'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  NotificationType, 
  NotificationPreferences,
  WeatherNotification,
  defaultNotificationPreferences,
  checkNotificationPermission,
  requestNotificationPermission,
  getNotificationPreferencesFromStorage,
  saveNotificationPreferencesToStorage
} from '../lib/notificationService';

// Local interface that matches WeatherNotification but with timestamp as number for storage
interface StoredNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface NotificationContextValue {
  notifications: StoredNotification[];
  unreadCount: number;
  notificationPreferences: NotificationPreferences;
  hasPermission: boolean | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences
  );

  // Load notification preferences from localStorage
  useEffect(() => {
    const savedPreferences = getNotificationPreferencesFromStorage();
    setNotificationPreferences(savedPreferences);

    // Load saved notifications
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter((n: StoredNotification) => !n.read).length);
      } catch (error) {
        console.error('Failed to parse saved notifications:', error);
      }
    }

    // Check notification permission status
    checkNotificationPermission().then(setHasPermission);
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save notification preferences to localStorage whenever they change  
  useEffect(() => {
    saveNotificationPreferencesToStorage(notificationPreferences);
  }, [notificationPreferences]);

  // Update unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Simulate adding some demo notifications
  useEffect(() => {
    // Add some demo notifications just for display
    const demoNotifications: StoredNotification[] = [
      {
        id: `alert-${Date.now()}-1`,
        title: 'Severe Weather Alert',
        message: 'Thunderstorm warning in your area for the next 2 hours',
        type: 'alert',
        timestamp: Date.now(),
        read: false,
        priority: 'high'
      },
      {
        id: `forecast-${Date.now()}-2`,
        title: 'Tomorrow\'s Forecast',
        message: 'Expect sunny conditions with a high of 82°F',
        type: 'forecast',
        timestamp: Date.now() - 3600000,
        read: false,
        priority: 'medium'
      },
      {
        id: `precipitation-${Date.now()}-3`,
        title: 'Rain Alert',
        message: 'Light rain expected to start in about 15 minutes',
        type: 'precipitation',
        timestamp: Date.now() - 7200000,
        read: true,
        priority: 'medium'
      }
    ];
    
    setNotifications(prev => {
      // Avoid duplicate notifications by checking IDs
      const existingIds = new Set(prev.map(n => n.id));
      const newNotifications = demoNotifications.filter(n => !existingIds.has(n.id));
      
      return [...prev, ...newNotifications];
    });
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateNotificationPreferences = (preferences: Partial<NotificationPreferences>) => {
    setNotificationPreferences(prev => ({ ...prev, ...preferences }));
  };

  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setHasPermission(permission);
    return permission;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationPreferences,
        hasPermission,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        updateNotificationPreferences,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
} 