'use client';

import { useState, useEffect } from 'react';
import { useUserPreferences, UserPreferencesProvider } from './hooks/useUserPreferences';
import { useLocationSearch } from './hooks/useLocationSearch';
import { getWeatherData, getForecastData, getWeatherAlerts, WeatherData, ForecastDay, WeatherAlert } from './lib/weatherService';
import { NotificationProvider } from './hooks/useNotifications';
import { useNotifications } from './hooks/useNotifications';
import { generateWeatherNotifications } from './lib/notificationService';
import WeatherCard from './components/WeatherCard';
import WeatherForecast from './components/WeatherForecast';
import WeatherBackground from './components/WeatherBackground';
import LocationSearch from './components/LocationSearch';
import WeatherAlerts from './components/WeatherAlerts';
import AirQualityIndicator from './components/AirQualityIndicator';
import NotificationButton from './components/NotificationButton';
import SettingsButton from './components/SettingsButton';
import Logo from './components/Logo';
import AdvancedHourlyForecast from './components/AdvancedHourlyForecast';
import EnhancedWeatherAlerts from './components/EnhancedWeatherAlerts';
import EnhancedWeatherCard from './components/EnhancedWeatherCard';
import PrecipitationAnalysis from './components/PrecipitationAnalysis';
import { WeatherHistoryCard } from './components/WeatherHistoryCard';
import EnhancedLocationSearch from './components/EnhancedLocationSearch';
import CurrentLocationButton from './components/CurrentLocationButton';
import SavedLocationsManager from './components/SavedLocationsManager';
import SettingsPanel from './components/SettingsPanel';
import { OfflineIndicator } from './components/ui/OfflineIndicator';

