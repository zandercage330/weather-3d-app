// This service handles weather data fetching and transformation
// Using WeatherAPI for real weather data

import {
  fetchCurrentWeather,
  fetchForecast,
  parseCurrentWeather,
  parseForecast,
  parseAlerts
} from './weatherApiClient';

// Continue using the existing MCP weather client as a fallback
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
  humidity?: number;
  windSpeed?: number;
  windDirection?: string;
  sunrise?: string;
  sunset?: string;
  description?: string;
  uvIndex?: number;
  hourlyForecast?: HourlyForecast[];
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  precipitation: number;
  windSpeed?: number;
  humidity?: number;
  feelsLike?: number;
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
 * Uses real WeatherAPI data, falls back to MCP or simulation if needed
 */
export async function getWeatherData(locationName: string = 'New York, NY'): Promise<WeatherData> {
  try {
    // First attempt to use WeatherAPI
    const weatherApiData = await fetchCurrentWeather(locationName);
    return parseCurrentWeather(weatherApiData);
  } catch (error) {
    console.error('WeatherAPI fetch failed, trying fallback:', error);
    
    try {
      // Fall back to MCP weather client if WeatherAPI fails
      const { lat, lon } = getCoordinatesForLocation(locationName) || { lat: 40.7128, lon: -74.006 };
      return await getCurrentWeatherFromMCP(lat, lon, locationName);
    } catch (mcpError) {
      console.error('All weather services failed:', mcpError);
      return getFallbackWeatherData(locationName);
    }
  }
}

/**
 * Gets forecast data for the next several days
 * Uses real WeatherAPI data, falls back to MCP or simulation if needed
 */
export async function getForecastData(days: number = 5, locationName: string = 'New York, NY'): Promise<ForecastDay[]> {
  try {
    // First attempt to use WeatherAPI
    const forecastData = await fetchForecast(locationName, days);
    return parseForecast(forecastData);
  } catch (error) {
    console.error('WeatherAPI forecast fetch failed, trying fallback:', error);
    
    try {
      // Fall back to MCP weather client if WeatherAPI fails
      const { lat, lon } = getCoordinatesForLocation(locationName) || { lat: 40.7128, lon: -74.006 };
      const forecast = await getForecastFromMCP(lat, lon);
      
      // Limit to requested number of days
      return forecast.slice(0, days);
    } catch (mcpError) {
      console.error('All weather forecast services failed:', mcpError);
      return getFallbackForecastData();
    }
  }
}

/**
 * Gets weather alerts for a state or location
 * Uses real WeatherAPI data when available
 */
export async function getWeatherAlerts(stateCode: string = 'NY'): Promise<WeatherAlert[]> {
  try {
    // For WeatherAPI, we need a location (not just state code)
    // We can use the state capital or major city as a representative location
    const locationName = getLocationFromStateCode(stateCode);
    
    // First attempt to use WeatherAPI alerts
    const forecastData = await fetchForecast(locationName, 1);
    return parseAlerts(forecastData);
  } catch (error) {
    console.error('WeatherAPI alerts fetch failed, trying fallback:', error);
    
    try {
      // Fall back to MCP weather client
      return await getAlertsFromMCP(stateCode);
    } catch (mcpError) {
      console.error('All weather alert services failed:', mcpError);
      return [];
    }
  }
}

