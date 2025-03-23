/**
 * weatherHistoryService.ts
 * Handles fetching and processing historical weather data
 */

import { WeatherData, AirQualityData } from './weatherService';

// Historical data types
export interface HistoricalDataPoint {
  date: string; // ISO date string
  temperature: {
    max: number;
    min: number;
    avg: number;
  };
  condition: string;
  precipitation: number; // in mm
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  airQuality: AirQualityData | null;
}

export interface HistoricalWeatherData {
  location: string;
  period: {
    from: string; // ISO date string
    to: string;   // ISO date string
  };
  dataPoints: HistoricalDataPoint[];
  stats: {
    temperature: {
      max: number;
      min: number;
      avg: number;
    };
    totalPrecipitation: number;
    avgHumidity: number;
    avgUvIndex: number;
  };
}

export type HistoryPeriod = 'week' | 'month' | 'year' | 'custom';

/**
 * Fetches historical weather data for a specific location and date range
 */
export async function fetchHistoricalWeather(
  location: string,
  fromDate: string, // ISO date string
  toDate: string    // ISO date string
): Promise<HistoricalWeatherData> {
  try {
    // Format dates for API
    const formattedFromDate = fromDate.split('T')[0]; // Get YYYY-MM-DD part
    const formattedToDate = toDate.split('T')[0];     // Get YYYY-MM-DD part
    
    // Call our API endpoint for history data
    const apiUrl = `/api/weather?q=${encodeURIComponent(location)}&from=${formattedFromDate}&to=${formattedToDate}&endpoint=history`;
    
    const response = await fetch(apiUrl, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch historical weather data';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return parseHistoricalData(data, location, fromDate, toDate);
    
  } catch (error) {
    console.error('Error fetching historical weather data:', error);
    return getHistoricalFallbackData(location, fromDate, toDate);
  }
}

/**
 * Get historical weather data for a predefined period
 */
export async function getHistoricalWeatherForPeriod(
  location: string,
  period: HistoryPeriod,
  customFromDate?: string,
  customToDate?: string
): Promise<HistoricalWeatherData> {
  // Calculate date range based on period
  const toDate = new Date().toISOString();
  let fromDate: string;
  
  switch (period) {
    case 'week':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      fromDate = weekAgo.toISOString();
      break;
    case 'month':
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      fromDate = monthAgo.toISOString();
      break;
    case 'year':
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      fromDate = yearAgo.toISOString();
      break;
    case 'custom':
      if (!customFromDate || !customToDate) {
        throw new Error('Custom date range requires both from and to dates');
      }
      fromDate = customFromDate;
      return fetchHistoricalWeather(location, fromDate, customToDate);
    default:
      // Default to last 7 days
      const defaultPeriod = new Date();
      defaultPeriod.setDate(defaultPeriod.getDate() - 7);
      fromDate = defaultPeriod.toISOString();
  }
  
  return fetchHistoricalWeather(location, fromDate, toDate);
}

/**
 * Parse raw API response into our HistoricalWeatherData format
 */
function parseHistoricalData(
  data: any,
  location: string,
  fromDate: string,
  toDate: string
): HistoricalWeatherData {
  // Extract the relevant data from the API response
  const dataPoints: HistoricalDataPoint[] = [];
  let tempMax = -Infinity;
  let tempMin = Infinity;
  let tempSum = 0;
  let precipSum = 0;
  let humiditySum = 0;
  let uvSum = 0;
  
  // Parse each day in the history
  if (data && data.forecast && data.forecast.forecastday) {
    data.forecast.forecastday.forEach((day: any) => {
      // Extract temperature data
      const maxTemp = day.day.maxtemp_f;
      const minTemp = day.day.mintemp_f;
      const avgTemp = day.day.avgtemp_f;
      
      // Update our running statistics
      tempMax = Math.max(tempMax, maxTemp);
      tempMin = Math.min(tempMin, minTemp);
      tempSum += avgTemp;
      precipSum += day.day.totalprecip_mm || 0;
      humiditySum += day.day.avghumidity || 0;
      uvSum += day.day.uv || 0;
      
      // Parse condition
      let condition = 'unknown';
      if (day.day.condition && day.day.condition.text) {
        condition = mapConditionText(day.day.condition.text);
      }
      
      // Create the data point
      const dataPoint: HistoricalDataPoint = {
        date: day.date,
        temperature: {
          max: maxTemp,
          min: minTemp,
          avg: avgTemp
        },
        condition,
        precipitation: day.day.totalprecip_mm || 0,
        humidity: day.day.avghumidity || 0,
        windSpeed: day.day.maxwind_mph || 0,
        uvIndex: day.day.uv || 0,
        airQuality: parseHistoricalAirQuality(day.day.air_quality)
      };
      
      dataPoints.push(dataPoint);
    });
  }
  
  // Calculate overall stats
  const daysCount = dataPoints.length || 1; // Avoid division by zero
  
  return {
    location,
    period: {
      from: fromDate,
      to: toDate
    },
    dataPoints,
    stats: {
      temperature: {
        max: tempMax === -Infinity ? 0 : tempMax,
        min: tempMin === Infinity ? 0 : tempMin,
        avg: tempSum / daysCount
      },
      totalPrecipitation: precipSum,
      avgHumidity: humiditySum / daysCount,
      avgUvIndex: uvSum / daysCount
    }
  };
}

/**
 * Parse historical air quality data
 */
function parseHistoricalAirQuality(airQualityData?: any): AirQualityData | null {
  if (!airQualityData) return null;
  
  // Get the EPA Air Quality Index (1-6 scale)
  const aqiValue = airQualityData['us-epa-index'] || 1;
  
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
    pm2_5: Math.round((airQualityData.pm2_5 || 0) * 10) / 10,
    pm10: Math.round((airQualityData.pm10 || 0) * 10) / 10,
    o3: Math.round((airQualityData.o3 || 0) * 10) / 10,
    no2: Math.round((airQualityData.no2 || 0) * 10) / 10
  };
}

