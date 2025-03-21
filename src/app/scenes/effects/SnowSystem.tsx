'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SnowSystemProps {
  intensity?: number; // 0 to 1
}

const SnowSystem = ({ intensity = 0.5 }: SnowSystemProps) => {
  // Calculate number of snowflakes based on intensity
  const count = Math.floor(800 * intensity);
  
  // Create snowflake positions and properties
  const snowflakes = useMemo(() => {
    const flakes = [];
    for (let i = 0; i < count; i++) {
      flakes.push({
        position: [
          (Math.random() - 0.5) * 30,   // x
          Math.random() * 20,           // y
          (Math.random() - 0.5) * 30    // z
        ],
        speed: Math.random() * 0.05 + 0.02,
        wobble: {
          speed: Math.random() * 0.5 + 0.2,
          amplitude: Math.random() * 0.3 + 0.1,
          offset: Math.random() * Math.PI * 2,
        }
      });
    }
    return flakes;
  }, [count]);

  // Reference to the points object
  const pointsRef = useRef<THREE.Points>(null);

  // Create positions for the snowflakes
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = snowflakes[i].position[0];
      pos[i3 + 1] = snowflakes[i].position[1];
      pos[i3 + 2] = snowflakes[i].position[2];
    }
    return pos;
  }, [count, snowflakes]);

  // Animation - make snowflakes fall with gentle wobble
  useFrame(({ clock }) => {
    if (pointsRef.current && pointsRef.current.geometry) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const flake = snowflakes[i];
        
        // Move snowflake down gradually
        positions[i3 + 1] -= flake.speed;
        
        // Add gentle side-to-side wobble
        const wobble = flake.wobble;
        positions[i3] += Math.sin(time * wobble.speed + wobble.offset) * wobble.amplitude * 0.01;
        positions[i3 + 2] += Math.cos(time * wobble.speed + wobble.offset) * wobble.amplitude * 0.01;
        
        // If snowflake goes below ground, reset to top
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
        color="#ffffff"
        size={0.2}
        transparent
        opacity={Math.min(0.8, intensity * 0.8)}
        fog={true}
        depthWrite={false}
      />
    </points>
  );
};

export default SnowSystem; 