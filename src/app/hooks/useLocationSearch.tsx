'use client';

import { useState, useCallback } from 'react';
import { useUserPreferences } from './useUserPreferences';

interface LocationResult {
  name: string;
  country: string;
  state?: string;
  displayName: string;
}

export function useLocationSearch() {
  const { preferences, updatePreference } = useUserPreferences();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results
      const mockResults: LocationResult[] = [
        { name: `${term}`, country: 'US', state: 'NY', displayName: `${term}, NY, US` },
        { name: `${term}`, country: 'US', state: 'CA', displayName: `${term}, CA, US` },
        { name: `${term}`, country: 'US', state: 'FL', displayName: `${term}, FL, US` },
        { name: `${term}`, country: 'UK', displayName: `${term}, UK` },
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching for locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleResultSelect = useCallback((result: LocationResult) => {
    const locationString = result.displayName;
    updatePreference('defaultLocation', locationString);
    
    // Add to saved locations if not already there
    if (!preferences.savedLocations.includes(locationString)) {
      const updatedSavedLocations = [...preferences.savedLocations, locationString];
      updatePreference('savedLocations', updatedSavedLocations);
    }
    
    setSearchTerm('');
    setSearchResults([]);
  }, [preferences.savedLocations, updatePreference]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  return {
    searchTerm,
    searchResults,
    isSearching,
    handleSearch,
    handleResultSelect,
    clearSearch
  };
} 