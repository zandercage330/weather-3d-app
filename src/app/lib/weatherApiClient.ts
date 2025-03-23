/**
 * weatherApiClient.ts
 * A secure client that interfaces with our internal API routes
 * to fetch weather data from WeatherAPI without exposing the API key
 */

import { WeatherData, ForecastDay, WeatherAlert, AirQualityData } from './weatherService';
import { fetchWithRateLimit, handleError } from './errorHandling';

// Types for WeatherAPI responses based on their API documentation
interface WeatherApiCurrentResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    precip_mm: number;
    precip_in: number;
    is_day: number;
    uv: number;
    air_quality?: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      'us-epa-index': number;
      'gb-defra-index': number;
    };
  };
}

interface WeatherApiForecastResponse {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    uv: number;
    air_quality?: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      'us-epa-index': number;
      'gb-defra-index': number;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      date_epoch: number;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        maxwind_mph: number;
        avghumidity: number;
        uv: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        temp_f: number;
        wind_mph: number;
        wind_dir: string;
        humidity: number;
        feelslike_f: number;
        feelslike_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        chance_of_rain: number;
        uv: number;
      }>;
    }>;
  };
  alerts?: {
    alert: Array<{
      headline: string;
      severity: string;
      areas: string;
      event: string;
      effective: string;
      expires: string;
      desc: string;
    }>;
  };
}

/**
 * Fetches current weather data from WeatherAPI via our secure API route
 */
