import { NextRequest, NextResponse } from 'next/server';

// Secure API route to proxy WeatherAPI requests
// This keeps the API key on the server side

// Rate limiting variables
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30;  // 30 requests per minute (adjust based on your API plan)

const requestCounts = new Map<string, { count: number, resetTime: number }>();

function getRateLimitInfo(ip: string): { count: number, resetTime: number } {
  const now = Date.now();
  
  if (!requestCounts.has(ip) || requestCounts.get(ip)!.resetTime < now) {
    // Initialize or reset counter for this IP
    requestCounts.set(ip, { count: 0, resetTime: now + RATE_LIMIT_WINDOW });
  }
  
  return requestCounts.get(ip)!;
}

function isRateLimited(ip: string): boolean {
  const rateLimitInfo = getRateLimitInfo(ip);
  rateLimitInfo.count += 1;
  
  return rateLimitInfo.count > MAX_REQUESTS_PER_WINDOW;
}

export async function GET(request: NextRequest) {
  console.log('API route called:', request.url);
  
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    console.log('Client IP:', ip);
    
    // Check rate limiting
    if (isRateLimited(ip)) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // Get API key from environment variables
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      console.error('WeatherAPI key is not configured');
      return NextResponse.json(
        { error: 'Weather service configuration error' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const days = searchParams.get('days') || '5';
    const endpoint = searchParams.get('endpoint') || 'forecast';
    
    console.log('Query parameters:', { q, days, endpoint });
    
    if (!q) {
      console.error('Missing location query parameter');
      return NextResponse.json(
        { error: 'Location query is required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // Build the WeatherAPI URL with sanitized inputs
    const baseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.weatherapi.com/v1';
    let apiUrl: string;
    
    // Validate endpoint to prevent injection
    if (!['current', 'forecast', 'search'].includes(endpoint)) {
      console.error('Invalid endpoint requested:', endpoint);
      return NextResponse.json(
        { error: 'Invalid endpoint' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    // Sanitize inputs and build URL
    const sanitizedQ = encodeURIComponent(q);
    const sanitizedDays = encodeURIComponent(days);
    
    apiUrl = `${baseUrl}/${endpoint}.json?key=${apiKey}&q=${sanitizedQ}&aqi=yes`;
    
    // Add days parameter for forecast endpoint
    if (endpoint === 'forecast') {
      apiUrl += `&days=${sanitizedDays}&alerts=yes`;
    }
    
    console.log('Fetching from WeatherAPI:', apiUrl.replace(apiKey, '[REDACTED]'));
    
    // Make the request to WeatherAPI
    const response = await fetch(apiUrl);
    
    console.log('WeatherAPI response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('WeatherAPI error:', errorData);
      return NextResponse.json(
        { error: 'Error fetching weather data', details: errorData },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }
    
    const data = await response.json();
    console.log('WeatherAPI data successfully retrieved');
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Weather API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
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