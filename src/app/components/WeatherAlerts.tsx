'use client';

import { useState, useEffect } from 'react';
import { getWeatherAlerts } from '../lib/weatherService';
import GlassCard from './GlassCard';

export interface WeatherAlert {
  eventType: string;
  area: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  headline: string;
}

interface WeatherAlertsProps {
  stateCode: string;
}

export default function WeatherAlerts({ stateCode }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      setIsLoading(true);
      try {
        const alertsData = await getWeatherAlerts(stateCode);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching weather alerts:', error);
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
  }, [stateCode]);

  if (isLoading) {
    return (
      <GlassCard className="p-4 animate-pulse" intensity="medium" variant="warning">
        <div className="h-8 bg-white/20 rounded mb-4"></div>
        <div className="h-20 bg-white/20 rounded"></div>
      </GlassCard>
    );
  }

  if (alerts.length === 0) {
    return (
      <GlassCard className="p-4" intensity="medium" variant="warning">
        <h3 className="text-xl font-semibold mb-2">Weather Alerts</h3>
        <p className="text-green-300">No active weather alerts for this area.</p>
      </GlassCard>
    );
  }

  // Function to get appropriate color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minor':
        return 'bg-yellow-500/50';
      case 'Moderate':
        return 'bg-orange-500/50';
      case 'Severe':
        return 'bg-red-500/50';
      case 'Extreme':
        return 'bg-purple-700/70';
      default:
        return 'bg-yellow-500/50';
    }
  };

  return (
    <GlassCard className="p-4" intensity="medium" variant="warning">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">Weather Alerts</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-300 hover:text-blue-100 transition-colors"
        >
          {isExpanded ? 'Show Less' : 'Show All'}
        </button>
      </div>
      
      <div className="space-y-3">
        {(isExpanded ? alerts : alerts.slice(0, 2)).map((alert, index) => (
          <div 
            key={index} 
            className={`rounded-md p-3 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex justify-between">
              <span className="font-bold">{alert.eventType}</span>
              <span className="text-sm px-2 py-1 bg-black/20 rounded-full">
                {alert.severity}
              </span>
            </div>
            <p className="text-sm font-medium mt-1">{alert.area}</p>
            <p className="text-sm mt-2">{alert.headline}</p>
          </div>
        ))}
      </div>
      
      {!isExpanded && alerts.length > 2 && (
        <p className="text-center text-sm mt-2 text-blue-300">
          + {alerts.length - 2} more alerts
        </p>
      )}
    </GlassCard>
  );
} 