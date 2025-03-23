'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import GlassCard from './GlassCard';

interface LocationSuggestion {
  name: string;
  region?: string;
  country?: string;
}

export interface EnhancedLocationSearchProps {
  onLocationSelect: (location: string) => void;
  className?: string;
}

export default function EnhancedLocationSearch({ 
  onLocationSelect, 
  className = ''
}: EnhancedLocationSearchProps) {
  const { preferences, addSavedLocation } = useUserPreferences();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geoLocationStatus, setGeoLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedRecentSearches = localStorage.getItem('recentLocationSearches');
    if (savedRecentSearches) {
      try {
        setRecentSearches(JSON.parse(savedRecentSearches));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage when they change
  useEffect(() => {
    localStorage.setItem('recentLocationSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Add selected location to recent searches
  const addToRecentSearches = (location: string) => {
    setRecentSearches(prev => {
      // Remove if already exists and add to beginning
      const filtered = prev.filter(item => item !== location);
      // Limit to 5 recent searches
      return [location, ...filtered].slice(0, 5);
    });
  };

  // Handle clicks outside of search component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch location suggestions
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/locationSearch?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      // Transform data to consistent format
      const formattedData: LocationSuggestion[] = data.map((item: any) => ({
        name: item.name || item.city || item.placeName || item.location,
        region: item.region || item.state || item.province,
        country: item.country
      }));
      
      setSuggestions(formattedData);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetchSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    setGeoLocationStatus('loading');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`/api/reverseGeocode?lat=${latitude}&lon=${longitude}`);
          
          if (!response.ok) {
            throw new Error('Failed to get location name');
          }
          
          const data = await response.json();
          const locationName = data.name || `${data.city}, ${data.country}`;
          
          setGeoLocationStatus('success');
          onLocationSelect(locationName);
          addToRecentSearches(locationName);
        } catch (error) {
          console.error('Error getting location name:', error);
          setGeoLocationStatus('error');
        }
      },
      (error) => {
        console.error('Error getting geolocation:', error);
        setGeoLocationStatus('error');
      }
    );
  };

  const handleSelectLocation = (location: string) => {
    onLocationSelect(location);
    addToRecentSearches(location);
    setQuery('');
    setShowSuggestions(false);
  };

  const handleSaveLocation = (location: string) => {
    addSavedLocation(location);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <GlassCard className="relative flex items-center p-2" intensity="medium">
        <Search className="h-5 w-5 text-white/70 mr-2" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for a location..."
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60"
        />
        
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4 text-white/70" />
          </button>
        )}
        
        <button 
          onClick={handleGetCurrentLocation}
          disabled={geoLocationStatus === 'loading'}
          className={`ml-2 p-1 rounded-full hover:bg-white/20 transition-colors ${
            geoLocationStatus === 'loading' ? 'opacity-50' : ''
          }`}
          title="Use current location"
        >
          {geoLocationStatus === 'loading' ? (
            <Loader2 className="h-5 w-5 text-white/70 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5 text-white/70" />
          )}
        </button>
      </GlassCard>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (query.trim() || recentSearches.length > 0) && (
        <div className="absolute w-full mt-1 z-50">
          <GlassCard className="p-2" intensity="heavy">
            {isLoading && (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-5 w-5 text-white/70 animate-spin mr-2" />
                <span className="text-white/70">Searching...</span>
              </div>
            )}
            
            {!isLoading && suggestions.length === 0 && query.trim() && (
              <div className="p-2 text-white/70 text-center">
                No locations found. Try a different search.
              </div>
            )}
            
            {!query.trim() && recentSearches.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs text-white/50 uppercase tracking-wider font-semibold">
                  Recent Searches
                </div>
                {recentSearches.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(location)}
                    className="flex items-center w-full p-2 hover:bg-white/10 rounded transition-colors text-left"
                  >
                    <Search className="h-4 w-4 text-white/50 mr-2" />
                    <span>{location}</span>
                  </button>
                ))}
              </div>
            )}
            
            {!isLoading && suggestions.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                {query.trim() && (
                  <div className="px-2 py-1 text-xs text-white/50 uppercase tracking-wider font-semibold">
                    Search Results
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(suggestion.name)}
                    className="flex items-center justify-between w-full p-2 hover:bg-white/10 rounded transition-colors text-left"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{suggestion.name}</span>
                      {(suggestion.region || suggestion.country) && (
                        <span className="text-xs text-white/70">
                          {[suggestion.region, suggestion.country].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveLocation(suggestion.name);
                      }}
                      className="p-1 rounded-full hover:bg-white/20 transition-colors"
                      title="Save location"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/70 hover:text-yellow-400"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
} 