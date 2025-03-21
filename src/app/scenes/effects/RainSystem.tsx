'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RainSystemProps {
  intensity?: number; // 0 to 1
}

const RainSystem = ({ intensity = 0.5 }: RainSystemProps) => {
  // Calculate number of raindrops based on intensity
  const count = Math.floor(1000 * intensity);
  
  // Create raindrop positions
  const raindrops = useMemo(() => {
    const drops = [];
    for (let i = 0; i < count; i++) {
      drops.push({
        position: [
          (Math.random() - 0.5) * 30,   // x
          Math.random() * 20,           // y
          (Math.random() - 0.5) * 30    // z
        ],
        speed: Math.random() * 0.2 + 0.2,
      });
    }
    return drops;
  }, [count]);

  // Create raindrops geometry
  const pointsRef = useRef<THREE.Points>(null);

  // Create positions for the raindrops
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = raindrops[i].position[0];
      pos[i3 + 1] = raindrops[i].position[1];
      pos[i3 + 2] = raindrops[i].position[2];
    }
    return pos;
  }, [count, raindrops]);

  // Animation - make raindrops fall
  useFrame(() => {
    if (pointsRef.current && pointsRef.current.geometry) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Move raindrop down
        positions[i3 + 1] -= raindrops[i].speed;
        
        // If raindrop goes below ground, reset to top
        if (positions[i3 + 1] < -1) {
          positions[i3] = (Math.random() - 0.5) * 30;
          positions[i3 + 1] = 20;
          positions[i3 + 2] = (Math.random() - 0.5) * 30;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#aaddff"
        size={0.1}
        transparent
        opacity={Math.min(0.7, intensity * 0.7)}
        fog={true}
      />
    </points>
  );
};

export default RainSystem; 