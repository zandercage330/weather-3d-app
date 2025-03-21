'use client';

import { useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FogEffectProps {
  density?: number; // 0 to 1
  color?: string;
  timeOfDay?: 'day' | 'night';
}

const FogEffect = ({ 
  density = 0.5, 
  color = '#c8d6e5',
  timeOfDay = 'day' 
}: FogEffectProps) => {
  // Get the scene from the Three.js context
  const { scene } = useThree();
  
  // Adjust fog color based on time of day
  const fogColor = useMemo(() => {
    if (timeOfDay === 'night') {
      return '#2c3e50'; // Darker fog for night
    }
    return color;
  }, [color, timeOfDay]);
  
  // Calculate fog density (0-1 scale to appropriate fog density)
  const fogDensity = useMemo(() => {
    return 0.01 * Math.max(0.05, density);
  }, [density]);

  // Create and apply fog effect
  useEffect(() => {
    if (!scene) return;
    
    // Create exponential fog for more realistic effect
    const fog = new THREE.FogExp2(fogColor, fogDensity);
    scene.fog = fog;
    
    // Store previous background for restoration
    const prevBackground = scene.background;
    
    // Match background color to fog for seamless transition
    scene.background = new THREE.Color(fogColor);
    
    // Clean up when component unmounts or props change
    return () => {
      scene.fog = null;
      scene.background = prevBackground;
    };
  }, [scene, fogColor, fogDensity]);

  // No need to return any visible elements as fog is applied to the scene
  return null;
};

export default FogEffect; 