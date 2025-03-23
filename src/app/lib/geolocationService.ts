// Interfaces for geolocation handling
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface ReverseGeocodingResult {
  name: string;
  country: string;
  state?: string;
  displayName: string;
}

/**
 * Gets the user's current position using the browser's geolocation API
 */
export async function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 0, message: 'Geolocation is not supported by this browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message || getGeolocationErrorMessage(error.code),
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/**
 * Converts geolocation error code to a human-readable message
 */
function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Permission denied. Please allow location access.';
    case 2:
      return 'Position unavailable. Please try again later.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
}

/**
 * Converts coordinates to a location name using reverse geocoding
 * Currently using a mock implementation - would integrate with a real geocoding API in production
 */
export async function reverseGeocode(coords: LocationCoordinates): Promise<ReverseGeocodingResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This would call a real geocoding API in production
  // For now, return a mock result based on coordinates
  return {
    name: `Location at ${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`,
    country: 'US',
    state: 'NY',
    displayName: `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}, NY, US`
  };
}

/**
 * Checks if geolocation is supported in the current browser
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
} 