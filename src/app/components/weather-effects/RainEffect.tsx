'use client';

import React, { useRef, useEffect } from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface RainEffectProps {
  intensity: EffectIntensity;
  precipitation: number; // 0-100 value
  windSpeed: number; // in mph
}

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  thickness: number;
  opacity: number;
}

/**
 * Canvas-based rain effect with varying intensity
 * Supports wind direction influence on raindrops
 */
export default function RainEffect({ 
  intensity = 'medium', 
  precipitation = 50,
  windSpeed = 0 
}: RainEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const animationFrameRef = useRef<number>(0);
  const canvasWidth = useRef<number>(0);
  const canvasHeight = useRef<number>(0);

  // Calculate the number of raindrops based on intensity and precipitation
  const getDropCount = (): number => {
    const baseCount = {
      'low': 50,
      'medium': 100,
      'high': 200,
      'none': 0
    }[intensity] || 0;
    
    // Scale count based on precipitation percentage
    return Math.floor(baseCount * (precipitation / 50));
  };

  // Calculate wind influence (-10 to 10 degrees of slant)
  const getWindFactor = (): number => {
    // Cap at max of 10 degree slant
    const maxWindFactor = 10;
    return Math.min(windSpeed / 2, maxWindFactor) * (Math.random() > 0.5 ? 1 : -1);
  };

  // Initialize raindrops with varying properties
  const initRaindrops = () => {
    if (!canvasRef.current) return;
    
    const count = getDropCount();
    const drops: Raindrop[] = [];
    
    for (let i = 0; i < count; i++) {
      drops.push(createRaindrop());
    }
    
    raindropsRef.current = drops;
  };

  // Create a single raindrop with random properties
  const createRaindrop = (isReset: boolean = false): Raindrop => {
    const speed = 10 + Math.random() * 10; // Falling speed
    const length = 10 + Math.random() * 20; // Length of drop
    const thickness = 1 + Math.random() * 2; // Thickness of drop
    
    return {
      x: Math.random() * canvasWidth.current,
      y: isReset ? -length : Math.random() * canvasHeight.current,
      length,
      speed,
      thickness,
      opacity: 0.1 + Math.random() * 0.4
    };
  };

  // Draw all raindrops on canvas
  const drawRain = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvasWidth.current, canvasHeight.current);
    
    const windFactor = getWindFactor(); // Calculate wind influence
    
    raindropsRef.current.forEach((drop) => {
      // Update position
      drop.y += drop.speed;
      
      // Reset if off screen
      if (drop.y > canvasHeight.current) {
        Object.assign(drop, createRaindrop(true));
        
        // Add splash effect
        createSplash(ctx, drop.x, canvasHeight.current);
      }
      
      // Draw raindrop
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(
        drop.x + windFactor, 
        drop.y + drop.length
      );
      ctx.lineWidth = drop.thickness;
      ctx.strokeStyle = `rgba(200, 200, 240, ${drop.opacity})`;
      ctx.stroke();
    });
  };

  // Create a splash effect at the bottom
  const createSplash = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Only create splash occasionally
    if (Math.random() > 0.3) return;
    
    const size = 2 + Math.random() * 2;
    
    // Draw splash circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 200, 240, 0.3)';
    ctx.fill();
  };

  // Animation loop
  const animate = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    drawRain(ctx);
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Initialize canvas and raindrops, start animation
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
    
    // Initialize raindrops
    initRaindrops();
    
    // Start animation if intensity is not none
    if (intensity !== 'none') {
      animate();
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [intensity, precipitation, windSpeed]);

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