import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

// Cache for location search results - 30 minute TTL
const locationCache = new LRUCache<string, any>({
  max: 100,
  ttl: 30 * 60 * 1000, // 30 minutes
});

// Rate limiting variables - increase limit
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per window (increased from 10)
const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();
const rateLimitedUntil = new Map<string, number>();

/**
 * Location search API route handler
 * 
 * Fetches location suggestions from the Weather API based on the query parameter
 * Implements rate limiting to prevent abuse
 * Uses caching to reduce API calls
 */
export async function GET(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // If client is currently rate limited, check if they can retry
  if (rateLimitedUntil.has(ip)) {
    const retryAfter = Math.ceil((rateLimitedUntil.get(ip)! - Date.now()) / 1000);
    
    if (retryAfter > 0) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: retryAfter,
          message: `Too many requests. Please try again in ${retryAfter} seconds.`
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString()
          }
        }
      );
    } else {
      // Reset rate limit if expired
      rateLimitedUntil.delete(ip);
    }
  }
  
  // Basic rate limiting check
  if (!isWithinRateLimit(ip)) {
    // Track when they can retry
    const resetTime = Date.now() + RATE_LIMIT_WINDOW;
    rateLimitedUntil.set(ip, resetTime);
    
    const retryAfter = Math.ceil(RATE_LIMIT_WINDOW / 1000);
    
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        retryAfter: retryAfter,
        message: `Too many requests. Please try again in ${retryAfter} seconds.`
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString()
        }
      }
    );
  }

  // Get search query from request
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Missing query parameter' },
      { status: 400 }
    );
  }
  
  // Check if query is too short to reduce unnecessary API calls
  if (query.length < 3) {
    return NextResponse.json([]);
  }
  
  // Check cache first
  const cacheKey = `loc_${query.toLowerCase()}`;
  const cachedData = locationCache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }
  
  try {
    // Fetch from Weather API
    const url = `${process.env.WEATHER_API_BASE_URL}/search.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Weather API error:', response.statusText);
      
      // Handle specific error codes
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Weather API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the data
    const formattedData = data.map((location: any) => ({
      name: location.name,
      region: location.region,
      country: location.country,
      lat: location.lat,
      lon: location.lon
    }));
    
    // Cache the results
    locationCache.set(cacheKey, formattedData);
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to check if a request is within rate limit
 */
function isWithinRateLimit(ip: string): boolean {
  const now = Date.now();
  const ipData = ipRequestCounts.get(ip);
  
  // If no previous requests or reset time has passed, initialize new counter
  if (!ipData || now > ipData.resetTime) {
    ipRequestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  // Increment counter if within limit
  if (ipData.count < MAX_REQUESTS_PER_WINDOW) {
    ipData.count += 1;
    return true;
  }
  
  // Rate limit exceeded
  return false;
} 