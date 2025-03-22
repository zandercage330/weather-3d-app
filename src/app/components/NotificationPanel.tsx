'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationType } from '../lib/notificationService';
import NotificationHistory from './NotificationHistory';
import NotificationScheduler from './NotificationScheduler';
import NotificationSettings from './NotificationSettings';

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'alert':
      return <span className="mr-2 text-red-500">⚠️</span>;
    case 'forecast':
      return <span className="mr-2 text-blue-500">🌤️</span>;
    case 'aqi':
      return <span className="mr-2 text-purple-500">💨</span>;
    case 'precipitation':
      return <span className="mr-2 text-indigo-500">🌧️</span>;
    case 'temperature':
      return <span className="mr-2 text-orange-500">🌡️</span>;
    case 'uv':
      return <span className="mr-2 text-yellow-500">☀️</span>;
    case 'system':
      return <span className="mr-2 text-gray-500">ℹ️</span>;
    default:
      return <span className="mr-2">📌</span>;
  }
};

// Format the timestamp in a human-readable format
const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // More than a day
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 1) {
    return 'Yesterday';
  }
  
  // Format date
  return timestamp.toLocaleDateString();
};

// Get background color based on priority
const getBackgroundColor = (priority: 'low' | 'medium' | 'high', read: boolean) => {
  if (read) {
    return 'bg-gray-50';
  }
  
  switch (priority) {
    case 'high':
      return 'bg-red-50';
    case 'medium':
      return 'bg-yellow-50';
    case 'low':
      return 'bg-blue-50';
    default:
      return 'bg-gray-50';
  }
};

type ActiveTab = 'notifications' | 'history' | 'schedule' | 'settings';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAllNotifications,
    notificationPreferences,
    updateNotificationPreferences
  } = useNotifications();
  
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('notifications');
  
  // Mark notifications as read when panel opens
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      setTimeout(() => {
        markAllAsRead();
      }, 3000);
    }
  }, [isOpen, unreadCount, markAllAsRead]);
  
  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeFilter);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30">
      <div className="w-full max-w-md h-full bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="text-lg font-medium">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Current
              {unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
        
        {/* Current Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            {/* Filter controls */}
            <div className="px-4 py-2 border-b flex items-center justify-between bg-gray-50">
              <div className="flex space-x-1 overflow-x-auto pb-1 flex-1">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                    activeFilter === 'all' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveFilter('alert')}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                    activeFilter === 'alert' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Alerts
                </button>
                <button 
                  onClick={() => setActiveFilter('forecast')}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                    activeFilter === 'forecast' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Forecast
                </button>
                <button 
                  onClick={() => setActiveFilter('precipitation')}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                    activeFilter === 'precipitation' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Precipitation
                </button>
              </div>
              
              <button 
                onClick={clearAllNotifications}
                className="text-xs text-gray-600 hover:text-gray-900 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
            
            {/* Notification list */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>No notifications to display</p>
                  {activeFilter !== 'all' && (
                    <button 
                      onClick={() => setActiveFilter('all')}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      View all notifications
                    </button>
                  )}
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`flex items-start p-4 mb-2 rounded-lg border ${getBackgroundColor(notification.priority, notification.read)}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        {getIconForType(notification.type)}
                        <h3 className="font-medium">{notification.title}</h3>
                        {!notification.read && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{notification.message}</p>
                      <div className="text-xs opacity-75 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 ml-2">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          title="Mark as read"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button 
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        title="Remove notification"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto">
            <NotificationHistory />
          </div>
        )}
        
        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="flex-1 overflow-y-auto p-4">
            <NotificationScheduler />
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4">
            <NotificationSettings onClose={() => setActiveTab('notifications')} />
          </div>
        )}
        
        {/* Footer with settings link */}
        <div className="bg-gray-50 px-4 py-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationPreferences.enabled}
                onChange={(e) => updateNotificationPreferences('enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 