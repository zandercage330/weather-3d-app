'use client';

import { useState } from 'react';

export interface RefreshButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
}

export default function RefreshButton({ onClick, isLoading }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isLoading || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onClick();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={isLoading || isRefreshing}
      className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
      aria-label="Refresh weather data"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
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
} 