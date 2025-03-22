'use client';

import { useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import ForecastSection from './components/ForecastSection';
import LocationSelector from './components/LocationSelector';
import RefreshButton from './components/RefreshButton';
import WeatherAlerts from './components/WeatherAlerts';
import WeatherBackground from './components/WeatherBackground';
import ApiTester from './components/ApiTester';
import SettingsButton from './components/SettingsButton';
import ThemeProvider from './components/ThemeProvider';
import { UserPreferencesProvider, useUserPreferences } from './hooks/useUserPreferences';
import { getWeatherData, getForecastData, WeatherData, ForecastDay } from './lib/weatherService';
import dynamic from 'next/dynamic';

// Dynamically import the WeatherMapView component to avoid SSR issues with Leaflet
const WeatherMapView = dynamic(() => import('./components/WeatherMapView'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-gray-800/50 rounded-lg flex items-center justify-center">Loading map...</div>
});

// Wrap the main content in the providers
export default function Home() {
  return (
    <UserPreferencesProvider>
      <ThemeProvider>
        <HomeContent />
      </ThemeProvider>
    </UserPreferencesProvider>
  );
}

// Main content component that uses the preferences
function HomeContent() {
  const { preferences, updatePreference, addSavedLocation } = useUserPreferences();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(preferences.defaultLocation);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiTester, setShowApiTester] = useState(false);
  const [showWeatherMap, setShowWeatherMap] = useState(false);
  
  // When defaultLocation changes in preferences, update selectedLocation
  useEffect(() => {
    setSelectedLocation(preferences.defaultLocation);
  }, [preferences.defaultLocation]);
  
  // Extract state code from location string for weather alerts
  const getStateCode = (location: string): string => {
    const match = location.match(/,\s*([A-Z]{2})$/);
    return match ? match[1] : 'NY'; // Default to NY if no state code found
  };

  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      const [weather, forecast] = await Promise.all([
        getWeatherData(selectedLocation),
        getForecastData(7, selectedLocation)
      ]);
      setWeatherData(weather);
      setForecastData(forecast);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weather data on initial load and when location changes
  useEffect(() => {
    fetchWeatherData();
  }, [selectedLocation]);

  const handleLocationChange = (newLocation: string) => {
    setSelectedLocation(newLocation);
    // Automatically save this location to preferences
    addSavedLocation(newLocation);
  };

  return (
    <WeatherBackground weatherData={weatherData}>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 text-white">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">Weather App</h1>
            <div className="flex items-center gap-4">
              <LocationSelector 
                currentLocation={selectedLocation} 
                onLocationChange={handleLocationChange} 
                savedLocations={preferences.savedLocations} 
              />
              <RefreshButton onClick={fetchWeatherData} isLoading={isLoading} />
              <SettingsButton />
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowApiTester(!showApiTester)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  {showApiTester ? 'Hide' : 'Show'} API Tester
                </button>
                <span className="text-white/30">|</span>
                <button 
                  onClick={() => setShowWeatherMap(!showWeatherMap)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  {showWeatherMap ? 'Hide' : 'Show'} Radar Map
                </button>
              </div>
            </div>
          </div>

          {showApiTester && (
            <div className="mb-6">
              <ApiTester />
            </div>
          )}
          
          {showWeatherMap && (
            <div className="mb-6">
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <WeatherMapView />
              </div>
            </div>
          )}

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main weather card and alerts in first column */}
            <div className="lg:col-span-1 space-y-6">
              <WeatherCard 
                weatherData={weatherData} 
                isLoading={isLoading} 
                userPreferences={preferences}
              />
              
              <WeatherAlerts 
                stateCode={getStateCode(selectedLocation)} 
              />
            </div>
            
            {/* Forecast section spans two columns on large screens */}
            <div className="lg:col-span-2">
              <ForecastSection 
                forecastData={forecastData} 
                isLoading={isLoading} 
                userPreferences={preferences}
              />
            </div>
          </div>
          
          <footer className="mt-8 text-center text-sm text-white/60">
            <p>Real-time weather data powered by WeatherAPI</p>
            <p className="mt-1">© {new Date().getFullYear()} Weather App</p>
          </footer>
        </div>
      </main>
    </WeatherBackground>
  );
} 