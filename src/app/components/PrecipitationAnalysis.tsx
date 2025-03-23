'use client';

import { useState } from 'react';
import { ForecastDay, HourlyForecast } from '../lib/weatherService';
import { UserPreferences } from '../hooks/useUserPreferences';
import GlassCard from './GlassCard';

interface PrecipitationAnalysisProps {
  forecastData: ForecastDay[];
  userPreferences?: UserPreferences;
}

export default function PrecipitationAnalysis({ forecastData, userPreferences }: PrecipitationAnalysisProps) {
  const [activeView, setActiveView] = useState<'overview' | 'hourly' | 'types'>('overview');
  
  // Default preferences if not provided
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

  // Extract hourly precipitation data from forecast
  const hourlyPrecipitation = forecastData
    .slice(0, 3) // Use first 3 days
    .flatMap(day => day.hourlyForecast || [])
    .filter(hour => hour); // Filter out undefined entries
  
  // Calculate precipitation stats
  const calculatePrecipStats = () => {
    if (hourlyPrecipitation.length === 0) {
      return { maxPrecip: 0, totalPrecip: 0, avgPrecip: 0, precipHours: 0 };
    }
    
    let totalPrecip = 0;
    let precipHours = 0;
    let maxPrecip = 0;
    
    hourlyPrecipitation.forEach(hour => {
      const precipAmount = hour.precipitationAmount || 0;
      totalPrecip += precipAmount;
      if (precipAmount > 0) precipHours++;
      if (precipAmount > maxPrecip) maxPrecip = precipAmount;
    });
    
    return {
      maxPrecip,
      totalPrecip,
      avgPrecip: precipHours > 0 ? totalPrecip / precipHours : 0,
      precipHours
    };
  };
  
  const precipStats = calculatePrecipStats();
  
  // Calculate precipitation by type
  const calculatePrecipByType = () => {
    const types: Record<string, number> = { rain: 0, snow: 0, sleet: 0, mixed: 0 };
    
    hourlyPrecipitation.forEach(hour => {
      const type = hour.precipitationType || 'rain';
      const amount = hour.precipitationAmount || 0;
      if (type !== 'none' && amount > 0) {
        types[type] += amount;
      }
    });
    
    return types;
  };
  
  const precipByType = calculatePrecipByType();
  
  // Function to get intensity label
  const getPrecipIntensity = (amount: number) => {
    if (amount === 0) return { label: 'None', color: 'text-gray-400' };
    if (amount < 0.5) return { label: 'Light', color: 'text-blue-300' };
    if (amount < 2) return { label: 'Moderate', color: 'text-blue-500' };
    if (amount < 5) return { label: 'Heavy', color: 'text-blue-700' };
    return { label: 'Extreme', color: 'text-indigo-500' };
  };
  
  // No precipitation data available
  if (hourlyPrecipitation.length === 0) {
    return (
      <GlassCard className="p-4" intensity="light" variant="default">
        <h3 className="text-lg font-semibold text-white mb-2">Precipitation Analysis</h3>
        <div className="flex items-center justify-center h-32 text-white/70">
          No precipitation data available
        </div>
      </GlassCard>
    );
  }
  
  return (
    <GlassCard className="p-4" intensity="light" variant="default">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Precipitation Analysis</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-2 py-1 rounded text-xs ${activeView === 'overview' ? 'bg-blue-500/30 text-blue-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('hourly')}
            className={`px-2 py-1 rounded text-xs ${activeView === 'hourly' ? 'bg-blue-500/30 text-blue-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Hourly
          </button>
          <button
            onClick={() => setActiveView('types')}
            className={`px-2 py-1 rounded text-xs ${activeView === 'types' ? 'bg-blue-500/30 text-blue-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            Types
          </button>
        </div>
      </div>
      
      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="space-y-4">
          <div className="bg-black/20 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/70 text-xs mb-1">Total Precipitation</div>
                <div className="text-white text-2xl font-bold">{precipStats.totalPrecip.toFixed(1)} mm</div>
              </div>
              <div>
                <div className="text-white/70 text-xs mb-1">Precipitation Hours</div>
                <div className="text-white text-2xl font-bold">{precipStats.precipHours} hrs</div>
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 p-3 rounded-lg">
            <div className="text-white/70 text-xs mb-1">Precipitation Chance (72 hours)</div>
            <div className="relative h-10 mt-2">
              <div className="absolute inset-0 flex">
                {hourlyPrecipitation.slice(0, 24).map((hour, idx) => (
                  <div 
                    key={idx} 
                    className="flex-1"
                    title={`${hour.time}: ${hour.precipitation}%`}
                  >
                    <div 
                      className="h-full bg-blue-500/80" 
                      style={{ height: `${hour.precipitation}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>Now</span>
              <span>24h</span>
              <span>48h</span>
              <span>72h</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Peak Intensity</div>
              <div className={`text-lg font-bold ${getPrecipIntensity(precipStats.maxPrecip).color}`}>
                {getPrecipIntensity(precipStats.maxPrecip).label}
              </div>
              <div className="text-white/70 text-xs mt-1">
                {precipStats.maxPrecip.toFixed(1)} mm/h max
              </div>
            </div>
            
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Predominant Type</div>
              <div className="text-lg font-bold text-white capitalize">
                {Object.entries(precipByType).sort((a, b) => b[1] - a[1])[0][0]}
              </div>
              <div className="text-white/70 text-xs mt-1">
                {Math.round((Object.entries(precipByType).sort((a, b) => b[1] - a[1])[0][1] / precipStats.totalPrecip) * 100)}% of total
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hourly View */}
      {activeView === 'hourly' && (
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-white/90 text-sm">
              <thead className="text-white/70 text-xs">
                <tr>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Chance</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {hourlyPrecipitation.slice(0, 12).map((hour, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-black/10' : ''}>
                    <td className="p-2">{hour.time}</td>
                    <td className="p-2">{hour.precipitation}%</td>
                    <td className="p-2">{hour.precipitationAmount || 0} mm</td>
                    <td className="p-2 capitalize">{hour.precipitationType || 'none'}</td>
                    <td className={`p-2 ${getPrecipIntensity(hour.precipitationAmount || 0).color}`}>
                      {getPrecipIntensity(hour.precipitationAmount || 0).label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center text-white/50 text-xs">
            Showing next 12 hours • Scroll for more →
          </div>
        </div>
      )}
      
      {/* Types View */}
      {activeView === 'types' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(precipByType).map(([type, amount]) => (
              <div key={type} className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1 capitalize">{type}</div>
                <div className="text-white text-lg font-bold">{amount.toFixed(1)} mm</div>
                <div className="text-white/70 text-xs mt-1">
                  {amount > 0 
                    ? `${Math.round((amount / precipStats.totalPrecip) * 100)}% of total`
                    : 'None expected'}
                </div>
              </div>
            ))}
          </div>
          
          {/* Precipitation type distribution bar */}
          <div className="bg-black/20 p-3 rounded-lg">
            <div className="text-white/70 text-xs mb-2">Precipitation Type Distribution</div>
            <div className="w-full h-6 flex rounded-lg overflow-hidden">
              {Object.entries(precipByType)
                .filter(([_, amount]) => amount > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([type, amount], idx) => {
                  // Generate a color based on the type
                  const colors = {
                    rain: 'bg-blue-500',
                    snow: 'bg-indigo-200',
                    sleet: 'bg-purple-500',
                    mixed: 'bg-violet-500'
                  };
                  const percentage = (amount / precipStats.totalPrecip) * 100;
                  return (
                    <div
                      key={idx}
                      className={`${colors[type as keyof typeof colors]} h-full`}
                      style={{ width: `${percentage}%` }}
                      title={`${type}: ${percentage.toFixed(1)}%`}
                    ></div>
                  );
                })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(precipByType)
                .filter(([_, amount]) => amount > 0)
                .map(([type, amount], idx) => {
                  const colors = {
                    rain: 'bg-blue-500',
                    snow: 'bg-indigo-200',
                    sleet: 'bg-purple-500',
                    mixed: 'bg-violet-500'
                  };
                  return (
                    <div key={idx} className="flex items-center">
                      <div className={`w-3 h-3 ${colors[type as keyof typeof colors]} rounded-sm mr-1`}></div>
                      <span className="text-white/70 text-xs capitalize">{type}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
} 