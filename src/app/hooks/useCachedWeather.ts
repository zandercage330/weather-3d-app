'use client';

import { useState, useEffect, useCallback } from 'react';
import { weatherCacheService } from '../lib/weatherCacheService';
import { WeatherData, ForecastDay, WeatherAlert } from '../lib/weatherService';
import { useServiceWorker } from '../providers/ServiceWorkerProvider';

interface UseCachedWeatherOptions {
  includeForecasts?: boolean;
  includeForecastDays?: number;
  includeAlerts?: boolean;
  refreshInterval?: number; // ms
  forceRefresh?: boolean;
}

interface CachedWeatherResult {
  weather: WeatherData | null;
  forecasts: ForecastDay[];
  alerts: WeatherAlert[];
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  isStale: boolean;
  isFromCache: boolean;
  refreshData: () => Promise<void>;
}

/**
 * Hook to access weather data with intelligent caching
 * @param location The location to get weather data for
 * @param options Configuration options
 * @returns Object containing weather data, loading state, and refresh function
 */
export function useCachedWeather(
  location: string,
  options: UseCachedWeatherOptions = {}
): CachedWeatherResult {
  const {
    includeForecasts = true,
    includeForecastDays = 5,
    includeAlerts = true,
    refreshInterval = 0, // Default to no auto-refresh
    forceRefresh = false
  } = options;

  const { isOfflineMode } = useServiceWorker();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecasts, setForecasts] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  // Fetch all weather data function
  const fetchAllData = useCallback(async () => {
    if (!location) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch current weather
      const weatherResult = await weatherCacheService.getCurrentWeather(
        location, 
        !isOfflineMode && forceRefresh
      );
      setWeather(weatherResult.data);
      setLastUpdated(weatherResult.metadata.lastUpdated);
      setIsStale(weatherResult.isStale);
      setIsFromCache(weatherResult.fromCache);

      // Fetch forecasts if required
      if (includeForecasts) {
        const forecastResult = await weatherCacheService.getForecast(
          location, 
          includeForecastDays, 
          !isOfflineMode && forceRefresh
        );
        setForecasts(forecastResult.data);
      }

      // Fetch alerts if required
      if (includeAlerts) {
        // Extract state code from location (assuming format "City, STATE")
        const state = location.split(',')[1]?.trim() || '';
        if (state) {
          const alertsResult = await weatherCacheService.getAlerts(
            state, 
            !isOfflineMode && forceRefresh
          );
          setAlerts(alertsResult.data);
        }
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [location, includeForecasts, includeForecastDays, includeAlerts, isOfflineMode, forceRefresh]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Set up auto-refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0 && !isOfflineMode) {
      const intervalId = setInterval(fetchAllData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchAllData, isOfflineMode]);

  // Prefetch data for this location when the component is first rendered
  useEffect(() => {
    if (location && !isOfflineMode) {
      weatherCacheService.prefetchLocation(location).catch(err => {
        console.error('Error prefetching location data:', err);
      });
    }
  }, [location, isOfflineMode]);

  // Re-fetch data when going from offline to online
  useEffect(() => {
    if (!isOfflineMode && isFromCache) {
      fetchAllData();
    }
  }, [isOfflineMode, isFromCache, fetchAllData]);

  return {
    weather,
    forecasts,
    alerts,
    loading,
    error,
    lastUpdated,
    isStale,
    isFromCache,
    refreshData: fetchAllData
  };
} 