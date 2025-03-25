'use client';

/**
 * cacheAnalytics.ts
 * Tracks and analyzes cache performance and API usage
 */

const isBrowser = typeof window !== 'undefined';

interface ApiCallRecord {
  endpoint: string;
  timestamp: number;
  duration: number;
  success: boolean;
  cached: boolean;
}

interface CacheAnalytics {
  apiCalls: ApiCallRecord[];
  cacheHits: number;
  cacheMisses: number;
  cacheRatio: number;
  avgApiCallDuration: number;
  rateLimitEvents: number;
  lastRateLimitTime: number | null;
}

class CacheAnalyticsService {
  private analytics: CacheAnalytics = {
    apiCalls: [],
    cacheHits: 0,
    cacheMisses: 0,
    cacheRatio: 0,
    avgApiCallDuration: 0,
    rateLimitEvents: 0,
    lastRateLimitTime: null
  };
  
  private readonly MAX_API_CALL_RECORDS = 100;
  private readonly ANALYTICS_STORAGE_KEY = 'weatherAppAnalytics';
  
  constructor() {
    if (isBrowser) {
      this.loadFromStorage();
      // Set up periodic storage
      setInterval(this.saveToStorage.bind(this), 5 * 60 * 1000); // Every 5 minutes
    }
  }
  
  /**
   * Track a cache hit
   * @param key Cache key that was hit
   */
  trackCacheHit(key: string): void {
    this.analytics.cacheHits++;
    this.updateCacheRatio();
  }
  
  /**
   * Track a cache miss
   * @param key Cache key that was missed
   */
  trackCacheMiss(key: string): void {
    this.analytics.cacheMisses++;
    this.updateCacheRatio();
  }
  
  /**
   * Track an API call
   * @param endpoint API endpoint called
   * @param duration Duration of the call in ms
   * @param success Whether the call succeeded
   * @param cached Whether the response was from cache
   */
  trackApiCall(endpoint: string, duration: number, success: boolean, cached: boolean): void {
    // Add the record
    this.analytics.apiCalls.push({
      endpoint,
      timestamp: Date.now(),
      duration,
      success,
      cached
    });
    
    // Cap the size of the array
    if (this.analytics.apiCalls.length > this.MAX_API_CALL_RECORDS) {
      this.analytics.apiCalls = this.analytics.apiCalls.slice(-this.MAX_API_CALL_RECORDS);
    }
    
    // Update average duration
    this.updateAverageApiCallDuration();
    
    // Save to storage after significant events
    this.saveToStorage();
  }
  
  /**
   * Track a rate limit event
   * @param endpoint The endpoint that was rate limited
   */
  trackRateLimit(endpoint: string): void {
    this.analytics.rateLimitEvents++;
    this.analytics.lastRateLimitTime = Date.now();
    
    // Save to storage immediately on rate limit
    this.saveToStorage();
  }
  
  /**
   * Get analytics data
   * @returns The current analytics data
   */
  getAnalytics(): CacheAnalytics {
    return { ...this.analytics };
  }
  
  /**
   * Get recommendations based on analytics
   * @returns Array of recommendations to improve performance
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Check cache efficiency
    if (this.analytics.cacheRatio < 0.5) {
      recommendations.push("Consider increasing cache TTLs to improve cache hit ratio");
    }
    
    // Check rate limiting
    if (this.analytics.rateLimitEvents > 0) {
      const hoursSinceLastRateLimit = this.analytics.lastRateLimitTime
        ? (Date.now() - this.analytics.lastRateLimitTime) / (1000 * 60 * 60)
        : 999;
        
      if (hoursSinceLastRateLimit < 24) {
        recommendations.push("Consider implementing more aggressive prefetching and caching to avoid rate limits");
      }
    }
    
    // Check API call performance
    if (this.analytics.avgApiCallDuration > 2000) {
      recommendations.push("API calls are slow. Consider enabling stale-while-revalidate to improve perceived performance");
    }
    
    return recommendations;
  }
  
  /**
   * Reset analytics data
   */
  reset(): void {
    this.analytics = {
      apiCalls: [],
      cacheHits: 0,
      cacheMisses: 0,
      cacheRatio: 0,
      avgApiCallDuration: 0,
      rateLimitEvents: 0,
      lastRateLimitTime: null
    };
    
    this.saveToStorage();
  }
  
  /**
   * Get API call rate by time period
   * @param periodMinutes Time period in minutes to analyze
   * @returns Calls per minute
   */
  getApiCallRate(periodMinutes: number = 60): number {
    const cutoffTime = Date.now() - (periodMinutes * 60 * 1000);
    const callsInPeriod = this.analytics.apiCalls.filter(call => 
      call.timestamp >= cutoffTime && !call.cached
    ).length;
    
    return callsInPeriod / periodMinutes;
  }
  
  private updateCacheRatio(): void {
    const total = this.analytics.cacheHits + this.analytics.cacheMisses;
    this.analytics.cacheRatio = total > 0 ? this.analytics.cacheHits / total : 0;
  }
  
  private updateAverageApiCallDuration(): void {
    const nonCachedCalls = this.analytics.apiCalls.filter(call => !call.cached);
    if (nonCachedCalls.length === 0) return;
    
    const totalDuration = nonCachedCalls.reduce((sum, call) => sum + call.duration, 0);
    this.analytics.avgApiCallDuration = totalDuration / nonCachedCalls.length;
  }
  
  private saveToStorage(): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(this.ANALYTICS_STORAGE_KEY, JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Error saving analytics to storage:', error);
    }
  }
  
  private loadFromStorage(): void {
    if (!isBrowser) return;
    try {
      const stored = localStorage.getItem(this.ANALYTICS_STORAGE_KEY);
      if (stored) {
        this.analytics = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading analytics from storage:', error);
    }
  }
}

// Create a singleton instance
export const cacheAnalytics = new CacheAnalyticsService(); 