import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';
import { rateLimit } from '@/app/lib/rateLimit';

// Rate limiter for API requests - increase limits
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 100, // Increased from 50 to 100
});

// Cache for API responses - increase capacity and TTL
const apiCache = new LRUCache<string, any>({
  max: 200,             // Increased from 100 to 200
  ttl: 1000 * 60 * 15,  // Increased from 10 to 15 minutes
});

// Rate limiting variables - increase limits
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 50;  // Increased from 30 to 50 requests per minute

const requestCounts = new Map<string, { count: number, resetTime: number }>();

// Track when a client hits the rate limit to provide a more helpful error
const rateLimitedUntil = new Map<string, number>();

function getRateLimitInfo(ip: string): { count: number, resetTime: number } {
  const now = Date.now();
  
  if (!requestCounts.has(ip) || requestCounts.get(ip)!.resetTime < now) {
    // Initialize or reset counter for this IP
    requestCounts.set(ip, { count: 0, resetTime: now + RATE_LIMIT_WINDOW });
    rateLimitedUntil.delete(ip); // Clear any previous rate limit expiry
  }
  
  return requestCounts.get(ip)!;
}

function isRateLimited(ip: string): boolean {
  const rateLimitInfo = getRateLimitInfo(ip);
  rateLimitInfo.count += 1;
  
  if (rateLimitInfo.count > MAX_REQUESTS_PER_WINDOW) {
    // Set rate limit expiry
    rateLimitedUntil.set(ip, rateLimitInfo.resetTime);
    return true;
  }
  
  return false;
}

/**
 * Secure API route to proxy requests to WeatherAPI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q');
    const days = searchParams.get('days');
    const endpoint = searchParams.get('endpoint') || 'forecast'; // Default to forecast
    
    // Historical data parameters
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Get IP for rate limiting
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

    // Check rate limit using the built-in limiter
    try {
      // Increased from 10 to 15 requests per minute per client
      await limiter.check(request, 15, 'WEATHER_API');
    } catch (error) {
      // Track when they can retry
      const resetTime = Date.now() + 60 * 1000; // 1 minute from now
      rateLimitedUntil.set(ip, resetTime);
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: 60,
          message: 'Too many requests. Please try again in 60 seconds.'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        }
      );
    }

    // Validate parameters
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    let weatherApiUrl: string;
    let cacheKey: string;

    // Determine endpoint and build the appropriate URL
    switch (endpoint) {
      case 'current':
        weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=yes`;
        cacheKey = `current_${query}`;
        break;
      case 'forecast':
        const daysParam = days ? `&days=${days}` : '&days=5';
        weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}${daysParam}&aqi=yes`;
        cacheKey = `forecast_${query}_${days || '5'}`;
        break;
      case 'history':
        // Validate history parameters
        if (!fromDate) {
          return NextResponse.json(
            { error: 'Missing from date parameter for historical data' },
            { status: 400 }
          );
        }
        
        // If toDate not provided, default to fromDate (one day)
        const historyToDate = toDate || fromDate;
        
        weatherApiUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${query}&dt=${fromDate}&end_dt=${historyToDate}`;
        cacheKey = `history_${query}_${fromDate}_${historyToDate}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint parameter' },
          { status: 400 }
        );
    }

    // Check cache first - add noise to cache key to randomize cache expiration
    // This prevents all cache entries from expiring at the same time
    const cacheNoise = Math.floor(Math.random() * 100);
    const cachedData = apiCache.get(`${cacheKey}_${cacheNoise % 5}`);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Call the WeatherAPI
    const response = await fetch(weatherApiUrl);
    if (!response.ok) {
      // Get error details if available
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error?.message || '';
      } catch (e) {
        // Ignore parse errors
      }

      return NextResponse.json(
        { 
          error: `Weather API error: ${response.status}`,
          detail: errorDetail
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Store in cache with noise added to key for distributed expiration
    apiCache.set(`${cacheKey}_${cacheNoise % 5}`, data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    }
  );
} 