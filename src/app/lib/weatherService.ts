// This service handles weather data fetching and transformation
// Using MCP weather tools for real data

import { getCurrentWeatherFromMCP, getForecastFromMCP, getAlertsFromMCP } from './mcpWeatherClient';

export interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  timeOfDay?: 'day' | 'night';
  precipitation?: number;
  humidity?: number;
  cloudCover?: number;
  windSpeed?: number;
}

export interface ForecastDay {
  date: string;
  day: string;
  condition: string;
  highTemp: number;
  lowTemp: number;
  precipitation: number;
}

export interface WeatherAlert {
  eventType: string;
  area: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  headline: string;
}

// Public API functions

/**
 * Gets weather data for the specified location
 * Uses MCP weather tools when available, falls back to simulation
 */
export async function getWeatherData(locationName: string = 'New York, NY'): Promise<WeatherData> {
  try {
    // Get coordinates for the location
    const { lat, lon } = getCoordinatesForLocation(locationName) || { lat: 40.7128, lon: -74.006 };
    
    // Use MCP weather client to get weather data
    return await getCurrentWeatherFromMCP(lat, lon, locationName);
  } catch (error) {
    console.error('Error getting weather data:', error);
    return getFallbackWeatherData(locationName);
  }
}

/**
 * Gets forecast data for the next several days
 * Uses MCP weather tools when available, falls back to simulation
 */
export async function getForecastData(days: number = 5, locationName: string = 'New York, NY'): Promise<ForecastDay[]> {
  try {
    // Get coordinates for the location
    const { lat, lon } = getCoordinatesForLocation(locationName) || { lat: 40.7128, lon: -74.006 };
    
    // Use MCP weather client to get forecast data
    const forecast = await getForecastFromMCP(lat, lon);
    
    // Limit to requested number of days
    return forecast.slice(0, days);
  } catch (error) {
    console.error('Error getting forecast data:', error);
    return getFallbackForecastData();
  }
}

/**
 * Gets weather alerts for a state
 * Uses MCP weather tools when available
 */
export async function getWeatherAlerts(stateCode: string = 'NY'): Promise<WeatherAlert[]> {
  try {
    // Use MCP weather client to get alerts data
    return await getAlertsFromMCP(stateCode);
  } catch (error) {
    console.error('Error getting weather alerts:', error);
    return [];
  }
}

/**
 * Checks if it's currently daytime
 * This is a simple implementation for demonstration purposes
 */
export function isDayTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20; // Daytime between 6am and 8pm
}

/**
 * Converts temperature from Fahrenheit to Celsius
 */
export function toCelsius(fahrenheit: number): number {
  return Math.round((fahrenheit - 32) * 5/9);
}

/**
 * Converts temperature from Celsius to Fahrenheit
 */
export function toFahrenheit(celsius: number): number {
  return Math.round(celsius * 9/5 + 32);
}

// Simple location to coordinates mapping
// In a real app, this would use a geocoding service
function getCoordinatesForLocation(locationName: string): { lat: number, lon: number } | null {
  const locationMap: Record<string, { lat: number, lon: number }> = {
    'New York, NY': { lat: 40.7128, lon: -74.006 },
    'Los Angeles, CA': { lat: 34.0522, lon: -118.2437 },
    'Chicago, IL': { lat: 41.8781, lon: -87.6298 },
    'Houston, TX': { lat: 29.7604, lon: -95.3698 },
    'Miami, FL': { lat: 25.7617, lon: -80.1918 },
    'Seattle, WA': { lat: 47.6062, lon: -122.3321 },
    'Denver, CO': { lat: 39.7392, lon: -104.9903 },
    'Boston, MA': { lat: 42.3601, lon: -71.0589 },
    'San Francisco, CA': { lat: 37.7749, lon: -122.4194 },
    'Atlanta, GA': { lat: 33.7490, lon: -84.3880 }
  };
  
  return locationMap[locationName] || null;
}

// Fallback data in case of errors
function getFallbackWeatherData(location: string = 'New York, NY'): WeatherData {
  return {
    temperature: 75,
    condition: 'partly-cloudy',
    location: location,
    timeOfDay: isDayTime() ? 'day' : 'night',
    precipitation: 20,
    humidity: 45,
    cloudCover: 0.4,
    windSpeed: 8
  };
}

function getFallbackForecastData(): ForecastDay[] {
  const forecast: ForecastDay[] = [];
  const conditions = ['clear', 'partly-cloudy', 'cloudy', 'rain', 'storm', 'snow'];
  const today = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (let i = 1; i <= 5; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    
    const dayName = daysOfWeek[nextDate.getDay()];
    const dateString = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Randomize weather conditions for demonstration
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const highTemp = Math.round(65 + Math.random() * 20); // Random temp between 65-85
    const lowTemp = Math.round(highTemp - (5 + Math.random() * 15)); // Random temp 5-20 degrees lower
    const precipitation = Math.round(Math.random() * 100);
    
    forecast.push({
      date: dateString,
      day: dayName,
      condition: randomCondition,
      highTemp,
      lowTemp,
      precipitation
    });
  }
  
  return forecast;
} 