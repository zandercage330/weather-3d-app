import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { UserPreferencesProvider } from '@/app/hooks/useUserPreferences';
import { ServiceWorkerProvider } from '@/app/providers/ServiceWorkerProvider';

/**
 * Custom renderer that wraps components with necessary providers
 * This ensures components have access to context they need during tests
 */
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock the service worker functionality for tests
  const mockServiceWorkerValue = {
    isOfflineMode: false,
    hasServiceWorker: true,
    clearCaches: jest.fn().mockResolvedValue(true),
  };

  // Return component wrapped with all required providers
  return (
    <UserPreferencesProvider>
      <ServiceWorkerProvider>
        {children}
      </ServiceWorkerProvider>
    </UserPreferencesProvider>
  );
};

/**
 * Custom render method that includes providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render }; 