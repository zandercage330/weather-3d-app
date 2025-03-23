'use client';

import { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { 
  registerServiceWorker, 
  addConnectionStatusListener, 
  isOffline, 
  hasActiveServiceWorker, 
  clearServiceWorkerCaches 
} from '../lib/serviceWorkerManager';

interface ServiceWorkerContextType {
  isOfflineMode: boolean;
  hasServiceWorker: boolean;
  clearCaches: () => Promise<boolean>;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType>({
  isOfflineMode: false,
  hasServiceWorker: false,
  clearCaches: async () => false,
});

export function useServiceWorker() {
  return useContext(ServiceWorkerContext);
}

export function ServiceWorkerProvider({ children }: { children: ReactNode }) {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [hasServiceWorker, setHasServiceWorker] = useState(false);

  useEffect(() => {
    // Set initial states
    setIsOfflineMode(isOffline());
    setHasServiceWorker(hasActiveServiceWorker());

    // Register service worker
    const registerSW = async () => {
      const registration = await registerServiceWorker();
      setHasServiceWorker(!!registration);
    };

    // Add listener for online/offline events
    const removeListener = addConnectionStatusListener((online) => {
      setIsOfflineMode(!online);
      
      // If coming back online, check if we have a service worker
      if (online) {
        setHasServiceWorker(hasActiveServiceWorker());
      }
    });

    // Register service worker on load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', registerSW);
    }

    return () => {
      removeListener();
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', registerSW);
      }
    };
  }, []);

  const clearCaches = async () => {
    const result = await clearServiceWorkerCaches();
    return result;
  };

  return (
    <ServiceWorkerContext.Provider
      value={{
        isOfflineMode,
        hasServiceWorker,
        clearCaches,
      }}
    >
      {children}
    </ServiceWorkerContext.Provider>
  );
} 