import React from 'react';
import { render, screen } from '@testing-library/react';
import withErrorBoundary from '../withErrorBoundary';

// Mock ErrorBoundary component
jest.mock('../ErrorBoundary', () => {
  return {
    __esModule: true,
    default: ({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
      // Simple implementation that just renders children for basic testing
      return (
        <div data-testid="error-boundary">
          {children}
          {fallback && <div data-testid="custom-fallback">{fallback}</div>}
        </div>
      );
    }
  };
});

describe('withErrorBoundary', () => {
  it('wraps a component with ErrorBoundary', () => {
    const TestComponent = () => <div data-testid="test-component">Test Content</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    render(<WrappedComponent />);
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('passes props to the wrapped component', () => {
    interface TestProps {
      testProp: string;
    }
    
    const TestComponent = ({ testProp }: TestProps) => (
      <div data-testid="test-component">{testProp}</div>
    );
    
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    render(<WrappedComponent testProp="Test Value" />);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });
  
  it('passes custom fallback to ErrorBoundary', () => {
    const TestComponent = () => <div>Test Content</div>;
    const customFallback = <div>Custom Error UI</div>;
    const WrappedComponent = withErrorBoundary(TestComponent, customFallback);
    
    render(<WrappedComponent />);
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
  
  it('sets proper displayName for debugging', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';
    
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
  
  it('uses component name as fallback for displayName', () => {
    // Anonymous component without displayName
    const AnonymousComponent = () => <div>Test</div>;
    const WrappedComponent = withErrorBoundary(AnonymousComponent);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(AnonymousComponent)');
  });
}); 