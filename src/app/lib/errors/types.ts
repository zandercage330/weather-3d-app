export type ErrorType = 
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'WEATHER_DATA_ERROR'
  | 'RENDERING_ERROR'
  | 'UNKNOWN_ERROR';

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}

export const createAppError = (
  message: string,
  type: ErrorType = 'UNKNOWN_ERROR',
  severity: ErrorSeverity = 'MEDIUM',
  retryable = true,
  context?: Record<string, unknown>
): AppError => ({
  name: 'AppError',
  message,
  type,
  severity,
  timestamp: new Date().toISOString(),
  retryable,
  context,
});

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('Network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('offline')
    );
  }
  return false;
};

export const isApiError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('API') ||
      error.message.includes('api') ||
      error.message.includes('status') ||
      error.message.includes('response')
    );
  }
  return false;
};

export const getErrorType = (error: unknown): ErrorType => {
  if (isNetworkError(error)) return 'NETWORK_ERROR';
  if (isApiError(error)) return 'API_ERROR';
  if (error instanceof Error && error.message.includes('weather')) return 'WEATHER_DATA_ERROR';
  if (error instanceof Error && error.message.includes('rendering')) return 'RENDERING_ERROR';
  return 'UNKNOWN_ERROR';
}; 