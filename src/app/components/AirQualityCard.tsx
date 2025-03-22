'use client';

import React from 'react';
import { AirQualityData } from '../lib/weatherService';
import GlassCard from './GlassCard';

interface AirQualityCardProps {
  airQuality: AirQualityData | null;
  className?: string;
}

/**
 * AirQualityCard component displays air quality information
 * with a visual indicator of the quality level
 */
const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality, className = '' }) => {
  if (!airQuality) {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-2">Air Quality</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Air quality data is currently unavailable
        </p>
      </GlassCard>
    );
  }

  // Color coding for different air quality levels
  const getColorClass = (category: AirQualityData['category']) => {
    switch (category) {
      case 'good':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'unhealthyForSensitive':
        return 'bg-orange-500';
      case 'unhealthy':
        return 'bg-red-500';
      case 'veryUnhealthy':
        return 'bg-purple-500';
      case 'hazardous':
        return 'bg-red-900';
      default:
        return 'bg-gray-500';
    }
  };

  // Get variant based on air quality
  const getVariant = (category: AirQualityData['category']) => {
    switch (category) {
      case 'good':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'unhealthyForSensitive':
      case 'unhealthy':
      case 'veryUnhealthy':
      case 'hazardous':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Get a human-readable category name
  const getCategoryName = (category: AirQualityData['category']) => {
    switch (category) {
      case 'good':
        return 'Good';
      case 'moderate':
        return 'Moderate';
      case 'unhealthyForSensitive':
        return 'Unhealthy for Sensitive Groups';
      case 'unhealthy':
        return 'Unhealthy';
      case 'veryUnhealthy':
        return 'Very Unhealthy';
      case 'hazardous':
        return 'Hazardous';
      default:
        return 'Unknown';
    }
  };

  return (
    <GlassCard 
      className={`p-4 ${className}`} 
      variant={getVariant(airQuality.category)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Air Quality</h3>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getColorClass(airQuality.category)}`}></div>
          <span className="text-sm font-medium">
            {getCategoryName(airQuality.category)}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="h-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColorClass(airQuality.category)}`} 
            style={{ width: `${Math.min(100, (airQuality.index / 6) * 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>Good</span>
          <span>Moderate</span>
          <span>Unhealthy</span>
          <span>Hazardous</span>
        </div>
      </div>
      
      <p className="text-sm mb-3">{airQuality.description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">PM2.5: </span>
          <span className="font-medium">{airQuality.pm2_5} μg/m³</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">PM10: </span>
          <span className="font-medium">{airQuality.pm10} μg/m³</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">O₃: </span>
          <span className="font-medium">{airQuality.o3} ppb</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">NO₂: </span>
          <span className="font-medium">{airQuality.no2} ppb</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default AirQualityCard; 