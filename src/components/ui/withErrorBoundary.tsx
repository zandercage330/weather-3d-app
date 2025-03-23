'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * @param Component The component to wrap with error handling
 * @param fallback Optional custom fallback UI to render when an error occurs
 */
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
}

export default withErrorBoundary; 