function HomePage() {
  const { preferences, updatePreference } = useUserPreferences();
  const { notificationPreferences, addNotifications } = useNotifications();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useAdvancedComponents, setUseAdvancedComponents] = useState(true);
  const { searchTerm, searchResults, isSearching, handleSearch, handleResultSelect, clearSearch } = useLocationSearch();

  // Create a wrapper function for handleResultSelect to match the expected signature
  const handleLocationSelect = (location: string) => {
    // Create a simple object to simulate a LocationResult
    const locationResult = {
      name: location,
      country: '',
      displayName: location
    };
    handleResultSelect(locationResult);
  };

  // Fetch weather data based on the location in preferences
  useEffect(() => {
    async function loadWeatherData() {
      if (!preferences.defaultLocation) return;
      
      setIsLoading(true);
      try {
        const [weather, forecast, alertsData] = await Promise.all([
          getWeatherData(preferences.defaultLocation),
          getForecastData(7, preferences.defaultLocation), // Increased to 7 days for better forecasting
          getWeatherAlerts(preferences.defaultLocation.split(',')[1]?.trim() || 'NY')
        ]);
        
        setWeatherData(weather);
        setForecastData(forecast);
        setAlerts(alertsData);
        
        // Generate and add notifications based on the new weather data
        if (notificationPreferences.enabled) {
          const notifications = generateWeatherNotifications(weather, forecast, alertsData, notificationPreferences);
          if (notifications.length > 0) {
            addNotifications(notifications);
          }
        }
      } catch (error) {
        console.error('Error loading weather data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadWeatherData();
  }, [preferences.defaultLocation, notificationPreferences, addNotifications]);
  
  // Generate notifications when weather data changes
  useEffect(() => {
    // Only proceed if we have all the required data and notifications are enabled
    if (weatherData && forecastData.length > 0 && notificationPreferences.enabled) {
      const newNotifications = generateWeatherNotifications(
        weatherData,
        forecastData,
        alerts,
        notificationPreferences
      );
      
      if (newNotifications.length > 0) {
        addNotifications(newNotifications);
      }
    }
  }, [weatherData, forecastData, alerts, notificationPreferences, addNotifications]);
  
  // Set up periodic notification check for background notification generation
  useEffect(() => {
    // Function to check for scheduled notifications and other time-based events
    const checkForScheduledNotifications = async () => {
      if (!weatherData || !notificationPreferences.enabled) return;
      
      // This will check scheduled notifications and generate any that are due
      const newNotifications = generateWeatherNotifications(
        weatherData,
        forecastData,
        alerts,
        notificationPreferences
      );
      
      if (newNotifications.length > 0) {
        addNotifications(newNotifications);
      }
    };
    
    // Run immediately on mount
    checkForScheduledNotifications();
    
    // Set up interval to run every minute
    const notificationInterval = setInterval(checkForScheduledNotifications, 60 * 1000);
    
    return () => clearInterval(notificationInterval);
  }, [weatherData, forecastData, alerts, notificationPreferences, addNotifications]);

  return (
    <div className="relative min-h-screen">
      {/* Offline indicator */}
      <OfflineIndicator />
      
      {/* Background */}
      <WeatherBackground 
        condition={weatherData?.condition || 'clear'} 
        timeOfDay={weatherData?.timeOfDay || 'day'}
      >
        <div className="container mx-auto p-4 relative z-10 overflow-auto max-h-screen">
          {/* Header with search and buttons */}
          <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center">
              <Logo />
            </div>
            
            <div className="flex-1 max-w-xl">
              <EnhancedLocationSearch
                onLocationSelect={handleLocationSelect}
                className=""
              />
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationButton />
              <SettingsButton 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
                onClick={() => setIsSettingsOpen(true)} 
              />
            </div>
          </header>
          
          {/* Show saved locations manager in mobile view */}
          <div className="md:hidden mb-6">
            <SavedLocationsManager 
              currentLocation={preferences.defaultLocation}
              className="bg-gradient-to-br from-black/40 to-black/60"
              onSelectLocation={(location: string) => {
                updatePreference('defaultLocation', location);
                clearSearch();
              }}
            />
          </div>
          
          {/* Main content */}
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current weather */}
            <div className="lg:col-span-2">
              {weatherData ? (
                useAdvancedComponents ? (
                  <EnhancedWeatherCard 
                    weatherData={weatherData} 
                    isLoading={false}
                    userPreferences={preferences}
                  />
                ) : (
                  <WeatherCard 
                    weatherData={weatherData} 
                    isLoading={false}
                    userPreferences={preferences}
                  />
                )
              ) : (
                <div className="animate-pulse bg-white/10 backdrop-blur-md rounded-xl h-64 flex items-center justify-center">
                  <p className="text-white/70">Loading weather data...</p>
                </div>
              )}
            </div>
            
            {/* Sidebar with additional info and saved locations on desktop */}
            <div className="space-y-6">
              {/* Air quality */}
              {weatherData?.airQuality && (
                <AirQualityIndicator airQuality={weatherData.airQuality} />
              )}
              
              {/* Weather alerts */}
              {alerts.length > 0 && (
                useAdvancedComponents ? (
                  <EnhancedWeatherAlerts alerts={alerts} />
                ) : (
                  <WeatherAlerts alerts={alerts} />
                )
              )}
              
              {/* Show saved locations in desktop view */}
              <div className="hidden md:block">
                <SavedLocationsManager 
                  currentLocation={preferences.defaultLocation}
                  className="bg-gradient-to-br from-black/40 to-black/60"
                  onSelectLocation={(location: string) => {
                    updatePreference('defaultLocation', location);
                    clearSearch();
                  }}
                />
              </div>
            </div>
          </main>
          
          {/* Weather forecast section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">7-Day Forecast</h2>
            {forecastData.length > 0 ? (
              <WeatherForecast 
                forecastData={forecastData}
                isLoading={false}
                userPreferences={preferences}
              />
            ) : (
              <div className="animate-pulse bg-white/10 backdrop-blur-md rounded-xl h-48 flex items-center justify-center">
                <p className="text-white/70">Loading forecast data...</p>
              </div>
            )}
          </section>
        
          {/* Advanced features toggle */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setUseAdvancedComponents(!useAdvancedComponents)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
            >
              {useAdvancedComponents ? 'Switch to Basic View' : 'Switch to Advanced View'}
            </button>
          </div>
          
          {/* Advanced hourly forecast */}
          {useAdvancedComponents && weatherData && forecastData.length > 0 && forecastData[0]?.hourlyForecast && (
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Hourly Forecast</h2>
              <AdvancedHourlyForecast 
                hourlyData={forecastData.flatMap(day => day.hourlyForecast || [])}
                date={forecastData[0].date}
                userPreferences={preferences}
              />
            </section>
          )}
          
          {/* Precipitation analysis */}
          {useAdvancedComponents && weatherData && (
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Precipitation Analysis</h2>
              <PrecipitationAnalysis 
                forecastData={forecastData}
                userPreferences={preferences}
              />
            </section>
          )}
          
          {/* Weather history card */}
          {useAdvancedComponents && weatherData && (
            <section className="mt-8 mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Weather History</h2>
              <WeatherHistoryCard location={preferences.defaultLocation} />
            </section>
          )}
        </div>
      </WeatherBackground>
      
      {/* Settings panel */}
      {isSettingsOpen && (
        <SettingsPanel 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

// Wrapper component that provides context
export default function Home() {
  return (
    <UserPreferencesProvider>
      <NotificationProvider>
        <HomePage />
      </NotificationProvider>
    </UserPreferencesProvider>
  );
} 