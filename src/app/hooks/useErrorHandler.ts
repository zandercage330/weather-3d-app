'use client';

import { useState, useCallback } from 'react';
import { useServiceWorker } from '@/app/providers/ServiceWorkerProvider';
import { handleError } from '@/app/lib/errorHandling';

interface ErrorHandlerResult {
  error: Error | null;
  isLoading: boolean;
  handleError: (error: unknown, context: string) => void;
  clearError: () => void;
  handleOperation: <T>(operation: () => Promise<T>, context: string) => Promise<T | null>;
}

/**
 * Custom hook for handling errors in functional components
 * @param initialLoading Initial loading state
 * @returns Object with error handling utilities
 */
export function useErrorHandler(initialLoading = false): ErrorHandlerResult {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const { isOfflineMode } = useServiceWorker();

  const handleErrorFn = useCallback((err: unknown, context: string) => {
    console.error(`Error in ${context}:`, err);
    
    // Create proper error object
    const errorObject = err instanceof Error 
      ? err 
      : new Error(typeof err === 'string' ? err : 'An unknown error occurred');
    
    // Check if offline to enhance error message
    if (isOfflineMode && !errorObject.message.includes('offline')) {
      errorObject.message = `${errorObject.message} (You appear to be offline)`;
    }
    
    setError(errorObject);
    setIsLoading(false);
    
    // Use existing error handler for consistent messaging
    handleError(err, context);
  }, [isOfflineMode]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handles an async operation with automatic error handling
   * @param operation Async function to execute
   * @param context Context description for error reporting
   * @returns Promise that resolves to the operation result or null if error
   */
  const handleOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T | null> => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await operation();
      setIsLoading(false);
      return result;
    } catch (err) {
      handleErrorFn(err, context);
      return null;
    }
  }, [clearError, handleErrorFn]);

  return {
    error,
    isLoading,
    handleError: handleErrorFn,
    clearError,
    handleOperation
  };
} 