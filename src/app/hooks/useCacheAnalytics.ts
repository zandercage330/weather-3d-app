'use client';

import { useState, useEffect } from 'react';
import { cacheAnalytics } from '../lib/cacheAnalytics';
import { weatherCache } from '../lib/weatherCache';

/**
 * Custom hook to provide cache analytics data to components
 * @param refreshInterval How often to refresh data in milliseconds
 * @returns Cache analytics data and actions
 */
export function useCacheAnalytics(refreshInterval = 30000) {
  const [data, setData] = useState<{
    analytics: any;
    cacheStats: any;
    recommendations: string[];
    loading: boolean;
  }>({
    analytics: null,
    cacheStats: null,
    recommendations: [],
    loading: true
  });
  
  // Actions
  const refreshData = () => {
    setData(prev => ({
      ...prev,
      analytics: cacheAnalytics.getAnalytics(),
      cacheStats: weatherCache.getStats(),
      recommendations: cacheAnalytics.getRecommendations(),
      loading: false
    }));
  };
  
  const clearCache = () => {
    weatherCache.clear();
    refreshData();
  };
  
  const resetAnalytics = () => {
    cacheAnalytics.reset();
    refreshData();
  };
  
  // Initial load and periodic refresh
  useEffect(() => {
    // Load immediately
    refreshData();
    
    // Set up interval for refresh
    const intervalId = setInterval(refreshData, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Helper function to get API call rate
  const getApiCallRate = (minutes = 60) => {
    return cacheAnalytics.getApiCallRate(minutes);
  };
  
  // Helper functions for UI formatting
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatDateTime = (timestamp: number | null) => 
    timestamp ? new Date(timestamp).toLocaleString() : 'Never';
  
  return {
    ...data,
    refreshData,
    clearCache,
    resetAnalytics,
    getApiCallRate,
    formatPercent,
    formatDateTime
  };
} 