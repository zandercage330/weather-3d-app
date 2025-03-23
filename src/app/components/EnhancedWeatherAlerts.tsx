'use client';

import { useState } from 'react';
import { WeatherAlert } from '../lib/weatherService';
import GlassCard from './GlassCard';

interface EnhancedWeatherAlertsProps {
  alerts: WeatherAlert[];
}

export default function EnhancedWeatherAlerts({ alerts }: EnhancedWeatherAlertsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAlertIndex, setSelectedAlertIndex] = useState<number | null>(null);

  // If no alerts, show the all-clear message instead of nothing
  if (alerts.length === 0) {
    return (
      <GlassCard className="p-4" intensity="light" variant="success">
        <div className="flex items-center">
          <div className="mr-3 p-2 rounded-full bg-green-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">All Clear</h3>
            <p className="text-sm text-white/70">
              No severe weather alerts are currently in effect for your area
            </p>
          </div>
        </div>
      </GlassCard>
    );
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

  const getImpactLevelLabel = (level?: string) => {
    if (!level) return null;
    
    switch (level) {
      case 'extreme':
        return { text: 'Extreme Impact', color: 'text-red-500' };
      case 'major':
        return { text: 'Major Impact', color: 'text-orange-500' };
      case 'moderate':
        return { text: 'Moderate Impact', color: 'text-yellow-500' };
      case 'minor':
        return { text: 'Minor Impact', color: 'text-blue-400' };
      case 'minimal':
      default:
        return { text: 'Minimal Impact', color: 'text-green-500' };
    }
  };

  const getCertaintyLabel = (certainty?: string) => {
    if (!certainty) return null;
    
    switch (certainty) {
      case 'observed':
        return { text: 'Observed', color: 'text-red-500' };
      case 'likely':
        return { text: 'Likely', color: 'text-orange-500' };
      case 'possible':
        return { text: 'Possible', color: 'text-yellow-500' };
      case 'unlikely':
      default:
        return { text: 'Unlikely', color: 'text-blue-500' };
    }
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getGenericSafetyInstructions = (eventType: string) => {
    const instructions: Record<string, string> = {
      'Tornado Warning': 'Seek shelter immediately in a basement or interior room on the lowest floor. Stay away from windows and cover your head.',
      'Flash Flood': 'Move to higher ground immediately. Do not walk, swim, or drive through flood waters.',
      'Severe Thunderstorm': 'Go indoors, stay away from windows, unplug appliances, and avoid using corded phones.',
      'Hurricane Warning': 'Evacuate if instructed to do so. Otherwise, stay indoors away from windows and brace for power outages.',
      'Winter Storm': 'Avoid travel. If stranded in a vehicle, stay inside. Keep emergency supplies and warm clothing on hand.',
      'Extreme Heat': 'Stay in air-conditioned spaces. Drink plenty of fluids. Avoid strenuous activities during peak sun hours.',
      'High Wind': 'Secure outdoor items. Stay away from windows. Be cautious when driving high-profile vehicles.',
    };
    
    // Match partial event types
    for (const key in instructions) {
      if (eventType.toLowerCase().includes(key.toLowerCase())) {
        return instructions[key];
      }
    }
    
    return 'Stay informed via local media. Follow instructions from local authorities and be prepared to take action if conditions worsen.';
  };

  return (
    <GlassCard className={`p-4 ${selectedAlertIndex !== null ? 'relative' : ''}`} intensity="light" variant="danger">
      {/* Alert list view */}
      {selectedAlertIndex === null && (
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
                <div className="flex items-center">
                  <h3 className="font-semibold text-white mr-2">Weather Alerts</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBg(highestSeverityAlert.severity)} ${getSeverityColor(highestSeverityAlert.severity)}`}>
                    {highestSeverityAlert.severity}
                  </span>
                </div>
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

          {/* Alert summary badges - always visible even when collapsed */}
          <div className="flex flex-wrap gap-2 mt-3">
            {alerts.map((alert, index) => (
              <button
                key={index}
                className={`px-2 py-1 rounded-full ${getSeverityBg(alert.severity)} ${getSeverityColor(alert.severity)} text-xs font-medium transition-colors hover:opacity-80`}
                onClick={() => setSelectedAlertIndex(index)}
              >
                {alert.eventType}
              </button>
            ))}
          </div>

          {/* Alert details when expanded */}
          {isExpanded && (
            <div className="mt-4 space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded cursor-pointer transition-colors hover:bg-white/10 ${getSeverityBg(alert.severity)} border border-${getSeverityColor(alert.severity).replace('text-', '')}/20`}
                  onClick={() => setSelectedAlertIndex(index)}
                >
                  <div className="flex items-start">
                    <div className={`mt-1 mr-2 ${getSeverityColor(alert.severity)}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{alert.eventType}</h4>
                        <div className={`ml-2 text-xs ${getSeverityColor(alert.severity)} px-2 py-0.5 rounded-full ${getSeverityBg(alert.severity)}`}>
                          {alert.severity}
                        </div>
                      </div>
                      <p className="text-sm text-white/90 mt-1">{alert.headline}</p>
                      
                      <div className="flex flex-wrap gap-x-4 mt-2 text-xs text-white/70">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {alert.area}
                        </span>
                        
                        {alert.startTime && (
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDateTime(alert.startTime)}
                          </span>
                        )}
                        
                        {alert.impactLevel && getImpactLevelLabel(alert.impactLevel) && (
                          <span className={`${getImpactLevelLabel(alert.impactLevel)?.color}`}>
                            {getImpactLevelLabel(alert.impactLevel)?.text}
                          </span>
                        )}
                      </div>
                      
                      <button 
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlertIndex(index);
                        }}
                      >
                        View details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Detailed single alert view */}
      {selectedAlertIndex !== null && (
        <div className="animate-fade-in">
          {/* Back button */}
          <button 
            className="absolute top-3 left-3 p-1 rounded-full bg-black/20 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedAlertIndex(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="pt-8 pb-2">
            {/* Alert header */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(alerts[selectedAlertIndex].severity)}`}></span>
                {alerts[selectedAlertIndex].eventType}
              </h3>
              <span className={`text-sm ${getSeverityColor(alerts[selectedAlertIndex].severity)} px-2 py-0.5 rounded-full ${getSeverityBg(alerts[selectedAlertIndex].severity)}`}>
                {alerts[selectedAlertIndex].severity}
              </span>
            </div>
            
            {/* Alert headline */}
            <p className="text-white/90 font-medium mb-4">
              {alerts[selectedAlertIndex].headline}
            </p>
            
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/20 p-2 rounded">
                <div className="text-white/50 text-xs mb-1">Location</div>
                <div className="text-white text-sm">{alerts[selectedAlertIndex].area}</div>
              </div>
              
              <div className="bg-black/20 p-2 rounded">
                <div className="text-white/50 text-xs mb-1">Source</div>
                <div className="text-white text-sm">{alerts[selectedAlertIndex].source || 'National Weather Service'}</div>
              </div>
              
              {alerts[selectedAlertIndex].startTime && (
                <div className="bg-black/20 p-2 rounded">
                  <div className="text-white/50 text-xs mb-1">Starts</div>
                  <div className="text-white text-sm">{formatDateTime(alerts[selectedAlertIndex].startTime)}</div>
                </div>
              )}
              
              {alerts[selectedAlertIndex].endTime && (
                <div className="bg-black/20 p-2 rounded">
                  <div className="text-white/50 text-xs mb-1">Ends</div>
                  <div className="text-white text-sm">{formatDateTime(alerts[selectedAlertIndex].endTime)}</div>
                </div>
              )}
              
              {alerts[selectedAlertIndex].certainty && (
                <div className="bg-black/20 p-2 rounded">
                  <div className="text-white/50 text-xs mb-1">Certainty</div>
                  <div className={`text-sm ${getCertaintyLabel(alerts[selectedAlertIndex].certainty)?.color}`}>
                    {getCertaintyLabel(alerts[selectedAlertIndex].certainty)?.text}
                  </div>
                </div>
              )}
              
              {alerts[selectedAlertIndex].impactLevel && (
                <div className="bg-black/20 p-2 rounded">
                  <div className="text-white/50 text-xs mb-1">Impact Level</div>
                  <div className={`text-sm ${getImpactLevelLabel(alerts[selectedAlertIndex].impactLevel)?.color}`}>
                    {getImpactLevelLabel(alerts[selectedAlertIndex].impactLevel)?.text}
                  </div>
                </div>
              )}
              
              {alerts[selectedAlertIndex].updateTime && (
                <div className="bg-black/20 p-2 rounded">
                  <div className="text-white/50 text-xs mb-1">Last Updated</div>
                  <div className="text-white text-sm">{formatDateTime(alerts[selectedAlertIndex].updateTime)}</div>
                </div>
              )}
            </div>
            
            {/* Detailed description */}
            {alerts[selectedAlertIndex].description && (
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Description</h4>
                <p className="text-white/80 text-sm bg-black/20 p-3 rounded leading-relaxed">
                  {alerts[selectedAlertIndex].description}
                </p>
              </div>
            )}
            
            {/* Safety instructions */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Safety Instructions</h4>
              <div className="bg-black/20 p-3 rounded border-l-2 border-yellow-500">
                <p className="text-white/90 text-sm leading-relaxed">
                  {alerts[selectedAlertIndex].instruction || 
                   getGenericSafetyInstructions(alerts[selectedAlertIndex].eventType)}
                </p>
              </div>
            </div>
            
            {/* Historical context if available */}
            {alerts[selectedAlertIndex].historicalContext && (
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Historical Context</h4>
                <div className="bg-black/20 p-3 rounded">
                  <p className="text-white/80 text-sm italic leading-relaxed">
                    {alerts[selectedAlertIndex].historicalContext}
                  </p>
                </div>
              </div>
            )}
            
            {/* Affected areas */}
            {alerts[selectedAlertIndex].affectedAreas && alerts[selectedAlertIndex].affectedAreas.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Affected Areas</h4>
                <div className="bg-black/20 p-3 rounded">
                  <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
                    {alerts[selectedAlertIndex].affectedAreas.map((area, i) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
} 