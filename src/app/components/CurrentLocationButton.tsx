'use client';

import { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CurrentLocationButtonProps {
  className?: string;
  onLocationDetected?: () => void;
}

export default function CurrentLocationButton({ 
  className,
  onLocationDetected
}: CurrentLocationButtonProps) {
  const { isLoading, error, updateCurrentLocation } = useGeolocation();
  const [showError, setShowError] = useState(false);

  const handleGetCurrentLocation = async () => {
    setShowError(false);
    try {
      const success = await updateCurrentLocation();
      if (success && onLocationDetected) {
        onLocationDetected();
      }
    } catch (err) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000); // Hide error after 5 seconds
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleGetCurrentLocation}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20",
          isLoading && "opacity-70 cursor-not-allowed",
          className
        )}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"></div>
            <span>Detecting...</span>
          </>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4" y1="12" x2="2" y2="12" />
              <line x1="22" y1="12" x2="20" y2="12" />
            </svg>
            <span>Current Location</span>
          </>
        )}
      </Button>
      
      {showError && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-500/90 text-white text-sm rounded shadow-lg z-50 animate-in fade-in">
          {error?.message || "Unable to access your location. Please check your browser permissions."}
        </div>
      )}
    </div>
  );
} 