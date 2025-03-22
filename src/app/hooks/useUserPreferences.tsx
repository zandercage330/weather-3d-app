'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the types for user preferences
export interface UserPreferences {
  temperatureUnit: 'C' | 'F';
  defaultLocation: string;
  theme: 'light' | 'dark' | 'auto';
  savedLocations: string[];
  // Display preferences
  showHumidity: boolean;
  showWindSpeed: boolean;
  showFeelsLike: boolean;
  showPrecipitation: boolean;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  temperatureUnit: 'F',
  defaultLocation: 'New York, NY',
  theme: 'auto',
  savedLocations: ['New York, NY', 'Boston, MA'],
  showHumidity: true,
  showWindSpeed: true,
  showFeelsLike: true,
  showPrecipitation: true,
};

// Create context for preferences
interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  addSavedLocation: (location: string) => void;
  removeSavedLocation: (location: string) => void;
  resetPreferences: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

// Provider component
interface UserPreferencesProviderProps {
  children: ReactNode;
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loaded, setLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('weatherAppPreferences');
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences({ ...defaultPreferences, ...parsedPreferences });
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
    setLoaded(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('weatherAppPreferences', JSON.stringify(preferences));
    }
  }, [preferences, loaded]);

  // Update a single preference
  const updatePreference = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Add a location to saved locations if it doesn't exist
  const addSavedLocation = (location: string) => {
    setPreferences(prev => {
      if (prev.savedLocations.includes(location)) {
        return prev;
      }
      return {
        ...prev,
        savedLocations: [...prev.savedLocations, location]
      };
    });
  };

  // Remove a location from saved locations
  const removeSavedLocation = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      savedLocations: prev.savedLocations.filter(loc => loc !== location)
    }));
  };

  // Reset preferences to defaults
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        addSavedLocation,
        removeSavedLocation,
        resetPreferences
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

// Hook for using the preferences context
export function useUserPreferences(): UserPreferencesContextType {
  const context = useContext(UserPreferencesContext);
  
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  
  return context;
} 