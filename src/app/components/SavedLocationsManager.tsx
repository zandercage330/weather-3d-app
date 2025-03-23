'use client';

import { useState, useEffect } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import GlassCard from './GlassCard';
import SavedLocationCard from './SavedLocationCard';
import { getWeatherData } from '../lib/weatherService';
import { PlusCircle } from 'lucide-react';

export interface SavedLocationsManagerProps {
  currentLocation: string;
  onSelectLocation: (location: string) => void;
  className?: string;
}

export default function SavedLocationsManager({ 
  currentLocation, 
  onSelectLocation, 
  className = ''
}: SavedLocationsManagerProps) {
  const { preferences, addSavedLocation, removeSavedLocation } = useUserPreferences();
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [weatherData, setWeatherData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [fetchQueue, setFetchQueue] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Set up fetch queue when saved locations change
  useEffect(() => {
    const locationsToFetch = preferences.savedLocations.filter(
      location => !weatherData[location] || isDataStale(weatherData[location]?.timestamp)
    );
    
    setFetchQueue(prev => {
      // Add new locations to queue without duplicates
      const newQueue = [...prev];
      locationsToFetch.forEach(location => {
        if (!newQueue.includes(location)) {
          newQueue.push(location);
        }
      });
      return newQueue;
    });
    
    // Initialize loading state for all locations
    const loadingState: { [key: string]: boolean } = {};
    preferences.savedLocations.forEach(location => {
      loadingState[location] = !weatherData[location] || isDataStale(weatherData[location]?.timestamp);
    });
    setIsLoading(loadingState);
    
  }, [preferences.savedLocations]);

  // Process fetch queue one by one
  useEffect(() => {
    const processQueue = async () => {
      if (fetchQueue.length === 0 || isFetching) return;
      
      setIsFetching(true);
      const location = fetchQueue[0];
      
      try {
        setIsLoading(prev => ({ ...prev, [location]: true }));
        const data = await getWeatherData(location);
        
        setWeatherData(prev => ({ 
          ...prev, 
          [location]: {
            ...data,
            timestamp: Date.now()
          }
        }));
      } catch (error) {
        console.error(`Error fetching data for ${location}:`, error);
      } finally {
        setIsLoading(prev => ({ ...prev, [location]: false }));
        setFetchQueue(prev => prev.slice(1));
        setIsFetching(false);
      }
    };
    
    processQueue();
  }, [fetchQueue, isFetching]);

  // Helper function to check if data is older than 5 minutes
  const isDataStale = (timestamp?: number): boolean => {
    if (!timestamp) return true;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return timestamp < fiveMinutesAgo;
  };

  const handleAddLocation = async () => {
    if (newLocation.trim() && !preferences.savedLocations.includes(newLocation)) {
      try {
        setIsLoading(prev => ({ ...prev, [newLocation]: true }));
        
        // Validate location by attempting to fetch its weather
        const data = await getWeatherData(newLocation);
        addSavedLocation(newLocation);
        setNewLocation('');
        setShowAddLocation(false);
        
        // Add to weather data with timestamp
        setWeatherData(prev => ({
          ...prev,
          [newLocation]: {
            ...data,
            timestamp: Date.now()
          }
        }));
        
        setIsLoading(prev => ({ ...prev, [newLocation]: false }));
      } catch (error) {
        console.error('Invalid location:', error);
        // Could show an error message to user here
      }
    }
  };

  const handleRemoveLocation = (location: string) => {
    removeSavedLocation(location);
    
    // Also remove from fetch queue if present
    setFetchQueue(prev => prev.filter(item => item !== location));
  };

  return (
    <GlassCard className={`p-4 ${className}`} intensity="light">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Saved Locations</h2>
        <button 
          onClick={() => setShowAddLocation(!showAddLocation)}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label={showAddLocation ? "Cancel adding location" : "Add location"}
        >
          <PlusCircle size={20} className={showAddLocation ? "text-blue-400" : "text-white/70"} />
        </button>
      </div>
      
      {showAddLocation && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter city name"
              className="w-full bg-black/20 border border-white/20 rounded px-3 py-1 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
            />
            <button 
              onClick={handleAddLocation}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {preferences.savedLocations.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-4">
            No saved locations. Add some to quickly access weather information.
          </p>
        ) : (
          preferences.savedLocations.map(location => (
            <SavedLocationCard
              key={location}
              locationName={location}
              weatherData={weatherData[location] || null}
              isLoading={!!isLoading[location]}
              userPreferences={preferences}
              isActive={location === currentLocation}
              onSelect={onSelectLocation}
              onRemove={handleRemoveLocation}
            />
          ))
        )}
      </div>
    </GlassCard>
  );
} 