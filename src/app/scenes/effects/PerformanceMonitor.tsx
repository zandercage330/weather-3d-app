'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Stats from 'stats.js';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showStats?: boolean;
  onPerformanceDrop?: (fps: number) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  showStats = false,
  onPerformanceDrop
}) => {
  const { gl, scene, camera } = useThree();
  const statsRef = useRef<Stats>();
  const fpsRef = useRef<number[]>([]);
  const frameCountRef = useRef(0);
  
  // Initialize stats
  useEffect(() => {
    if (showStats) {
      statsRef.current = new Stats();
      statsRef.current.showPanel(0); // 0: fps, 1: ms, 2: mb
      document.body.appendChild(statsRef.current.dom);
      
      return () => {
        if (statsRef.current) {
          document.body.removeChild(statsRef.current.dom);
        }
      };
    }
  }, [showStats]);
  
  // Performance optimization
  useEffect(() => {
    if (!enabled) return;
    
    // Optimize scene
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Enable frustum culling
        object.frustumCulled = true;
        
        // Optimize geometries
        if (object.geometry) {
          object.geometry.computeBoundingSphere();
          object.geometry.computeBoundingBox();
        }
        
        // Optimize materials
        if (object.material) {
          const material = object.material as THREE.Material;
          material.precision = 'lowp'; // Use low precision for better performance
        }
      }
    });
    
    // Optimize renderer
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.compile(scene, camera);
    
    // Enable texture compression
    gl.capabilities.isWebGL2 && gl.getContext().getExtension('WEBGL_compressed_texture_s3tc');
    
  }, [enabled, scene, camera, gl]);
  
  // Monitor performance
  useFrame((state, delta) => {
    if (!enabled) return;
    
    // Update stats if enabled
    if (showStats && statsRef.current) {
      statsRef.current.update();
    }
    
    // Calculate FPS
    const fps = 1 / delta;
    fpsRef.current.push(fps);
    
    // Keep last 60 frames for analysis
    if (fpsRef.current.length > 60) {
      fpsRef.current.shift();
    }
    
    // Check performance every 60 frames
    frameCountRef.current++;
    if (frameCountRef.current >= 60) {
      frameCountRef.current = 0;
      
      // Calculate average FPS
      const avgFps = fpsRef.current.reduce((a, b) => a + b) / fpsRef.current.length;
      
      // Check for performance issues
      if (avgFps < 30 && onPerformanceDrop) {
        onPerformanceDrop(avgFps);
      }
      
      // Adaptive quality adjustments
      if (avgFps < 30) {
        // Reduce quality for better performance
        gl.setPixelRatio(1);
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh && object.material) {
            const material = object.material as THREE.Material;
            material.precision = 'lowp';
          }
        });
      } else if (avgFps > 55) {
        // Increase quality if performance is good
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    }
  });
  
  return null;
};

export default PerformanceMonitor; 