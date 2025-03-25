'use client';

import React, { Suspense, useRef, useEffect, useState, Fragment } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Stats,
  Sky,
  Cloud
} from '@react-three/drei';
import { 
  EffectComposer, 
  Bloom, 
  Vignette, 
  ChromaticAberration,
  DepthOfField,
  SMAA
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import * as THREE from 'three';

// Import our effects
import CloudSystem from './effects/CloudSystem';
import RainSystem from './effects/RainSystem';
import SnowSystem from './effects/SnowSystem';
import SkyBox from './effects/SkyBox';
import FogEffect from './effects/FogEffect';
import LightningEffect from './effects/LightningEffect';
import PerformanceMonitor from './effects/PerformanceMonitor';
import AccessibilityManager from './effects/AccessibilityManager';

interface CameraProps {
  timeOfDay?: 'day' | 'night';
  condition?: string;
}

// Camera animation component
const AnimatedCamera: React.FC<CameraProps> = ({ timeOfDay, condition }) => {
  const { camera } = useThree();
  const targetPosition = useRef([0, 3, 13]);
  
  // Change camera position based on weather
  useEffect(() => {
    if (condition === 'storm') {
      targetPosition.current = [0, 5, 15];
    } else if (condition === 'fog') {
      targetPosition.current = [0, 3, 10];
    } else if (condition === 'snow') {
      targetPosition.current = [2, 2, 12];
    } else {
      targetPosition.current = [0, 3, 13];
    }
  }, [condition]);
  
  // Animate camera
  useFrame(() => {
    camera.position.x += (targetPosition.current[0] - camera.position.x) * 0.03;
    camera.position.y += (targetPosition.current[1] - camera.position.y) * 0.03;
    camera.position.z += (targetPosition.current[2] - camera.position.z) * 0.03;
  });
  
  return null;
};

// Weather effect components with proper conditional rendering
const WeatherEffects: React.FC<{
  isRaining: boolean; 
  isSnowing: boolean;
  hasLightning: boolean;
  isFoggy: boolean;
}> = ({
  isRaining,
  isSnowing,
  hasLightning,
  isFoggy
}) => {
  return (
    <Fragment>
      {/* Only render if condition is true */}
      {(isRaining || isSnowing || hasLightning) ? (
        <ChromaticAberration 
          offset={[0.001, 0.001]} 
          blendFunction={BlendFunction.NORMAL}
        />
      ) : null}
      
      {isFoggy ? (
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.02}
          bokehScale={2}
        />
      ) : null}
    </Fragment>
  );
};

interface WeatherSceneProps {
  condition?: string;
  temperature?: number;
  timeOfDay?: 'day' | 'night';
  precipitation?: number;
  humidity?: number;
  cloudCover?: number;
  windSpeed?: number;
  fullScreen?: boolean;
  intensity?: number;
  showPerformanceStats?: boolean;
  onPerformanceDrop?: (fps: number) => void;
  onInteraction?: (event: { type: string; position: THREE.Vector3 }) => void;
  onAccessibilityAnnouncement?: (message: string) => void;
}

// Transition duration in seconds
const TRANSITION_DURATION = 2.0;

// Performance optimization component
const PerformanceOptimizer: React.FC<{ condition: string }> = ({ condition }) => {
  const { gl } = useThree();
  
  useEffect(() => {
    // Optimize renderer based on weather condition
    (gl as THREE.WebGLRenderer).toneMapping = THREE.ACESFilmicToneMapping;
    (gl as THREE.WebGLRenderer).toneMappingExposure = condition === 'night' ? 0.5 : 1;
    
    // Enable shadow optimization
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl, condition]);
  
  return null;
};

