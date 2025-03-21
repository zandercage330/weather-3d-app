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

export interface ForecastDay {
  date: string;
  day: string;
  condition: string;
  highTemp: number;
  lowTemp: number;
  precipitation: number;
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
 * Gets forecast data for the next several days
 * Note: This is currently mocked data
 */
export async function getForecastData(days: number = 5): Promise<ForecastDay[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const forecast: ForecastDay[] = [];
  const conditions = ['clear', 'partly-cloudy', 'cloudy', 'rain', 'storm', 'snow'];
  const today = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (let i = 1; i <= days; i++) {
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