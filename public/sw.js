// Service Worker for Weather App
// Handles caching and offline support

const CACHE_VERSION = 'v1';
const CACHE_NAME = `weather-app-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/offline.html',
  '/manifest.json'
];

// APIs to cache
const API_CACHE_NAME = 'weather-data';
const API_PATHS = [
  '/api/weather',
  '/api/forecast',
  '/api/alerts',
  '/api/locationSearch',
  '/api/reverseGeocode',
  '/api/prefetch'
];

// Max age for cached API responses
const API_CACHE_MAX_AGE = {
  '/api/weather': 15 * 60 * 1000,       // 15 minutes for current weather
  '/api/forecast': 30 * 60 * 1000,      // 30 minutes for forecast
  '/api/alerts': 10 * 60 * 1000,        // 10 minutes for alerts
  '/api/locationSearch': 24 * 60 * 60 * 1000, // 24 hours for location search
  '/api/reverseGeocode': 7 * 24 * 60 * 60 * 1000, // 7 days for reverse geocode
  '/api/prefetch': 30 * 60 * 1000       // 30 minutes for prefetch
};

// Install event - precache critical assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...', event);
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => self.clients.claim())
  );
  
  return self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(event.request, url));
    return;
  }
  
  // For non-API requests, use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Not in cache, get from network
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Cache successful responses for static assets
            if (shouldCacheAsset(url.pathname)) {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            }
            
            return networkResponse;
          })
          .catch(() => {
            // Network failed, show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Return error for other requests
            return new Response('Network error occurred', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle messages from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    clearAllCaches()
      .then(success => {
        // Send response back to client
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({
            type: 'CACHES_CLEARED',
            success
          });
        }
      });
  }
});

// Helper functions

function isApiRequest(pathname) {
  return API_PATHS.some(path => pathname.startsWith(path));
}

function shouldCacheAsset(pathname) {
  const cacheableExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf'];
  return cacheableExtensions.some(ext => pathname.endsWith(ext));
}

function handleApiRequest(request, url) {
  // Try the network first for API requests
  return fetch(request)
    .then(response => {
      // Cache successful responses
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        
        caches.open(API_CACHE_NAME)
          .then(cache => {
            // Add timestamp for cache expiration
            const timestamp = Date.now();
            const cacheMetadata = {
              url: request.url,
              timestamp,
              headers: {}
            };
            
            // Store metadata separately
            const metadataUrl = `/api/metadata?${url.searchParams.toString()}`;
            cache.put(
              new Request(metadataUrl),
              new Response(JSON.stringify({
                lastUpdated: new Date(timestamp),
                expiresAt: new Date(timestamp + getMaxAge(url.pathname))
              }), {
                headers: { 'Content-Type': 'application/json' }
              })
            );
            
            // Store the actual response
            cache.put(request, responseToCache);
          });
      }
      
      return response;
    })
    .catch(() => {
      // If network fails, try the cache
      return caches.open(API_CACHE_NAME)
        .then(cache => cache.match(request))
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If nothing in cache, return error
          return new Response(JSON.stringify({
            error: 'Network error and no cached data available',
            offline: true
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          });
        });
    });
}

function getMaxAge(pathname) {
  // Find the matching API path
  const apiPath = API_PATHS.find(path => pathname.startsWith(path));
  return apiPath ? API_CACHE_MAX_AGE[apiPath] : 5 * 60 * 1000; // Default 5 minutes
}

async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    return true;
  } catch (error) {
    console.error('Error clearing caches:', error);
    return false;
  }
}

// Helper to clean up expired API cache entries
async function cleanUpExpiredCache() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    
    for (const request of requests) {
      // Skip metadata entries
      if (request.url.includes('/api/metadata')) continue;
      
      // Get the matching metadata entry
      const searchParams = new URL(request.url).searchParams.toString();
      const metadataUrl = `/api/metadata?${searchParams}`;
      const metadataResponse = await cache.match(new Request(metadataUrl));
      
      if (metadataResponse) {
        const metadata = await metadataResponse.json();
        if (new Date(metadata.expiresAt).getTime() < now) {
          // Expired, remove from cache
          await cache.delete(request);
          await cache.delete(new Request(metadataUrl));
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
  }
}

// Run cache cleanup every hour
setInterval(cleanUpExpiredCache, 60 * 60 * 1000); 