// weatherCacheService.ts
// Centralized caching service for all weather data to reduce API calls and improve offline experience

import { WeatherCache } from './weatherCache';
import { cacheAnalytics } from './cacheAnalytics';
import { getCompositeKey as generateCacheKey } from './cacheKeyGenerator';

// Types imported from the weather service
import { 
  WeatherData,
  ForecastDay, 
  WeatherAlert
} from './weatherService';

// Import HistoricalWeatherData from weatherHistoryService
import { HistoricalWeatherData } from './weatherHistoryService';

// Define location type based on weatherApiClient's searchLocations return type
interface WeatherLocation {
  name: string;
  region: string;
  country: string;
}

// Data types we can cache
export type WeatherDataType = 
  | 'currentWeather' 
  | 'forecast' 
  | 'alerts' 
  | 'searchResults'
  | 'historical'
  | 'metadata'
  | 'default';  // Include default as a valid type

// Interface for metadata about cached data
interface CacheMetadata {
  lastUpdated: Date;
  source: string;
  expiresAt: Date;
}

// Cache response interface
interface CacheResponse<T> {
  data: T;
  metadata: CacheMetadata;
  fromCache: boolean;
  isStale: boolean;
}

class WeatherCacheService {
  private cache: WeatherCache;
  private cacheName = 'weather-data';
  
