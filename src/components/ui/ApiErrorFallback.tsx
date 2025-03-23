'use client';

import { RefreshCcw, WifiOff, ServerCrash, Zap } from 'lucide-react';

interface ApiErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  isOffline?: boolean;
}

/**
 * API Error Fallback component for displaying API-specific errors
 * with appropriate actions based on error type
 */
export default function ApiErrorFallback({
  error,
  resetError,
  isOffline = false
}: ApiErrorFallbackProps) {
  // Determine the type of error for better user feedback
  const isRateLimitError = error?.message.includes('Rate limit');
  const isNetworkError = error?.message.includes('Network error') || isOffline;
  const isServerError = error?.message.includes('500') || error?.message.includes('Server error');

  // Icon based on error type
  const ErrorIcon = isNetworkError 
    ? WifiOff 
    : isRateLimitError 
      ? Zap 
      : ServerCrash;

  // Error title based on type
  const errorTitle = isNetworkError 
    ? 'Network Error' 
    : isRateLimitError 
      ? 'Rate Limit Exceeded' 
      : isServerError 
        ? 'Server Error' 
        : 'API Error';

  // Custom message based on error type
  const errorMessage = isNetworkError 
    ? 'Unable to connect to the weather service. Please check your internet connection.'
    : isRateLimitError 
      ? 'You\'ve made too many requests. Please wait a moment and try again.'
      : isServerError 
        ? 'The weather service is currently unavailable. Please try again later.'
        : 'There was a problem fetching weather data. Please try again.';

  return (
    <div className="flex flex-col items-center p-6 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-amber-500/20">
        <ErrorIcon className="w-8 h-8 text-amber-500" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{errorTitle}</h3>
      
      <p className="text-gray-300 text-center mb-4">
        {errorMessage}
      </p>
      
      {error && !isNetworkError && (
        <div className="p-3 bg-gray-700/50 rounded text-sm font-mono break-words mb-4 w-full max-w-md">
          {error.message}
        </div>
      )}
      
      <button
        onClick={resetError}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition"
      >
        <RefreshCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
} 