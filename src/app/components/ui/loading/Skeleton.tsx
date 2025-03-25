'use client';

import { cn } from '@/app/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'rounded' | 'circular';
  animation?: 'pulse' | 'shimmer';
}

export const Skeleton = ({
  className,
  variant = 'default',
  animation = 'shimmer',
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn(
        'relative bg-slate-700/50 overflow-hidden',
        animation === 'shimmer' && 'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-slate-600/10 before:to-transparent',
        animation === 'pulse' && 'animate-pulse',
        variant === 'default' && 'rounded-md',
        variant === 'rounded' && 'rounded-full',
        variant === 'circular' && 'rounded-full aspect-square',
        className
      )}
      {...props}
    />
  );
}; 