export async function fetchCurrentWeather(location: string): Promise<WeatherApiCurrentResponse> {
  try {
    // Add logging to debug the request
    console.log(`Fetching weather data for: ${location}`);
    
    // Use absolute URL to ensure proper resolution
    const apiUrl = `/api/weather?q=${encodeURIComponent(location)}&endpoint=current`;
    
    // Use rate-limited fetch with endpoint tracking
    return await fetchWithRateLimit(apiUrl, 'current_weather', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    const errorMessage = handleError(error, 'fetchCurrentWeather');
    throw new Error(errorMessage);
  }
}

/**
 * Fetches forecast data from WeatherAPI via our secure API route
 */
export async function fetchForecast(location: string, days: number = 5): Promise<WeatherApiForecastResponse> {
  try {
    // Add logging to debug the request
    console.log(`Fetching forecast data for: ${location}, days: ${days}`);
    
    // Use absolute URL to ensure proper resolution
    const apiUrl = `/api/weather?q=${encodeURIComponent(location)}&days=${days}&endpoint=forecast`;
    
    // Use rate-limited fetch with endpoint tracking
    return await fetchWithRateLimit(apiUrl, 'forecast_weather', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    const errorMessage = handleError(error, 'fetchForecast');
    throw new Error(errorMessage);
  }
}

/**
 * Fetches location suggestions for autocomplete
 */
export async function searchLocations(query: string): Promise<Array<{name: string, region: string, country: string}>> {
  if (!query || query.length < 3) return [];
  
  try {
    const apiUrl = `/api/locationSearch?query=${encodeURIComponent(query)}`;
    
    // Use rate-limited fetch with endpoint tracking
    return await fetchWithRateLimit(apiUrl, 'location_search', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

/**
 * Maps WeatherAPI condition code to our internal condition format
 */
export function mapWeatherApiCondition(code: number, isDay: boolean): string {
  // WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
  // Map to our internal condition codes: clear, partly-cloudy, cloudy, rain, storm, snow, etc.
  
  // Night conditions
  if (!isDay) {
    if (code === 1000) return 'clear-night';
    if ([1003, 1006, 1009].includes(code)) return 'partly-cloudy-night';
  }
  
  // Day or night conditions
  if (code === 1000) return 'clear';
  if ([1003, 1006].includes(code)) return 'partly-cloudy';
  if ([1009, 1030, 1135, 1147].includes(code)) return 'cloudy';
  if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return 'rain';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'storm';
  if ([1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1261, 1264].includes(code)) return 'snow';
  if ([1237, 1249, 1252, 1261, 1264].includes(code)) return 'sleet';
  if ([1273, 1276, 1279, 1282].includes(code)) return 'thunderstorm';
  
  // Default fallback
  return 'partly-cloudy';
}

/**
 * Parses the WeatherAPI current data to our internal format
 */
export function parseCurrentWeather(data: WeatherApiCurrentResponse): WeatherData {
  const isDay = data.current.is_day === 1;
  
  return {
    temperature: Math.round(data.current.temp_f),
    condition: mapWeatherApiCondition(data.current.condition.code, isDay),
    location: `${data.location.name}, ${data.location.region}`,
    timeOfDay: isDay ? 'day' : 'night',
    precipitation: data.current.precip_in * 100, // Convert to percentage chance
    humidity: data.current.humidity,
    cloudCover: data.current.cloud / 100,  // Convert to decimal
    windSpeed: Math.round(data.current.wind_mph),
    uvIndex: data.current.uv,
    airQuality: parseAirQuality(data.current.air_quality)
  };
}

/**
 * Parse air quality data from WeatherAPI
 */
export function parseAirQuality(airQualityData?: WeatherApiCurrentResponse['current']['air_quality']): AirQualityData | null {
  if (!airQualityData) return null;
  
  // Get the EPA Air Quality Index (1-6 scale)
  const aqiValue = airQualityData['us-epa-index'];
  
  // Map AQI value to our descriptive categories
  let category: AirQualityData['category'];
  let description: string;
  
  switch (aqiValue) {
    case 1:
      category = 'good';
      description = 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
      break;
    case 2:
      category = 'moderate';
      description = 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people.';
      break;
    case 3:
      category = 'unhealthyForSensitive';
      description = 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.';
      break;
    case 4:
      category = 'unhealthy';
      description = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
      break;
    case 5:
      category = 'veryUnhealthy';
      description = 'Health alert: everyone may experience more serious health effects.';
      break;
    case 6:
      category = 'hazardous';
      description = 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
      break;
    default:
      category = 'unknown';
      description = 'Air quality information is not available.';
  }
  
  return {
    index: aqiValue,
    category,
    description,
    pm2_5: Math.round(airQualityData.pm2_5 * 10) / 10,
    pm10: Math.round(airQualityData.pm10 * 10) / 10,
    o3: Math.round(airQualityData.o3 * 10) / 10,
    no2: Math.round(airQualityData.no2 * 10) / 10
  };
}

/**
 * Parses the WeatherAPI forecast data to our internal format
 */
export function parseForecast(data: WeatherApiForecastResponse): ForecastDay[] {
  return data.forecast.forecastday.map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Parse hourly forecasts
    const hourlyForecast = day.hour.filter((_, index) => index % 3 === 0).map(hour => {
      const hourTime = new Date(hour.time);
      return {
        time: hourTime.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temperature: Math.round(hour.temp_f),
        condition: mapWeatherApiCondition(hour.condition.code, hour.time.includes('06:00') || hour.time.includes('12:00') || hour.time.includes('18:00')),
        precipitation: hour.chance_of_rain,
        windSpeed: Math.round(hour.wind_mph),
        humidity: hour.humidity,
        feelsLike: Math.round(hour.feelslike_f),
        uvIndex: hour.uv
      };
    });
    
    return {
      date: dateString,
      day: dayName,
      condition: mapWeatherApiCondition(day.day.condition.code, true),
      highTemp: Math.round(day.day.maxtemp_f),
      lowTemp: Math.round(day.day.mintemp_f),
      precipitation: day.day.daily_chance_of_rain,
      humidity: day.day.avghumidity,
      windSpeed: Math.round(day.day.maxwind_mph),
      windDirection: day.hour[12]?.wind_dir || 'N', // Use noon hour wind direction as representative
      sunrise: day.astro.sunrise,
      sunset: day.astro.sunset,
      description: getDescriptionFromCondition(mapWeatherApiCondition(day.day.condition.code, true)),
      uvIndex: day.day.uv,
      hourlyForecast
    };
  });
}

// Helper function imported into this file from weatherService
function getDescriptionFromCondition(condition: string): string {
  switch (condition) {
    case 'clear':
      return 'Clear sky throughout the day.';
    case 'partly-cloudy':
      return 'Partly cloudy conditions expected.';
    case 'cloudy':
      return 'Cloudy skies throughout the day.';
    case 'rain':
      return 'Rain showers expected.';
    case 'storm':
      return 'Stormy conditions with possible thunderstorms.';
    case 'snow':
      return 'Snow is expected.';
    case 'sleet':
      return 'Sleet or wintry mix expected.';
    case 'fog':
      return 'Foggy conditions expected.';
    default:
      return 'Mixed weather conditions throughout the day.';
  }
}

/**
 * Parses the WeatherAPI alerts to our internal format
 */
export function parseAlerts(data: WeatherApiForecastResponse): WeatherAlert[] {
  if (!data.alerts || !data.alerts.alert || data.alerts.alert.length === 0) {
    return [];
  }
  
  return data.alerts.alert.map(alert => {
    let severity: WeatherAlert['severity'] = 'Minor';
    
    // Map WeatherAPI severity to our format
    if (alert.severity.toLowerCase().includes('moderate')) {
      severity = 'Moderate';
    } else if (alert.severity.toLowerCase().includes('severe')) {
      severity = 'Severe';
    } else if (alert.severity.toLowerCase().includes('extreme')) {
      severity = 'Extreme';
    }
    
    return {
      eventType: alert.event,
      area: alert.areas,
      severity,
      headline: alert.headline
    };
  });
} 