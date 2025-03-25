'use client';

// weatherCache.ts
// Enhanced caching layer for weather data to reduce API calls and improve performance
import { cacheAnalytics } from './cacheAnalytics';

const isBrowser = typeof window !== 'undefined';

type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

interface CacheTTLConfig {
  currentWeather: number;
  forecast: number;
  alerts: number;
  searchResults: number;
  default: number;
}

export class WeatherCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private backgroundFetchInProgress: Set<string> = new Set();
  
  // Time-to-live settings for different data types (in milliseconds)
  private ttlConfig: CacheTTLConfig = {
    currentWeather: 15 * 60 * 1000, // 15 minutes for current weather
    forecast: 30 * 60 * 1000,       // 30 minutes for forecast
    alerts: 10 * 60 * 1000,         // 10 minutes for alerts
    searchResults: 24 * 60 * 60 * 1000, // 24 hours for location search results
    default: 10 * 60 * 1000         // 10 minutes default
  };

  constructor() {
    if (isBrowser) {
      this.loadFromStorage();
      // Set up interval to clean expired items
      setInterval(this.cleanExpired.bind(this), 5 * 60 * 1000); // Clean every 5 minutes
    }
  }

  /**
   * Get data from cache
   * @param key Cache key
   * @param category Data category for TTL determination
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string, category: keyof CacheTTLConfig = 'default'): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      // Track cache miss in analytics
      cacheAnalytics.trackCacheMiss(key);
      return null;
    }
    
    // Check if item has expired
    const now = Date.now();
    if (now >= item.expiresAt) {
      // Start background refresh if not already in progress
      this.triggerBackgroundRefresh(key, category);
      
      // If it's within grace period (25% of TTL), still return stale data
      const ttl = this.ttlConfig[category];
      const gracePeriod = ttl * 0.25;
      
      if (now - item.expiresAt < gracePeriod) {
        console.log(`Returning stale data for ${key} while refreshing in background`);
        // Track as cache hit even though it's stale (but still usable)
        cacheAnalytics.trackCacheHit(key);
        return item.data as T;
      }
      
      this.cache.delete(key);
      cacheAnalytics.trackCacheMiss(key);
      return null;
    }
    
    // Track successful cache hit
    cacheAnalytics.trackCacheHit(key);
    return item.data as T;
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param category Data category for TTL determination
   */
  set<T>(key: string, data: T, category: keyof CacheTTLConfig = 'default'): void {
    const ttl = this.ttlConfig[category];
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
    
    // Remove from background fetch tracking if present
    this.backgroundFetchInProgress.delete(key);
    
    // Save to persistent storage
    this.saveToStorage();
  }

  /**
   * Delete item from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  /**
   * Clear all items from cache
   */
  clear(): void {
    this.cache.clear();
    this.backgroundFetchInProgress.clear();
    
    try {
      localStorage.removeItem('weatherCache');
    } catch (error) {
      console.error('Error clearing cache from localStorage', error);
    }
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get or set data in cache with async function
   * @param key Cache key
   * @param fetchFn Function to fetch data if not in cache
   * @param category Data category for TTL determination
   * @param forceRefresh Whether to force refresh regardless of cache state
   * @returns Cached or fetched data
   */
  async getOrSet<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    category: keyof CacheTTLConfig = 'default',
    forceRefresh: boolean = false
  ): Promise<T> {
    // Start measuring duration for analytics
    const startTime = Date.now();
    
    // If forcing refresh, skip cache check
    if (!forceRefresh) {
      // Check cache first
      const cachedData = this.get<T>(key, category);
      if (cachedData) {
        // Track as cached API call for analytics
        const duration = Date.now() - startTime;
        cacheAnalytics.trackApiCall(key, duration, true, true);
        
        return cachedData;
      }
    }
    
    // Don't fetch if already fetching in background for this key
    if (this.backgroundFetchInProgress.has(key)) {
      throw new Error(`Background fetch already in progress for ${key}`);
    }
    
    // Fetch fresh data
    try {
      const freshData = await fetchFn();
      this.set(key, freshData, category);
      
      // Track as successful non-cached API call
      const duration = Date.now() - startTime;
      cacheAnalytics.trackApiCall(key, duration, true, false);
      
      return freshData;
    } catch (error) {
      // If fetch fails, try to return stale data if available
      const staleItem = this.cache.get(key);
      if (staleItem) {
        console.warn(`Returning stale data for ${key} after fetch error`);
        
        // Track as cached API call with stale data
        const duration = Date.now() - startTime;
        cacheAnalytics.trackApiCall(key, duration, true, true);
        
        return staleItem.data as T;
      }
      
      // Track as failed API call
      const duration = Date.now() - startTime;
      cacheAnalytics.trackApiCall(key, duration, false, false);
      
      throw error;
    }
  }

  /**
   * Prefetch data in the background
   * @param key Cache key
   * @param fetchFn Function to fetch data
   * @param category Data category for TTL determination
   */
  async prefetch<T>(key: string, fetchFn: () => Promise<T>, category: keyof CacheTTLConfig = 'default'): Promise<void> {
    // Don't prefetch if already in progress
    if (this.backgroundFetchInProgress.has(key)) return;
    
    // Check if we need to prefetch (not in cache or nearing expiration)
    const item = this.cache.get(key);
    const now = Date.now();
    
    // Only prefetch if not in cache or nearing expiration (75% of TTL elapsed)
    if (!item || (now - item.timestamp) > (this.ttlConfig[category] * 0.75)) {
      this.triggerBackgroundRefresh(key, category, fetchFn);
    }
  }

  /**
   * Trigger background refresh of cached data
   */
  private triggerBackgroundRefresh<T>(
    key: string, 
    category: keyof CacheTTLConfig = 'default',
    fetchFn?: () => Promise<T>
  ): void {
    // Don't start another refresh if one is already in progress
    if (this.backgroundFetchInProgress.has(key)) return;
    
    // Mark as in progress
    this.backgroundFetchInProgress.add(key);
    
    // If no fetch function provided, we can't refresh
    if (!fetchFn) return;
    
    // Execute fetch in background
    setTimeout(async () => {
      const startTime = Date.now();
      try {
        console.log(`Background refreshing data for ${key}`);
        const freshData = await fetchFn();
        this.set(key, freshData, category);
        console.log(`Background refresh complete for ${key}`);
        
        // Track successful background refresh
        const duration = Date.now() - startTime;
        cacheAnalytics.trackApiCall(`${key}_background`, duration, true, false);
      } catch (error) {
        console.error(`Background refresh failed for ${key}:`, error);
        
        // Track failed background refresh
        const duration = Date.now() - startTime;
        cacheAnalytics.trackApiCall(`${key}_background`, duration, false, false);
      } finally {
        this.backgroundFetchInProgress.delete(key);
      }
    }, 0);
  }

  /**
   * Save cache to localStorage for persistence
   */
  private saveToStorage(): void {
    if (!isBrowser) return;
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem('weatherCache', serialized);
    } catch (error) {
      console.error('Error saving cache to localStorage', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (!isBrowser) return;
    try {
      const serialized = localStorage.getItem('weatherCache');
      if (serialized) {
        const entries = JSON.parse(serialized);
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.error('Error loading cache from localStorage', error);
    }
  }

  /**
   * Clean expired items from cache
   */
  private cleanExpired(): void {
    const now = Date.now();
    let hasExpired = false;
    
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expiresAt) {
        this.cache.delete(key);
        hasExpired = true;
      }
    }
    
    if (hasExpired && isBrowser) {
      this.saveToStorage();
    }
  }
  
  /**
   * Update TTL configuration
   * @param newConfig New TTL configuration
   */
  updateTTLConfig(newConfig: Partial<CacheTTLConfig>): void {
    this.ttlConfig = { ...this.ttlConfig, ...newConfig };
  }
  
  /**
   * Get cache stats
   * @returns Statistics about the cache
   */
  getStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export a singleton instance
export const weatherCache = new WeatherCache(); 