// Enhanced dynamic lighting
const EnhancedLighting: React.FC<{
  condition: string;
  timeOfDay: 'day' | 'night';
  intensity: number;
}> = ({ condition, timeOfDay, intensity }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (!lightRef.current || !ambientRef.current) return;

    const isDaytime = timeOfDay === 'day';
    const baseIntensity = isDaytime ? 1.0 : 0.3;
    const weatherFactor = condition === 'clear' ? 1 : 
                         condition === 'cloudy' ? 0.7 :
                         condition === 'rain' ? 0.5 :
                         condition === 'snow' ? 0.8 : 0.6;

    const targetIntensity = baseIntensity * weatherFactor;
    lightRef.current.intensity = targetIntensity;
    
    const ambientIntensity = isDaytime ? 0.4 : 0.2;
    ambientRef.current.intensity = ambientIntensity * weatherFactor;

    const lightColor = isDaytime ? 
      new THREE.Color(0xffffff).multiplyScalar(intensity) : 
      new THREE.Color(0x2c5aa0).multiplyScalar(intensity * 0.8);
    
    lightRef.current.color = lightColor;
    
    // Enhanced shadow settings
    if (lightRef.current.shadow.camera) {
      const shadowCamera = lightRef.current.shadow.camera;
      shadowCamera.near = 1;
      shadowCamera.far = 50;
      shadowCamera.left = -10;
      shadowCamera.right = 10;
      shadowCamera.top = 10;
      shadowCamera.bottom = -10;
      
      // Higher resolution shadows for better quality
      lightRef.current.shadow.mapSize.width = 2048;
      lightRef.current.shadow.mapSize.height = 2048;
      lightRef.current.shadow.bias = -0.001;
      lightRef.current.shadow.normalBias = 0.05;
    }
  }, [condition, timeOfDay, intensity]);

  return (
    <>
      <ambientLight ref={ambientRef} />
      <directionalLight
        ref={lightRef}
        position={[5, 5, 5]}
        castShadow
      />
      {/* Add subtle fill light for better shadows */}
      <hemisphereLight
        intensity={0.3}
        color={timeOfDay === 'day' ? '#ffffff' : '#2c5aa0'}
        groundColor={timeOfDay === 'day' ? '#ffffff' : '#000000'}
      />
    </>
  );
};

// Atmospheric effects based on weather
const AtmosphericEffects = ({ 
  condition, 
  temperature,
  windSpeed,
  intensity = 0.5 
}: {
  condition: string;
  temperature: number;
  windSpeed: number;
  intensity?: number;
}) => {
  const cloudIntensity = condition === 'cloudy' ? intensity : 
                        condition === 'rain' ? intensity * 0.8 :
                        condition === 'snow' ? intensity * 0.6 : 0.2;

  return (
    <>
      {/* Dynamic clouds */}
      <Cloud
        opacity={cloudIntensity}
        speed={0.4}
        segments={20}
        position={[0, 5, -5]}
        scale={[3, 1, 1]}
      />
      
      {/* Weather effects */}
      {condition === 'rain' && (
        <RainSystem 
          intensity={intensity}
          temperature={temperature}
          windSpeed={windSpeed}
        />
      )}
      {condition === 'snow' && (
        <SnowSystem 
          intensity={intensity}
          temperature={temperature}
          windSpeed={windSpeed}
        />
      )}
      
      {/* Fog effect for all conditions */}
      <FogEffect 
        intensity={
          condition === 'cloudy' ? intensity * 0.5 :
          condition === 'rain' ? intensity * 0.3 :
          condition === 'snow' ? intensity * 0.4 : 0.1
        }
        temperature={temperature}
        windSpeed={windSpeed}
      />
    </>
  );
};

