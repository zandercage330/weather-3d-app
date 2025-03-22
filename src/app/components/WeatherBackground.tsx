'use client';

import React, { useEffect, useState } from 'react';
import WeatherEffectsManager from './weather-effects/WeatherEffectsManager';

export interface WeatherBackgroundProps {
  condition: string;
  timeOfDay: 'day' | 'night';
  children?: React.ReactNode;
}

/**
 * Dynamic weather background component that changes based on current conditions and time of day
 * Creates atmospheric effects appropriate for the current weather
 */
export default function WeatherBackground({ condition, timeOfDay, children }: WeatherBackgroundProps) {
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
  
  // Get appropriate background style and effects based on weather condition and time of day
  const backgroundStyle = getBackgroundStyle(condition, timeOfDay);
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={backgroundStyle}
    >
      {/* Weather effects layer (rain, snow, etc.) */}
      {!reducedMotion && effectIntensity !== 'none' && (
        <WeatherEffectsManager 
          condition={condition}
          timeOfDay={timeOfDay}
          intensity={effectIntensity}
        />
      )}
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 pointer-events-none" />
      
      {children}
    </div>
  );
}

/**
 * Get the appropriate background style based on weather condition and time of day
 */
function getBackgroundStyle(condition: string, timeOfDay: 'day' | 'night'): React.CSSProperties {
  // Normalize the condition to lowercase and remove spaces
  const normalizedCondition = condition.toLowerCase().replace(/\s+/g, '');
  
  // Base gradients for different times of day
  const dayGradient = 'linear-gradient(to bottom, #4B91F7, #98CBFF)';
  const nightGradient = 'linear-gradient(to bottom, #0F2043, #274577)';
  
  // Base colors for different weather conditions
  const clearDayGradient = 'linear-gradient(to bottom, #4B91F7, #98CBFF)';
  const clearNightGradient = 'linear-gradient(to bottom, #0F2043, #274577)';
  const cloudyDayGradient = 'linear-gradient(to bottom, #8FA9C0, #BCCFDE)';
  const cloudyNightGradient = 'linear-gradient(to bottom, #252F3D, #414C5E)';
  const rainyDayGradient = 'linear-gradient(to bottom, #576574, #8395A7)';
  const rainyNightGradient = 'linear-gradient(to bottom, #1E272E, #485460)';
  const snowyDayGradient = 'linear-gradient(to bottom, #C8D6E5, #F0F4F8)';
  const snowyNightGradient = 'linear-gradient(to bottom, #606C7A, #8395A7)';
  const stormyDayGradient = 'linear-gradient(to bottom, #2C3A47, #4B6584)';
  const stormyNightGradient = 'linear-gradient(to bottom, #151D26, #2C3A47)';
  const foggyDayGradient = 'linear-gradient(to bottom, #A5B1C2, #D1D8E0)';
  const foggyNightGradient = 'linear-gradient(to bottom, #4B6584, #718093)';
  
  // Map condition to gradient
  let backgroundImage;
  
  if (normalizedCondition.includes('clear') || normalizedCondition.includes('sunny')) {
    backgroundImage = timeOfDay === 'day' ? clearDayGradient : clearNightGradient;
  } else if (normalizedCondition.includes('cloud') || normalizedCondition.includes('overcast') || normalizedCondition.includes('partly')) {
    backgroundImage = timeOfDay === 'day' ? cloudyDayGradient : cloudyNightGradient;
  } else if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle') || normalizedCondition.includes('shower')) {
    backgroundImage = timeOfDay === 'day' ? rainyDayGradient : rainyNightGradient;
  } else if (normalizedCondition.includes('snow') || normalizedCondition.includes('sleet') || normalizedCondition.includes('ice')) {
    backgroundImage = timeOfDay === 'day' ? snowyDayGradient : snowyNightGradient;
  } else if (normalizedCondition.includes('thunder') || normalizedCondition.includes('storm') || normalizedCondition.includes('lightning')) {
    backgroundImage = timeOfDay === 'day' ? stormyDayGradient : stormyNightGradient;
  } else if (normalizedCondition.includes('fog') || normalizedCondition.includes('mist') || normalizedCondition.includes('haz')) {
    backgroundImage = timeOfDay === 'day' ? foggyDayGradient : foggyNightGradient;
  } else {
    // Default fallback based on time of day
    backgroundImage = timeOfDay === 'day' ? dayGradient : nightGradient;
  }
  
  return {
    backgroundImage,
    transition: 'background-image 1s ease-in-out',
  };
} 