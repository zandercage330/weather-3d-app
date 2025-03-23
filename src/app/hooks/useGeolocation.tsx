'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentPosition, GeolocationPosition, GeolocationError, reverseGeocode, ReverseGeocodingResult } from '../lib/geolocationService';
import { useUserPreferences, UserPreferences } from './useUserPreferences';

interface GeolocationState {
  position: GeolocationPosition | null;
  locationName: ReverseGeocodingResult | null;
  error: GeolocationError | null;
  isLoading: boolean;
}

export function useGeolocation() {
  // Use try-catch to safely use preferences if available, but fall back gracefully if not
  // Define fallback functions with correct types
  let updatePreferenceFn = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {};
  let addSavedLocationFn = (location: string) => {};
  
  try {
    const { updatePreference, addSavedLocation } = useUserPreferences();
    updatePreferenceFn = updatePreference;
    addSavedLocationFn = addSavedLocation;
  } catch (error) {
    console.warn('UserPreferences not available, using fallback mode');
  }
  
  const [state, setState] = useState<GeolocationState>({
    position: null,
    locationName: null,
    error: null,
    isLoading: false,
  });

  const getLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await getCurrentPosition();
      setState(prev => ({ ...prev, position, isLoading: false }));

      // After getting coordinates, try to get a location name
      try {
        const locationName = await reverseGeocode({
          latitude: position.latitude,
          longitude: position.longitude,
        });
        setState(prev => ({ ...prev, locationName }));
        return { position, locationName };
      } catch (geocodeError) {
        console.error('Error during reverse geocoding:', geocodeError);
        // We still have the position even if reverse geocoding failed
        return { position, locationName: null };
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as GeolocationError,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateCurrentLocation = useCallback(async () => {
    try {
      const { locationName } = await getLocation();
      if (locationName) {
        try {
          updatePreferenceFn('defaultLocation', locationName.displayName);
          addSavedLocationFn(locationName.displayName);
        } catch (error) {
          console.warn('Could not update preferences:', error);
        }
      }
      return true;
    } catch (error) {
      console.error('Could not update current location:', error);
      return false;
    }
  }, [getLocation, updatePreferenceFn, addSavedLocationFn]);

  // Return functions and state
  return {
    ...state,
    getLocation,
    updateCurrentLocation,
  };
} 