const WeatherScene: React.FC<WeatherSceneProps> = ({
  condition = 'clear',
  temperature = 75,
  timeOfDay = 'day',
  precipitation = 0,
  humidity = 40,
  cloudCover = 0.2, // 0 to 1
  windSpeed = 0, // mph
  fullScreen = false,
  intensity = 0.5,
  showPerformanceStats = false,
  onPerformanceDrop,
  onInteraction,
  onAccessibilityAnnouncement
}) => {
  // Track previous weather states for transitions
  const [prevCondition, setPrevCondition] = useState(condition);
  const [transitionProgress, setTransitionProgress] = useState(1); // 0 to 1, 1 means transition complete
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Track effect intensities for smooth transitions
  const [rainIntensity, setRainIntensity] = useState(0);
  const [snowIntensity, setSnowIntensity] = useState(0);
  const [fogDensity, setFogDensity] = useState(0);
  const [cloudDensity, setCloudDensity] = useState(getCloudDensityByCondition(condition, cloudCover, humidity));
  const [lightningIntensity, setLightningIntensity] = useState(0);
  
  // Track the last update time for animation
  const lastUpdateTime = useRef(Date.now());
  
  // Accessibility announcement state
  const [accessibilityMessage, setAccessibilityMessage] = useState<string>('');

  // Detect condition changes and trigger transitions
  useEffect(() => {
    if (condition !== prevCondition) {
      // Start transition
      setIsTransitioning(true);
      setTransitionProgress(0);
      lastUpdateTime.current = Date.now();
      
      // After transition is complete, update the previous condition
      const transitionTimer = setTimeout(() => {
        setPrevCondition(condition);
        setIsTransitioning(false);
        setTransitionProgress(1);
      }, TRANSITION_DURATION * 1000);
      
      return () => clearTimeout(transitionTimer);
    }
  }, [condition, prevCondition]);
  
  // Animate transitions
  useEffect(() => {
    if (!isTransitioning) return;
    
    const targetRainIntensity = calculateRainIntensity(condition, precipitation);
    const targetSnowIntensity = calculateSnowIntensity(condition, temperature, precipitation);
    const targetFogDensity = calculateFogDensity(condition, humidity, temperature);
    const targetCloudDensity = getCloudDensityByCondition(condition, cloudCover, humidity);
    const targetLightningIntensity = calculateLightningIntensity(condition, precipitation);
    
    const prevRainIntensity = calculateRainIntensity(prevCondition, precipitation);
    const prevSnowIntensity = calculateSnowIntensity(prevCondition, temperature, precipitation);
    const prevFogDensity = calculateFogDensity(prevCondition, humidity, temperature);
    const prevCloudDensity = getCloudDensityByCondition(prevCondition, cloudCover, humidity);
    const prevLightningIntensity = calculateLightningIntensity(prevCondition, precipitation);
    
    const animateTransition = () => {
      if (!isTransitioning) return;
      
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;
      
      // Update transition progress
      const newProgress = Math.min(transitionProgress + (deltaTime / TRANSITION_DURATION), 1);
      setTransitionProgress(newProgress);
      
      // Interpolate effect intensities
      setRainIntensity(lerp(prevRainIntensity, targetRainIntensity, newProgress));
      setSnowIntensity(lerp(prevSnowIntensity, targetSnowIntensity, newProgress));
      setFogDensity(lerp(prevFogDensity, targetFogDensity, newProgress));
      setCloudDensity(lerp(prevCloudDensity, targetCloudDensity, newProgress));
      setLightningIntensity(lerp(prevLightningIntensity, targetLightningIntensity, newProgress));
      
      if (newProgress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };
    
    requestAnimationFrame(animateTransition);
    
    return () => {};
  }, [isTransitioning, condition, prevCondition, precipitation, temperature, humidity, cloudCover]);
  
  // Helper function for linear interpolation
  function lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
  }
  
  // Helper function to calculate cloud density based on condition
  function getCloudDensityByCondition(
    currentCondition: string, 
    currentCloudCover: number, 
    currentHumidity: number
  ): number {
    switch (currentCondition) {
      case 'clear':
        return 0.1;
      case 'partly-cloudy':
        return 0.4;
      case 'cloudy':
        return 0.7;
      case 'rain':
      case 'storm':
        return 0.8;
      case 'snow':
        return 0.6;
      case 'fog':
        return 0.4;
      default:
        return Math.min(1, currentCloudCover + (currentHumidity / 100) * 0.3);
    }
  }
  
  // Helper functions to calculate effect intensities
  function calculateRainIntensity(currentCondition: string, currentPrecipitation: number): number {
    const isRaining = currentCondition === 'rain' || currentCondition === 'storm';
    return isRaining ? Math.max(0.3, currentPrecipitation / 100) : 0;
  }
  
  function calculateSnowIntensity(
    currentCondition: string, 
    currentTemperature: number, 
    currentPrecipitation: number
  ): number {
    const isSnowing = currentCondition === 'snow' || (currentCondition === 'cloudy' && currentTemperature < 32);
    return isSnowing ? Math.max(0.3, currentPrecipitation / 100) : 0;
  }
  
  function calculateFogDensity(
    currentCondition: string, 
    currentHumidity: number, 
    currentTemperature: number
  ): number {
    const isFoggy = currentCondition === 'fog' || (currentHumidity > 90 && currentTemperature < 50);
    return isFoggy ? Math.max(0.2, currentHumidity / 100) : 0;
  }
  
  function calculateLightningIntensity(currentCondition: string, currentPrecipitation: number): number {
    const hasLightning = currentCondition === 'storm';
    return hasLightning ? Math.max(0.3, currentPrecipitation / 100) : 0;
  }
  
  // Weather condition flags - using actual intensities for smooth transitions
  const isRaining = rainIntensity > 0.01;
  const isSnowing = snowIntensity > 0.01;
  const isFoggy = fogDensity > 0.01;
  const hasLightning = lightningIntensity > 0.01;
  
  // Wind effect
  const cloudSpeed = (windSpeed / 30) * 0.3 + (condition === 'storm' ? 0.3 : 0.1);
  
  // Determine post-processing effects based on conditions
  const bloomIntensity = timeOfDay === 'day' ? 0.2 : 0.5;
  const vignetteIntensity = timeOfDay === 'night' ? 0.7 : 0.3;
  
  // Environment settings based on conditions
  const isDark = timeOfDay === 'night' || condition === 'storm';

  // Add interaction handler
  const handleSceneInteraction = (event: THREE.Event) => {
    if (!onInteraction) return;
    
    const intersects = (event as any).intersects;
    if (intersects && intersects.length > 0) {
      const position = intersects[0].point;
      onInteraction({
        type: event.type,
        position: position
      });
    }
  };

  // Handle accessibility announcements
  useEffect(() => {
    if (accessibilityMessage && onAccessibilityAnnouncement) {
      onAccessibilityAnnouncement(accessibilityMessage);
    }
  }, [accessibilityMessage, onAccessibilityAnnouncement]);

  return (
    <div 
      className={`${fullScreen ? 'w-screen h-screen' : 'w-full h-[400px]'} relative`}
      role="region"
      aria-label="Interactive weather visualization"
    >
      <Canvas
        shadows
        camera={{ position: [0, 3, 13], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        onPointerDown={handleSceneInteraction}
        onPointerMove={handleSceneInteraction}
      >
        <PerformanceMonitor
          enabled={true}
          showStats={showPerformanceStats}
          onPerformanceDrop={onPerformanceDrop}
        />
        
        <PerformanceOptimizer condition={condition} />
        
        <AnimatedCamera timeOfDay={timeOfDay} condition={condition} />
        
        <Sky 
          distance={450000}
          sunPosition={timeOfDay === 'day' ? [0, 1, 0] : [0, -1, 0]}
          inclination={timeOfDay === 'day' ? 0.6 : 0.1}
          azimuth={0.25}
          turbidity={condition === 'cloudy' ? 10 : 6}
          rayleigh={condition === 'clear' ? 1 : 3}
        />
        
        <EnhancedLighting 
          condition={condition}
          timeOfDay={timeOfDay}
          intensity={intensity}
        />
        
        <Suspense fallback={null}>
          <CloudSystem 
            density={cloudDensity}
            count={fullScreen ? 50 : 30}
            speed={cloudSpeed}
            interactive={true}
            onCloudClick={(event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              handleSceneInteraction(event);
              setAccessibilityMessage('Interacting with cloud formation');
            }}
          />
          
          <AtmosphericEffects 
            condition={condition}
            temperature={temperature}
            windSpeed={windSpeed}
            intensity={intensity}
          />
          
          {/* Enhanced ground with better materials */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -1, 0]} 
            receiveShadow
            onClick={(event) => {
              event.stopPropagation();
              handleSceneInteraction(event);
            }}
            userData={{
              interactive: true,
              type: 'ground',
              description: `Ground surface showing ${isSnowing ? 'snow cover' : 'terrain'}`
            }}
          >
            <planeGeometry args={[100, 100, 32, 32]} />
            <meshStandardMaterial 
              color={isSnowing ? '#f5f5f5' : (timeOfDay === 'day' ? '#2ecc71' : '#196f3d')}
              roughness={0.8}
              metalness={0.1}
              envMapIntensity={0.5}
            />
          </mesh>
        </Suspense>
        
        {/* Post-processing effects */}
        <Suspense fallback={null}>
          <EffectComposer>
            <SMAA />
            <Bloom
              intensity={isDark ? 0.8 : 0.5}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              kernelSize={KernelSize.LARGE}
            />
            <Vignette
              darkness={isDark ? 0.7 : 0.3}
              offset={0.5}
            />
            <DynamicEffects 
              condition={condition}
              intensity={intensity}
            />
          </EffectComposer>
        </Suspense>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minPolarAngle={Math.PI / 6}
          enableRotate={fullScreen}
          rotateSpeed={0.5}
        />
        
        <AccessibilityManager
          condition={condition}
          timeOfDay={timeOfDay}
          onFocus={(description) => setAccessibilityMessage(description)}
        />
      </Canvas>
      
      {/* Accessibility status messages */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite"
      >
        {accessibilityMessage}
      </div>

      {/* Performance indicator */}
      {showPerformanceStats && (
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
          Performance Mode: {transitionProgress < 1 ? 'Optimized' : 'Normal'}
        </div>
      )}

      {isTransitioning && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
          Transitioning: {Math.round(transitionProgress * 100)}%
        </div>
      )}
    </div>
  );
};

// Dynamic effects component
const DynamicEffects: React.FC<{ condition: string; intensity: number }> = ({ condition, intensity }) => {
  switch (condition) {
    case 'rain':
      return (
        <ChromaticAberration
          offset={[0.002, 0.002]}
          radialModulation
          modulationOffset={0.5}
        />
      );
    case 'snow':
      return (
        <ChromaticAberration
          offset={[0.001, 0.001]}
          radialModulation
          modulationOffset={0.3}
        />
      );
    case 'fog':
      return (
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.02}
          bokehScale={3}
        />
      );
    default:
      return null;
  }
};

export default WeatherScene; 