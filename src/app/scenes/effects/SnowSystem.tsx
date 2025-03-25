'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SnowSystemProps {
  intensity?: number; // 0 to 1
  windSpeed?: number; // 0 to 1
  temperature?: number; // in Fahrenheit
}

// Snowflake shader for realistic rendering
const snowMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    time: { value: 0 },
    intensity: { value: 0.5 },
  },
  vertexShader: `
    attribute float size;
    attribute float rotation;
    attribute float rotationSpeed;
    attribute vec3 customColor;
    varying vec3 vColor;
    varying float vRotation;
    varying float vAlpha;
    
    void main() {
      vColor = customColor;
      vRotation = rotation;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      vAlpha = 0.9 * (1.0 - abs(position.y) / 20.0); // Fade based on height
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vRotation;
    varying float vAlpha;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float angle = vRotation;
      float c = cos(angle);
      float s = sin(angle);
      vec2 rotated = vec2(
        center.x * c - center.y * s,
        center.x * s + center.y * c
      );
      
      // Create snowflake shape
      float r = length(rotated);
      float a = atan(rotated.y, rotated.x);
      
      // Six-pointed star pattern
      float f = abs(cos(a * 3.0));
      f = mix(f, 1.0, 0.5);
      
      if(r > 0.5 * f) discard;
      
      // Add some sparkle
      float sparkle = pow(f, 5.0) * 0.3;
      vec3 finalColor = vColor + sparkle;
      
      gl_FragColor = vec4(finalColor, vAlpha * (1.0 - r * 2.0));
    }
  `
});

const SnowSystem = ({ 
  intensity = 0.5, 
  windSpeed = 0,
  temperature = 30 
}: SnowSystemProps) => {
  const { scene, camera } = useThree();
  
  // Calculate number of snowflakes based on intensity
  const count = Math.floor(1500 * intensity);
  
  // References for animation
  const pointsRef = useRef<THREE.Points>(null);
  const speedsRef = useRef<Float32Array>(new Float32Array());
  const rotationsRef = useRef<Float32Array>(new Float32Array());
  const rotationSpeedsRef = useRef<Float32Array>(new Float32Array());
  const wobbleRef = useRef<Float32Array>(new Float32Array());
  
  // Create snowflake properties
  const { positions, speeds, sizes, colors, rotations, rotationSpeeds, wobble } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const rotations = new Float32Array(count);
    const rotationSpeeds = new Float32Array(count);
    const wobble = new Float32Array(count * 2); // x: speed, y: amplitude
    
    for (let i = 0; i < count; i++) {
      // Position
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;     // x
      positions[i3 + 1] = Math.random() * 20;         // y
      positions[i3 + 2] = (Math.random() - 0.5) * 30; // z
      
      // Temperature affects size and speed
      const tempFactor = Math.min(Math.max((32 - temperature) / 15, 0), 1);
      
      // Speed (slower for larger flakes)
      sizes[i] = Math.random() * 0.3 + 0.2;
      speeds[i] = (0.05 + Math.random() * 0.05) * (1 + tempFactor * 0.5);
      
      // Rotation
      rotations[i] = Math.random() * Math.PI * 2;
      rotationSpeeds[i] = (Math.random() - 0.5) * 0.02;
      
      // Wobble characteristics
      const i2 = i * 2;
      wobble[i2] = Math.random() * 0.5 + 0.2;     // speed
      wobble[i2 + 1] = Math.random() * 0.3 + 0.1; // amplitude
      
      // Color varies with lighting and temperature
      const brightness = 0.9 + Math.random() * 0.1;
      colors[i3] = brightness;     // R
      colors[i3 + 1] = brightness; // G
      colors[i3 + 2] = brightness; // B
    }
    
    return { positions, speeds, sizes, colors, rotations, rotationSpeeds, wobble };
  }, [count, temperature]);
  
  // Set up geometry attributes
  useEffect(() => {
    if (!pointsRef.current) return;
    
    const geometry = pointsRef.current.geometry;
    
    // Store refs for animation
    speedsRef.current = speeds;
    rotationsRef.current = rotations;
    rotationSpeedsRef.current = rotationSpeeds;
    wobbleRef.current = wobble;
    
    // Add attributes to geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
    geometry.setAttribute('rotationSpeed', new THREE.BufferAttribute(rotationSpeeds, 1));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    
    // Update material uniforms
    const material = pointsRef.current.material as THREE.ShaderMaterial;
    material.uniforms.intensity.value = intensity;
    
  }, [positions, speeds, sizes, colors, rotations, rotationSpeeds, intensity]);
  
  // Animation
  useFrame(({ clock }) => {
    if (!pointsRef.current || !speedsRef.current || !rotationsRef.current || 
        !rotationSpeedsRef.current || !wobbleRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const speeds = speedsRef.current;
    const rotations = rotationsRef.current;
    const rotationSpeeds = rotationSpeedsRef.current;
    const wobble = wobbleRef.current;
    const time = clock.getElapsedTime();
    
    // Update material time uniform for shader effects
    (pointsRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i2 = i * 2;
      
      // Update vertical position
      positions[i3 + 1] -= speeds[i];
      
      // Add wobble movement
      positions[i3] += Math.sin(time * wobble[i2] + i) * wobble[i2 + 1] * 0.01;
      positions[i3 + 2] += Math.cos(time * wobble[i2] + i) * wobble[i2 + 1] * 0.01;
      
      // Add wind effect
      positions[i3] += windSpeed * speeds[i] * 0.5;
      
      // Update rotation
      rotations[i] += rotationSpeeds[i];
      
      // Reset if below ground
      if (positions[i3 + 1] < -1) {
        positions[i3] = (Math.random() - 0.5) * 30;
        positions[i3 + 1] = 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 30;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.rotation.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} material={snowMaterial}>
      <bufferGeometry />
    </points>
  );
};

export default SnowSystem; 