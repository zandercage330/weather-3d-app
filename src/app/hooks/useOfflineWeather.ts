'use client';

import { useState, useEffect } from 'react';
import { useServiceWorker } from '../providers/ServiceWorkerProvider';
import { WeatherData, ForecastDay, WeatherAlert } from '../lib/weatherService';

interface OfflineWeatherData {
  weatherData: WeatherData | null;
  forecastData: ForecastDay[];
  alerts: WeatherAlert[];
  lastUpdated: Date | null;
  isStale: boolean;
}

/**
 * Hook to access cached weather data when offline
 * @param location The location to get weather data for
 * @returns Object containing weather data and status information
 */
export function useOfflineWeather(location: string): OfflineWeatherData & { isOffline: boolean } {
  const { isOfflineMode } = useServiceWorker();
  const [cachedData, setCachedData] = useState<OfflineWeatherData>({
    weatherData: null,
    forecastData: [],
    alerts: [],
    lastUpdated: null,
    isStale: false,
  });

  // Attempt to get cached data when offline
  useEffect(() => {
    const fetchCachedData = async () => {
      if (!isOfflineMode || !location) return;

      try {
        // Try to get data from IndexedDB cache first
        const weatherData = await getCachedWeatherData(location);
        const forecastData = await getCachedForecastData(location);
        const alertsData = await getCachedAlertData(location.split(',')[1]?.trim() || 'NY');
        const lastUpdated = await getLastUpdatedTime(location);

        // Calculate if data is stale (older than 6 hours)
        const isStale = lastUpdated
          ? new Date().getTime() - lastUpdated.getTime() > 6 * 60 * 60 * 1000
          : true;

        setCachedData({
          weatherData,
          forecastData,
          alerts: alertsData,
          lastUpdated,
          isStale,
        });
      } catch (error) {
        console.error('Error retrieving cached weather data:', error);
      }
    };

    fetchCachedData();
  }, [isOfflineMode, location]);

  return {
    ...cachedData,
    isOffline: isOfflineMode,
  };
}

// Helper functions to access cached data from IndexedDB

async function getCachedWeatherData(location: string): Promise<WeatherData | null> {
  try {
    const cache = await caches.open('weather-data');
    const response = await cache.match(`/api/weather?location=${encodeURIComponent(location)}`);
    
    if (response) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error retrieving cached weather data:', error);
    return null;
  }
}

async function getCachedForecastData(location: string): Promise<ForecastDay[]> {
  try {
    const cache = await caches.open('weather-data');
    const response = await cache.match(`/api/forecast?location=${encodeURIComponent(location)}&days=7`);
    
    if (response) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error retrieving cached forecast data:', error);
    return [];
  }
}

async function getCachedAlertData(state: string): Promise<WeatherAlert[]> {
  try {
    const cache = await caches.open('weather-data');
    const response = await cache.match(`/api/alerts?state=${encodeURIComponent(state)}`);
    
    if (response) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error retrieving cached alert data:', error);
    return [];
  }
}

async function getLastUpdatedTime(location: string): Promise<Date | null> {
  try {
    const cache = await caches.open('weather-data');
    const response = await cache.match(`/api/metadata?location=${encodeURIComponent(location)}`);
    
    if (response) {
      const data = await response.json();
      return data.lastUpdated ? new Date(data.lastUpdated) : null;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving last updated time:', error);
    return null;
  }
} 