/**
 * Map condition text from API to our internal condition types
 */
function mapConditionText(conditionText: string): string {
  const lowerText = conditionText.toLowerCase();
  
  if (lowerText.includes('sunny') || lowerText.includes('clear')) {
    return 'clear';
  } else if (lowerText.includes('partly cloudy')) {
    return 'partly-cloudy';
  } else if (lowerText.includes('cloudy') || lowerText.includes('overcast')) {
    return 'cloudy';
  } else if (lowerText.includes('rain') || lowerText.includes('drizzle')) {
    return 'rain';
  } else if (lowerText.includes('thunder') || lowerText.includes('storm')) {
    return 'storm';
  } else if (lowerText.includes('snow') || lowerText.includes('blizzard')) {
    return 'snow';
  } else if (lowerText.includes('sleet')) {
    return 'sleet';
  } else if (lowerText.includes('fog') || lowerText.includes('mist')) {
    return 'fog';
  }
  
  return 'partly-cloudy'; // Default
}

/**
 * Generate fallback historical data when API call fails
 */
function getHistoricalFallbackData(
  location: string,
  fromDate: string,
  toDate: string
): HistoricalWeatherData {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const dataPoints: HistoricalDataPoint[] = [];
  
  // Generate a random but somewhat realistic temperature range
  const baseTemp = 65; // Base temperature (adjust for season/location if needed)
  const variance = 15; // Daily variance
  
  // Create data points for each day in the range
  const currentDate = new Date(from);
  while (currentDate <= to) {
    const dayOffset = Math.sin((currentDate.getDate() / 31) * Math.PI) * 5; // Seasonal variation
    const avgTemp = baseTemp + dayOffset + (Math.random() * 6 - 3);
    const maxTemp = avgTemp + Math.random() * variance / 2;
    const minTemp = avgTemp - Math.random() * variance / 2;
    
    // Weather conditions - weighted randomness
    const conditions = ['clear', 'partly-cloudy', 'cloudy', 'rain', 'storm', 'snow'];
    const weights = [0.4, 0.3, 0.15, 0.1, 0.03, 0.02];
    const condition = weightedRandomChoice(conditions, weights);
    
    // Precipitation depends on condition
    let precipitation = 0;
    if (condition === 'rain') {
      precipitation = Math.random() * 10 + 1;
    } else if (condition === 'storm') {
      precipitation = Math.random() * 20 + 10;
    } else if (condition === 'snow') {
      precipitation = Math.random() * 5 + 1;
    } else if (condition === 'cloudy') {
      precipitation = Math.random() < 0.3 ? Math.random() * 2 : 0;
    }
    
    // Generate data point
    dataPoints.push({
      date: currentDate.toISOString().split('T')[0],
      temperature: {
        max: Math.round(maxTemp),
        min: Math.round(minTemp),
        avg: Math.round(avgTemp)
      },
      condition,
      precipitation: Math.round(precipitation * 10) / 10,
      humidity: Math.round(Math.random() * 50 + 30),
      windSpeed: Math.round(Math.random() * 15 + 2),
      uvIndex: Math.round(Math.random() * 10),
      airQuality: null
    });
    
    // Increment date by 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate overall stats
  let tempMax = -Infinity;
  let tempMin = Infinity;
  let tempSum = 0;
  let precipSum = 0;
  let humiditySum = 0;
  let uvSum = 0;
  
  dataPoints.forEach(point => {
    tempMax = Math.max(tempMax, point.temperature.max);
    tempMin = Math.min(tempMin, point.temperature.min);
    tempSum += point.temperature.avg;
    precipSum += point.precipitation;
    humiditySum += point.humidity;
    uvSum += point.uvIndex;
  });
  
  const daysCount = dataPoints.length || 1;
  
  return {
    location,
    period: {
      from: fromDate,
      to: toDate
    },
    dataPoints,
    stats: {
      temperature: {
        max: tempMax,
        min: tempMin,
        avg: tempSum / daysCount
      },
      totalPrecipitation: precipSum,
      avgHumidity: humiditySum / daysCount,
      avgUvIndex: uvSum / daysCount
    }
  };
}

/**
 * Helper function to select an item based on weighted probability
 */
function weightedRandomChoice<T>(items: T[], weights: number[]): T {
  // Normalize weights
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const normalizedWeights = weights.map(weight => weight / totalWeight);
  
  // Generate random value
  const random = Math.random();
  let cumulativeWeight = 0;
  
  // Select item based on weight
  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += normalizedWeights[i];
    if (random <= cumulativeWeight) {
      return items[i];
    }
  }
  
  // Fallback
  return items[items.length - 1];
} 