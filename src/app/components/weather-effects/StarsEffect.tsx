'use client';

import React, { useState, useEffect } from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface StarsEffectProps {
  intensity: EffectIntensity;
}

interface Star {
  id: number;
  size: number;
  top: number;
  left: number;
  opacity: number;
  delay: number;
  duration: number;
}

/**
 * Stars effect for clear night conditions
 * Creates twinkling stars and moon glow
 */
export default function StarsEffect({ intensity = 'medium' }: StarsEffectProps) {
  const [stars, setStars] = useState<Star[]>([]);
  
  // Calculate star count based on intensity
  const getStarCount = (): number => {
    return {
      'low': 30,
      'medium': 80,
      'high': 150,
      'none': 0
    }[intensity] || 0;
  };
  
  // Generate stars with random properties
  const generateStars = () => {
    const count = getStarCount();
    const newStars: Star[] = [];
    
    for (let i = 0; i < count; i++) {
      newStars.push({
        id: i,
        size: 1 + Math.random() * 2, // 1-3px
        top: Math.random() * 100, // 0-100%
        left: Math.random() * 100, // 0-100%
        opacity: 0.5 + Math.random() * 0.5, // 0.5-1
        delay: Math.random() * 5, // 0-5s delay
        duration: 1 + Math.random() * 4 // 1-5s duration
      });
    }
    
    setStars(newStars);
  };
  
  // Initialize stars on mount and when intensity changes
  useEffect(() => {
    generateStars();
  }, [intensity]);
  
  // Don't render if intensity is 'none'
  if (intensity === 'none') return null;
  
  // Calculate moon glow opacity based on intensity
  const moonOpacity = {
    'low': 0.4,
    'medium': 0.6,
    'high': 0.8,
    'none': 0
  }[intensity] || 0;
  
  return (
    <div 
      className="stars-effect absolute inset-0 overflow-hidden weather-effect pointer-events-none"
      aria-hidden="true"
    >
      {/* Moon glow */}
      <div 
        className="moon absolute"
        style={{
          top: '10%',
          right: '15%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(200, 220, 255, 0.5) 30%, rgba(200, 220, 255, 0) 70%)',
          boxShadow: '0 0 20px 10px rgba(200, 220, 255, 0.3)',
          opacity: moonOpacity
        }}
      />
      
      {/* Ambient moon light */}
      <div 
        className="moon-ambient absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 85% 10%, rgba(200, 220, 255, 0.1) 0%, rgba(50, 70, 90, 0) 60%)',
          opacity: moonOpacity * 0.8
        }}
      />
      
      {/* Stars */}
      {stars.map(star => (
        <div 
          key={star.id}
          className="star absolute rounded-full"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.top}%`,
            left: `${star.left}%`,
            backgroundColor: star.size > 2 ? 'rgba(200, 220, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            opacity: star.opacity,
            animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            boxShadow: star.size > 2 ? '0 0 4px 1px rgba(200, 220, 255, 0.8)' : 'none'
          }}
        />
      ))}
      
      {/* Shooting stars - only shown with high intensity */}
      {intensity === 'high' && (
        <>
          <div 
            className="shooting-star absolute"
            style={{
              top: '20%',
              left: '30%',
              width: '80px',
              height: '1px',
              background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))',
              transform: 'rotate(-45deg)',
              opacity: 0,
              animation: 'shooting-star-1 8s linear 2s infinite'
            }}
          />
          <div 
            className="shooting-star absolute"
            style={{
              top: '40%',
              left: '70%',
              width: '100px',
              height: '1px',
              background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))',
              transform: 'rotate(-60deg)',
              opacity: 0,
              animation: 'shooting-star-2 12s linear 5s infinite'
            }}
          />
          <style jsx>{`
            @keyframes shooting-star-1 {
              0%, 100% {
                opacity: 0;
                transform: rotate(-45deg) translateX(0);
              }
              10%, 15% {
                opacity: 0.8;
              }
              20% {
                opacity: 0;
                transform: rotate(-45deg) translateX(200px);
              }
            }
            @keyframes shooting-star-2 {
              0%, 100% {
                opacity: 0;
                transform: rotate(-60deg) translateX(0);
              }
              50%, 55% {
                opacity: 0.8;
              }
              60% {
                opacity: 0;
                transform: rotate(-60deg) translateX(300px);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
} 