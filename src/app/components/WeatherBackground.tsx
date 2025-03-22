'use client';

import React, { useEffect, useState } from 'react';
import { WeatherData } from '../lib/weatherService';
import WeatherEffectsManager from './weather-effects/WeatherEffectsManager';

export interface WeatherBackgroundProps {
  weatherData: WeatherData | null;
  children: React.ReactNode;
}

/**
 * Dynamic weather background component that changes based on current conditions and time of day
 * Creates atmospheric effects appropriate for the current weather
 */
export default function WeatherBackground({ weatherData, children }: WeatherBackgroundProps) {
  // State for user preferences
  const [reducedMotion, setReducedMotion] = useState(false);
  const [effectIntensity, setEffectIntensity] = useState<'none' | 'low' | 'medium' | 'high'>('medium');
  
  // Check user preference for reduced motion
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);
    
    // Listen for changes to the preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, []);

  // Get background gradient based on weather and time
  const backgroundStyle = getBackgroundStyle(weatherData);
  
  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden transition-all duration-1000 ease-in-out"
      style={backgroundStyle}
      aria-label={weatherData ? `Weather background: ${weatherData.condition} during ${weatherData?.timeOfDay || 'day'}` : 'Loading weather background'}
    >
      {/* Weather effects */}
      <WeatherEffectsManager 
        weatherData={weatherData}
        intensity={effectIntensity}
        reducedMotion={reducedMotion}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Generates the appropriate background style based on weather conditions and time of day
 */
function getBackgroundStyle(weatherData: WeatherData | null): React.CSSProperties {
  if (!weatherData) {
    // Default loading state - blue gradient
    return {
      background: 'linear-gradient(to bottom, #1e3c72, #2a5298)'
    };
  }

  const { condition, timeOfDay = 'day' } = weatherData;
  
  // Background styles mapped to weather conditions and time of day
  const backgroundStyles: Record<string, React.CSSProperties> = {
    // Clear day/night backgrounds
    'clear-day': {
      background: 'linear-gradient(to bottom, #4facfe, #00f2fe)'
    },
    'clear-night': {
      background: 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)'
    },
    
    // Cloudy variations
    'partly-cloudy-day': {
      background: 'linear-gradient(to bottom, #6a85b6, #bac8e0)'
    },
    'partly-cloudy-night': {
      background: 'linear-gradient(to bottom, #30445c, #5b6976)'
    },
    'cloudy-day': {
      background: 'linear-gradient(to bottom, #8e9eab, #eef2f3)'
    },
    'cloudy-night': {
      background: 'linear-gradient(to bottom, #373b44, #4286f4)'
    },
    
    // Rain variations
    'rain-day': {
      background: 'linear-gradient(to bottom, #616161, #9bc5c3)'
    },
    'rain-night': {
      background: 'linear-gradient(to bottom, #232526, #414345)'
    },
    
    // Storm variations
    'storm-day': {
      background: 'linear-gradient(to bottom, #372f6a, #7474bf)'
    },
    'storm-night': {
      background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)'
    },
    
    // Snow variations
    'snow-day': {
      background: 'linear-gradient(to bottom, #e6dada, #274046)'
    },
    'snow-night': {
      background: 'linear-gradient(to bottom, #2c3e50, #3498db)'
    },
    
    // Fog variations
    'fog-day': {
      background: 'linear-gradient(to bottom, #bdc3c7, #2c3e50)'
    },
    'fog-night': {
      background: 'linear-gradient(to bottom, #4b6cb7, #182848)'
    }
  };
  
  // Create a key from condition and time of day
  const styleKey = `${condition}-${timeOfDay}`;
  
  // Return the appropriate style or a default one
  return backgroundStyles[styleKey] || backgroundStyles[`partly-cloudy-${timeOfDay}`];
} 