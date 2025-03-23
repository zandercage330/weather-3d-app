'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import GlassCard from '@/app/components/GlassCard';

interface DataErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

/**
 * A fallback UI component displayed when data loading fails
 */
export function DataErrorFallback({
  message = 'Failed to load data. Please try again later.',
  onRetry,
  showRetry = true,
  className = '',
}: DataErrorFallbackProps) {
  return (
    <GlassCard className={`p-4 ${className}`} variant="danger">
      <div className="flex flex-col items-center justify-center text-center p-4">
        <div className="rounded-full bg-red-500/20 p-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Data Loading Error</h3>
        
        <p className="text-gray-200 mb-4">
          {message}
        </p>
        
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </GlassCard>
  );
} 