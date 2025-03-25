'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Cloud } from '@react-three/drei';

interface CloudSystemProps {
  density?: number;
  count?: number;
  speed?: number;
  interactive?: boolean;
  onCloudClick?: (event: ThreeEvent<MouseEvent>) => void;
}

const CloudSystem: React.FC<CloudSystemProps> = ({
  density = 0.5,
  count = 30,
  speed = 0.2,
  interactive = false,
  onCloudClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh[]>([]);
  
  useEffect(() => {
    if (!groupRef.current) return;
    
    // Clear existing clouds
    cloudsRef.current = [];
    
    // Create new clouds
    for (let i = 0; i < count; i++) {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(1, 8, 8),
        new THREE.MeshStandardMaterial({
          transparent: true,
          opacity: 0.8 * density,
          color: '#ffffff'
        })
      );
      
      // Random position
      cloud.position.set(
        Math.random() * 40 - 20,
        Math.random() * 5 + 5,
        Math.random() * 40 - 20
      );
      
      // Random scale
      const scale = Math.random() * 2 + 1;
      cloud.scale.set(scale, scale * 0.6, scale);
      
      // Add interaction if enabled
      if (interactive) {
        cloud.userData.interactive = true;
        cloud.userData.originalScale = scale;
      }
      
      groupRef.current.add(cloud);
      cloudsRef.current.push(cloud);
    }
    
    return () => {
      if (groupRef.current) {
        cloudsRef.current.forEach(cloud => {
          groupRef.current?.remove(cloud);
          cloud.geometry.dispose();
          (cloud.material as THREE.Material).dispose();
        });
      }
    };
  }, [count, density, interactive]);
  
  // Handle cloud animation and interaction
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    cloudsRef.current.forEach((cloud, i) => {
      // Move clouds
      cloud.position.x += speed * delta;
      
      // Wrap around when out of bounds
      if (cloud.position.x > 20) {
        cloud.position.x = -20;
      }
      
      // Handle hover animation if interactive
      if (interactive && cloud.userData.interactive) {
        const distance = state.camera.position.distanceTo(cloud.position);
        const hoverScale = Math.max(1 - (distance / 30), 0.8);
        const targetScale = cloud.userData.originalScale * (1 + hoverScale * 0.2);
        
        cloud.scale.lerp(
          new THREE.Vector3(targetScale, targetScale * 0.6, targetScale),
          0.1
        );
      }
    });
  });
  
  return (
    <group 
      ref={groupRef}
      onClick={(event) => {
        if (interactive && onCloudClick) {
          const cloud = event.object;
          if (cloud.userData.interactive) {
            onCloudClick(event);
          }
        }
      }}
    >
      {/* Clouds will be added dynamically */}
    </group>
  );
};

export default CloudSystem; 