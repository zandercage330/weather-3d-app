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

function HomePage() {
  const { preferences, updatePreference } = useUserPreferences();
  const { notificationPreferences, addNotifications } = useNotifications();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchTerm, searchResults, isSearching, handleSearch, handleResultSelect, clearSearch } = useLocationSearch();

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
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadWeatherData();
    
    // Set up a periodic refresh for weather data
    const refreshInterval = setInterval(loadWeatherData, 15 * 60 * 1000); // Refresh every 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, [preferences.defaultLocation]);
  
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
    <NotificationProvider>
      <WeatherBackground 
        condition={weatherData?.condition || 'clear'} 
        timeOfDay={weatherData?.timeOfDay || 'day'}
      >
        <div className="flex flex-col h-screen max-h-screen overflow-hidden p-4">
          {/* Header section */}
          <header className="flex justify-between items-center mb-6">
            <Logo />
            <div className="flex space-x-3">
              <NotificationButton />
              <SettingsButton 
                onClick={() => setIsSettingsOpen(true)} 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
              />
            </div>
          </header>

          {/* Location search */}
          <div className="mb-6 relative z-10">
            <LocationSearch
              searchTerm={searchTerm}
              searchResults={searchResults}
              isSearching={isSearching}
              onSearch={handleSearch}
              onResultSelect={handleResultSelect}
              onClearSearch={clearSearch}
            />
          </div>

          {/* Main weather content */}
          <div className="flex-1 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto pb-4">
            <div className="space-y-4 md:col-span-1 lg:col-span-2">
              <WeatherCard 
                weatherData={weatherData}
                isLoading={isLoading}
                userPreferences={preferences} 
              />
              
              {weatherData?.airQuality && (
                <AirQualityIndicator airQuality={weatherData.airQuality} />
              )}
              
              {alerts.length > 0 && (
                <WeatherAlerts alerts={alerts} />
              )}
            </div>
            
            <div className="md:col-span-1 order-first md:order-none">
              <WeatherForecast 
                forecastData={forecastData}
                isLoading={isLoading}
                userPreferences={preferences}
              />
            </div>
          </div>
        </div>
      </WeatherBackground>
    </NotificationProvider>
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