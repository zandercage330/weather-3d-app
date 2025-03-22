'use client';

import React, { useRef, useEffect, useState } from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface CloudEffectProps {
  intensity: EffectIntensity;
  coverage: number; // 0-100 value for cloud coverage
}

interface Cloud {
  id: number;
  width: number;
  height: number;
  opacity: number;
  top: number;
  speed: number;
  delay: number;
  zIndex: number;
}

/**
 * Cloud effect that creates drifting clouds with varying density and coverage
 */
export default function CloudEffect({ 
  intensity = 'medium', 
  coverage = 50 
}: CloudEffectProps) {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  
  // Calculate cloud count based on intensity and coverage
  const getCloudCount = (): number => {
    const baseCount = {
      'low': 3,
      'medium': 6,
      'high': 10,
      'none': 0
    }[intensity] || 0;
    
    // Scale count based on coverage
    return Math.floor(baseCount * (coverage / 50));
  };
  
  // Generate clouds with random properties
  const generateClouds = () => {
    const count = getCloudCount();
    const newClouds: Cloud[] = [];
    
    for (let i = 0; i < count; i++) {
      newClouds.push({
        id: i,
        width: 100 + Math.random() * 200, // 100-300px width
        height: 60 + Math.random() * 100, // 60-160px height
        opacity: 0.3 + Math.random() * 0.5, // 0.3-0.8 opacity
        top: Math.random() * 50, // 0-50% from top
        speed: 30 + Math.random() * 40, // 30-70s to cross the screen
        delay: Math.random() * -30, // Random start delay
        zIndex: Math.floor(Math.random() * 3) // 0-2 z-index for layering
      });
    }
    
    setClouds(newClouds);
  };
  
  // Initialize clouds on mount and when props change
  useEffect(() => {
    generateClouds();
  }, [intensity, coverage]);
  
  // Don't render if intensity is 'none'
  if (intensity === 'none') return null;
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden weather-effect pointer-events-none"
      aria-hidden="true"
    >
      {clouds.map(cloud => (
        <div 
          key={cloud.id}
          className="cloud absolute" 
          style={{
            width: `${cloud.width}px`,
            height: `${cloud.height}px`,
            top: `${cloud.top}%`,
            left: '-20%',
            opacity: cloud.opacity,
            zIndex: cloud.zIndex,
            animation: `cloud-drift ${cloud.speed}s linear ${cloud.delay}s infinite`,
            borderRadius: '50%',
            filter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.8)'
          }}
        />
      ))}
      
      {/* Heavy cloud cover for high coverage conditions */}
      {coverage > 70 && (
        <div 
          className="cloud-cover absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
            opacity: (coverage - 70) / 30 * 0.7 // Scale from 0 to 0.7 based on coverage above 70
          }}
        />
      )}
    </div>
  );
} 