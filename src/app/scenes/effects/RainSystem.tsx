'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface RainSystemProps {
  intensity?: number; // 0 to 1
  windSpeed?: number; // 0 to 1
  temperature?: number; // in Fahrenheit
}

// Raindrop trail shader
const rainMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    time: { value: 0 },
    intensity: { value: 0.5 },
  },
  vertexShader: `
    attribute float size;
    attribute float speed;
    attribute vec3 customColor;
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      vColor = customColor;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      vAlpha = 0.8 * (1.0 - abs(position.y) / 20.0); // Fade based on height
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      float strength = distance(gl_PointCoord, vec2(0.5));
      if(strength > 0.5) discard;
      gl_FragColor = vec4(vColor, vAlpha * (1.0 - strength * 2.0));
    }
  `
});

const RainSystem = ({ 
  intensity = 0.5, 
  windSpeed = 0,
  temperature = 70 
}: RainSystemProps) => {
  const { scene, camera } = useThree();
  
  // Calculate number of raindrops based on intensity
  const count = Math.floor(2000 * intensity);
  
  // References for animation
  const pointsRef = useRef<THREE.Points>(null);
  const speedsRef = useRef<Float32Array>(new Float32Array());
  const sizesRef = useRef<Float32Array>(new Float32Array());
  const colorsRef = useRef<Float32Array>(new Float32Array());
  
  // Create raindrop properties
  const { positions, speeds, sizes, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Position
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;   // x
      positions[i3 + 1] = Math.random() * 20;       // y
      positions[i3 + 2] = (Math.random() - 0.5) * 30; // z
      
      // Speed varies with temperature (faster in warmer weather)
      const tempFactor = Math.min(Math.max((temperature - 32) / 40, 0), 1);
      speeds[i] = (Math.random() * 0.3 + 0.2) * (1 + tempFactor * 0.5);
      
      // Size varies with temperature (larger drops in warmer weather)
      sizes[i] = (Math.random() * 0.5 + 0.5) * (1 + tempFactor * 0.3);
      
      // Color varies with lighting conditions
      const brightness = 0.7 + Math.random() * 0.3;
      colors[i3] = 0.7 * brightness;     // R
      colors[i3 + 1] = 0.8 * brightness; // G
      colors[i3 + 2] = 1.0 * brightness; // B
    }
    
    return { positions, speeds, sizes, colors };
  }, [count, temperature]);
  
  // Set up geometry attributes
  useEffect(() => {
    if (!pointsRef.current) return;
    
    const geometry = pointsRef.current.geometry;
    
    // Store refs for animation
    speedsRef.current = speeds;
    sizesRef.current = sizes;
    colorsRef.current = colors;
    
    // Add attributes to geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    
    // Update material uniforms
    const material = pointsRef.current.material as THREE.ShaderMaterial;
    material.uniforms.intensity.value = intensity;
    
  }, [positions, speeds, sizes, colors, intensity]);
  
  // Animation
  useFrame(({ clock }) => {
    if (!pointsRef.current || !speedsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const speeds = speedsRef.current;
    const time = clock.getElapsedTime();
    
    // Update material time uniform for shader effects
    (pointsRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update vertical position
      positions[i3 + 1] -= speeds[i];
      
      // Add wind effect
      positions[i3] += windSpeed * speeds[i] * 0.5;
      
      // Reset if below ground
      if (positions[i3 + 1] < -1) {
        positions[i3] = (Math.random() - 0.5) * 30;
        positions[i3 + 1] = 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 30;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} material={rainMaterial}>
      <bufferGeometry />
    </points>
  );
};

export default RainSystem; 