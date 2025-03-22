'use client';

import { useState } from 'react';
import { ForecastDay, HourlyForecast, toCelsius } from '../lib/weatherService';
import { UserPreferences } from '../hooks/useUserPreferences';
import GlassCard from './GlassCard';
import { ChevronDown, ChevronUp, Sunrise, Sunset, Wind, Droplets, Sun } from 'lucide-react';

export interface ForecastSectionProps {
  forecastData: ForecastDay[];
  isLoading: boolean;
  userPreferences?: UserPreferences;
}

export default function ForecastSection({ forecastData, isLoading, userPreferences }: ForecastSectionProps) {
  // If we don't have userPreferences, create defaults for backward compatibility
  const preferences = userPreferences || {
    temperatureUnit: 'F' as const,
    showHumidity: true,
    showWindSpeed: true,
    showFeelsLike: true,
    showPrecipitation: true,
    defaultLocation: '',
    theme: 'auto' as const,
    savedLocations: []
  };
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  
  // Display loading skeleton while data is loading
  if (isLoading) {
    return (
      <GlassCard className="p-6 animate-pulse" intensity="medium" variant="info">
        <div className="h-8 bg-white/20 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-28 bg-white/20 rounded"></div>
          ))}
        </div>
      </GlassCard>
    );
  }
  
  // Helper to format temperature based on selected unit
  const formatTemp = (temp: number) => {
    return preferences.temperatureUnit === 'F' ? temp : toCelsius(temp);
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

  // Toggle expanded state for a forecast day
  const toggleExpand = (index: number) => {
    if (expandedDay === index) {
      setExpandedDay(null);
    } else {
      setExpandedDay(index);
    }
  };

  return (
    <GlassCard className="p-6" intensity="medium" variant="info">
      <h3 className="text-xl font-bold mb-4">7-Day Forecast</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {forecastData.map((day, index) => (
          <div key={index} className="flex flex-col">
            <GlassCard 
              className={`p-3 text-center ${expandedDay === index ? 'rounded-b-none' : ''}`}
              intensity="light" 
              hoverEffect={true}
              onClick={() => toggleExpand(index)}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{day.day}</div>
                <div>
                  {expandedDay === index ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="text-sm opacity-70 mb-2">{day.date}</div>
              
              <div className="text-3xl mb-2">{getWeatherIcon(day.condition)}</div>
              
              <div className="flex justify-between text-sm px-1">
                <span>High: {formatTemp(day.highTemp)}°{preferences.temperatureUnit}</span>
                <span>Low: {formatTemp(day.lowTemp)}°{preferences.temperatureUnit}</span>
              </div>
              
              <div className="mt-2 text-xs">
                {preferences.showPrecipitation && day.precipitation > 0 && (
                  <span className="inline-flex items-center">
                    <span>💧 {day.precipitation}%</span>
                  </span>
                )}
              </div>
            </GlassCard>
            
            {/* Expanded details */}
            {expandedDay === index && (
              <GlassCard 
                className="p-3 text-center rounded-t-none border-t border-white/20"
                intensity="medium"
              >
                {/* Detailed info */}
                <div className="text-sm my-2">
                  {day.description}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex items-center gap-1 justify-center">
                    <Sunrise className="h-3 w-3" />
                    <span>{day.sunrise}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Sunset className="h-3 w-3" />
                    <span>{day.sunset}</span>
                  </div>
                  {preferences.showWindSpeed && (
                    <div className="flex items-center gap-1 justify-center">
                      <Wind className="h-3 w-3" />
                      <span>{day.windSpeed} mph {day.windDirection}</span>
                    </div>
                  )}
                  {preferences.showHumidity && (
                    <div className="flex items-center gap-1 justify-center">
                      <Droplets className="h-3 w-3" />
                      <span>{day.humidity}%</span>
                    </div>
                  )}
                  {day.uvIndex && (
                    <div className="flex items-center gap-1 justify-center col-span-2">
                      <Sun className="h-3 w-3" />
                      <span>UV Index: {day.uvIndex}</span>
                    </div>
                  )}
                </div>
                
                {/* Hourly forecast */}
                {day.hourlyForecast && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold mb-2">Hourly Forecast</h4>
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                        {day.hourlyForecast.map((hour, hourIndex) => (
                          <div key={hourIndex} className="flex flex-col items-center">
                            <div className="text-xs font-medium">{hour.time}</div>
                            <div className="text-lg my-1">{getWeatherIcon(hour.condition)}</div>
                            <div className="text-xs font-medium">{formatTemp(hour.temperature)}°</div>
                            {preferences.showPrecipitation && (
                              <div className="text-xs opacity-70">{hour.precipitation}%</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
} 