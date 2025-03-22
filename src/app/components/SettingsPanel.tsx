'use client';

import { useState } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import GlassCard from './GlassCard';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { 
    preferences, 
    updatePreference, 
    addSavedLocation,
    removeSavedLocation,
    resetPreferences 
  } = useUserPreferences();
  
  const [newLocation, setNewLocation] = useState('');

  // Handle adding a new saved location
  const handleAddLocation = () => {
    if (newLocation.trim()) {
      addSavedLocation(newLocation.trim());
      setNewLocation('');
    }
  };

  // If panel is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <GlassCard className="p-6" intensity="heavy" variant="primary">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-white/80 p-1"
              aria-label="Close settings"
            >
              ✕
            </button>
          </div>

          {/* Temperature unit */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Temperature Unit</h3>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={preferences.temperatureUnit === 'F'}
                  onChange={() => updatePreference('temperatureUnit', 'F')}
                  className="mr-2"
                />
                Fahrenheit (°F)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={preferences.temperatureUnit === 'C'}
                  onChange={() => updatePreference('temperatureUnit', 'C')}
                  className="mr-2"
                />
                Celsius (°C)
              </label>
            </div>
          </div>

          {/* Default location */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Default Location</h3>
            <select
              value={preferences.defaultLocation}
              onChange={(e) => updatePreference('defaultLocation', e.target.value)}
              className="w-full p-2 bg-black/20 border border-white/20 rounded text-white"
            >
              {preferences.savedLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Saved locations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Saved Locations</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add location (e.g. Chicago, IL)"
                className="flex-1 p-2 bg-black/20 border border-white/20 rounded text-white"
              />
              <button
                onClick={handleAddLocation}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
              >
                Add
              </button>
            </div>
            
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {preferences.savedLocations.map(location => (
                <li key={location} className="flex justify-between items-center bg-black/20 p-2 rounded">
                  {location}
                  <button
                    onClick={() => removeSavedLocation(location)}
                    className="text-red-400 hover:text-red-300 p-1"
                    disabled={preferences.savedLocations.length <= 1 || location === preferences.defaultLocation}
                    aria-label={`Remove ${location}`}
                  >
                    {preferences.savedLocations.length <= 1 || location === preferences.defaultLocation ? '(Default)' : '✕'}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Theme selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Theme</h3>
            <select
              value={preferences.theme}
              onChange={(e) => updatePreference('theme', e.target.value as 'light' | 'dark' | 'auto')}
              className="w-full p-2 bg-black/20 border border-white/20 rounded text-white"
            >
              <option value="auto">Auto (System Default)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Display preferences */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Display Options</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.showHumidity}
                  onChange={(e) => updatePreference('showHumidity', e.target.checked)}
                  className="mr-2"
                />
                Show Humidity
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.showWindSpeed}
                  onChange={(e) => updatePreference('showWindSpeed', e.target.checked)}
                  className="mr-2"
                />
                Show Wind Speed
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.showFeelsLike}
                  onChange={(e) => updatePreference('showFeelsLike', e.target.checked)}
                  className="mr-2"
                />
                Show "Feels Like" Temperature
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.showPrecipitation}
                  onChange={(e) => updatePreference('showPrecipitation', e.target.checked)}
                  className="mr-2"
                />
                Show Precipitation
              </label>
            </div>
          </div>

          {/* Reset button */}
          <div className="border-t border-white/10 pt-4 mt-4 flex justify-between">
            <button
              onClick={resetPreferences}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 