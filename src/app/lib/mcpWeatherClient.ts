/**
 * This file contains client functions that make direct calls to the MCP weather tools.
 * This is the real implementation that should be used in the production environment.
 * 
 * NOTE: In a typical Next.js application, these API calls should be made from server components
 * or API routes to avoid exposing any keys. This is a simplified implementation for demonstration.
 */

import { parseMCPCurrentWeather, parseMCPForecast, parseMCPAlerts } from './mcpWeatherAdapter';
import { WeatherData, ForecastDay, WeatherAlert } from './weatherService';

/**
 * Calls the MCP weather tool to get forecast data
 * @param latitude Latitude of the location
 * @param longitude Longitude of the location
 * @returns The raw response from the MCP weather tool
 */
export async function callMCPForecastAPI(latitude: number, longitude: number): Promise<any> {
  try {
    // In a real implementation, this would be a fetch call to a Next.js API route
    // that would call the MCP weather tool or a direct call to the tool if available
    
    // For now, we'll mock the data
    return await mockMCPForecastCall(latitude, longitude);
  } catch (error) {
    console.error('Error calling MCP Forecast API:', error);
    throw error;
  }
}

/**
 * Calls the MCP weather tool to get alerts data
 * @param stateCode Two-letter state code (e.g. NY, CA)
 * @returns The raw response from the MCP weather tool
 */
export async function callMCPAlertsAPI(stateCode: string): Promise<any> {
  try {
    // In a real implementation, this would be a fetch call to a Next.js API route
    // that would call the MCP weather tool or a direct call to the tool if available
    
    // For now, we'll mock the data
    return await mockMCPAlertsCall(stateCode);
  } catch (error) {
    console.error('Error calling MCP Alerts API:', error);
    throw error;
  }
}

/**
 * Gets current weather data from MCP tools
 * @param latitude Latitude of the location
 * @param longitude Longitude of the location
 * @param locationName Name of the location
 * @returns WeatherData object
 */
export async function getCurrentWeatherFromMCP(
  latitude: number, 
  longitude: number, 
  locationName: string
): Promise<WeatherData> {
  const response = await callMCPForecastAPI(latitude, longitude);
  return parseMCPCurrentWeather(response, locationName);
}

/**
 * Gets forecast data from MCP tools
 * @param latitude Latitude of the location
 * @param longitude Longitude of the location
 * @returns Array of ForecastDay objects
 */
export async function getForecastFromMCP(
  latitude: number, 
  longitude: number
): Promise<ForecastDay[]> {
  const response = await callMCPForecastAPI(latitude, longitude);
  return parseMCPForecast(response);
}

/**
 * Gets weather alerts from MCP tools
 * @param stateCode Two-letter state code
 * @returns Array of WeatherAlert objects
 */
export async function getAlertsFromMCP(stateCode: string): Promise<WeatherAlert[]> {
  const response = await callMCPAlertsAPI(stateCode);
  return parseMCPAlerts(response);
}

// Mock implementations for development
// These would be replaced with actual MCP tool calls in production

