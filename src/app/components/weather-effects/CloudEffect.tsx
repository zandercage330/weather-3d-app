'use client';

import React, { useRef, useEffect, useState } from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface CloudEffectProps {
  intensity: EffectIntensity;
  coverage: number; // 0-100 value for cloud coverage
  dark?: boolean; // Whether to use darker clouds for night/storm
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
  coverage = 50,
  dark = false
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
  
  // Generate clouds with varying properties
  const generateClouds = () => {
    const cloudCount = getCloudCount();
    const newClouds: Cloud[] = [];
    
    for (let i = 0; i < cloudCount; i++) {
      newClouds.push({
        id: i,
        width: Math.floor(Math.random() * 100) + 150, // 150-250px
        height: Math.floor(Math.random() * 40) + 80, // 80-120px
        opacity: (Math.random() * 0.4) + (dark ? 0.6 : 0.3), // More opaque if dark
        top: Math.floor(Math.random() * 60), // 0-60% from top
        speed: (Math.random() * 80) + 40, // 40-120s to cross screen
        delay: Math.random() * 40, // 0-40s delay before animation starts
        zIndex: Math.floor(Math.random() * 3), // 0-2 z-index
      });
    }
    
    setClouds(newClouds);
  };
  
  // Generate clouds on mount and when intensity/coverage changes
  useEffect(() => {
    generateClouds();
  }, [intensity, coverage, dark]);
  
  // Skip rendering if intensity is none
  if (intensity === 'none' || clouds.length === 0) {
    return null;
  }
  
  return (
    <div className="cloud-effect fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {clouds.map((cloud) => (
        <div 
          key={cloud.id}
          className="absolute left-full"
          style={{
            width: `${cloud.width}px`,
            height: `${cloud.height}px`,
            top: `${cloud.top}%`,
            opacity: cloud.opacity,
            zIndex: cloud.zIndex,
            animation: `float-cloud ${cloud.speed}s linear infinite`,
            animationDelay: `-${cloud.delay}s`,
            backgroundColor: dark ? 'rgba(40, 40, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50px',
            filter: 'blur(8px)',
            boxShadow: dark 
              ? 'inset 10px -10px 20px rgba(20, 20, 25, 0.5)' 
              : 'inset 10px -10px 20px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes float-cloud {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-150vw);
          }
        }
      `}</style>
    </div>
  );
} 