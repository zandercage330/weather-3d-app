'use client';

import { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface LightningEffectProps {
  enabled?: boolean;
  intensity?: number; // 0 to 1
}

const LightningEffect = ({ 
  enabled = false, 
  intensity = 0.5 
}: LightningEffectProps) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const { scene } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Frequency factors based on intensity
  const minFrequency = 5000; // 5 seconds
  const maxFrequency = 20000; // 20 seconds
  const frequency = useRef(
    maxFrequency - (maxFrequency - minFrequency) * Math.min(1, intensity * 1.5)
  );
  
  // Flash duration based on intensity
  const flashDuration = 150 + Math.random() * 100; // 150-250ms
  
  // Lightning brightness based on intensity
  const maxIntensity = 5 + intensity * 20; // 5-25
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  // Create lightning flashes at random intervals
  useEffect(() => {
    if (!enabled) return;
    
    const triggerLightning = () => {
      if (!enabled) return;
      
      // Random position around the center
      const randomPos = [
        (Math.random() - 0.5) * 20, 
        10 + Math.random() * 5, 
        (Math.random() - 0.5) * 20
      ];
      
      if (lightRef.current) {
        lightRef.current.position.set(randomPos[0], randomPos[1], randomPos[2]);
      }
      
      // Start flash
      setIsFlashing(true);
      
      // End flash after duration
      setTimeout(() => {
        setIsFlashing(false);
      }, flashDuration);
      
      // Calculate next lightning timing
      const nextTime = minFrequency + Math.random() * frequency.current;
      
      // Schedule next lightning
      timeoutRef.current = setTimeout(triggerLightning, nextTime);
    };
    
    // Initial trigger
    timeoutRef.current = setTimeout(triggerLightning, 1000 + Math.random() * 3000);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, flashDuration]);
  
  // Control light intensity during flash
  useFrame(() => {
    if (lightRef.current) {
      if (isFlashing) {
        lightRef.current.intensity = maxIntensity;
      } else {
        lightRef.current.intensity = 0;
      }
    }
  });
  
  return (
    <pointLight 
      ref={lightRef}
      position={[0, 15, 0]}
      intensity={0}
      distance={100}
      decay={2}
      color="#f0f6ff"
    />
  );
};

export default LightningEffect; 