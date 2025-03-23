/**
 * cacheKeyGenerator.ts
 * Utilities for consistent cache key generation
 */

/**
 * Generate a normalized cache key for a location
 * Ensures consistent caching regardless of spacing, capitalization, etc.
 * @param location Location name
 * @returns Normalized cache key
 */
export function normalizeLocationKey(location: string): string {
  return location
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\d_-]/g, ''); // Remove any special characters
}

/**
 * Generate a current weather cache key
 * @param location Location name
 * @returns Cache key for current weather
 */
export function getCurrentWeatherKey(location: string): string {
  return `current_${normalizeLocationKey(location)}`;
}

/**
 * Generate a forecast cache key
 * @param location Location name
 * @param days Number of forecast days
 * @returns Cache key for forecast
 */
export function getForecastKey(location: string, days: number = 5): string {
  return `forecast_${normalizeLocationKey(location)}_${days}`;
}

/**
 * Generate a weather alerts cache key
 * @param stateCode State code (e.g., NY)
 * @returns Cache key for alerts
 */
export function getAlertsKey(stateCode: string): string {
  return `alerts_${stateCode.toUpperCase()}`;
}

/**
 * Generate a location search cache key
 * @param query Search query
 * @returns Cache key for location search
 */
export function getSearchKey(query: string): string {
  return `search_${query.toLowerCase().trim()}`;
}

/**
 * Generate a composite cache key for multiple parameters
 * Useful for complex caching scenarios
 * @param prefix Key prefix
 * @param params Object with parameters to include in the key
 * @returns Composite cache key
 */
export function getCompositeKey(prefix: string, params: Record<string, any>): string {
  const normalizedParams = Object.entries(params)
    .map(([key, value]) => {
      // Handle various value types
      if (value === null || value === undefined) {
        return `${key}_null`;
      }
      
      if (typeof value === 'object') {
        // Convert objects to a hash-like string
        return `${key}_${JSON.stringify(value).replace(/[^\w\d]/g, '')}`;
      }
      
      return `${key}_${String(value).toLowerCase().trim()}`;
    })
    .join('_');
    
  return `${prefix}_${normalizedParams}`;
}

/**
 * Extract location from a cache key
 * @param key Cache key
 * @returns Original location name or null if not a location key
 */
export function extractLocationFromKey(key: string): string | null {
  const locRegex = /^(current|forecast)_(.+?)(?:_\d+)?$/;
  const match = key.match(locRegex);
  
  if (match && match[2]) {
    // Convert normalized key back to readable format
    return match[2].replace(/_/g, ' ');
  }
  
  return null;
} 