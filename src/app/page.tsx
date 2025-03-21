'use client';

import { useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import ForecastSection from './components/ForecastSection';
import LocationSelector from './components/LocationSelector';
import { TemperatureUnitProvider } from './components/TemperatureUnitProvider';
import RefreshButton from './components/RefreshButton';
import WeatherAlerts from './components/WeatherAlerts';
import WeatherBackground from './components/WeatherBackground';
import { getWeatherData, getForecastData, WeatherData, ForecastDay } from './lib/weatherService';

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('New York, NY');
  const [isLoading, setIsLoading] = useState(true);
  
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
        getForecastData(5, selectedLocation)
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
  };

  return (
    <TemperatureUnitProvider>
      <WeatherBackground weatherData={weatherData}>
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 text-white">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <h1 className="text-3xl md:text-4xl font-bold">Weather App</h1>
              <div className="flex items-center gap-4">
                <LocationSelector currentLocation={selectedLocation} onLocationChange={handleLocationChange} />
                <RefreshButton onClick={fetchWeatherData} isLoading={isLoading} />
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main weather card and alerts in first column */}
              <div className="lg:col-span-1 space-y-6">
                <WeatherCard 
                  weatherData={weatherData} 
                  isLoading={isLoading} 
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
                />
              </div>
            </div>
            
            <footer className="mt-8 text-center text-sm text-white/60">
              <p>Real-time weather data powered by MCP Weather</p>
              <p className="mt-1">© {new Date().getFullYear()} Weather App</p>
            </footer>
          </div>
        </main>
      </WeatherBackground>
    </TemperatureUnitProvider>
  );
} 