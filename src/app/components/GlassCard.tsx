'use client';

import React, { forwardRef } from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  intensity?: 'light' | 'medium' | 'heavy';
  hoverEffect?: boolean;
  borderEffect?: boolean;
}

/**
 * Enhanced glass card component with improved glass morphism effects
 * Provides consistent styling across the application with various configuration options
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className = '',
  variant = 'default',
  intensity = 'medium',
  hoverEffect = true,
  borderEffect = true,
  ...props
}, ref) => {
  // Intensity affects the opacity/transparency level
  const intensityMap = {
    light: {
      bg: 'bg-white/10 dark:bg-black/10',
      border: 'border-white/10 dark:border-white/5',
      shadow: 'shadow-sm'
    },
    medium: {
      bg: 'bg-white/20 dark:bg-black/20',
      border: 'border-white/20 dark:border-white/10',
      shadow: 'shadow-md'
    },
    heavy: {
      bg: 'bg-white/30 dark:bg-black/30',
      border: 'border-white/30 dark:border-white/15',
      shadow: 'shadow-lg'
    }
  };

  // Variant provides different color accents
  const variantMap = {
    default: '',
    primary: 'from-blue-500/10 dark:from-blue-500/5',
    success: 'from-green-500/10 dark:from-green-500/5',
    warning: 'from-yellow-500/10 dark:from-yellow-500/5',
    danger: 'from-red-500/10 dark:from-red-500/5',
    info: 'from-cyan-500/10 dark:from-cyan-500/5'
  };

  // Build class names based on props
  const baseClasses = 'rounded-lg backdrop-blur-xl backdrop-saturate-150 transition-all';
  const intensityClasses = intensityMap[intensity];
  const variantClasses = variant !== 'default' ? `bg-gradient-to-br ${variantMap[variant]} to-transparent` : intensityClasses.bg;
  const hoverClasses = hoverEffect ? 'hover:bg-white/30 dark:hover:bg-black/30 hover:shadow-lg hover:-translate-y-0.5' : '';
  const borderClasses = borderEffect ? `border ${intensityClasses.border}` : '';

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${intensityClasses.shadow} ${hoverClasses} ${borderClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard; 