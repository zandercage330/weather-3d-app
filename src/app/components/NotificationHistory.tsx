'use client';

import { useState, useMemo } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { WeatherNotification, NotificationType } from '../lib/notificationService';

type FilterType = 'all' | NotificationType;
type SortType = 'newest' | 'oldest' | 'priority';

export default function NotificationHistory() {
  const { notifications, clearAllNotifications, removeNotification } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [search, setSearch] = useState('');
  
  // Apply filters, sorting, and search
  const filteredNotifications = useMemo(() => {
    // Filter by type
    let result = notifications.filter(notification => 
      filter === 'all' || notification.type === filter
    );
    
    // Apply search filter if entered
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(notification => 
        notification.title.toLowerCase().includes(searchLower) || 
        notification.message.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      if (sort === 'newest') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else if (sort === 'oldest') {
        return a.timestamp.getTime() - b.timestamp.getTime();
      } else if (sort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
  }, [notifications, filter, sort, search]);

  // Helper to get tag color by notification type
  const getTagColorByType = (type: NotificationType): string => {
    switch (type) {
      case 'alert':
        return 'bg-red-100 text-red-800';
      case 'forecast':
        return 'bg-blue-100 text-blue-800';
      case 'aqi':
        return 'bg-purple-100 text-purple-800';
      case 'precipitation':
        return 'bg-cyan-100 text-cyan-800';
      case 'temperature':
        return 'bg-orange-100 text-orange-800';
      case 'uv':
        return 'bg-yellow-100 text-yellow-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a day
    if (diff < 86400000) {
      return date.toLocaleTimeString(undefined, { 
        hour: 'numeric', 
        minute: '2-digit'
      });
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }
    
    // Older
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Notification History</h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={clearAllNotifications}
              className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search notifications..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="alert">Alert</option>
            <option value="forecast">Forecast</option>
            <option value="precipitation">Precipitation</option>
            <option value="temperature">Temperature</option>
            <option value="aqi">Air Quality</option>
            <option value="uv">UV Index</option>
            <option value="system">System</option>
          </select>
          
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-2">No notifications found</p>
            {search && <p className="text-sm">Try adjusting your search or filters</p>}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <li key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColorByType(notification.type)}`}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </span>
                      {notification.priority === 'high' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(notification.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 