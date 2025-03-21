// This is a mock weather service
// In a real application, this would fetch data from a weather API

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

/**
 * Gets weather data for the current location
 * Note: This is currently mocked data
 */
export async function getWeatherData(): Promise<WeatherData> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return mock data
  return {
    temperature: 75,
    condition: 'partly-cloudy',
    location: 'New York, NY',
    precipitation: 20,
    humidity: 45,
    cloudCover: 0.4,
    windSpeed: 8
  };
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
  return (fahrenheit - 32) * 5/9;
}

/**
 * Converts temperature from Celsius to Fahrenheit
 */
export function toFahrenheit(celsius: number): number {
  return celsius * 9/5 + 32;
} 