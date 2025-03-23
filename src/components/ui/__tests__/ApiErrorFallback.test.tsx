import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApiErrorFallback from '../ApiErrorFallback';

describe('ApiErrorFallback', () => {
  const mockResetError = jest.fn();
  
  beforeEach(() => {
    mockResetError.mockClear();
  });

  it('renders network error message correctly', () => {
    const networkError = new Error('Network error occurred');
    
    render(
      <ApiErrorFallback 
        error={networkError} 
        resetError={mockResetError} 
        isOffline={true} 
      />
    );
    
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the weather service/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    // Network errors don't show the error message text
    expect(screen.queryByText(networkError.message)).not.toBeInTheDocument();
  });

  it('renders rate limit error message correctly', () => {
    const rateLimitError = new Error('Rate limit exceeded. Please try again in 60 seconds.');
    
    render(
      <ApiErrorFallback 
        error={rateLimitError} 
        resetError={mockResetError} 
      />
    );
    
    expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
    expect(screen.getByText(/You've made too many requests/i)).toBeInTheDocument();
    expect(screen.getByText(rateLimitError.message)).toBeInTheDocument();
  });

  it('renders server error message correctly', () => {
    const serverError = new Error('Server error 500: Internal Server Error');
    
    render(
      <ApiErrorFallback 
        error={serverError} 
        resetError={mockResetError} 
      />
    );
    
    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText(/The weather service is currently unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(serverError.message)).toBeInTheDocument();
  });

  it('renders generic API error message when error type is unrecognized', () => {
    const genericError = new Error('Something went wrong');
    
    render(
      <ApiErrorFallback 
        error={genericError} 
        resetError={mockResetError} 
      />
    );
    
    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(screen.getByText(/There was a problem fetching weather data/i)).toBeInTheDocument();
    expect(screen.getByText(genericError.message)).toBeInTheDocument();
  });

  it('calls resetError when retry button is clicked', async () => {
    const user = userEvent.setup();
    const error = new Error('Test error');
    
    render(
      <ApiErrorFallback 
        error={error} 
        resetError={mockResetError} 
      />
    );
    
    await user.click(screen.getByRole('button', { name: /Try Again/i }));
    
    expect(mockResetError).toHaveBeenCalledTimes(1);
  });
}); 