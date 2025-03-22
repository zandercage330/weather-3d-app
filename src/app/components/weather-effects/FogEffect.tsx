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
    
    return baseSpeed;
  };
  
  // Apply fog properties based on current settings
  useEffect(() => {
    if (!fogLayersRef.current) return;
    
    const fogLayers = fogLayersRef.current.children;
    const opacity = getOpacity();
    const duration = getAnimationDuration();
    
    // Apply different properties to each layer
    Array.from(fogLayers).forEach((layer, index) => {
      const element = layer as HTMLElement;
      const layerIndex = index + 1;
      
      // Create depth by varying opacity and speed for different layers
      const layerOpacity = opacity * (1 - (index * 0.2));
      const layerDuration = duration + (index * 5);
      const layerDelay = index * -10;
      
      element.style.opacity = layerOpacity.toString();
      element.style.animationDuration = `${layerDuration}s`;
      element.style.animationDelay = `${layerDelay}s`;
      
      // Add 3D effect with different transform values
      element.style.transform = `translateZ(${-layerIndex * 10}px)`;
    });
  }, [intensity, density]);
  
  // Don't render if intensity is 'none'
  if (intensity === 'none') return null;
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden weather-effect pointer-events-none"
      style={{ 
        perspective: '1000px',
        perspectiveOrigin: 'center center'
      }}
      aria-hidden="true"
    >
      <div ref={fogLayersRef} className="fog-layers relative w-full h-full">
        {/* Multiple fog layers for depth effect */}
        <div 
          className="fog-layer absolute inset-0" 
          style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1600\' height=\'800\' fill=\'%23fff\'%3E%3Cpath d=\'M0,192L60,176C120,160,240,128,360,138.7C480,149,600,203,720,208C840,213,960,171,1080,149.3C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E") repeat-x',
            backgroundSize: '100% 100%',
            animation: 'fog-move 40s linear infinite',
            opacity: 0.5
          }}
        />
        <div 
          className="fog-layer absolute inset-0" 
          style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1600\' height=\'800\' fill=\'%23fff\'%3E%3Cpath d=\'M0,224L80,229.3C160,235,320,245,480,245.3C640,245,800,235,960,224C1120,213,1280,203,1360,197.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E") repeat-x',
            backgroundSize: '120% 100%',
            animation: 'fog-move 60s linear infinite',
            opacity: 0.4,
            transform: 'translateY(30%)'
          }}
        />
        <div 
          className="fog-layer absolute inset-0" 
          style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1600\' height=\'800\' fill=\'%23fff\'%3E%3Cpath d=\'M0,160L60,165.3C120,171,240,181,360,197.3C480,213,600,235,720,234.7C840,235,960,213,1080,202.7C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E") repeat-x',
            backgroundSize: '150% 100%',
            animation: 'fog-move 80s linear infinite',
            opacity: 0.6,
            transform: 'translateY(60%)'
          }}
        />
        {/* Fog overlay */}
        <div 
          className="fog-overlay absolute inset-0" 
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.3) 100%)',
            backdropFilter: 'blur(4px)',
            opacity: getOpacity() * 0.5
          }}
        />
      </div>
    </div>
  );
} 