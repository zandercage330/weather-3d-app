'use client';

import { useState, useEffect } from 'react';
import { useCachedWeather } from '../hooks/useCachedWeather';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRouter, useSearchParams } from 'next/navigation';
import ActivityRecommendations from '../components/ActivityRecommendations';
import GlassCard from '../components/GlassCard';
import { reverseGeocode } from '../lib/geolocationService';
import { searchLocations } from '../lib/weatherApiClient';
import { Loader2, MapPin, Search, Sliders } from 'lucide-react';
import { mockWeatherData, mockForecastData } from '../lib/activityMockData';

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get('location');
  
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    region: string;
    country: string;
    lat?: number;
    lon?: number;
  } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  const router = useRouter();
  const { getLocation, error: geoError, isLoading: geoLoading } = useGeolocation();

  // Get cached weather data using the selected location name for API calls
  const { 
    weather, 
    forecasts, 
    loading: weatherLoading, 
    error: weatherError
  } = useCachedWeather(
    selectedLocation ? `${selectedLocation.name}, ${selectedLocation.region}` : '',
    { includeForecasts: true, includeForecastDays: 5 }
  );

  // Load location from URL or use geolocation
  useEffect(() => {
    const loadInitialLocation = async () => {
      if (initialLocation) {
        try {
          setIsSearching(true);
          const results = await searchLocations(initialLocation);
          if (results && results.length > 0) {
            setSelectedLocation(results[0]);
          }
        } catch (error) {
          console.error('Failed to load location from URL', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        // Try to get the current location
        try {
          setIsSearching(true);
          const { position } = await getLocation().catch(err => {
            console.error('Error getting geolocation:', err);
            return { position: null };
          });
          
          if (position) {
            try {
              const location = await reverseGeocode({
                latitude: position.latitude,
                longitude: position.longitude
              });
              
              setSelectedLocation({
                name: location.name,
                region: location.state || '',
                country: location.country,
                lat: position.latitude,
                lon: position.longitude
              });
            } catch (geocodeError) {
              console.error('Error with reverse geocoding:', geocodeError);
            }
          }
        } catch (error) {
          console.error('Failed to get current position', error);
        } finally {
          setIsSearching(false);
        }
      }
    };

    loadInitialLocation();
  }, [initialLocation, getLocation]);

  // Handle search input
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 3) {
      setIsSearching(true);
      try {
        const results = await searchLocations(query);
        setSearchResults(results || []);
      } catch (error) {
        console.error('Search error', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Select a location from search results
  const selectLocation = (location: any) => {
    setSelectedLocation(location);
    setSearchQuery('');
    setSearchResults([]);
    
    // Update URL with the location name
    router.push(`/activities?location=${encodeURIComponent(location.name)}`);
  };

  // Use current location
  const useCurrentLocation = async () => {
    try {
      setIsSearching(true);
      const { position } = await getLocation();
      if (position) {
        const location = await reverseGeocode({
          latitude: position.latitude,
          longitude: position.longitude
        });
        
        setSelectedLocation({
          name: location.name,
          region: location.state || '',
          country: location.country,
          lat: position.latitude,
          lon: position.longitude
        });
      }
    } catch (error) {
      console.error('Failed to get current position', error);
    } finally {
      setIsSearching(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const isLoading = geoLoading || weatherLoading || isSearching;

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Weather-Based Activity Recommendations</h1>
      
      {/* Location selector */}
      <GlassCard className="mb-6 p-4">
        <div className="mb-4">
          <label htmlFor="location-search" className="block text-sm font-medium mb-1">
            Search for a location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="location-search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="City, region or country"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              <ul className="py-1">
                {searchResults.map((result, index) => (
                  <li 
                    key={index} 
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    onClick={() => selectLocation(result)}
                  >
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-xs text-gray-500">
                        {result.region}, {result.country}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={useCurrentLocation}
            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Use current location
          </button>
        </div>
        
        {selectedLocation && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
            <div className="font-medium">Current location:</div>
            <div className="text-lg">
              {selectedLocation.name}, {selectedLocation.region}, {selectedLocation.country}
            </div>
          </div>
        )}
      </GlassCard>

      {isLoading && (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      )}

      {geoError && !selectedLocation && (
        <GlassCard className="p-6 text-center">
          <p className="text-red-500 mb-4">
            {geoError.message || 'Unable to get your current location. Please search for a location instead.'}
          </p>
          
          {/* Provide fallback option to show demo data */}
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => {
                setSelectedLocation({
                  name: mockWeatherData.location,
                  region: 'Demo',
                  country: 'US'
                });
              }}
            >
              Show demo recommendations
            </button>
          </div>
        </GlassCard>
      )}

      {weatherError && selectedLocation && (
        <GlassCard className="p-6 text-center">
          <p className="text-red-500 mb-4">
            {weatherError.message || 'Unable to fetch weather data. Please try again later.'}
          </p>
          
          {/* Provide fallback option to show demo data */}
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => {
                // Force using mock data
                setMockMode(true);
              }}
            >
              Show demo recommendations
            </button>
          </div>
        </GlassCard>
      )}

      {/* Conditionally use real or mock data */}
      {(weather || mockMode) && !isLoading && (
        <ActivityRecommendations
          weatherData={weather || mockWeatherData}
          forecastData={forecasts.length > 0 ? forecasts : mockForecastData}
          className="mb-6"
        />
      )}

      {/* General information about activities */}
      <GlassCard className="p-4 mt-8">
        <h2 className="text-xl font-semibold mb-3">About Activity Recommendations</h2>
        <p className="mb-4">
          Our activity recommendations are based on current weather conditions and forecast data to help you 
          make the most of your day. We consider factors like:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Temperature range ideal for specific activities</li>
          <li>Precipitation levels and likelihood</li>
          <li>Wind speed and conditions</li>
          <li>UV index for sun protection</li>
          <li>Time of day (some activities are better in daylight vs evening)</li>
        </ul>
        <p>
          Each activity receives a score from 0-100% based on how well current weather conditions match the
          ideal conditions for that activity. Activities with higher scores are recommended first.
        </p>
      </GlassCard>
    </div>
  );
} 