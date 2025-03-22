/**
 * This file contains adapter functions to integrate the MCP weather tools with our app.
 * The MCP weather tools provide real weather data with specific formatting that needs to be
 * parsed and transformed to match our application's data model.
 */

import { 
  WeatherData, 
  ForecastDay, 
  WeatherAlert, 
  HourlyForecast 
} from './weatherService';

// Import helper functions from weather service
import { toCelsius, toFahrenheit, getFallbackForecastData } from './weatherService';

/**
 * Fetch forecast data from MCP weather tool
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with the forecast data as string
 */
export async function fetchMCPForecast(latitude: number, longitude: number): Promise<any> {
  // In a real implementation, we would use the mcp_weather_get_forecast MCP tool
  // Since we can't directly call the MCP tool from this code, this function should be
  // replaced with the actual implementation where the MCP tool is available

  // Mock response format based on observed MCP tool response
  return {
    "forecasts": [
      {
        "name": "Tonight",
        "startTime": "2023-05-12T20:00:00-04:00",
        "endTime": "2023-05-13T06:00:00-04:00",
        "isDaytime": false,
        "temperature": 48,
        "temperatureUnit": "F",
        "windSpeed": "5 to 10 mph",
        "windDirection": "NE",
        "shortForecast": "Partly Cloudy",
        "detailedForecast": "Partly cloudy, with a low around 48. Northeast wind 5 to 10 mph."
      },
      {
        "name": "Saturday",
        "startTime": "2023-05-13T06:00:00-04:00",
        "endTime": "2023-05-13T18:00:00-04:00",
        "isDaytime": true,
        "temperature": 65,
        "temperatureUnit": "F",
        "windSpeed": "10 to 15 mph",
        "windDirection": "SE",
        "shortForecast": "Mostly Sunny",
        "detailedForecast": "Mostly sunny, with a high near 65. Southeast wind 10 to 15 mph."
      },
      {
        "name": "Saturday Night",
        "startTime": "2023-05-13T18:00:00-04:00",
        "endTime": "2023-05-14T06:00:00-04:00",
        "isDaytime": false,
        "temperature": 52,
        "temperatureUnit": "F",
        "windSpeed": "5 to 10 mph",
        "windDirection": "S",
        "shortForecast": "Partly Cloudy",
        "detailedForecast": "Partly cloudy, with a low around 52. South wind 5 to 10 mph."
      }
      // Additional periods would be included here in the real response
    ]
  };
}

/**
 * Fetch weather alerts from MCP weather tool
 * @param stateCode Two-letter state code (e.g. NY, CA)
 * @returns Promise with the alerts data as string
 */
export async function fetchMCPAlerts(stateCode: string): Promise<any> {
  // In a real implementation, we would use the mcp_weather_get_alerts MCP tool
  // Since we can't directly call the MCP tool from this code, this function should be
  // replaced with the actual implementation where the MCP tool is available

  // Mock response format based on observed MCP tool response
  return {
    "alerts": [
      {
        "event": "Special Weather Statement",
        "headline": "Special Weather Statement issued for potential thunderstorms",
        "severity": "Moderate",
        "areas": ["Northern Counties"],
        "status": "Actual",
        "messageType": "Alert",
        "category": "Met",
        "urgency": "Expected",
        "certainty": "Likely",
        "effective": "2023-05-12T15:30:00-04:00",
        "expires": "2023-05-13T00:00:00-04:00",
        "description": "Thunderstorms with gusty winds and heavy rain possible."
      },
      {
        "event": "Flood Watch",
        "headline": "Flood Watch in effect until Saturday evening",
        "severity": "Severe",
        "areas": ["Coastal Regions"],
        "status": "Actual",
        "messageType": "Alert",
        "category": "Met",
        "urgency": "Expected",
        "certainty": "Likely",
        "effective": "2023-05-12T12:00:00-04:00",
        "expires": "2023-05-13T20:00:00-04:00",
        "description": "Heavy rainfall may lead to flooding in low-lying areas."
      }
    ]
  };
}

/**
 * Parse MCP forecast response into current weather
 * @param mcpResponse The response from MCP forecast tool
 * @param location The location name
 * @returns Converted WeatherData object
 */
