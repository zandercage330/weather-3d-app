'use client';

import { useEffect } from 'react';
import { RefreshCcw, AlertTriangle, Home, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { AppError, createAppError, getErrorType } from './lib/errors/types';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const appError = createAppError(
    error.message,
    getErrorType(error),
    'HIGH',
    true,
    { digest: error.digest }
  );

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error encountered:', {
      error: appError,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }, [appError]);

  const getErrorIcon = () => {
    switch (appError.type) {
      case 'NETWORK_ERROR':
        return <WifiOff className="w-10 h-10 text-red-500" aria-hidden="true" />;
      default:
        return <AlertTriangle className="w-10 h-10 text-red-500" aria-hidden="true" />;
    }
  };

  const getErrorMessage = () => {
    switch (appError.type) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'API_ERROR':
        return 'There was a problem communicating with our weather service.';
      case 'WEATHER_DATA_ERROR':
        return 'We encountered an issue while processing weather data.';
      case 'RENDERING_ERROR':
        return 'There was a problem displaying the application interface.';
      default:
        return 'An unexpected error occurred. We\'ve been notified and are working to fix it.';
    }
  };

  const errorDigest = appError.context?.digest as string | undefined;

  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center max-w-md w-full p-8 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl">
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-500/20">
            {getErrorIcon()}
          </div>
          
          <h1 className="text-2xl font-bold mb-3 text-center">Something Went Wrong</h1>
          
          <p className="text-slate-300 text-center mb-6">
            {getErrorMessage()}
          </p>
          
          {errorDigest && (
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Error ID: {errorDigest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => {
                // Clear any cached data that might be causing the error
                if (typeof window !== 'undefined') {
                  sessionStorage.clear();
                }
                reset();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition flex-1"
              aria-label="Try loading the application again"
            >
              <RefreshCcw className="w-4 h-4" aria-hidden="true" />
              <span>Try Again</span>
            </button>
            
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition flex-1"
              aria-label="Return to home page"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Go Home</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
} 