'use client';

import React, { useEffect, useState } from 'react';
import { WeatherData } from '../lib/weatherService';

export interface WeatherBackgroundProps {
  weatherData: WeatherData | null;
  children: React.ReactNode;
}

/**
 * Dynamic weather background component that changes based on current conditions and time of day
 * Creates atmospheric effects appropriate for the current weather
 */
export default function WeatherBackground({ weatherData, children }: WeatherBackgroundProps) {
  // State for animation particles
  const [particles, setParticles] = useState<React.ReactNode[]>([]);
  
  // Update particles when weather changes
  useEffect(() => {
    if (!weatherData) return;
    
    // Generate appropriate particles based on weather condition
    const newParticles = generateParticlesForWeather(weatherData);
    setParticles(newParticles);
    
    // Cleanup function
    return () => {
      setParticles([]);
    };
  }, [weatherData]);

  // Get background gradient based on weather and time
  const backgroundStyle = getBackgroundStyle(weatherData);
  
  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden transition-all duration-1000 ease-in-out"
      style={backgroundStyle}
      aria-label={weatherData ? `Weather background: ${weatherData.condition} during ${weatherData?.timeOfDay || 'day'}` : 'Loading weather background'}
    >
      {/* Weather effect particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {particles}
      </div>
      
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

/**
 * Generates animated particles appropriate for the current weather condition
 */
function generateParticlesForWeather(weatherData: WeatherData): React.ReactNode[] {
  const { condition } = weatherData;
  const particles: React.ReactNode[] = [];
  
  // Number of particles to generate
  let count = 0;
  
  // Configure particles based on condition
  switch (condition) {
    case 'rain':
      count = 50;
      for (let i = 0; i < count; i++) {
        const left = `${Math.random() * 100}%`;
        const animationDuration = 0.5 + Math.random() * 0.5; // 0.5-1s
        const animationDelay = Math.random() * 2;
        
        particles.push(
          <div 
            key={`rain-${i}`}
            className="absolute rounded-full bg-white/60"
            style={{
              left,
              top: -10,
              width: '1px',
              height: '10px',
              animation: `fall ${animationDuration}s linear ${animationDelay}s infinite`,
              opacity: 0.6 + Math.random() * 0.4
            }}
          />
        );
      }
      break;
    
    case 'snow':
      count = 30;
      for (let i = 0; i < count; i++) {
        const left = `${Math.random() * 100}%`;
        const size = 2 + Math.random() * 3; // 2-5px
        const animationDuration = 3 + Math.random() * 5; // 3-8s
        const animationDelay = Math.random() * 5;
        
        particles.push(
          <div 
            key={`snow-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left,
              top: -10,
              width: `${size}px`,
              height: `${size}px`,
              animation: `snowfall ${animationDuration}s linear ${animationDelay}s infinite`,
              opacity: 0.7 + Math.random() * 0.3
            }}
          />
        );
      }
      break;
    
    case 'cloudy':
    case 'partly-cloudy':
      count = 3;
      for (let i = 0; i < count; i++) {
        const left = `${20 + Math.random() * 60}%`;
        const top = `${10 + Math.random() * 40}%`;
        const size = 100 + Math.random() * 100; // 100-200px
        
        particles.push(
          <div 
            key={`cloud-${i}`}
            className="absolute bg-white/20 rounded-full"
            style={{
              left,
              top,
              width: `${size}px`,
              height: `${size * 0.6}px`,
              filter: 'blur(20px)',
              animation: 'float 15s ease-in-out infinite',
              animationDelay: `${i * 5}s`
            }}
          />
        );
      }
      break;
      
    default:
      // For clear days or unhandled conditions
      break;
  }
  
  return particles;
} 