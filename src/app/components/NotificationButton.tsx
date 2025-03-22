'use client';

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, hasPermission, requestPermission } = useNotifications();

  const togglePanel = () => {
    setIsOpen(prev => !prev);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const requestNotificationAccess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await requestPermission();
  };

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Permission request badge */}
      {hasPermission === false && (
        <button
          onClick={requestNotificationAccess}
          className="absolute -bottom-1 -right-1 bg-yellow-400 text-xs text-gray-800 rounded-full p-1 shadow-md hover:bg-yellow-300 transition-colors"
          title="Enable notifications"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-3 w-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 10V3L4 14h7v7l9-11h-7z" 
            />
          </svg>
        </button>
      )}
      
      <NotificationPanel isOpen={isOpen} onClose={closePanel} />
    </div>
  );
} 