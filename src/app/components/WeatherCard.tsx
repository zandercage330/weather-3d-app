'use client';

import { useTemperatureUnit } from './TemperatureUnitProvider';
import { WeatherData, toCelsius } from '../lib/weatherService';

export interface WeatherCardProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
}

export default function WeatherCard({ weatherData, isLoading }: WeatherCardProps) {
  const { unit, toggleUnit } = useTemperatureUnit();
  
  // Display loading skeleton while data is loading
  if (isLoading || !weatherData) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-lg animate-pulse">
        <div className="h-8 bg-white/20 rounded w-3/4 mb-6"></div>
        <div className="flex items-end mb-4">
          <div className="h-16 bg-white/20 rounded w-1/3 mr-2"></div>
          <div className="h-8 bg-white/20 rounded w-1/6"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  // Get the display temperature based on unit
  const displayTemperature = unit === 'F' 
    ? weatherData.temperature 
    : toCelsius(weatherData.temperature);
    
  // Get the feels like temperature based on unit and calculation
  const feelsLikeTemp = calculateFeelsLikeTemp(weatherData);
  const displayFeelsLike = unit === 'F' 
    ? feelsLikeTemp
    : toCelsius(feelsLikeTemp);
  
  // Format the current date and time
  const dateTimeString = new Date().toLocaleString('en-US', {
    weekday: 'long',
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  
  // Get icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear':
        return weatherData.timeOfDay === 'day' 
          ? '☀️' 
          : '🌙';
      case 'partly-cloudy':
        return weatherData.timeOfDay === 'day' 
          ? '⛅' 
          : '☁️';
      case 'cloudy':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'storm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">{weatherData.location}</h2>
        <button 
          onClick={toggleUnit}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
        >
          °{unit} → °{unit === 'F' ? 'C' : 'F'}
        </button>
      </div>
      
      <div className="flex items-end mb-4">
        <div className="text-5xl font-bold mr-2">{displayTemperature}°{unit}</div>
        <div className="text-3xl">{getWeatherIcon(weatherData.condition)}</div>
      </div>
      
      <div className="capitalize text-xl mb-4">
        {weatherData.condition.replace('-', ' ')}
      </div>
      
      <div className="text-sm opacity-80">
        <p>Feels like: {displayFeelsLike}°{unit}</p>
        <p>Humidity: {weatherData.humidity}%</p>
        <p>Wind: {weatherData.windSpeed} mph</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10 text-sm opacity-60">
        {dateTimeString}
      </div>
    </div>
  );
}

// Calculate feels like temperature based on temperature, humidity, and wind speed
function calculateFeelsLikeTemp(data: WeatherData): number {
  const { temperature, humidity = 50, windSpeed = 0 } = data;
  
  // Simple heat index calculation for high temperatures
  if (temperature > 80) {
    return Math.round(
      -42.379 +
      2.04901523 * temperature +
      10.14333127 * humidity -
      0.22475541 * temperature * humidity -
      0.00683783 * temperature * temperature -
      0.05481717 * humidity * humidity +
      0.00122874 * temperature * temperature * humidity +
      0.00085282 * temperature * humidity * humidity -
      0.00000199 * temperature * temperature * humidity * humidity
    );
  }
  
  // Wind chill calculation for cold temperatures
  if (temperature < 50 && windSpeed > 3) {
    return Math.round(
      35.74 +
      0.6215 * temperature -
      35.75 * Math.pow(windSpeed, 0.16) +
      0.4275 * temperature * Math.pow(windSpeed, 0.16)
    );
  }
  
  // Default: just return the temperature if neither condition applies
  return temperature;
} 