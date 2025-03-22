'use client';

import React, { useEffect, useState, useRef } from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface LightningEffectProps {
  intensity: EffectIntensity;
}

interface Flash {
  opacity: number;
  duration: number;
  delay: number;
  timestamp: number;
}

/**
 * Lightning effect that creates occasional flashes during storms
 */
export default function LightningEffect({ intensity = 'medium' }: LightningEffectProps) {
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [activeFlash, setActiveFlash] = useState<Flash | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate a flash with random properties
  const generateFlash = (): Flash => {
    const now = Date.now();
    
    return {
      opacity: 0.3 + Math.random() * 0.5, // Random opacity
      duration: 100 + Math.random() * 200, // Flash duration in ms
      delay: 100 + Math.random() * 150, // Delay between consecutive flashes
      timestamp: now
    };
  };
  
  // Generate a lightning strike consisting of multiple flashes
  const generateLightningStrike = () => {
    const flashCount = 1 + Math.floor(Math.random() * 3); // 1-3 flashes per strike
    const newFlashes: Flash[] = [];
    
    for (let i = 0; i < flashCount; i++) {
      newFlashes.push(generateFlash());
    }
    
    setFlashes(newFlashes);
  };
  
  // Calculate time between lightning strikes based on intensity
  const getStrikeInterval = (): [number, number] => {
    switch (intensity) {
      case 'high':
        return [3000, 10000]; // 3-10 seconds between strikes
      case 'medium':
        return [8000, 20000]; // 8-20 seconds between strikes
      case 'low':
        return [15000, 40000]; // 15-40 seconds between strikes
      default:
        return [10000, 30000]; // Default
    }
  };
  
  // Process flashes and update active flash
  useEffect(() => {
    if (flashes.length === 0) return;
    
    const currentTime = Date.now();
    let cumulativeDelay = 0;
    
    // Find the current active flash based on time
    for (let i = 0; i < flashes.length; i++) {
      const flash = flashes[i];
      const flashStart = flash.timestamp + cumulativeDelay;
      const flashEnd = flashStart + flash.duration;
      
      if (currentTime >= flashStart && currentTime <= flashEnd) {
        setActiveFlash(flash);
        return;
      }
      
      cumulativeDelay += flash.duration + flash.delay;
    }
    
    // If we've gone through all flashes, clear them
    if (currentTime > flashes[0].timestamp + cumulativeDelay) {
      setFlashes([]);
      setActiveFlash(null);
    }
    
    // Check for active flash every 16ms (approximately 60fps)
    const timer = setTimeout(() => {
      // Recursively check
      if (flashes.length > 0) {
        // This will trigger the effect again
        setFlashes([...flashes]);
      }
    }, 16);
    
    return () => clearTimeout(timer);
  }, [flashes]);
  
  // Set up interval for lightning strikes
  useEffect(() => {
    if (intensity === 'none') {
      setActiveFlash(null);
      setFlashes([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    const startLightningInterval = () => {
      // Generate initial strike after a random delay
      const [minInterval, maxInterval] = getStrikeInterval();
      const initialDelay = minInterval + Math.random() * (maxInterval - minInterval);
      
      const timeout = setTimeout(() => {
        generateLightningStrike();
        
        // Set up recurring interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
          const [min, max] = getStrikeInterval();
          const nextDelay = min + Math.random() * (max - min);
          
          // Generate strike, then set a timeout for the next one
          generateLightningStrike();
          
          // Clear and reset interval with new random timing
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          intervalRef.current = setTimeout(startLightningInterval, nextDelay);
        }, initialDelay);
      }, initialDelay);
      
      return timeout;
    };
    
    const timeout = startLightningInterval();
    
    // Cleanup
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [intensity]);
  
  // Don't render if intensity is 'none' or no active flash
  if (intensity === 'none' || !activeFlash) return null;
  
  return (
    <div 
      className="absolute inset-0 weather-effect pointer-events-none"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        opacity: activeFlash.opacity,
        mixBlendMode: 'screen',
        animation: 'lightning 2s ease-out'
      }}
      aria-hidden="true"
    />
  );
} 