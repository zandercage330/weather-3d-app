import { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

export interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max number of unique users per interval
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, string[]>({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });
  
  return {
    /**
     * Check if the request should be rate limited
     * @param request The Next.js request object
     * @param limit Maximum number of requests in the time window
     * @param identifier Token identifier for tracking different API endpoints
     */
    check: async (request: NextRequest, limit: number, identifier: string) => {
      // Get a unique token for the request
      const clientIp = request.headers.get('x-forwarded-for') || 
                      'anonymous';
      const token = `${clientIp}_${identifier}`;
      
      // Get the token's current count from cache
      const tokenCount = tokenCache.get(token) || [];
      
      // Check if the token has exceeded the limit
      if (tokenCount.length >= limit) {
        throw new Error('Rate limit exceeded');
      }
      
      // Update the token count
      tokenCount.push(Date.now().toString());
      tokenCache.set(token, tokenCount);
      
      return true;
    }
  };
} 