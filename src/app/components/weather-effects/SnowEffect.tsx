'use client';

import React, { useRef, useEffect } from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface SnowEffectProps {
  intensity: EffectIntensity;
  precipitation: number; // 0-100 value
  windSpeed: number; // in mph
  temperature?: number; // temperature affects snowflake type
}

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  sway: number;
  swaySpeed: number;
  swayPos: number;
  rotation: number;
  rotationSpeed: number;
}

/**
 * Canvas-based snow effect with realistic snowflake movement
 * Supports wind direction and temperature influencing snowflake behavior
 */
export default function SnowEffect({ 
  intensity = 'medium', 
  precipitation = 50,
  windSpeed = 0,
  temperature = 30
}: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationFrameRef = useRef<number>(0);
  const canvasWidth = useRef<number>(0);
  const canvasHeight = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Calculate the number of snowflakes based on intensity and precipitation
  const getFlakeCount = (): number => {
    const baseCount = {
      'low': 50,
      'medium': 150,
      'high': 300,
      'none': 0
    }[intensity] || 0;
    
    // Scale count based on precipitation percentage
    return Math.floor(baseCount * (precipitation / 50));
  };
  
  // Initialize the snowflakes array
  const initSnowflakes = () => {
    const count = getFlakeCount();
    const flakes: Snowflake[] = [];
    
    for (let i = 0; i < count; i++) {
      flakes.push(createSnowflake(false));
    }
    
    snowflakesRef.current = flakes;
  };
  
  // Create a new snowflake with randomized properties
  const createSnowflake = (isReset: boolean = false): Snowflake => {
    // Temperature affects size and speed of snowflakes
    // Colder = smaller, faster flakes; Warmer = larger, slower flakes
    const tempFactor = Math.min(Math.max((32 - temperature) / 15, 0), 1);
    
    // Size of snowflake (2-6px)
    // Smaller in cold temperatures, larger in warmer temperatures
    const size = 2 + Math.random() * 4 * (1 - tempFactor * 0.5);
    
    // Fall speed (slower for larger flakes, faster for smaller flakes)
    // Adjusted by temperature (faster in colder weather)
    const speed = (0.5 + Math.random() * 1.5) * (7 - size) * (1 + tempFactor * 0.5);
    
    // Sway characteristics - how much the snowflake moves side to side
    const sway = 0.5 + Math.random() * 1.5;
    const swaySpeed = 0.003 + Math.random() * 0.007;
    
    // Rotation characteristics
    const rotation = Math.random() * Math.PI * 2;
    const rotationSpeed = (Math.random() - 0.5) * 0.01;
    
    return {
      x: isReset ? Math.random() * canvasWidth.current : Math.random() * canvasWidth.current,
      y: isReset ? -10 - Math.random() * 20 : Math.random() * canvasHeight.current,
      size,
      speed,
      opacity: 0.4 + Math.random() * 0.6,
      sway,
      swaySpeed,
      swayPos: Math.random() * Math.PI * 2, // Random starting position in sway cycle
      rotation,
      rotationSpeed
    };
  };
  
  // Draw the snowflakes on the canvas
  const drawSnow = (ctx: CanvasRenderingContext2D, timestamp: number) => {
    // Calculate time delta for smooth animation
    const timeDelta = timestamp - (timeRef.current || timestamp);
    timeRef.current = timestamp;
    
    ctx.clearRect(0, 0, canvasWidth.current, canvasHeight.current);
    
    // Wind effect - horizontal movement based on wind speed
    const windOffset = (windSpeed / 10) * (timeDelta / 16);
    
    snowflakesRef.current.forEach((flake, i) => {
      // Update position with gravity and wind
      flake.y += flake.speed * (timeDelta / 16);
      
      // Horizontal movement from wind and sway
      flake.swayPos += flake.swaySpeed * timeDelta;
      
      // Combine sway movement with wind influence
      const swayOffset = Math.sin(flake.swayPos) * flake.sway;
      const totalHorizontalMovement = swayOffset + windOffset;
      
      flake.x += totalHorizontalMovement;
      
      // Update rotation
      flake.rotation += flake.rotationSpeed * timeDelta;
      
      // Draw the snowflake
      drawFlake(ctx, flake);
      
      // Reset if off screen
      if (flake.y > canvasHeight.current || 
          flake.x > canvasWidth.current + 50 || 
          flake.x < -50) {
        snowflakesRef.current[i] = createSnowflake(true);
      }
    });
  };
  
  // Draw a single snowflake
  const drawFlake = (ctx: CanvasRenderingContext2D, flake: Snowflake) => {
    ctx.save();
    ctx.translate(flake.x, flake.y);
    ctx.rotate(flake.rotation);
    ctx.globalAlpha = flake.opacity;
    
    // Flake style varies by temperature
    if (temperature < 20) {
      // Very cold - simple small crystals
      drawCrystalFlake(ctx, flake.size);
    } else if (temperature < 28) {
      // Cold - detailed crystals
      drawDetailedCrystal(ctx, flake.size);
    } else {
      // Warmer - fluffy flakes
      drawSoftFlake(ctx, flake.size);
    }
    
    ctx.restore();
  };
  
  // Draw a simple crystal snowflake (cold weather)
  const drawCrystalFlake = (ctx: CanvasRenderingContext2D, size: number) => {
    const armLength = size * 1.2;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = size / 8;
    
    // Draw six arms
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, armLength);
      
      // Draw small branches on each arm
      ctx.moveTo(0, armLength * 0.4);
      ctx.lineTo(armLength * 0.2, armLength * 0.5);
      
      ctx.moveTo(0, armLength * 0.4);
      ctx.lineTo(-armLength * 0.2, armLength * 0.5);
      
      ctx.moveTo(0, armLength * 0.7);
      ctx.lineTo(armLength * 0.2, armLength * 0.8);
      
      ctx.moveTo(0, armLength * 0.7);
      ctx.lineTo(-armLength * 0.2, armLength * 0.8);
      
      ctx.stroke();
      ctx.rotate(Math.PI / 3);
    }
  };
  
  // Draw a detailed crystal (moderately cold weather)
  const drawDetailedCrystal = (ctx: CanvasRenderingContext2D, size: number) => {
    const armLength = size * 1.5;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = size / 10;
    
    // Draw six arms with more detailed branches
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, armLength);
      ctx.stroke();
      
      // Draw branches on each arm
      const branchCount = 3;
      const branchSpacing = armLength / (branchCount + 1);
      
      for (let j = 1; j <= branchCount; j++) {
        const branchY = j * branchSpacing;
        const branchLength = (armLength - branchY) * 0.4;
        
        ctx.beginPath();
        ctx.moveTo(0, branchY);
        ctx.lineTo(branchLength, branchY + branchLength * 0.3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, branchY);
        ctx.lineTo(-branchLength, branchY + branchLength * 0.3);
        ctx.stroke();
      }
      
      ctx.rotate(Math.PI / 3);
    }
  };
  
  // Draw a soft, fluffy snowflake (warmer weather)
  const drawSoftFlake = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Main circle
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Small satellite circles for fluffy appearance
    const satellites = Math.floor(3 + Math.random() * 3);
    for (let i = 0; i < satellites; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = size * 0.3 + Math.random() * size * 0.3;
      const satelliteSize = size * (0.3 + Math.random() * 0.2);
      
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        satelliteSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };
  
  // Animation loop
  const animate = (timestamp: number) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    drawSnow(ctx, timestamp);
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // Set up the canvas and start the animation
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      
      canvasWidth.current = canvasRef.current.width;
      canvasHeight.current = canvasRef.current.height;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    initSnowflakes();
    
    if (intensity !== 'none') {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [intensity, precipitation, windSpeed, temperature]);
  
  // Don't render if intensity is none
  if (intensity === 'none') {
    return null;
  }
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-20"
      aria-hidden="true"
    />
  );
} 