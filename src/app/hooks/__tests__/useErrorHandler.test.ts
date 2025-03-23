import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '@/app/hooks/useErrorHandler';

// Mock the dependencies
jest.mock('@/app/providers/ServiceWorkerProvider', () => ({
  useServiceWorker: () => ({
    isOfflineMode: false
  })
}));

jest.mock('@/app/lib/errorHandling', () => ({
  handleError: jest.fn()
}));

describe('useErrorHandler', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
  
  it('initializes with given loading state', () => {
    const { result } = renderHook(() => useErrorHandler(true));
    
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });
  
  it('handles error correctly', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError, 'test context');
    });
    
    expect(result.current.error).toEqual(testError);
    expect(result.current.isLoading).toBe(false);
  });
  
  it('clears error correctly', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError, 'test context');
    });
    
    expect(result.current.error).not.toBeNull();
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });
  
  it('handles operations correctly when successful', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const mockOperation = jest.fn().mockResolvedValue('success');
    
    let operationResult;
    await act(async () => {
      operationResult = await result.current.handleOperation(mockOperation, 'test operation');
    });
    
    expect(operationResult).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });
  
  it('handles operations correctly when failed', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Operation failed');
    const mockOperation = jest.fn().mockRejectedValue(testError);
    
    let operationResult;
    await act(async () => {
      operationResult = await result.current.handleOperation(mockOperation, 'test operation');
    });
    
    expect(operationResult).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(testError);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });
}); 