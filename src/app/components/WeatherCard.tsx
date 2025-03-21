'use client';

import React from 'react';
import { WeatherData } from '../lib/weatherService';
import { toCelsius, toFahrenheit } from '../lib/weatherService';
import { useTemperatureUnit } from './TemperatureUnitProvider';

interface WeatherCardProps {
  data: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  const { tempUnit, toggleTempUnit } = useTemperatureUnit();
  
  // Format date and time
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);
  const formattedTime = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  });

  // Map condition to emoji
  const getWeatherEmoji = (condition: string) => {
    switch (condition) {
      case 'clear':
        return data.timeOfDay === 'day' ? '☀️' : '🌙';
      case 'partly-cloudy':
        return data.timeOfDay === 'day' ? '⛅' : '☁️';
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

  // Format condition for display
  const formatCondition = (condition: string) => {
    return condition
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format temperature based on selected unit
  const formatTemperature = (temp: number) => {
    return tempUnit === 'F' ? Math.round(temp) : Math.round(toCelsius(temp));
  };
  
  // Calculate "feels like" temperature (simplified)
  const calculateFeelsLike = (temp: number, windSpeed: number, humidity: number) => {
    // Simple approximation of "feels like" temperature
    const windChill = windSpeed > 3 ? temp - (windSpeed * 0.5) : temp;
    const heatIndex = humidity > 60 ? temp + (humidity - 60) * 0.1 : temp;
    
    return tempUnit === 'F' 
      ? Math.round((temp >= 70) ? heatIndex : windChill) 
      : Math.round(toCelsius((temp >= 70) ? heatIndex : windChill));
  };

  const feelsLike = calculateFeelsLike(
    data.temperature,
    data.windSpeed || 0,
    data.humidity || 0
  );

  return (
    <div className="glass-card rounded-2xl p-6 w-full float-animation">
      {/* Date, Time and Location */}
      <div className="flex flex-col items-start mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm flex items-center justify-between w-full">
          {data.location}
          <button 
            onClick={toggleTempUnit}
            className="text-sm bg-white/30 dark:bg-black/30 px-2 py-1 rounded ml-2 hover:bg-white/40 dark:hover:bg-black/40 transition-colors"
          >
            °{tempUnit}
          </button>
        </h2>
        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          {formattedDate} • {formattedTime}
        </div>
      </div>
      
      {/* Current Weather */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="text-6xl font-bold text-gray-900 dark:text-white mb-1 drop-shadow-sm">
            {formatTemperature(data.temperature)}°{tempUnit}
          </div>
          <div className="text-xl text-gray-800 dark:text-gray-200 font-medium">
            {formatCondition(data.condition)}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Feels like {feelsLike}°{tempUnit}
          </div>
        </div>
        <span className="text-7xl drop-shadow-md">{getWeatherEmoji(data.condition)}</span>
      </div>
      
      {/* Details Section */}
      <div className="border-t border-white/30 dark:border-gray-700/60 mt-6 pt-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Precipitation */}
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center text-lg mr-2">
              💧
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Precipitation</div>
              <div className="text-base text-gray-800 dark:text-gray-200">
                {data.precipitation !== undefined ? `${data.precipitation}%` : 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Humidity */}
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center text-lg mr-2">
              💦
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Humidity</div>
              <div className="text-base text-gray-800 dark:text-gray-200">
                {data.humidity !== undefined ? `${data.humidity}%` : 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Wind Speed */}
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center text-lg mr-2">
              🌬️
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Wind</div>
              <div className="text-base text-gray-800 dark:text-gray-200">
                {data.windSpeed !== undefined ? `${data.windSpeed} mph` : 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Cloud Cover */}
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center text-lg mr-2">
              ☁️
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Cloud Cover</div>
              <div className="text-base text-gray-800 dark:text-gray-200">
                {data.cloudCover !== undefined ? `${Math.round(data.cloudCover * 100)}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/30 dark:border-gray-700/60 mt-2 pt-3 text-center text-xs text-gray-700 dark:text-gray-300 font-medium">
        {data.timeOfDay === 'day' ? 'Daytime' : 'Nighttime'}
      </div>
    </div>
  );
};

export default WeatherCard; 