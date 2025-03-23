'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import withErrorBoundary from '@/components/ui/withErrorBoundary';
import ApiErrorFallback from '@/components/ui/ApiErrorFallback';

// Component that will intentionally throw an error
function ErrorThrower({ shouldThrow = false }) {
  if (shouldThrow) {
    // This will trigger the error boundary
    throw new Error('This is a test error to demonstrate error boundaries');
  }
  
  return <p className="mb-4">No errors here! Try the buttons below to test different errors.</p>;
}

// Wrap the error thrower with our error boundary and custom fallback
const ErrorThrowerWithBoundary = withErrorBoundary(ErrorThrower, 
  <ApiErrorFallback 
    error={new Error('Test error with custom fallback')} 
    resetError={() => window.location.reload()}
  />
);

export default function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [shouldThrowAsync, setShouldThrowAsync] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);
  
  // Function to simulate an API error
  const simulateApiError = () => {
    try {
      throw new Error('API Rate limit exceeded. Please try again in 60 seconds.');
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err);
      }
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Error Handling Test Page</h1>
      <p className="mb-6 text-gray-200">
        This page demonstrates the different error handling mechanisms in the application.
      </p>
      
      <div className="space-y-8">
        {/* Test React Error Boundary */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">React Error Boundary Test</h2>
          
          <div className="mb-4">
            <ErrorThrowerWithBoundary shouldThrow={shouldThrow} />
          </div>
          
          <Button 
            onClick={() => setShouldThrow(!shouldThrow)}
            variant="destructive"
          >
            {shouldThrow ? 'Reset Error' : 'Trigger Error'}
          </Button>
        </div>
        
        {/* Test API Error Handling */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API Error Handling Test</h2>
          
          {apiError ? (
            <ApiErrorFallback 
              error={apiError}
              resetError={() => setApiError(null)}
            />
          ) : (
            <p className="mb-4">Click the button to simulate an API error.</p>
          )}
          
          {!apiError && (
            <Button 
              onClick={simulateApiError}
              variant="destructive"
            >
              Simulate API Error
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 