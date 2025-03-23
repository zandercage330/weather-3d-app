'use client';

import { useEffect } from 'react';
import { RefreshCcw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error encountered:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center max-w-md w-full p-8 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl">
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-3 text-center">Something Went Wrong</h1>
          
          <p className="text-slate-300 text-center mb-6">
            The application encountered an unexpected error. We've been notified of the issue and are working to fix it.
          </p>
          
          {error?.digest && (
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition flex-1"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition flex-1"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
} 