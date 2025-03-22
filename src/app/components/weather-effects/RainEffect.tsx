'use client';

import React, { useRef, useEffect } from 'react';
import { EffectIntensity } from './WeatherEffectsManager';

interface RainEffectProps {
  intensity: EffectIntensity;
  precipitation: number; // 0-100 value
  windSpeed: number; // in mph
  heavy?: boolean; // Whether this is heavy rain (affects raindrop size and sound)
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
  windSpeed = 0,
  heavy = false
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
    
    // Adjust for precipitation and heavy rain
    const precipitationFactor = precipitation / 50;
    const heavyFactor = heavy ? 1.5 : 1;
    return Math.floor(baseCount * precipitationFactor * heavyFactor);
  };
  
  // Calculate wind influence on raindrop angle
  const getWindFactor = (): number => {
    // Convert wind speed to a reasonable angle factor
    // 20mph wind would result in about a 30 degree angle
    return (windSpeed / 20) * 0.5;
  };
  
  // Initialize the raindrops array
  const initRaindrops = () => {
    const count = getDropCount();
    const drops: Raindrop[] = [];
    
    for (let i = 0; i < count; i++) {
      drops.push(createRaindrop(false));
    }
    
    raindropsRef.current = drops;
  };
  
  // Create a new raindrop with randomized properties
  const createRaindrop = (isReset: boolean = false): Raindrop => {
    const heavyFactor = heavy ? 1.5 : 1;
    
    return {
      x: isReset ? Math.random() * canvasWidth.current : Math.random() * canvasWidth.current,
      y: isReset ? -20 : Math.random() * canvasHeight.current,
      length: (Math.random() * 10 + 10) * heavyFactor, // 10-20px (or 15-30px if heavy)
      speed: (Math.random() * 10 + 15) * (intensity === 'high' ? 1.5 : 1) * heavyFactor,
      thickness: (Math.random() + 1) * heavyFactor,
      opacity: Math.random() * 0.2 + 0.8 // 0.8-1.0 opacity
    };
  };
  
  // Draw the raindrops on the canvas
  const drawRain = (ctx: CanvasRenderingContext2D) => {
    const windFactor = getWindFactor();
    
    ctx.clearRect(0, 0, canvasWidth.current, canvasHeight.current);
    ctx.strokeStyle = heavy ? 'rgba(180, 200, 225, 0.9)' : 'rgba(200, 230, 255, 0.8)';
    ctx.lineWidth = 1;
    
    raindropsRef.current.forEach((drop, i) => {
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      
      // Calculate the end position with wind angle
      const endX = drop.x + drop.length * windFactor;
      const endY = drop.y + drop.length;
      
      ctx.lineTo(endX, endY);
      ctx.globalAlpha = drop.opacity;
      ctx.lineWidth = drop.thickness;
      ctx.stroke();
      
      // Update position for next frame
      drop.y += drop.speed;
      drop.x += windFactor * drop.speed * 0.5; // Horizontal movement based on wind
      
      // If raindrop goes off screen, reset it
      if (drop.y > canvasHeight.current) {
        // Create splash effect for larger/heavier drops
        if (drop.thickness > 1.5 || heavy) {
          createSplash(ctx, endX, canvasHeight.current);
        }
        
        raindropsRef.current[i] = createRaindrop(true);
      }
    });
  };
  
  // Create a small splash effect when raindrops hit the ground
  const createSplash = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = heavy ? Math.random() * 3 + 2 : Math.random() * 2 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = heavy ? 'rgba(180, 200, 225, 0.6)' : 'rgba(200, 230, 255, 0.5)';
    ctx.fill();
    
    // Ripple effect for heavy rain
    if (heavy) {
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(180, 200, 225, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  };
  
  // Animation loop
  const animate = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    drawRain(ctx);
    
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
    
    initRaindrops();
    animate();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [intensity, precipitation, windSpeed, heavy]);
  
  // Don't render if intensity is none
  if (intensity === 'none') {
    return null;
  }
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      aria-hidden="true"
    />
  );
} 