async function mockMCPForecastCall(latitude: number, longitude: number): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    forecasts: [
      {
        name: "Tonight",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        isDaytime: false,
        temperature: 52,
        temperatureUnit: "F",
        windSpeed: "5 to 10 mph",
        windDirection: "NE",
        shortForecast: "Partly Cloudy",
        detailedForecast: "Partly cloudy, with a low around 52. Northeast wind 5 to 10 mph."
      },
      {
        name: "Saturday",
        startTime: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        isDaytime: true,
        temperature: 65,
        temperatureUnit: "F",
        windSpeed: "10 to 15 mph",
        windDirection: "SE",
        shortForecast: "Mostly Sunny",
        detailedForecast: "Mostly sunny, with a high near 65. Southeast wind 10 to 15 mph."
      },
      {
        name: "Saturday Night",
        startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
        isDaytime: false,
        temperature: 54,
        temperatureUnit: "F",
        windSpeed: "5 to 10 mph",
        windDirection: "S",
        shortForecast: "Partly Cloudy",
        detailedForecast: "Partly cloudy, with a low around 54. South wind 5 to 10 mph."
      },
      {
        name: "Sunday",
        startTime: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        isDaytime: true,
        temperature: 72,
        temperatureUnit: "F",
        windSpeed: "10 to 15 mph",
        windDirection: "SW",
        shortForecast: "Chance of Rain",
        detailedForecast: "A 30 percent chance of rain. Partly sunny, with a high near 72. Southwest wind 10 to 15 mph."
      },
      {
        name: "Sunday Night",
        startTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
        isDaytime: false,
        temperature: 56,
        temperatureUnit: "F",
        windSpeed: "5 to 10 mph",
        windDirection: "W",
        shortForecast: "Slight Chance of Rain",
        detailedForecast: "A slight chance of rain. Mostly cloudy, with a low around 56. West wind 5 to 10 mph."
      },
      {
        name: "Monday",
        startTime: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        isDaytime: true,
        temperature: 68,
        temperatureUnit: "F",
        windSpeed: "10 to 15 mph",
        windDirection: "NW",
        shortForecast: "Partly Sunny",
        detailedForecast: "Partly sunny, with a high near 68. Northwest wind 10 to 15 mph."
      },
      {
        name: "Monday Night",
        startTime: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 84 * 3600 * 1000).toISOString(),
        isDaytime: false,
        temperature: 50,
        temperatureUnit: "F",
        windSpeed: "5 to 10 mph",
        windDirection: "N",
        shortForecast: "Partly Cloudy",
        detailedForecast: "Partly cloudy, with a low around 50. North wind 5 to 10 mph."
      },
      {
        name: "Tuesday",
        startTime: new Date(Date.now() + 84 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
        isDaytime: true,
        temperature: 63,
        temperatureUnit: "F",
        windSpeed: "5 to 10 mph",
        windDirection: "NE",
        shortForecast: "Mostly Sunny",
        detailedForecast: "Mostly sunny, with a high near 63. Northeast wind 5 to 10 mph."
      },
      {
        name: "Tuesday Night",
        startTime: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 108 * 3600 * 1000).toISOString(),
        isDaytime: false,
        temperature: 48,
        temperatureUnit: "F",
        windSpeed: "5 to 10 mph",
        windDirection: "NE",
        shortForecast: "Mostly Clear",
        detailedForecast: "Mostly clear, with a low around 48. Northeast wind 5 to 10 mph."
      },
      {
        name: "Wednesday",
        startTime: new Date(Date.now() + 108 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 120 * 3600 * 1000).toISOString(),
        isDaytime: true,
        temperature: 65,
        temperatureUnit: "F",
        windSpeed: "5 to 10 mph",
        windDirection: "E",
        shortForecast: "Sunny",
        detailedForecast: "Sunny, with a high near 65. East wind 5 to 10 mph."
      }
    ]
  };
}

async function mockMCPAlertsCall(stateCode: string): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return empty alerts for most states
  if (stateCode !== 'NY' && stateCode !== 'FL' && stateCode !== 'CA') {
    return { alerts: [] };
  }
  
  // Return sample alerts for a few states
  return {
    alerts: stateCode === 'NY' ? [
      {
        event: "Special Weather Statement",
        headline: "Special Weather Statement issued for potential thunderstorms",
        severity: "Moderate",
        areas: ["Northern Counties"],
        status: "Actual",
        messageType: "Alert",
        category: "Met",
        urgency: "Expected",
        certainty: "Likely",
        description: "Thunderstorms with gusty winds and heavy rain possible."
      }
    ] : stateCode === 'FL' ? [
      {
        event: "Flood Watch",
        headline: "Flood Watch in effect until Saturday evening",
        severity: "Severe",
        areas: ["Coastal Regions"],
        status: "Actual",
        messageType: "Alert",
        category: "Met",
        urgency: "Expected",
        certainty: "Likely",
        description: "Heavy rainfall may lead to flooding in low-lying areas."
      },
      {
        event: "Rip Current Statement",
        headline: "High Rip Current Risk for Atlantic beaches",
        severity: "Moderate",
        areas: ["Atlantic Coast"],
        status: "Actual",
        messageType: "Alert",
        category: "Met",
        urgency: "Expected",
        certainty: "Likely",
        description: "Dangerous rip currents expected along Atlantic beaches."
      }
    ] : [
      {
        event: "Red Flag Warning",
        headline: "Red Flag Warning for fire danger",
        severity: "Severe",
        areas: ["Southern California"],
        status: "Actual",
        messageType: "Alert",
        category: "Met",
        urgency: "Expected",
        certainty: "Likely",
        description: "Critical fire weather conditions expected due to strong winds and low humidity."
      }
    ]
  };
} 