  constructor() {
    this.cache = new WeatherCache();
    
    // Register event listener for connectivity changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
    }
  }
  
  /**
   * Get cache metadata for a given location
   */
  async getMetadata(location: string): Promise<CacheMetadata | null> {
    const key = generateCacheKey('metadata', { location });
    const metadata = this.cache.get<CacheMetadata>(key, 'default');
    
    if (!metadata) {
      // Try to get from Cache API as fallback
      try {
        const cache = await caches.open(this.cacheName);
        const response = await cache.match(`/api/metadata?location=${encodeURIComponent(location)}`);
        
        if (response) {
          return await response.json();
        }
      } catch (error) {
        console.error('Error retrieving metadata from Cache API:', error);
      }
      
      return null;
    }
    
    return metadata;
  }
  
  /**
   * Set cache metadata for a location
   */
  async setMetadata(location: string, metadata: CacheMetadata): Promise<void> {
    const key = generateCacheKey('metadata', { location });
    this.cache.set(key, metadata);
    
    // Also store in Cache API for service worker access
    try {
      const cache = await caches.open(this.cacheName);
      await cache.put(
        `/api/metadata?location=${encodeURIComponent(location)}`,
        new Response(JSON.stringify(metadata))
      );
    } catch (error) {
      console.error('Error storing metadata in Cache API:', error);
    }
  }
  
  /**
   * Get current weather data
   */
  async getCurrentWeather(location: string, forceRefresh = false): Promise<CacheResponse<WeatherData>> {
    const key = generateCacheKey('currentWeather', { location });
    
    return this.fetchWithCache<WeatherData>(
      key,
      'currentWeather',
      async () => {
        const response = await fetch(`/api/weather?q=${encodeURIComponent(location)}&endpoint=current`);
        if (!response.ok) {
          throw new Error(`Failed to fetch current weather: ${response.statusText}`);
        }
        return response.json();
      },
      forceRefresh
    );
  }
  
  /**
   * Get forecast data
   */
  async getForecast(location: string, days = 5, forceRefresh = false): Promise<CacheResponse<ForecastDay[]>> {
    const key = generateCacheKey('forecast', { location, days });
    
    return this.fetchWithCache<ForecastDay[]>(
      key,
      'forecast',
      async () => {
        const response = await fetch(`/api/weather?q=${encodeURIComponent(location)}&endpoint=forecast&days=${days}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch forecast: ${response.statusText}`);
        }
        return response.json();
      },
      forceRefresh
    );
  }
  
  /**
   * Get weather alerts
   */
  async getAlerts(state: string, forceRefresh = false): Promise<CacheResponse<WeatherAlert[]>> {
    const key = generateCacheKey('alerts', { state });
    
    return this.fetchWithCache<WeatherAlert[]>(
      key,
      'alerts',
      async () => {
        const response = await fetch(`/api/alerts?state=${encodeURIComponent(state)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch alerts: ${response.statusText}`);
        }
        return response.json();
      },
      forceRefresh
    );
  }
  
  /**
   * Get location search results
   */
  async getLocationSearch(query: string, forceRefresh = false): Promise<CacheResponse<WeatherLocation[]>> {
    const key = generateCacheKey('searchResults', { query });
    
    return this.fetchWithCache<WeatherLocation[]>(
      key,
      'searchResults',
      async () => {
        const response = await fetch(`/api/locationSearch?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch locations: ${response.statusText}`);
        }
        return response.json();
      },
      forceRefresh
    );
  }
  
  /**
   * Get historical weather data
   */
  async getHistoricalWeather(
    location: string, 
    fromDate: string, 
    toDate?: string, 
    forceRefresh = false
  ): Promise<CacheResponse<HistoricalWeatherData>> {
    const key = generateCacheKey('historical', { location, fromDate, toDate });
    
    return this.fetchWithCache<HistoricalWeatherData>(
      key,
      'historical',
      async () => {
        const endpoint = toDate
          ? `/api/weather?q=${encodeURIComponent(location)}&endpoint=history&from=${fromDate}&to=${toDate}`
          : `/api/weather?q=${encodeURIComponent(location)}&endpoint=history&from=${fromDate}`;
          
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch historical data: ${response.statusText}`);
        }
        return response.json();
      },
      forceRefresh
    );
  }
  
  /**
   * Prefetch data for a location to prepare for offline use
   */
  async prefetchLocation(location: string): Promise<void> {
    try {
      // Prefetch current weather
      this.cache.prefetch(
        generateCacheKey('currentWeather', { location }),
        () => fetch(`/api/weather?q=${encodeURIComponent(location)}&endpoint=current`).then(r => r.json()),
        'currentWeather'
      );
      
      // Prefetch forecast
      this.cache.prefetch(
        generateCacheKey('forecast', { location, days: 5 }),
        () => fetch(`/api/weather?q=${encodeURIComponent(location)}&endpoint=forecast&days=5`).then(r => r.json()),
        'forecast'
      );
      
      // Prefetch alerts for the state
      const state = location.split(',')[1]?.trim() || '';
      if (state) {
        this.cache.prefetch(
          generateCacheKey('alerts', { state }),
          () => fetch(`/api/alerts?state=${encodeURIComponent(state)}`).then(r => r.json()),
          'alerts'
        );
      }
      
      // Update metadata
      this.setMetadata(location, {
        lastUpdated: new Date(),
        source: 'prefetch',
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
      });
      
      console.log(`Prefetched data for ${location}`);
    } catch (error) {
      console.error(`Failed to prefetch data for ${location}:`, error);
    }
  }
  
  /**
   * Clear all cached data for a location
   */
  async clearLocationCache(location: string): Promise<void> {
    // Clear from memory cache
    this.cache.delete(generateCacheKey('currentWeather', { location }));
    this.cache.delete(generateCacheKey('forecast', { location, days: 5 }));
    this.cache.delete(generateCacheKey('metadata', { location }));
    
    // Clear from Cache API
    try {
      const cache = await caches.open(this.cacheName);
      await cache.delete(`/api/weather?q=${encodeURIComponent(location)}&endpoint=current`);
      await cache.delete(`/api/weather?q=${encodeURIComponent(location)}&endpoint=forecast&days=5`);
      await cache.delete(`/api/metadata?location=${encodeURIComponent(location)}`);
      
      console.log(`Cleared cache for ${location}`);
    } catch (error) {
      console.error(`Error clearing cache for ${location}:`, error);
    }
  }
  
  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    // Clear memory cache
    this.cache.clear();
    
    // Clear Cache API
    try {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter(key => key === this.cacheName)
          .map(key => caches.delete(key))
      );
      
      console.log('Cleared all cache');
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
  
  /**
   * Get cache stats for analytics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
  
  /**
   * Check if data is stale
   */
  isDataStale(key: string, category: WeatherDataType = 'default'): boolean {
    const item = this.cache.get(key, category as any);
    return !item;
  }
  
  /**
   * Handle online status change - trigger background refresh of critical data
   */
  private async handleOnlineStatusChange() {
    if (navigator.onLine) {
      console.log('Back online - refreshing weather data');
      
      // Get all location keys and refresh
      const stats = this.cache.getStats();
      const locationKeys = stats.keys.filter(key => key.startsWith('metadata_'));
      
      // Extract locations from keys and refresh
      for (const key of locationKeys) {
        const location = key.replace('metadata_', '');
        await this.prefetchLocation(location);
      }
    }
  }
  
  /**
   * Generic fetch with cache method
   */
  private async fetchWithCache<T>(
    key: string,
    category: WeatherDataType,
    fetchFn: () => Promise<T>,
    forceRefresh = false
  ): Promise<CacheResponse<T>> {
    try {
      const now = Date.now();
      let fromCache = false;
      let isStale = false;
      
      // Try to get from cache first
      const result = await this.cache.getOrSet(
        key,
        fetchFn,
        category as any,
        forceRefresh
      );
      
      // Determine if this was from cache
      fromCache = !forceRefresh && this.cache.get<T>(key, category as any) !== null;
      
      // Check if data is stale
      if (fromCache) {
        const metadata = await this.getMetadata(key.split('_')[1]);
        isStale = metadata ? now > metadata.expiresAt.getTime() : false;
      }
      
      // Create metadata if it doesn't exist
      if (!fromCache || !await this.getMetadata(key.split('_')[1])) {
        const defaultTtl = 3600000; // 1 hour default
        await this.setMetadata(key.split('_')[1], {
          lastUpdated: new Date(),
          source: fromCache ? 'cache' : 'api',
          expiresAt: new Date(now + defaultTtl)
        });
      }
      
      return {
        data: result,
        metadata: await this.getMetadata(key.split('_')[1]) || {
          lastUpdated: new Date(),
          source: fromCache ? 'cache' : 'api',
          expiresAt: new Date(now + 3600000) // Default 1 hour
        },
        fromCache,
        isStale
      };
    } catch (error) {
      console.error(`Error fetching data with cache for ${key}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const weatherCacheService = new WeatherCacheService(); 