// Helper to map state code to a representative location
function getLocationFromStateCode(stateCode: string): string {
  const stateMap: Record<string, string> = {
    'AL': 'Birmingham, AL',
    'AK': 'Anchorage, AK',
    'AZ': 'Phoenix, AZ',
    'AR': 'Little Rock, AR',
    'CA': 'Sacramento, CA',
    'CO': 'Denver, CO',
    'CT': 'Hartford, CT',
    'DE': 'Dover, DE',
    'FL': 'Tallahassee, FL',
    'GA': 'Atlanta, GA',
    'HI': 'Honolulu, HI',
    'ID': 'Boise, ID',
    'IL': 'Springfield, IL',
    'IN': 'Indianapolis, IN',
    'IA': 'Des Moines, IA',
    'KS': 'Topeka, KS',
    'KY': 'Frankfort, KY',
    'LA': 'Baton Rouge, LA',
    'ME': 'Augusta, ME',
    'MD': 'Annapolis, MD',
    'MA': 'Boston, MA',
    'MI': 'Lansing, MI',
    'MN': 'Saint Paul, MN',
    'MS': 'Jackson, MS',
    'MO': 'Jefferson City, MO',
    'MT': 'Helena, MT',
    'NE': 'Lincoln, NE',
    'NV': 'Carson City, NV',
    'NH': 'Concord, NH',
    'NJ': 'Trenton, NJ',
    'NM': 'Santa Fe, NM',
    'NY': 'Albany, NY',
    'NC': 'Raleigh, NC',
    'ND': 'Bismarck, ND',
    'OH': 'Columbus, OH',
    'OK': 'Oklahoma City, OK',
    'OR': 'Salem, OR',
    'PA': 'Harrisburg, PA',
    'RI': 'Providence, RI',
    'SC': 'Columbia, SC',
    'SD': 'Pierre, SD',
    'TN': 'Nashville, TN',
    'TX': 'Austin, TX',
    'UT': 'Salt Lake City, UT',
    'VT': 'Montpelier, VT',
    'VA': 'Richmond, VA',
    'WA': 'Olympia, WA',
    'WV': 'Charleston, WV',
    'WI': 'Madison, WI',
    'WY': 'Cheyenne, WY'
  };
  
  return stateMap[stateCode] || `${stateCode}, USA`;
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

// Generate fallback weather data when API calls fail
export function getFallbackWeatherData(location: string = 'New York, NY'): WeatherData {
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

// Generate fallback forecast data
export function getFallbackForecastData(): ForecastDay[] {
  const forecast: ForecastDay[] = [];
  const today = new Date();
  const conditions = ['clear', 'partly-cloudy', 'cloudy', 'rain', 'storm'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // For the random condition, pick from the conditions array
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Generate random temperatures that make sense (higher high, lower low)
    const highTemp = Math.round(Math.random() * 20) + 60; // 60-80°F
    const lowTemp = highTemp - (Math.round(Math.random() * 15) + 5); // 5-20°F lower than high
    
    // Random precipitation chance
    const precipitation = Math.round(Math.random() * 100);
    
    // Generate hourly forecast data
    const hourlyForecast: HourlyForecast[] = [];
    for (let hour = 0; hour < 24; hour += 3) {
      const hourTime = new Date(date);
      hourTime.setHours(hour);
      
      // Temperature fluctuates throughout the day
      const hourTemp = Math.round(
        lowTemp + (highTemp - lowTemp) * (
          hour < 12 
            ? hour / 12 // Temperature rises until noon
            : 1 - ((hour - 12) / 12) // Temperature falls after noon
        )
      );
      
      hourlyForecast.push({
        time: hourTime.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temperature: hourTemp,
        condition: hour >= 6 && hour <= 18 ? condition : (condition === 'clear' ? 'clear' : 'cloudy'),
        precipitation: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 15) + 5,
        humidity: Math.round(Math.random() * 40) + 40,
        feelsLike: hourTemp - Math.round(Math.random() * 5)
      });
    }
    
    forecast.push({
      date: dateString,
      day: dayName,
      condition,
      highTemp,
      lowTemp,
      precipitation,
      humidity: Math.round(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.round(Math.random() * 15) + 5, // 5-20 mph
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      sunrise: '6:30 AM',
      sunset: '7:45 PM',
      description: getDescriptionFromCondition(condition),
      uvIndex: Math.round(Math.random() * 10) + 1, // 1-11 UV index
      hourlyForecast: hourlyForecast
    });
  }
  
  return forecast;
}

// Helper function to get description from condition
function getDescriptionFromCondition(condition: string): string {
  switch (condition) {
    case 'clear':
      return 'Clear sky with full sunshine';
    case 'partly-cloudy':
      return 'Partly cloudy with some sun';
    case 'cloudy':
      return 'Overcast with cloud cover';
    case 'rain':
      return 'Light to moderate rainfall';
    case 'storm':
      return 'Thunderstorms with lightning';
    case 'snow':
      return 'Snow showers';
    case 'fog':
      return 'Foggy conditions with reduced visibility';
    default:
      return 'Varying weather conditions';
  }
} 