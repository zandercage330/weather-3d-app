'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

interface CloudSystemProps {
  count?: number;
  density?: number; // 0 to 1
  speed?: number;
}

const CloudSystem = ({ 
  count = 20, 
  density = 0.5, // 0 to 1
  speed = 0.1
}: CloudSystemProps) => {
  // Adjust count based on density
  const cloudCount = Math.floor(count * Math.max(0.1, density));
  
  // Create random positions for clouds
  const positions = useMemo(() => {
    return Array.from({ length: cloudCount }, () => ({
      position: [
        (Math.random() - 0.5) * 20, // x
        Math.random() * 3 + 3,      // y (positioned above the scene)
        (Math.random() - 0.5) * 20  // z
      ],
      scale: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.01 * speed
    }));
  }, [cloudCount, speed]);

  // Group ref for moving all clouds together
  const groupRef = useRef<THREE.Group>(null);
  
  // Animation - move clouds slowly
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0003 * speed;
    }
  });

  return (
    <group ref={groupRef}>
      <Instances limit={cloudCount}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial 
          color="white" 
          transparent
          opacity={Math.min(0.8, density * 0.8)}
        />
        
        {positions.map((data, i) => (
          <Cloud 
            key={i} 
            position={data.position as [number, number, number]} 
            scale={data.scale} 
            rotation={data.rotation}
            speed={data.speed}
          />
        ))}
      </Instances>
    </group>
  );
};

interface CloudProps {
  position: [number, number, number];
  scale: number;
  rotation: number;
  speed: number;
}

const Cloud = ({ position, scale, rotation, speed }: CloudProps) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ref.current) {
      // Make clouds drift slightly
      ref.current.position.x += Math.sin(rotation) * speed;
      ref.current.position.z += Math.cos(rotation) * speed;
      
      // Reset position if cloud moves too far
      if (ref.current.position.x > 15) ref.current.position.x = -15;
      if (ref.current.position.x < -15) ref.current.position.x = 15;
      if (ref.current.position.z > 15) ref.current.position.z = -15;
      if (ref.current.position.z < -15) ref.current.position.z = 15;
    }
  });

  return (
    <Instance 
      ref={ref}
      position={position}
      scale={[scale * 2.5, scale, scale * 1.5]}
      rotation={[0, rotation, 0]}
    />
  );
};

export default CloudSystem; 