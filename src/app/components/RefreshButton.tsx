'use client';

import React, { useState } from 'react';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      await onRefresh();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      // Add a slight delay to show the refreshing state
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`p-2 rounded-full glass-card bg-white/20 dark:bg-black/20 
        hover:bg-white/30 dark:hover:bg-black/30 transition-colors
        text-gray-900 dark:text-white focus:outline-none ${isRefreshing ? 'opacity-70' : ''}`}
      aria-label="Refresh weather data"
    >
      <svg 
        className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  );
};

export default RefreshButton; 