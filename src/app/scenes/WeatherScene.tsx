'use client';

import React, { Suspense, useRef, useEffect, useState, Fragment } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Stats 
} from '@react-three/drei';
import { 
  EffectComposer, 
  Bloom, 
  Vignette, 
  ChromaticAberration,
  DepthOfField
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// Import our effects
import CloudSystem from './effects/CloudSystem';
import RainSystem from './effects/RainSystem';
import SnowSystem from './effects/SnowSystem';
import SkyBox from './effects/SkyBox';
import FogEffect from './effects/FogEffect';
import LightningEffect from './effects/LightningEffect';

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
}

// Transition duration in seconds
const TRANSITION_DURATION = 2.0;

const WeatherScene: React.FC<WeatherSceneProps> = ({
  condition = 'clear',
  temperature = 75,
  timeOfDay = 'day',
  precipitation = 0,
  humidity = 40,
  cloudCover = 0.2, // 0 to 1
  windSpeed = 0, // mph
  fullScreen = false,
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

  return (
    <div className={`${fullScreen ? 'w-screen h-screen' : 'w-full h-[400px]'}`}>
      <Canvas shadows camera={{ position: [0, 3, 13], fov: 50 }}>
        {/* Animated Camera */}
        <AnimatedCamera timeOfDay={timeOfDay} condition={condition} />
        
        {/* Sky */}
        <SkyBox timeOfDay={timeOfDay} />
        
        {/* Lighting */}
        <ambientLight intensity={timeOfDay === 'day' ? 1 : 0.2} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={timeOfDay === 'day' ? 1.5 : 0.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Add some subtle light for depth */}
        <pointLight position={[-10, 0, -10]} intensity={0.2} color={timeOfDay === 'night' ? '#3498db' : '#ffffff'} />
        
        <Suspense fallback={null}>
          {/* Clouds */}
          <CloudSystem 
            density={cloudDensity}
            count={fullScreen ? 50 : 30}
            speed={cloudSpeed}
          />
          
          {/* Weather precipitation effects */}
          {isRaining && <RainSystem intensity={rainIntensity} />}
          {isSnowing && <SnowSystem intensity={snowIntensity} />}
          
          {/* Atmospheric effects */}
          {isFoggy && <FogEffect density={fogDensity} timeOfDay={timeOfDay} />}
          {hasLightning && <LightningEffect enabled={true} intensity={lightningIntensity} />}
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial 
              color={
                isSnowing ? '#f5f5f5' : 
                (timeOfDay === 'day' ? '#2ecc71' : '#196f3d')
              } 
            />
          </mesh>
        </Suspense>
        
        {/* Post-processing effects */}
        <EffectComposer enabled={true}>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            blendFunction={BlendFunction.SCREEN}
          />
          <Vignette 
            darkness={vignetteIntensity} 
            offset={0.5} 
            blendFunction={BlendFunction.NORMAL}
          />
          
          {/* Weather effects with proper conditional rendering */}
          <WeatherEffects 
            isRaining={isRaining}
            isSnowing={isSnowing}
            hasLightning={hasLightning}
            isFoggy={isFoggy}
          />
        </EffectComposer>
        
        {/* Controls */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minPolarAngle={Math.PI / 6}
          enableRotate={fullScreen}
          rotateSpeed={0.5}
        />
        
        {/* Uncomment for performance stats (development only) */}
        {/* <Stats /> */}
      </Canvas>
      
      {/* Transition indicator - only visible during development */}
      {isTransitioning && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
          Transitioning: {Math.round(transitionProgress * 100)}%
        </div>
      )}
    </div>
  );
};

export default WeatherScene; 