export function parseMCPCurrentWeather(mcpResponse: any, location: string): WeatherData {
  try {
    if (!mcpResponse?.forecasts || !mcpResponse.forecasts.length) {
      throw new Error("Invalid MCP forecast response");
    }
    
    // Get the first forecast period (current or tonight)
    const currentPeriod = mcpResponse.forecasts[0];
    
    // Extract temperature
    const temperature = currentPeriod.temperature;
    
    // Extract wind speed
    const windSpeedText = currentPeriod.windSpeed || '';
    const windSpeedMatch = windSpeedText.match(/(\d+)\s+to\s+(\d+)/);
    const windSpeed = windSpeedMatch 
      ? Math.round((parseInt(windSpeedMatch[1]) + parseInt(windSpeedMatch[2])) / 2) 
      : 5;
    
    // Extract condition
    const condition = mapMCPCondition(currentPeriod.shortForecast);
    
    // Determine if it's day or night
    const timeOfDay = currentPeriod.isDaytime ? 'day' : 'night';
    
    // Estimate precipitation, humidity, and cloud cover based on condition
    const { precipitation, humidity, cloudCover } = estimateWeatherValues(condition);
    
    return {
      temperature,
      condition,
      location,
      timeOfDay,
      precipitation,
      humidity,
      cloudCover,
      windSpeed
    };
  } catch (error) {
    console.error("Error parsing MCP current weather:", error);
    throw error;
  }
}

/**
 * Parse MCP forecast response into forecast days
 * @param mcpResponse The response from MCP forecast tool
 * @returns Array of ForecastDay objects
 */
export function parseMCPForecast(mcpResponse: any): ForecastDay[] {
  // Ensure we have a valid response
  if (!mcpResponse || !mcpResponse.daily_forecast) {
    return getFallbackForecastData();
  }

  const forecast: ForecastDay[] = [];
  
  // Process each day in the forecast
  mcpResponse.daily_forecast.forEach((day: any) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Map MCP condition to our internal condition format
    const condition = mapMCPCondition(day.condition);
    
    // Generate hourly forecast data based on the daily data
    // Since MCP doesn't provide hourly data, we'll simulate it
    const hourlyForecast: HourlyForecast[] = [];
    
    // Create 8 entries for 3-hour intervals (24 hours / 3 = 8 intervals)
    for (let hour = 0; hour < 24; hour += 3) {
      const hourTime = new Date(date);
      hourTime.setHours(hour);
      
      // Temperature fluctuates throughout the day
      const tempRange = day.high_temperature - day.low_temperature;
      let hourTemp = day.low_temperature;
      
      // Model temperature curve: lowest at night, highest in afternoon
      if (hour >= 6 && hour <= 15) {
        // Rising temperature from 6am to 3pm
        hourTemp = day.low_temperature + tempRange * ((hour - 6) / 9);
      } else if (hour > 15) {
        // Falling temperature from 3pm to midnight
        hourTemp = day.high_temperature - tempRange * ((hour - 15) / 9);
      }
      
      // Map condition based on time of day
      let hourlyCondition = condition;
      if (hour < 6 || hour > 18) {
        // At night, clear becomes clear-night, and cloudy conditions remain
        hourlyCondition = condition === 'clear' ? 'clear' : condition;
      }
      
      hourlyForecast.push({
        time: hourTime.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temperature: Math.round(hourTemp),
        condition: hourlyCondition,
        precipitation: day.precipitation_chance || 0,
        windSpeed: day.wind_speed,
        humidity: day.humidity || 50, // Default if not available
        feelsLike: Math.round(hourTemp - (Math.random() * 5)) // Simulate feels like temperature
      });
    }
    
    // Create the forecast day entry
    forecast.push({
      date: dateString,
      day: dayName,
      condition,
      highTemp: Math.round(day.high_temperature),
      lowTemp: Math.round(day.low_temperature),
      precipitation: day.precipitation_chance || 0,
      humidity: day.humidity || 50, // Default if not available
      windSpeed: day.wind_speed,
      windDirection: day.wind_direction || 'N', // Default if not available
      sunrise: day.sunrise || '6:30 AM', // Default if not available
      sunset: day.sunset || '7:45 PM', // Default if not available
      description: getDescriptionFromCondition(condition),
      uvIndex: day.uv_index || Math.round(Math.random() * 10) + 1, // Generate if not available
      hourlyForecast
    });
  });

  return forecast;
}

/**
 * Parse MCP alerts response into weather alerts
 * @param mcpResponse The response from MCP alerts tool
 * @returns Array of WeatherAlert objects
 */
