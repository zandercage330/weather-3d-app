import { NextResponse } from 'next/server';
import { prefetchWeatherData } from '../../lib/weatherService';

/**
 * API route to prefetch weather data for saved locations
 * This reduces visible loading time by fetching data in the background
 * 
 * Expected request body:
 * {
 *   locations: string[] // Array of location names to prefetch
 * }
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate locations
    if (!body.locations || !Array.isArray(body.locations)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected locations array.' }, 
        { status: 400 }
      );
    }
    
    // Limit the number of locations to prevent abuse
    const locations = body.locations.slice(0, 10);
    
    // Start prefetching in the background
    // We don't await this since we want to respond quickly
    // and let the prefetching happen asynchronously
    setTimeout(() => {
      prefetchWeatherData(locations);
    }, 0);
    
    // Return success immediately
    return NextResponse.json({ 
      success: true, 
      message: `Started prefetching data for ${locations.length} locations` 
    });
  } catch (error) {
    console.error('Error in prefetch API route:', error);
    return NextResponse.json(
      { error: 'Failed to process prefetch request' }, 
      { status: 500 }
    );
  }
}

/**
 * For OPTIONS requests - CORS support
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 