'use client';

import { useState } from 'react';
import { WeatherData, toCelsius } from '../lib/weatherService';
import { UserPreferences } from '../hooks/useUserPreferences';
import GlassCard from './GlassCard';
import { ChevronRight, Star, X, Map } from 'lucide-react';

export interface SavedLocationCardProps {
  locationName: string;
  weatherData: WeatherData | null;
  isLoading: boolean;
  userPreferences?: UserPreferences;
  isActive?: boolean;
  onSelect: (location: string) => void;
  onRemove: (location: string) => void;
}

export default function SavedLocationCard({ 
  locationName, 
  weatherData, 
  isLoading, 
  userPreferences,
  isActive = false,
  onSelect,
  onRemove
}: SavedLocationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  // Display loading skeleton while data is loading
  if (isLoading || !weatherData) {
    return (
      <GlassCard 
        className="p-3 animate-pulse" 
        intensity="light" 
        variant="default"
        hoverEffect={false}
      >
        <div className="flex justify-between">
          <div className="h-5 bg-white/20 rounded w-3/4 mb-2"></div>
          <div className="h-5 bg-white/20 rounded-full w-5"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-7 bg-white/20 rounded w-1/4 mr-2"></div>
          <div className="h-5 bg-white/20 rounded w-1/5"></div>
        </div>
      </GlassCard>
    );
  }
  
  // Get the display temperature based on unit
  const displayTemperature = preferences.temperatureUnit === 'F' 
    ? Math.round(weatherData.temperature)
    : Math.round(toCelsius(weatherData.temperature));
  
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
  
  const handleClick = () => {
    onSelect(locationName);
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onRemove(locationName);
  };
  
  return (
    <GlassCard 
      className={`p-3 cursor-pointer ${isActive ? 'ring-2 ring-blue-400' : ''}`}
      intensity={isActive ? "medium" : "light"}
      variant={isActive ? "primary" : "default"}
      hoverEffect={true}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-semibold truncate mr-2">{locationName}</h3>
        {isActive && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl font-bold mr-1">{displayTemperature}°</span>
          <span className="text-lg">{getWeatherIcon(weatherData.condition)}</span>
        </div>
        
        {isHovered ? (
          <button 
            onClick={handleRemove}
            className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
            aria-label="Remove location"
          >
            <X size={16} className="text-red-400" />
          </button>
        ) : (
          <ChevronRight size={16} className="text-white/60" />
        )}
      </div>
    </GlassCard>
  );
} 