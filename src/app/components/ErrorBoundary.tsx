'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { AppError, createAppError, getErrorType } from '../lib/errors/types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  error: AppError | null;
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = createAppError(
      error.message,
      getErrorType(error),
      'MEDIUM',
      true,
      { originalError: error }
    );

    return {
      error: appError,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    if (this.props.onError) {
      const appError = createAppError(
        error.message,
        getErrorType(error),
        'MEDIUM',
        true,
        { componentStack: errorInfo.componentStack }
      );
      this.props.onError(appError);
    }
  }

  private handleRetry = () => {
    this.setState({ error: null, hasError: false });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    if (fallback) return fallback;

    return (
      <div className="w-full p-4 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {error?.type.replace('_', ' ').toLowerCase()}
            </h3>
            <p className="text-sm text-slate-300">{error?.message}</p>
          </div>
        </div>

        {error?.retryable && (
          <button
            onClick={this.handleRetry}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition w-full"
            aria-label="Retry loading the content"
          >
            <RefreshCcw className="w-4 h-4" aria-hidden="true" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }
} 