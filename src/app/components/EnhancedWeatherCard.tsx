'use client';

import { useState } from 'react';
import { WeatherData, toCelsius } from '../lib/weatherService';
import { UserPreferences } from '../hooks/useUserPreferences';
import GlassCard from './GlassCard';

export interface EnhancedWeatherCardProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  userPreferences?: UserPreferences;
}

export default function EnhancedWeatherCard({ weatherData, isLoading, userPreferences }: EnhancedWeatherCardProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'details' | 'historical'>('main');
  
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
      <GlassCard className="p-6 animate-pulse" intensity="medium" variant="primary">
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
      </GlassCard>
    );
  }
  
  // Get the display temperature based on unit
  const displayTemperature = preferences.temperatureUnit === 'F' 
    ? weatherData.temperature 
    : toCelsius(weatherData.temperature);
    
  // Get the feels like temp based on unit
  const feelsLikeTemp = calculateFeelsLikeTemp(weatherData);
  const displayFeelsLike = preferences.temperatureUnit === 'F' 
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

  // Get color coding for UV index
  const getUVIndexColor = (index: number) => {
    if (index <= 2) return 'text-green-400'; // Low
    if (index <= 5) return 'text-yellow-400'; // Moderate
    if (index <= 7) return 'text-orange-400'; // High
    if (index <= 10) return 'text-red-500'; // Very High
    return 'text-purple-500'; // Extreme
  };
  
  // Get UV index risk level
  const getUVIndexRisk = (index: number) => {
    if (index <= 2) return 'Low';
    if (index <= 5) return 'Moderate';
    if (index <= 7) return 'High';
    if (index <= 10) return 'Very High';
    return 'Extreme';
  };

  // Get air quality label
  const getAirQualityLabel = (index: number) => {
    if (index <= 50) return 'Good';
    if (index <= 100) return 'Moderate';
    if (index <= 150) return 'Unhealthy for Sensitive Groups';
    if (index <= 200) return 'Unhealthy';
    if (index <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Get air quality color
  const getAirQualityColor = (index: number) => {
    if (index <= 50) return 'text-green-400';
    if (index <= 100) return 'text-yellow-400';
    if (index <= 150) return 'text-orange-400';
    if (index <= 200) return 'text-red-500';
    if (index <= 300) return 'text-purple-500';
    return 'text-purple-900';
  };

  // Calculate historic comparison (would normally come from API, using mock data here)
  const getHistoricalComparison = () => {
    const avgTemp = displayTemperature - Math.floor(Math.random() * 7) + Math.floor(Math.random() * 7);
    const recordHigh = displayTemperature + Math.floor(Math.random() * 15) + 5;
    const recordLow = displayTemperature - Math.floor(Math.random() * 15) - 5;
    
    return {
      averageTemp: avgTemp,
      recordHigh,
      recordLow,
      comparedToAvg: displayTemperature - avgTemp
    };
  };

  const historical = getHistoricalComparison();

  return (
    <GlassCard className="p-6" intensity="medium" variant="primary">
      {/* Header with location and tabs */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{weatherData.location}</h2>
          <p className="text-sm opacity-80">{dateTimeString}</p>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => setActiveTab('main')}
            className={`px-2 py-1 rounded text-sm ${activeTab === 'main' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Main
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-2 py-1 rounded text-sm ${activeTab === 'details' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Details
          </button>
          <button 
            onClick={() => setActiveTab('historical')}
            className={`px-2 py-1 rounded text-sm ${activeTab === 'historical' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            History
          </button>
        </div>
      </div>
      
      {/* Main Tab Content */}
      {activeTab === 'main' && (
        <>
          <div className="flex items-center mb-4">
            <div className="text-6xl font-bold mr-4">{displayTemperature}°{preferences.temperatureUnit}</div>
            <div className="text-4xl">{getWeatherIcon(weatherData.condition)}</div>
          </div>
          
          <div className="capitalize text-xl mb-5">
            {weatherData.condition.replace('-', ' ')}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {preferences.showFeelsLike && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">Feels Like</div>
                <div className="text-white text-lg font-bold">{displayFeelsLike}°{preferences.temperatureUnit}</div>
              </div>
            )}
            
            {preferences.showHumidity && weatherData.humidity !== undefined && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">Humidity</div>
                <div className="text-white text-lg font-bold">{weatherData.humidity}%</div>
              </div>
            )}
            
            {preferences.showWindSpeed && weatherData.windSpeed !== undefined && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">Wind</div>
                <div className="text-white text-lg font-bold">{weatherData.windSpeed} mph</div>
              </div>
            )}
            
            {preferences.showPrecipitation && weatherData.precipitation !== undefined && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">Precipitation</div>
                <div className="text-white text-lg font-bold">{weatherData.precipitation}%</div>
              </div>
            )}
            
            {weatherData.uvIndex !== undefined && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">UV Index</div>
                <div className={`${getUVIndexColor(weatherData.uvIndex)} text-lg font-bold`}>
                  {weatherData.uvIndex} - {getUVIndexRisk(weatherData.uvIndex)}
                </div>
              </div>
            )}
            
            {weatherData.airQuality && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">Air Quality</div>
                <div className={`${getAirQualityColor(weatherData.airQuality.index)} text-lg font-bold`}>
                  {getAirQualityLabel(weatherData.airQuality.index)}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Details Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-2 gap-3">
          {/* Cloud cover */}
          {weatherData.cloudCover !== undefined && (
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Cloud Cover</div>
              <div className="text-white text-lg font-bold">{Math.round(weatherData.cloudCover * 100)}%</div>
              <div className="h-1.5 w-full bg-white/10 rounded-full mt-2">
                <div 
                  className="h-1.5 bg-white/40 rounded-full" 
                  style={{ width: `${Math.round(weatherData.cloudCover * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* UV Index */}
          {weatherData.uvIndex !== undefined && (
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">UV Index</div>
              <div className={`${getUVIndexColor(weatherData.uvIndex)} text-lg font-bold flex items-center`}>
                {weatherData.uvIndex}
                <span className="text-xs ml-2 font-normal">{getUVIndexRisk(weatherData.uvIndex)}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full mt-2">
                <div 
                  className={`h-1.5 rounded-full ${getUVIndexColor(weatherData.uvIndex).replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(100, weatherData.uvIndex * 8)}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Air Quality - full details */}
          {weatherData.airQuality && (
            <div className="bg-black/20 p-3 rounded-lg col-span-2">
              <div className="text-white/70 text-xs mb-1">Air Quality</div>
              <div className="flex justify-between items-center">
                <div className={`${getAirQualityColor(weatherData.airQuality.index)} text-lg font-bold`}>
                  {weatherData.airQuality.index} - {getAirQualityLabel(weatherData.airQuality.index)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <div className="text-white/70 text-xs">PM2.5</div>
                  <div className="text-white text-sm">{weatherData.airQuality.pm2_5} μg/m³</div>
                </div>
                <div>
                  <div className="text-white/70 text-xs">PM10</div>
                  <div className="text-white text-sm">{weatherData.airQuality.pm10} μg/m³</div>
                </div>
                <div>
                  <div className="text-white/70 text-xs">Ozone</div>
                  <div className="text-white text-sm">{weatherData.airQuality.o3} ppb</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Historical Tab Content */}
      {activeTab === 'historical' && (
        <div className="space-y-4">
          <div className="flex items-center justify-center mt-2 mb-6">
            <div className="text-6xl font-bold mr-4">{displayTemperature}°{preferences.temperatureUnit}</div>
            <div className="text-4xl">{getWeatherIcon(weatherData.condition)}</div>
          </div>
          
          <div className="bg-black/20 p-3 rounded-lg">
            <div className="text-white/70 text-xs mb-1">Today vs. Average</div>
            <div className="flex items-center">
              <div className="text-white text-lg font-bold">
                {historical.averageTemp}° avg
              </div>
              <div className={`text-sm ml-2 ${historical.comparedToAvg > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                {historical.comparedToAvg > 0 ? '+' : ''}{historical.comparedToAvg}° {historical.comparedToAvg > 0 ? 'warmer' : 'cooler'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Record High</div>
              <div className="text-white text-lg font-bold">
                {historical.recordHigh}°{preferences.temperatureUnit}
              </div>
              <div className="text-red-400 text-xs mt-0.5">
                {historical.recordHigh - displayTemperature}° warmer
              </div>
            </div>
            
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Record Low</div>
              <div className="text-white text-lg font-bold">
                {historical.recordLow}°{preferences.temperatureUnit}
              </div>
              <div className="text-blue-400 text-xs mt-0.5">
                {displayTemperature - historical.recordLow}° cooler
              </div>
            </div>
          </div>
          
          {/* Visual temperature graph placeholder (simplified) */}
          <div className="bg-black/20 p-3 rounded-lg mt-4">
            <div className="text-white/70 text-xs mb-3">Temperature Range</div>
            <div className="relative h-8 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 rounded-lg">
              {/* Record low marker */}
              <div className="absolute bottom-full left-0 text-xs text-blue-400 mb-1">
                {historical.recordLow}°
              </div>
              
              {/* Average marker */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 text-xs text-white/70 mb-1">
                {historical.averageTemp}°
              </div>
              
              {/* Record high marker */}
              <div className="absolute bottom-full right-0 text-xs text-red-400 mb-1">
                {historical.recordHigh}°
              </div>
              
              {/* Current temperature marker */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white"
                style={{ 
                  left: `${Math.round(((displayTemperature - historical.recordLow) / (historical.recordHigh - historical.recordLow)) * 100)}%`,
                  transform: 'translateX(-50%)'
                }}
              ></div>
              <div 
                className="absolute top-full text-xs text-white font-medium"
                style={{ 
                  left: `${Math.round(((displayTemperature - historical.recordLow) / (historical.recordHigh - historical.recordLow)) * 100)}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                Now
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// Helper function to calculate feels like temperature
function calculateFeelsLikeTemp(data: WeatherData): number {
  // Basic feels like calculation - in reality would use heat index, wind chill, etc.
  const temp = data.temperature;
  const humidity = data.humidity || 0;
  const windSpeed = data.windSpeed || 0;
  
  if (temp >= 80 && humidity > 40) {
    // Heat index calculation (simplified)
    return Math.round(temp + (humidity - 40) / 10);
  } else if (temp <= 50 && windSpeed > 3) {
    // Wind chill calculation (simplified)
    return Math.round(temp - (windSpeed / 5));
  }
  
  return temp;
} 