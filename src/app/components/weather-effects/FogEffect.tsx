'use client';

import React, { useRef, useEffect } from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface FogEffectProps {
  intensity: EffectIntensity;
  density: number; // 0-100 value representing fog density
}

/**
 * Fog effect that creates moving fog overlay with multiple layers
 * Adjusts opacity and movement based on intensity and density
 */
export default function FogEffect({ 
  intensity = 'medium', 
  density = 60 
}: FogEffectProps) {
  const fogLayersRef = useRef<HTMLDivElement>(null);
  
  // Calculate actual intensity based on props
  const getOpacity = (): number => {
    const baseOpacity = {
      'low': 0.3,
      'medium': 0.5,
      'high': 0.7,
      'none': 0
    }[intensity] || 0;
    
    // Scale opacity based on density
    return baseOpacity * (density / 60);
  };
  
  // Calculate animation speed based on intensity
  const getAnimationDuration = (): number => {
    const baseSpeed = {
      'low': 70,
      'medium': 50,
      'high': 30,
      'none': 0
    }[intensity] || 50;
    
    // Density also affects speed (thicker fog moves slower)
    const densityFactor = 1 - ((density - 50) / 100);
    return baseSpeed * (densityFactor < 0.7 ? 0.7 : densityFactor);
  };
  
  // Skip rendering if intensity is none
  if (intensity === 'none') {
    return null;
  }
  
  const opacity = getOpacity();
  const duration = getAnimationDuration();
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-30">
      {/* Base fog layer */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-gray-200/50 to-gray-300/80"
        style={{ 
          opacity: opacity * 0.6,
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Multiple animated fog layers with different speeds and opacity */}
      <div ref={fogLayersRef} className="absolute inset-0">
        {/* Layer 1 - slow moving base layer */}
        <div 
          className="absolute inset-0 bg-[url('/images/fog-texture.png')]"
          style={{
            backgroundSize: '200% 200%',
            opacity: opacity * 0.7,
            animation: `fog-drift-1 ${duration * 1.5}s linear infinite`,
            mixBlendMode: 'screen'
          }}
        />
        
        {/* Layer 2 - medium speed middle layer */}
        <div 
          className="absolute inset-0 bg-[url('/images/fog-texture-2.png')]"
          style={{
            backgroundSize: '300% 200%',
            opacity: opacity * 0.5,
            animation: `fog-drift-2 ${duration}s linear infinite`,
            mixBlendMode: 'screen'
          }}
        />
        
        {/* Layer 3 - faster moving light wisps */}
        <div 
          className="absolute inset-0 bg-[url('/images/fog-wisps.png')]"
          style={{
            backgroundSize: '200% 100%',
            opacity: opacity * 0.3,
            animation: `fog-drift-3 ${duration * 0.7}s linear infinite`,
            mixBlendMode: 'screen'
          }}
        />
        
        {/* Heavy fog visibility reducer */}
        {density > 70 && (
          <div 
            className="absolute inset-0 bg-gray-100"
            style={{ 
              opacity: (density - 70) / 30 * 0.2,
              mixBlendMode: 'overlay'
            }}
          />
        )}
      </div>
      
      {/* Animations keyframes defined in CSS */}
      <style jsx>{`
        @keyframes fog-drift-1 {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 10%; }
        }
        @keyframes fog-drift-2 {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% -20%; }
        }
        @keyframes fog-drift-3 {
          0% { background-position: 0% 30%; }
          100% { background-position: 200% 10%; }
        }
      `}</style>
    </div>
  );
} 