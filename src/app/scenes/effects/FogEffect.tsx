'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FogEffectProps {
  intensity?: number; // 0 to 1
  color?: string; // fog color
  temperature?: number; // in Fahrenheit
  windSpeed?: number; // 0 to 1
}

const FogEffect = ({ 
  intensity = 0.5,
  color = '#c8d6e5',
  temperature = 60,
  windSpeed = 0
}: FogEffectProps) => {
  const { scene } = useThree();
  const fogRef = useRef<THREE.Fog | null>(null);
  const noiseRef = useRef<number[]>([]);
  const timeRef = useRef(0);
  
  // Initialize noise array for fog movement
  useEffect(() => {
    noiseRef.current = Array(10).fill(0).map(() => Math.random() * 2 - 1);
  }, []);

  // Set up fog effect
  useEffect(() => {
    // Calculate fog density based on temperature and intensity
    const tempFactor = Math.min(Math.max((70 - temperature) / 40, 0), 1);
    const density = 0.015 * intensity * (1 + tempFactor * 0.5);
    
    // Create fog with adjusted parameters
    const fogColor = new THREE.Color(color);
    const fog = new THREE.Fog(
      fogColor,
      1, // near
      50 * (1 - intensity * 0.7) // far - reduces visibility with higher intensity
    );
    
    // Store ref and apply to scene
    fogRef.current = fog;
    scene.fog = fog;
    
    // Cleanup
    return () => {
      scene.fog = null;
    };
  }, [scene, intensity, color, temperature]);

  // Animate fog
  useFrame(({ clock }) => {
    if (!fogRef.current) return;
    
    const time = clock.getElapsedTime();
    timeRef.current += 0.001 * (1 + windSpeed * 2);
    
    // Create subtle color variations
    const hue = (Math.sin(timeRef.current * 0.1) * 0.02) + 0.5;
    const saturation = 0.1;
    const lightness = 0.7 + Math.sin(timeRef.current * 0.2) * 0.05;
    
    // Apply color variations
    const fogColor = new THREE.Color().setHSL(hue, saturation, lightness);
    fogRef.current.color.copy(fogColor);
    
    // Animate fog density with noise
    const noiseIndex = Math.floor(time % noiseRef.current.length);
    const noiseFactor = noiseRef.current[noiseIndex];
    
    // Update fog distance based on noise and wind
    fogRef.current.far = 50 * (1 - intensity * 0.7) * (1 + noiseFactor * 0.1);
    
    // Slowly rotate fog color based on wind
    const windFactor = windSpeed * 0.01;
    fogRef.current.color.offsetHSL(windFactor, 0, 0);
  });

  return null; // This component only modifies scene properties
};

export default FogEffect; 