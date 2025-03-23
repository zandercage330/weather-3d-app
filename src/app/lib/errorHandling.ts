/**
 * Error handling utilities for API requests and rate limiting
 */
import { cacheAnalytics } from './cacheAnalytics';

// Map to track API endpoint backoff periods
const endpointBackoff = new Map<string, number>();

/**
 * Check if an endpoint is currently in backoff due to rate limiting
 * @param endpoint API endpoint path
 * @returns Whether the endpoint is in backoff, and when it will be available
 */
export function isInBackoff(endpoint: string): { inBackoff: boolean, retryAfter?: number } {
  const backoffUntil = endpointBackoff.get(endpoint);
  
  if (!backoffUntil) {
    return { inBackoff: false };
  }
  
  const now = Date.now();
  if (now >= backoffUntil) {
    // Backoff period has expired
    endpointBackoff.delete(endpoint);
    return { inBackoff: false };
  }
  
  // Still in backoff
  const retryAfter = Math.ceil((backoffUntil - now) / 1000);
  return { inBackoff: true, retryAfter };
}

/**
 * Set backoff for an endpoint
 * @param endpoint API endpoint path
 * @param seconds Number of seconds to backoff
 */
export function setBackoff(endpoint: string, seconds: number): void {
  const backoffUntil = Date.now() + (seconds * 1000);
  endpointBackoff.set(endpoint, backoffUntil);
  
  // Track the rate limit event in analytics
  cacheAnalytics.trackRateLimit(endpoint);
}

/**
 * Handles response from fetch API, checking for rate limit errors
 * @param response Fetch API response
 * @param endpoint API endpoint for tracking backoff
 * @returns Parsed JSON response
 * @throws Error with details if rate limited or other errors
 */
export async function handleApiResponse(response: Response, endpoint: string): Promise<any> {
  if (!response.ok) {
    // Try to parse response for error details
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // Unable to parse JSON
    }
    
    // Handle rate limiting
    if (response.status === 429) {
      // Check if server provided retry time
      const retryAfter = response.headers.get('Retry-After') || 
                        errorData.retryAfter || 
                        '60';
      
      // Convert to number and set backoff
      const seconds = parseInt(retryAfter, 10) || 60;
      setBackoff(endpoint, seconds);
      
      throw new Error(
        errorData.message || 
        `Rate limit exceeded. Please try again in ${seconds} seconds.`
      );
    }
    
    // Handle other errors
    throw new Error(
      errorData.error || 
      errorData.message || 
      `API error: ${response.status}`
    );
  }
  
  return await response.json();
}

/**
 * Wraps a fetch call with rate limit handling
 * @param url URL to fetch
 * @param endpoint Endpoint identifier for backoff tracking
 * @param options Fetch options
 * @returns Promise with response data
 * @throws Error with rate limit or other error details
 */
export async function fetchWithRateLimit(
  url: string, 
  endpoint: string, 
  options?: RequestInit
): Promise<any> {
  // Check if we're in backoff period
  const { inBackoff, retryAfter } = isInBackoff(endpoint);
  if (inBackoff) {
    throw new Error(`Rate limit cooldown. Please try again in ${retryAfter} seconds.`);
  }
  
  // Start measuring duration
  const startTime = Date.now();
  let success = false;
  
  try {
    // Make the request
    const response = await fetch(url, options);
    const data = await handleApiResponse(response, endpoint);
    
    // If we get here, the request was successful
    success = true;
    
    // Track successful API call
    const duration = Date.now() - startTime;
    cacheAnalytics.trackApiCall(endpoint, duration, true, false);
    
    return data;
  } catch (error) {
    // Track failed API call
    const duration = Date.now() - startTime;
    cacheAnalytics.trackApiCall(endpoint, duration, false, false);
    
    throw error;
  }
}

/**
 * Handles error from API requests and logs them
 * @param error Error object
 * @param context Information about where the error occurred
 * @returns Friendly error message for the user
 */
export function handleError(error: unknown, context: string): string {
  // Log the error with context
  console.error(`Error in ${context}:`, error);
  
  // Return user-friendly message
  if (error instanceof Error) {
    // Check if it's a rate limit error
    if (error.message.includes('Rate limit')) {
      return error.message;
    }
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again later.';
} 