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
      'low': 30,
      'medium': 70,
      'high': 150,
      'none': 0
    }[intensity] || 0;
    
    // Scale count based on precipitation percentage
    return Math.floor(baseCount * (precipitation / 50));
  };

  // Initialize snowflakes with varying properties
  const initSnowflakes = () => {
    if (!canvasRef.current) return;
    
    const count = getFlakeCount();
    const flakes: Snowflake[] = [];
    
    for (let i = 0; i < count; i++) {
      flakes.push(createSnowflake());
    }
    
    snowflakesRef.current = flakes;
  };

  // Create a single snowflake with random properties
  const createSnowflake = (isReset: boolean = false): Snowflake => {
    // Wet, heavy snow for temperatures near freezing
    const isWetSnow = temperature > 28;
    
    // Size depends on temperature - colder = smaller, drier flakes
    const sizeRange = isWetSnow ? [3, 7] : [2, 5];
    const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    
    // Speed depends on size and type - larger and wetter falls faster
    const speedFactor = isWetSnow ? 1.2 : 1;
    const speedRange = [1, 3];
    const speed = (speedRange[0] + Math.random() * (speedRange[1] - speedRange[0])) * speedFactor;
    
    // Higher opacity for wet snow
    const opacity = isWetSnow ? 0.7 + Math.random() * 0.3 : 0.4 + Math.random() * 0.3;
    
    // Sway (horizontal movement) is less for wet snow
    const swayFactor = isWetSnow ? 0.7 : 1.5;
    const sway = Math.random() * 2 * swayFactor;
    const swaySpeed = 0.01 + Math.random() * 0.02;
    
    return {
      x: Math.random() * canvasWidth.current,
      y: isReset ? -size * 2 : Math.random() * canvasHeight.current,
      size,
      speed,
      opacity,
      sway,
      swaySpeed,
      swayPos: Math.random() * Math.PI * 2, // Random start position in the sine wave
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01
    };
  };

  // Draw all snowflakes on canvas
  const drawSnow = (ctx: CanvasRenderingContext2D, timestamp: number) => {
    ctx.clearRect(0, 0, canvasWidth.current, canvasHeight.current);
    
    // Wind influence on horizontal movement
    const windFactor = Math.min(windSpeed / 5, 2);
    
    timeRef.current = timestamp;
    
    snowflakesRef.current.forEach((flake) => {
      // Update position with time-based animation
      flake.y += flake.speed;
      
      // Add horizontal sway using sine wave
      flake.swayPos += flake.swaySpeed;
      const swayOffset = Math.sin(flake.swayPos) * flake.sway;
      
      // Add wind influence to horizontal position
      flake.x += swayOffset + windFactor;
      
      // Update rotation
      flake.rotation += flake.rotationSpeed;
      
      // Handle wrapping around edges
      if (flake.x > canvasWidth.current + flake.size) {
        flake.x = -flake.size;
      } else if (flake.x < -flake.size) {
        flake.x = canvasWidth.current + flake.size;
      }
      
      // Reset if off bottom of screen
      if (flake.y > canvasHeight.current + flake.size) {
        Object.assign(flake, createSnowflake(true));
      }
      
      // Draw snowflake
      drawFlake(ctx, flake);
    });
  };
  
  // Draw a single snowflake - either a simple circle or a more complex shape
  const drawFlake = (ctx: CanvasRenderingContext2D, flake: Snowflake) => {
    ctx.save();
    ctx.translate(flake.x, flake.y);
    ctx.rotate(flake.rotation);
    ctx.globalAlpha = flake.opacity;
    
    const drawDetailedFlake = flake.size > 4 && Math.random() > 0.7;
    
    if (drawDetailedFlake) {
      // Draw a more detailed snowflake
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        const length = flake.size;
        
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle) * length,
          Math.sin(angle) * length
        );
        
        // Optional: add small branches
        if (flake.size > 5) {
          const branchLength = flake.size * 0.4;
          const branchAngle1 = angle + Math.PI / 6;
          const branchAngle2 = angle - Math.PI / 6;
          
          // Position branch halfway along the main arm
          const midX = Math.cos(angle) * (length * 0.5);
          const midY = Math.sin(angle) * (length * 0.5);
          
          ctx.moveTo(midX, midY);
          ctx.lineTo(
            midX + Math.cos(branchAngle1) * branchLength,
            midY + Math.sin(branchAngle1) * branchLength
          );
          
          ctx.moveTo(midX, midY);
          ctx.lineTo(
            midX + Math.cos(branchAngle2) * branchLength,
            midY + Math.sin(branchAngle2) * branchLength
          );
        }
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.lineWidth = flake.size / 15 + 0.2;
      ctx.stroke();
    } else {
      // Draw a simple circle for small or distant flakes
      ctx.beginPath();
      ctx.arc(0, 0, flake.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.fill();
    }
    
    ctx.restore();
  };

  // Animation loop
  const animate = (timestamp: number) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    drawSnow(ctx, timestamp);
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Initialize canvas and snowflakes, start animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const updateCanvasSize = () => {
      if (!canvas) return;
      
      // Set canvas to window size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      canvasWidth.current = canvas.width;
      canvasHeight.current = canvas.height;
    };
    
    // Initialize canvas size
    updateCanvasSize();
    
    // Handle window resize
    window.addEventListener('resize', updateCanvasSize);
    
    // Initialize snowflakes
    initSnowflakes();
    
    // Start animation if intensity is not none
    if (intensity !== 'none') {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [intensity, precipitation, windSpeed, temperature]);

  // Don't render if intensity is 'none'
  if (intensity === 'none') return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none weather-effect"
      aria-hidden="true"
    />
  );
} 