'use client';

import { useState } from 'react';
import { ForecastDay } from '../lib/weatherService';
import { UserPreferences } from '../hooks/useUserPreferences';
import { toCelsius } from '../lib/weatherService';
import GlassCard from './GlassCard';
import { ForecastSkeleton } from './ui/loading';

interface WeatherForecastProps {
  forecastData: ForecastDay[];
  isLoading: boolean;
  userPreferences?: UserPreferences;
}

export default function WeatherForecast({
  forecastData,
  isLoading,
  userPreferences
}: WeatherForecastProps) {
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);
  
  // If we don't have userPreferences, create defaults
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

  // Display loading skeleton while data is loading
  if (isLoading || forecastData.length === 0) {
    return <ForecastSkeleton />;
  }

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="5" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        );
      case 'partly-cloudy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'rain':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14.5a4 4 0 00-4-4h-1a7 7 0 00-7-6c-3.866 0-7 3.134-7 7 0 1.552.5 2.986 1.362 4.147M19 14.5a4 4 0 01-4 4H8a7 7 0 01-7-7c0-1.552.5-2.986 1.362-4.147" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 19v2M12 19v2M16 19v2" />
          </svg>
        );
      case 'storm':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10l-2 5h3l-1 4" />
          </svg>
        );
      case 'snow':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 17l.5.5m.5.5l.5.5m-.5-.5l.5-.5m-.5.5l-.5-.5m-.5-.5l-.5-.5m.5.5l-.5.5m.5-.5l.5.5" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
    }
  };

  const formatTemperature = (temp: number): string => {
    const temperature = preferences.temperatureUnit === 'C' ? toCelsius(temp) : Math.round(temp);
    return `${temperature}°${preferences.temperatureUnit}`;
  };

  return (
    <GlassCard className="p-4" intensity="medium" variant="default">
      <h3 className="text-lg font-semibold text-white mb-3">5-Day Forecast</h3>
      
      <div className="space-y-3">
        {forecastData.map((day, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => setSelectedDay(selectedDay?.date === day.date ? null : day)}
          >
            <div className="w-20">
              <div className="text-white">{day.day}</div>
              <div className="text-white/70 text-sm">{day.date}</div>
            </div>
            <div className="flex-shrink-0">
              {getWeatherIcon(day.condition)}
            </div>
            <div className="text-right">
              <div className="text-white font-medium">{formatTemperature(day.highTemp)}</div>
              <div className="text-white/70">{formatTemperature(day.lowTemp)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Show hourly forecast if a day is selected */}
      {selectedDay && selectedDay.hourlyForecast && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <h4 className="text-md font-medium text-white mb-2">Hourly Forecast for {selectedDay.date}</h4>
          
          <div className="grid grid-cols-4 gap-2">
            {selectedDay.hourlyForecast.slice(0, 8).map((hour, index) => (
              <div key={index} className="bg-black/20 p-2 rounded-lg text-center">
                <div className="text-white text-sm">{hour.time}</div>
                <div className="my-1">{getWeatherIcon(hour.condition)}</div>
                <div className="text-white font-medium">{formatTemperature(hour.temperature)}</div>
                {preferences.showPrecipitation && (
                  <div className="text-blue-300 text-xs">{hour.precipitation}%</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
} 