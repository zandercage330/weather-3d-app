'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { BackSide } from 'three';

interface SkyBoxProps {
  timeOfDay: 'day' | 'night';
}

const SkyBox = ({ timeOfDay }: SkyBoxProps) => {
  // Sky colors
  const skyColors = useMemo(() => {
    return {
      day: {
        top: new THREE.Color('#1e90ff'),    // Dodger blue
        bottom: new THREE.Color('#87ceeb'),  // Sky blue
      },
      night: {
        top: new THREE.Color('#000033'),    // Dark blue
        bottom: new THREE.Color('#0a1a3f'),  // Navy blue
      }
    };
  }, []);

  // Select colors based on time of day
  const { top, bottom } = skyColors[timeOfDay];

  // Create shader material for the sky
  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: top },
        bottomColor: { value: bottom },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: BackSide,
    });
  }, [top, bottom]);

  return (
    <mesh>
      <sphereGeometry args={[50, 32, 15]} />
      <primitive object={skyMaterial} attach="material" />
      
      {/* Add stars if night time */}
      {timeOfDay === 'night' && <Stars />}
    </mesh>
  );
};

// Stars component for night sky
const Stars = () => {
  // Create random star positions
  const positions = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Position stars on a sphere
      const radius = 40 + Math.random() * 5; // Slightly different distances
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  return (
    <points>
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
        size={0.2}
        color="white"
        transparent
        opacity={0.8}
        sizeAttenuation={false}
      />
    </points>
  );
};

export default SkyBox; 