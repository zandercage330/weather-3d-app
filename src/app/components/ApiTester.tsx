'use client';

import { useState } from 'react';
import { fetchCurrentWeather, fetchForecast, searchLocations } from '../lib/weatherApiClient';
import GlassCard from './GlassCard';

/**
 * This component is for testing the API integration
 * It allows direct testing of the API endpoints without affecting the main application
 */
export default function ApiTester() {
  const [location, setLocation] = useState('London, UK');
  const [endpoint, setEndpoint] = useState<'current' | 'forecast' | 'search'>('current');
  const [days, setDays] = useState(5);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      switch (endpoint) {
        case 'current':
          data = await fetchCurrentWeather(location);
          break;
        case 'forecast':
          data = await fetchForecast(location, days);
          break;
        case 'search':
          data = await searchLocations(location);
          break;
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-4">
      <h2 className="text-xl font-bold mb-4">WeatherAPI Integration Test</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="endpoint" className="text-sm font-medium">Endpoint</label>
          <select 
            id="endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value as any)}
            className="bg-gray-700 bg-opacity-40 rounded p-2 text-white"
          >
            <option value="current">Current Weather</option>
            <option value="forecast">Forecast</option>
            <option value="search">Location Search</option>
          </select>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label htmlFor="location" className="text-sm font-medium">Location</label>
          <input 
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-gray-700 bg-opacity-40 rounded p-2 text-white"
            placeholder="Enter location"
          />
        </div>
        
        {endpoint === 'forecast' && (
          <div className="flex flex-col space-y-2">
            <label htmlFor="days" className="text-sm font-medium">Days</label>
            <input 
              id="days"
              type="number"
              min="1"
              max="10"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="bg-gray-700 bg-opacity-40 rounded p-2 text-white"
            />
          </div>
        )}
        
        <button
          onClick={testApi}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test API'}
        </button>
        
        {error && (
          <div className="p-3 bg-red-500 bg-opacity-30 rounded">
            <p className="text-red-100">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Result:</h3>
            <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-80 text-xs text-green-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <p className="mt-4 text-xs text-white/60">
        Note: You need to set the WEATHER_API_KEY in your .env.local file for this test to work.
      </p>
    </GlassCard>
  );
} 