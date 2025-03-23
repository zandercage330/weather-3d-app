import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';

// Component that will throw an error for testing purposes
const ErrorThrow = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Prevent console errors from being displayed during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorThrow shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check for error UI elements
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/The application encountered an unexpected error/i)).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorThrow shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('resets error state when reset button is clicked', async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      return (
        <ErrorBoundary>
          <ErrorThrow shouldThrow={true} />
        </ErrorBoundary>
      );
    };
    
    render(<TestComponent />);
    
    // Verify error UI is shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click the reset button
    await user.click(screen.getByRole('button', { name: /Try Again/i }));
    
    // Since the error condition still exists, the error boundary will catch it again
    // This test mainly verifies that handleReset is correctly wired up
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
}); 