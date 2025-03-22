'use client';

import React, { useEffect, useState, useRef } from 'react';
import { WeatherData } from '../../lib/weatherService';
import RainEffect from './RainEffect';
import SnowEffect from './SnowEffect';
import LightningEffect from './LightningEffect';
import FogEffect from './FogEffect';
import CloudEffect from './CloudEffect';
import SunRaysEffect from './SunRaysEffect';
import StarsEffect from './StarsEffect';

// Weather effect intensity levels
export type EffectIntensity = 'none' | 'low' | 'medium' | 'high';

export interface WeatherEffectsProps {
  weatherData: WeatherData | null;
  intensity?: EffectIntensity;
  reducedMotion?: boolean;
}

/**
 * Manager component that coordinates weather effects based on current conditions
 * Controls which effects are active and their intensity
 */
export default function WeatherEffectsManager({ 
  weatherData, 
  intensity = 'medium',
  reducedMotion = false
}: WeatherEffectsProps) {
  // Track if component is mounted to prevent memory leaks
  const isMounted = useRef(true);
  
  // Performance monitoring
  const fpsRef = useRef(0);
  const frameTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  
  // State for active effects
  const [activeEffects, setActiveEffects] = useState<React.ReactNode[]>([]);
  
  // Determine which effects should be active based on weather conditions
  useEffect(() => {
    if (!weatherData || reducedMotion) {
      setActiveEffects([]);
      return;
    }
    
    // Function to generate appropriate effects
    const generateEffects = () => {
      const { condition, precipitation = 0, windSpeed = 0, humidity = 50, temperature } = weatherData;
      const effects: React.ReactNode[] = [];
      
      // Calculate actual intensity based on device performance
      const actualIntensity = calculateActualIntensity(intensity);
      
      switch (condition) {
        case 'rain':
          // Add rain effect with intensity based on precipitation
          effects.push(
            <RainEffect 
              key="rain"
              intensity={actualIntensity} 
              precipitation={precipitation}
              windSpeed={windSpeed}
            />
          );
          break;
          
        case 'snow':
          // Add snow effect with intensity based on precipitation
          effects.push(
            <SnowEffect 
              key="snow"
              intensity={actualIntensity} 
              precipitation={precipitation}
              windSpeed={windSpeed}
              temperature={temperature}
            />
          );
          break;
          
        case 'storm':
          // Add rain and lightning effects
          effects.push(
            <RainEffect 
              key="rain"
              intensity={actualIntensity} 
              precipitation={precipitation > 30 ? precipitation : 30} // Ensure some rain with storms
              windSpeed={windSpeed}
            />
          );
          effects.push(
            <LightningEffect 
              key="lightning"
              intensity={actualIntensity} 
            />
          );
          break;
          
        case 'fog':
          // Add fog effect with intensity based on humidity
          effects.push(
            <FogEffect 
              key="fog"
              intensity={actualIntensity} 
              density={humidity}
            />
          );
          break;
          
        case 'cloudy':
        case 'partly-cloudy':
          // Add cloud effect with number based on condition
          effects.push(
            <CloudEffect 
              key="cloud"
              intensity={actualIntensity} 
              coverage={condition === 'cloudy' ? 80 : 40}
            />
          );
          break;
          
        case 'clear':
          // Add sun rays or stars effect based on time of day
          if (weatherData.timeOfDay === 'day') {
            effects.push(
              <SunRaysEffect 
                key="sunrays"
                intensity={actualIntensity} 
              />
            );
          } else {
            effects.push(
              <StarsEffect 
                key="stars"
                intensity={actualIntensity} 
              />
            );
          }
          break;
      }
      
      return effects;
    };
    
    setActiveEffects(generateEffects());
    
    // Start monitoring performance
    startPerformanceMonitoring();
    
    return () => {
      stopPerformanceMonitoring();
    };
  }, [weatherData, intensity, reducedMotion]);
  
  // Effect to clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Performance monitoring functions
  const startPerformanceMonitoring = () => {
    lastFrameTimeRef.current = performance.now();
    requestAnimationFrame(monitorPerformance);
  };
  
  const stopPerformanceMonitoring = () => {
    // No need to cancel animation frame as we check isMounted
  };
  
  const monitorPerformance = (timestamp: number) => {
    if (!isMounted.current) return;
    
    // Calculate frame time and FPS
    const frameTime = timestamp - lastFrameTimeRef.current;
    frameTimeRef.current = frameTime;
    fpsRef.current = 1000 / frameTime;
    
    lastFrameTimeRef.current = timestamp;
    
    // Continue monitoring
    requestAnimationFrame(monitorPerformance);
  };
  
  // Calculate appropriate intensity based on device performance
  const calculateActualIntensity = (requestedIntensity: EffectIntensity): EffectIntensity => {
    if (requestedIntensity === 'none') return 'none';
    
    const fps = fpsRef.current;
    
    // If FPS is too low, reduce intensity
    if (fps > 0 && fps < 30) {
      // Significantly reduce intensity
      if (requestedIntensity === 'high') return 'medium';
      if (requestedIntensity === 'medium') return 'low';
      return 'none';
    } else if (fps > 0 && fps < 45) {
      // Slightly reduce intensity
      if (requestedIntensity === 'high') return 'medium';
      return requestedIntensity;
    }
    
    // Default: use requested intensity
    return requestedIntensity;
  };
  
  // Render active effects
  return (
    <div className="weather-effects-container absolute inset-0 pointer-events-none overflow-hidden">
      {activeEffects}
    </div>
  );
} 