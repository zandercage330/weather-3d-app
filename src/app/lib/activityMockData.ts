import { WeatherData, ForecastDay } from './weatherService';

// Mock weather data for testing activities page
export const mockWeatherData: WeatherData = {
  location: 'New York, NY',
  temperature: 72,
  condition: 'Sunny',
  windSpeed: 8,
  uvIndex: 5,
  timeOfDay: 'day',
  precipitation: 0,
  humidity: 65,
  cloudCover: 10,
  airQuality: {
    index: 42,
    category: 'good',
    description: 'Good',
    pm2_5: 10,
    pm10: 15,
    o3: 30,
    no2: 5
  }
};

// Mock forecast data
export const mockForecastData: ForecastDay[] = [
  {
    day: 'Today',
    date: new Date().toISOString(),
    highTemp: 75,
    lowTemp: 62,
    condition: 'Clear',
    precipitation: 0,
    precipitationAmount: 0,
    precipitationType: 'none',
    humidity: 65,
    windSpeed: 8,
    uvIndex: 6,
    sunrise: '06:12 AM',
    sunset: '08:15 PM',
    chanceOfRain: 0
  },
  {
    day: 'Tomorrow',
    date: new Date(Date.now() + 86400000).toISOString(),
    highTemp: 78,
    lowTemp: 64,
    condition: 'Partly cloudy',
    precipitation: 0,
    precipitationAmount: 0,
    precipitationType: 'none',
    humidity: 70,
    windSpeed: 7,
    uvIndex: 7,
    sunrise: '06:13 AM',
    sunset: '08:14 PM',
    chanceOfRain: 10
  },
  {
    day: 'Wed',
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    highTemp: 80,
    lowTemp: 67,
    condition: 'Cloudy',
    precipitation: 0.1,
    precipitationAmount: 2,
    precipitationType: 'rain',
    humidity: 75,
    windSpeed: 6,
    uvIndex: 5,
    sunrise: '06:14 AM',
    sunset: '08:13 PM',
    chanceOfRain: 30
  },
  {
    day: 'Thu',
    date: new Date(Date.now() + 3 * 86400000).toISOString(),
    highTemp: 75,
    lowTemp: 66,
    condition: 'Rain',
    precipitation: 0.5,
    precipitationAmount: 15,
    precipitationType: 'rain',
    humidity: 85,
    windSpeed: 9,
    uvIndex: 3,
    sunrise: '06:15 AM',
    sunset: '08:12 PM',
    chanceOfRain: 80
  },
  {
    day: 'Fri',
    date: new Date(Date.now() + 4 * 86400000).toISOString(),
    highTemp: 73,
    lowTemp: 63,
    condition: 'Partly cloudy',
    precipitation: 0.1,
    precipitationAmount: 1,
    precipitationType: 'rain',
    humidity: 70,
    windSpeed: 8,
    uvIndex: 6,
    sunrise: '06:16 AM',
    sunset: '08:11 PM',
    chanceOfRain: 20
  }
];

// Function to get randomized mock weather data
export function getRandomizedMockWeather(): WeatherData {
  const conditions = [
    'Clear', 'Sunny', 'Partly cloudy', 'Cloudy', 
    'Overcast', 'Mist', 'Fog', 'Light rain', 
    'Moderate rain', 'Heavy rain', 'Thunderstorm',
    'Snow', 'Sleet', 'Freezing rain'
  ];
  
  const timeOfDay = Math.random() > 0.2 ? 'day' : 'night';
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const randomTemp = Math.floor(Math.random() * 50) + 40; // 40-90°F
  
  return {
    ...mockWeatherData,
    temperature: randomTemp,
    condition: randomCondition,
    timeOfDay,
    windSpeed: Math.floor(Math.random() * 15) + 3,
    humidity: Math.floor(Math.random() * 60) + 30,
    uvIndex: Math.floor(Math.random() * 11),
    precipitation: Math.random() > 0.7 ? (Math.random() * 0.5) : 0,
    cloudCover: Math.floor(Math.random() * 100)
  };
} 