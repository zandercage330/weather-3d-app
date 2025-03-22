'use client';

import React from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface SunRaysEffectProps {
  intensity: EffectIntensity;
}

/**
 * Sun rays effect for clear day conditions
 * Creates subtle light rays and glow effects
 */
export default function SunRaysEffect({ intensity = 'medium' }: SunRaysEffectProps) {
  // Calculate opacity based on intensity
  const getOpacity = (): number => {
    return {
      'low': 0.2,
      'medium': 0.4,
      'high': 0.6,
      'none': 0
    }[intensity] || 0;
  };
  
  // Don't render if intensity is 'none'
  if (intensity === 'none') return null;
  
  const opacity = getOpacity();
  
  return (
    <div 
      className="sun-rays absolute inset-0 overflow-hidden weather-effect pointer-events-none"
      aria-hidden="true"
    >
      {/* Sun glow in top right corner */}
      <div 
        className="sun-glow absolute"
        style={{
          top: '5%',
          right: '10%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          opacity: opacity * 1.2,
          animation: 'sun-rays 8s ease-in-out infinite'
        }}
      />
      
      {/* Light rays spreading from sun */}
      <div
        className="sun-rays-container absolute"
        style={{
          top: '5%',
          right: '10%',
          width: '300px',
          height: '300px',
          opacity: opacity,
          animation: 'sun-rays 10s ease-in-out infinite',
          transform: 'translate(50%, -50%)'
        }}
      >
        {/* Generate 12 rays around the sun */}
        {[...Array(12)].map((_, index) => {
          const angle = (index * 30) * (Math.PI / 180);
          const length = 100 + Math.random() * 200;
          
          return (
            <div 
              key={index}
              className="sun-ray absolute"
              style={{
                top: '50%',
                left: '50%',
                width: `${length}px`,
                height: '2px',
                background: 'linear-gradient(to right, rgba(255,255,255,0.7), rgba(255,255,255,0))',
                transformOrigin: 'left center',
                transform: `rotate(${angle}rad) translateY(-50%)`,
                opacity: 0.1 + Math.random() * 0.3
              }}
            />
          );
        })}
      </div>
      
      {/* Subtle ambient light effect */}
      <div 
        className="ambient-light absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 90% 5%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
          opacity: opacity * 0.7
        }}
      />
      
      {/* Lens flare effect */}
      {intensity === 'high' && (
        <div 
          className="lens-flare absolute"
          style={{
            top: '75%',
            left: '30%',
            width: '40px',
            height: '10px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            transform: 'rotate(-30deg)',
            opacity: 0.3,
            filter: 'blur(2px)'
          }}
        />
      )}
    </div>
  );
} 