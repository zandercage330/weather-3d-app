'use client';

import { useState } from 'react';
import { WeatherAlert } from '../lib/weatherService';
import GlassCard from './GlassCard';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export default function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If no alerts, don't render the component
  if (alerts.length === 0) {
    return null;
  }

  // Get the highest severity alert for the header
  const highestSeverityAlert = [...alerts].sort((a, b) => {
    const severityOrder = {
      'Extreme': 3,
      'Severe': 2,
      'Moderate': 1,
      'Minor': 0
    };
    return severityOrder[b.severity] - severityOrder[a.severity];
  })[0];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme':
        return 'text-red-500';
      case 'Severe':
        return 'text-orange-500';
      case 'Moderate':
        return 'text-yellow-500';
      case 'Minor':
      default:
        return 'text-blue-500';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'Extreme':
        return 'bg-red-500/10';
      case 'Severe':
        return 'bg-orange-500/10';
      case 'Moderate':
        return 'bg-yellow-500/10';
      case 'Minor':
      default:
        return 'bg-blue-500/10';
    }
  };

  return (
    <GlassCard className="p-4" intensity="light" variant="danger">
      <div className="flex flex-col">
        {/* Header with alert count and toggle */}
        <div 
          className="flex justify-between items-center cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <div className={`mr-3 p-2 rounded-full ${getSeverityBg(highestSeverityAlert.severity)}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getSeverityColor(highestSeverityAlert.severity)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Weather Alerts</h3>
              <p className="text-sm text-white/70">
                {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} in effect
              </p>
            </div>
          </div>
          <button className="text-white/80 hover:text-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {/* Alert details when expanded */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-3 rounded ${getSeverityBg(alert.severity)} border border-${getSeverityColor(alert.severity).replace('text-', '')}/20`}
              >
                <div className="flex items-start">
                  <div className={`mt-0.5 mr-2 ${getSeverityColor(alert.severity)}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{alert.eventType}</h4>
                    <p className="text-sm text-white/80">{alert.headline}</p>
                    <div className="flex mt-1 text-xs text-white/60">
                      <span className="mr-2">{alert.area}</span>
                      <span className={`${getSeverityColor(alert.severity)}`}>{alert.severity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
} 