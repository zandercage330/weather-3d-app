'use client';

import { useTemperatureUnit } from './TemperatureUnitProvider';
import { ForecastDay, toCelsius } from '../lib/weatherService';
import GlassCard from './GlassCard';

export interface ForecastSectionProps {
  forecastData: ForecastDay[];
  isLoading: boolean;
}

export default function ForecastSection({ forecastData, isLoading }: ForecastSectionProps) {
  const { unit } = useTemperatureUnit();
  
  // Display loading skeleton while data is loading
  if (isLoading) {
    return (
      <GlassCard className="p-6 animate-pulse" intensity="medium" variant="info">
        <div className="h-8 bg-white/20 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white/20 rounded"></div>
          ))}
        </div>
      </GlassCard>
    );
  }
  
  // Helper to format temperature based on selected unit
  const formatTemp = (temp: number) => {
    return unit === 'F' ? temp : toCelsius(temp);
  };
  
  // Helper to get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
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

  return (
    <GlassCard className="p-6" intensity="medium" variant="info">
      <h3 className="text-xl font-bold mb-4">5-Day Forecast</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {forecastData.map((day, index) => (
          <GlassCard 
            key={index} 
            className="p-3 text-center" 
            intensity="light" 
            hoverEffect={true}
          >
            <div className="font-medium">{day.day}</div>
            <div className="text-sm opacity-70 mb-2">{day.date}</div>
            
            <div className="text-3xl mb-2">{getWeatherIcon(day.condition)}</div>
            
            <div className="flex justify-between text-sm px-1">
              <span>High: {formatTemp(day.highTemp)}°{unit}</span>
              <span>Low: {formatTemp(day.lowTemp)}°{unit}</span>
            </div>
            
            <div className="mt-2 text-xs">
              {day.precipitation > 0 && (
                <span className="inline-flex items-center">
                  <span>💧 {day.precipitation}%</span>
                </span>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </GlassCard>
  );
} 