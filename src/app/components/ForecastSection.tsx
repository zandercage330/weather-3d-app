'use client';

import React from 'react';
import { ForecastDay } from '../lib/weatherService';
import { toCelsius } from '../lib/weatherService';
import { useTemperatureUnit } from './TemperatureUnitProvider';

interface ForecastSectionProps {
  forecast: ForecastDay[];
}

const ForecastSection: React.FC<ForecastSectionProps> = ({ forecast }) => {
  const { tempUnit } = useTemperatureUnit();
  
  // Map condition to emoji
  const getWeatherEmoji = (condition: string) => {
    switch (condition) {
      case 'clear':
        return '☀️';
      case 'partly-cloudy':
        return '⛅';
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

  return (
    <div className="glass-card rounded-2xl p-5 w-full mt-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">5-Day Forecast</h3>
      
      <div className="divide-y divide-white/20 dark:divide-gray-700/60">
        {forecast.map((day, index) => (
          <div key={index} className={`py-3 ${index === 0 ? '' : 'pt-4'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{day.day}</div>
                <div className="text-xs text-gray-700 dark:text-gray-400">{day.date}</div>
              </div>
              
              <div className="flex-1 text-center flex flex-col items-center">
                <div className="text-2xl">{getWeatherEmoji(day.condition)}</div>
                <div className="text-xs mt-1 text-gray-700 dark:text-gray-400">
                  {formatCondition(day.condition)}
                </div>
              </div>
              
              <div className="flex-1 text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatTemperature(day.highTemp)}°{tempUnit}
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-400">
                  {formatTemperature(day.lowTemp)}°{tempUnit}
                </div>
              </div>
            </div>
            
            {/* Precipitation indicator */}
            {day.precipitation > 0 && (
              <div className="mt-2 flex items-center">
                <span className="text-xs text-blue-500 dark:text-blue-400">
                  💧 {day.precipitation}% chance of precipitation
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastSection; 