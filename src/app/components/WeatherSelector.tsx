'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface WeatherScenario {
  name: string;
  condition: string;
  precipitation: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
}

interface WeatherSelectorProps {
  scenarios: WeatherScenario[];
}

const WeatherSelector: React.FC<WeatherSelectorProps> = ({ scenarios }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the current condition from URL or default to first scenario
  const currentCondition = searchParams.get('condition') || scenarios[0].condition;
  
  // Find the current scenario by condition
  const currentScenario = scenarios.find(s => s.condition === currentCondition) || scenarios[0];
  
  // Function to change weather condition
  const changeWeather = (condition: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('condition', condition);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  return (
    <div className="glass-card rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Weather Conditions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.condition}
            onClick={() => changeWeather(scenario.condition)}
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              currentScenario.condition === scenario.condition
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white/30 hover:bg-white/50 hover:shadow text-gray-800 dark:text-white'
            }`}
          >
            <div className="flex items-center justify-center">
              <WeatherIcon condition={scenario.condition} />
              <span className="ml-2 capitalize">{scenario.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper component for weather icons
const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
  // Map condition to emoji
  const getWeatherEmoji = (cond: string) => {
    switch (cond) {
      case 'clear':
        return '☀️';
      case 'partly-cloudy':
        return '⛅';
      case 'cloudy':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'storm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  };

  return <span className="text-lg">{getWeatherEmoji(condition)}</span>;
};

export default WeatherSelector; 