'use client';

import { useState, useEffect, useCallback } from 'react';
import CloudEffect from './CloudEffect';
import RainEffect from './RainEffect';
import SnowEffect from './SnowEffect';
import FogEffect from './FogEffect';

export type EffectIntensity = 'none' | 'low' | 'medium' | 'high';

interface WeatherEffectsProps {
  condition: string;
  timeOfDay?: 'day' | 'night';
  intensity?: EffectIntensity;
  reducedMotion?: boolean;
}

export default function WeatherEffectsManager({ 
  condition, 
  timeOfDay = 'day',
  intensity = 'medium',
  reducedMotion = false
}: WeatherEffectsProps) {
  const [frameRate, setFrameRate] = useState<number | null>(null);
  const [effectIntensity, setEffectIntensity] = useState<EffectIntensity>(intensity);
  
  // Frame rate monitoring for performance adjustments
  const monitorPerformance = useCallback(() => {
    if (reducedMotion) {
      setEffectIntensity('low');
      return;
    }
    
    let lastTime = performance.now();
    let frames = 0;
    let frameTimes: number[] = [];
    
    const countFrame = () => {
      const now = performance.now();
      const elapsed = now - lastTime;
      
      // Only count frames after first call
      if (frames > 0) {
        frameTimes.push(elapsed);
        
        // Calculate average after collecting 10 frames
        if (frameTimes.length >= 10) {
          const average = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
          const fps = 1000 / average;
          setFrameRate(Math.round(fps));
          
          // Adjust effect intensity based on frame rate
          if (fps < 30) {
            setEffectIntensity('low');
          } else if (fps < 50) {
            setEffectIntensity('medium');
          } else {
            setEffectIntensity(intensity);
          }
          
          // Reset for next cycle
          frameTimes = [];
        }
      }
      
      frames++;
      lastTime = now;
      
      if (frames < 100) { // Only monitor for a short time
        requestAnimationFrame(countFrame);
      }
    };
    
    requestAnimationFrame(countFrame);
  }, [intensity, reducedMotion]);
  
  // Start monitoring performance when component mounts
  useEffect(() => {
    if (!reducedMotion) {
      monitorPerformance();
    }
  }, [monitorPerformance, reducedMotion]);

  // Generate effects based on weather condition
  const generateEffects = () => {
    const isDark = timeOfDay === 'night';
    const baseIntensity = reducedMotion ? 'low' : effectIntensity;
    
    // Default values for weather effects
    let clouds: EffectIntensity = 'none';
    let rain: EffectIntensity = 'none';
    let snow: EffectIntensity = 'none';
    let fog: EffectIntensity = 'none';
    let isHeavyRain = false;
    
    // Set effect intensities based on condition
    switch (condition?.toLowerCase()) {
      case 'clear':
        clouds = 'low';
        break;
        
      case 'partly-cloudy':
        clouds = 'medium';
        break;
        
      case 'cloudy':
        clouds = 'high';
        break;
        
      case 'fog':
        clouds = 'medium';
        fog = baseIntensity;
        break;
        
      case 'rain':
        clouds = 'high';
        rain = baseIntensity;
        break;
        
      case 'heavy-rain':
      case 'thunderstorm':
      case 'storm':
        clouds = 'high';
        rain = 'high';
        isHeavyRain = true;
        break;
        
      case 'snow':
        clouds = 'medium';
        snow = baseIntensity;
        break;
        
      case 'blizzard':
      case 'heavy-snow':
        clouds = 'high';
        snow = 'high';
        fog = 'low';
        break;
        
      case 'sleet':
      case 'mixed':
        clouds = 'high';
        rain = 'low';
        snow = 'low';
        break;
        
      default:
        // Default to partly cloudy if condition not recognized
        clouds = 'medium';
    }
    
    return (
      <>
        <CloudEffect 
          intensity={clouds} 
          coverage={clouds === 'high' ? 90 : clouds === 'medium' ? 60 : 30}
          dark={isDark || ['storm', 'thunderstorm', 'heavy-rain'].includes(condition?.toLowerCase() || '')} 
        />
        
        {rain !== 'none' && (
          <RainEffect 
            intensity={rain} 
            precipitation={rain === 'high' ? 90 : 50} 
            windSpeed={10} 
            heavy={isHeavyRain}
          />
        )}
        
        {snow !== 'none' && (
          <SnowEffect 
            intensity={snow} 
            precipitation={snow === 'high' ? 90 : 50} 
            windSpeed={5} 
            temperature={25}
          />
        )}
        
        {fog !== 'none' && (
          <FogEffect 
            intensity={fog} 
            density={fog === 'high' ? 90 : 60} 
          />
        )}
      </>
    );
  };

  return (
    <div className="weather-effects">
      {generateEffects()}
    </div>
  );
} 