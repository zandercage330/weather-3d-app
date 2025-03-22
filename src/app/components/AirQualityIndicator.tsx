'use client';

import { AirQualityData } from '../lib/weatherService';
import GlassCard from './GlassCard';

interface AirQualityIndicatorProps {
  airQuality: AirQualityData;
}

export default function AirQualityIndicator({ airQuality }: AirQualityIndicatorProps) {
  const getCategoryColor = (category: string) => {
    switch(category) {
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
        return 'bg-rose-900';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch(category) {
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
    <GlassCard className="p-4" intensity="light" variant="default">
      <h3 className="text-lg font-semibold text-white mb-2">Air Quality</h3>
      
      <div className="flex items-center mb-3">
        <div className={`h-10 w-10 rounded-full ${getCategoryColor(airQuality.category)} flex items-center justify-center text-white font-bold`}>
          {airQuality.index}
        </div>
        <div className="ml-3">
          <div className="text-white font-medium">{getCategoryLabel(airQuality.category)}</div>
          <div className="text-white/70 text-sm">{airQuality.description}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-black/20 p-2 rounded">
          <div className="text-xs text-white/70">PM2.5</div>
          <div className="text-white font-medium">{airQuality.pm2_5} μg/m³</div>
        </div>
        <div className="bg-black/20 p-2 rounded">
          <div className="text-xs text-white/70">PM10</div>
          <div className="text-white font-medium">{airQuality.pm10} μg/m³</div>
        </div>
        <div className="bg-black/20 p-2 rounded">
          <div className="text-xs text-white/70">Ozone</div>
          <div className="text-white font-medium">{airQuality.o3} ppb</div>
        </div>
        <div className="bg-black/20 p-2 rounded">
          <div className="text-xs text-white/70">NO₂</div>
          <div className="text-white font-medium">{airQuality.no2} ppb</div>
        </div>
      </div>
    </GlassCard>
  );
} 