'use client';

import React from 'react';
import { WeatherData } from '../lib/weatherService';

interface WeatherCardProps {
  data: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
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

  return (
    <div className="glass-card rounded-2xl p-6 float-animation">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">{data.location}</h2>
        <span className="text-5xl drop-shadow-md">{getWeatherEmoji(data.condition)}</span>
      </div>
      
      <div className="mb-6">
        <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2 drop-shadow-sm">
          {data.temperature}°F
        </div>
        <div className="text-xl text-gray-800 dark:text-gray-200 font-medium">
          {formatCondition(data.condition)}
        </div>
      </div>
      
      <div className="border-t border-white/30 dark:border-gray-700/60 pt-4">
        <div className="grid grid-cols-3 gap-2">
          {/* Precipitation */}
          <div className="text-center">
            <div className="text-sm text-gray-700 dark:text-gray-300">Precipitation</div>
            <div className="font-medium mt-1 text-gray-900 dark:text-white">
              {data.precipitation !== undefined ? `${data.precipitation}%` : 'N/A'}
            </div>
          </div>
          
          {/* Humidity */}
          <div className="text-center">
            <div className="text-sm text-gray-700 dark:text-gray-300">Humidity</div>
            <div className="font-medium mt-1 text-gray-900 dark:text-white">
              {data.humidity !== undefined ? `${data.humidity}%` : 'N/A'}
            </div>
          </div>
          
          {/* Wind Speed */}
          <div className="text-center">
            <div className="text-sm text-gray-700 dark:text-gray-300">Wind</div>
            <div className="font-medium mt-1 text-gray-900 dark:text-white">
              {data.windSpeed !== undefined ? `${data.windSpeed} mph` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-700 dark:text-gray-300 text-center font-medium">
        {data.timeOfDay === 'day' ? 'Daytime' : 'Nighttime'}
      </div>
    </div>
  );
};

export default WeatherCard; 