'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire application.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      errorInfo
    });
    
    // Here you could add integration with error monitoring services like Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white">
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-500/20">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          
          <p className="text-gray-300 text-center mb-4 max-w-md">
            The application encountered an unexpected error. You can try refreshing the page or clicking the button below.
          </p>
          
          <div className="space-y-4 w-full max-w-md">
            {this.state.error && (
              <div className="p-3 bg-red-500/10 rounded text-sm font-mono break-words overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md w-full transition"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 