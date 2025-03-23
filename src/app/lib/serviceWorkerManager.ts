'use client';

/**
 * Utility functions for managing the service worker
 * Used for handling offline support and caching
 */

// Check if service workers are supported
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Register the service worker
 * @returns Promise resolving to the active ServiceWorkerRegistration or null if not supported
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.log('Service workers are not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Clear all service worker caches
 * @returns Promise resolving to success status
 */
export async function clearServiceWorkerCaches(): Promise<boolean> {
  if (!isServiceWorkerSupported() || !navigator.serviceWorker.controller) {
    console.log('No active service worker found');
    return false;
  }
  
  try {
    // Create a new message channel
    const messageChannel = new MessageChannel();
    
    // Set up a promise to resolve when we get a response
    const clearPromise = new Promise<boolean>((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'CACHES_CLEARED') {
          resolve(event.data.success);
        } else {
          resolve(false);
        }
      };
    });
    
    // Send the clear caches message to the service worker
    navigator.serviceWorker.controller.postMessage(
      { type: 'CLEAR_CACHES' },
      [messageChannel.port2]
    );
    
    // Wait for the response
    return await clearPromise;
  } catch (error) {
    console.error('Failed to clear service worker caches:', error);
    return false;
  }
}

/**
 * Check if we have an active service worker
 * @returns Whether we have an active service worker
 */
export function hasActiveServiceWorker(): boolean {
  return isServiceWorkerSupported() && !!navigator.serviceWorker.controller;
}

/**
 * Check if we're currently offline
 * @returns Whether we're offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Add a listener for online/offline events
 * @param callback Function to call when online status changes
 * @returns Function to remove the listener
 */
export function addConnectionStatusListener(
  callback: (online: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return a function to remove the listeners
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Hook to add the service worker when the app starts
 * Call this in a useEffect in your layout or root component
 */
export function initializeServiceWorker(): void {
  if (typeof window !== 'undefined') {
    // Wait until page load to register service worker
    window.addEventListener('load', () => {
      registerServiceWorker();
    });
  }
} 