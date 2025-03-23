import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

// Cache for reverse geocoding results - 6 hour TTL since locations rarely change
const geocodeCache = new LRUCache<string, any>({
  max: 100,
  ttl: 6 * 60 * 60 * 1000, // 6 hours
});

// Rate limiting variables - increase the limit slightly
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per window (increased from 5)
const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();
const rateLimitedUntil = new Map<string, number>();

/**
 * Reverse Geocoding API route handler
 * 
 * Converts latitude and longitude coordinates to a location name
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

  // Get coordinates from request
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Missing lat or lon parameters' },
      { status: 400 }
    );
  }
  
  // Round coordinates to 4 decimal places for better cache hit rate
  // This provides approximately 11m precision which is sufficient for weather
  const roundedLat = parseFloat(parseFloat(lat).toFixed(4));
  const roundedLon = parseFloat(parseFloat(lon).toFixed(4));
  
  // Check cache first
  const cacheKey = `geo_${roundedLat}_${roundedLon}`;
  const cachedData = geocodeCache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }
  
  try {
    // Fetch from Weather API
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `${process.env.WEATHER_API_BASE_URL}/current.json?key=${apiKey}&q=${roundedLat},${roundedLon}`;
    
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
    
    if (!data.location) {
      return NextResponse.json(
        { error: 'No location found for the provided coordinates' },
        { status: 404 }
      );
    }
    
    // Format the response
    const locationData = {
      name: data.location.name,
      region: data.location.region,
      country: data.location.country,
      lat: data.location.lat,
      lon: data.location.lon,
      localtime: data.location.localtime
    };
    
    // Cache the result
    geocodeCache.set(cacheKey, locationData);
    
    return NextResponse.json(locationData);
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return NextResponse.json(
      { error: 'Failed to reverse geocode the coordinates' },
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