export function parseMCPAlerts(mcpResponse: any): WeatherAlert[] {
  try {
    if (!mcpResponse?.alerts) {
      return [];
    }
    
    return mcpResponse.alerts.map((alert: any) => {
      return {
        eventType: alert.event || 'Weather Alert',
        area: alert.areas?.[0] || 'Local Area',
        severity: mapAlertSeverity(alert.severity),
        headline: alert.headline || alert.event || 'Weather alert in effect'
      };
    });
  } catch (error) {
    console.error("Error parsing MCP alerts:", error);
    return [];
  }
}

// Helper functions

/**
 * Map MCP condition text to our internal condition codes
 */
function mapMCPCondition(conditionText: string): string {
  if (!conditionText) return 'partly-cloudy';
  
  const conditionLower = conditionText.toLowerCase();
  
  if (conditionLower.includes('sunny') && conditionLower.includes('partly')) {
    return 'partly-cloudy';
  } else if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return 'clear';
  } else if (conditionLower.includes('cloudy') && conditionLower.includes('partly')) {
    return 'partly-cloudy';
  } else if (conditionLower.includes('cloudy') && conditionLower.includes('mostly')) {
    return 'cloudy';
  } else if (conditionLower.includes('cloudy')) {
    return 'cloudy';
  } else if (conditionLower.includes('rain') && (conditionLower.includes('heavy') || conditionLower.includes('thunderstorm'))) {
    return 'storm';
  } else if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
    return 'rain';
  } else if (conditionLower.includes('snow') || conditionLower.includes('flurries')) {
    return 'snow';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'fog';
  } 
  
  // Default to partly cloudy if we can't determine
  return 'partly-cloudy';
}

/**
 * Estimate precipitation percentage based on forecast text
 */
function estimatePrecipitationFromForecast(shortForecast: string, detailedForecast: string): number {
  const combinedText = (shortForecast + ' ' + detailedForecast).toLowerCase();
  
  if (combinedText.includes('no chance')) return 0;
  if (combinedText.includes('slight chance')) return 20;
  if (combinedText.includes('chance')) return 40;
  if (combinedText.includes('likely')) return 70;
  if (combinedText.includes('rain') || combinedText.includes('shower')) return 80;
  if (combinedText.includes('thunderstorm') || combinedText.includes('storm')) return 90;
  if (combinedText.includes('snow') || combinedText.includes('flurries')) return 70;
  
  // Look for percentages in the text
  const percentMatch = combinedText.match(/(\d+)\s*%\s*(?:chance|probability)/);
  if (percentMatch) {
    return parseInt(percentMatch[1]);
  }
  
  return 0;
}

/**
 * Estimate weather values based on condition
 */
function estimateWeatherValues(condition: string): { precipitation: number, humidity: number, cloudCover: number } {
  switch (condition) {
    case 'clear':
      return {
        precipitation: 0,
        humidity: 30,
        cloudCover: 0.1
      };
    case 'partly-cloudy':
      return {
        precipitation: 10,
        humidity: 45,
        cloudCover: 0.4
      };
    case 'cloudy':
      return {
        precipitation: 20,
        humidity: 60,
        cloudCover: 0.7
      };
    case 'rain':
      return {
        precipitation: 70,
        humidity: 80,
        cloudCover: 0.8
      };
    case 'storm':
      return {
        precipitation: 90,
        humidity: 85,
        cloudCover: 0.9
      };
    case 'snow':
      return {
        precipitation: 70,
        humidity: 75,
        cloudCover: 0.7
      };
    case 'fog':
      return {
        precipitation: 0,
        humidity: 95,
        cloudCover: 0.5
      };
    default:
      return {
        precipitation: 0,
        humidity: 50,
        cloudCover: 0.3
      };
  }
}

/**
 * Map MCP alert severity to our severity types
 */
function mapAlertSeverity(severity: string): 'Minor' | 'Moderate' | 'Severe' | 'Extreme' {
  if (!severity) return 'Moderate';
  
  const severityLower = severity.toLowerCase();
  
  if (severityLower.includes('extreme')) return 'Extreme';
  if (severityLower.includes('severe')) return 'Severe';
  if (severityLower.includes('minor')) return 'Minor';
  
  return 'Moderate';
}

// Helper function to get description from condition (reuse from weatherService)
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