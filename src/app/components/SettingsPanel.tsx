'use client';

import { useState } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useNotifications } from '../hooks/useNotifications';
import GlassCard from './GlassCard';
import SavedLocationsManager from './SavedLocationsManager';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
}

export default function SettingsPanel({ isOpen, onClose, activeTab = 'general' }: SettingsPanelProps) {
  const { 
    preferences, 
    updatePreference, 
    addSavedLocation,
    removeSavedLocation,
    resetPreferences 
  } = useUserPreferences();
  
  const {
    notificationPreferences,
    updateNotificationPreferences,
    hasPermission,
    requestPermission
  } = useNotifications();
  
  const [newLocation, setNewLocation] = useState('');
  const [currentTab, setCurrentTab] = useState(activeTab);

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'locations', label: 'Locations' },
    { id: 'display', label: 'Display' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'about', label: 'About' }
  ];

  // Handle adding a new saved location
  const handleAddLocation = () => {
    if (newLocation.trim()) {
      addSavedLocation(newLocation.trim());
      setNewLocation('');
    }
  };

  // Request browser notification permission
  const handleRequestPermission = async () => {
    await requestPermission();
  };

  // If panel is not open, don't render anything
  if (!isOpen) return null;

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (currentTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Temperature Unit</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => updatePreference('temperatureUnit', 'C')}
                  className={`py-2 px-4 rounded-lg ${
                    preferences.temperatureUnit === 'C'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  onClick={() => updatePreference('temperatureUnit', 'F')}
                  className={`py-2 px-4 rounded-lg ${
                    preferences.temperatureUnit === 'F'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Theme</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => updatePreference('theme', 'light')}
                  className={`py-2 px-4 rounded-lg ${
                    preferences.theme === 'light'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => updatePreference('theme', 'dark')}
                  className={`py-2 px-4 rounded-lg ${
                    preferences.theme === 'dark'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => updatePreference('theme', 'auto')}
                  className={`py-2 px-4 rounded-lg ${
                    preferences.theme === 'auto'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  Auto
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={resetPreferences}
                className="py-2 px-4 rounded-lg bg-red-500/20 text-red-100 hover:bg-red-500/30 transition-colors"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        );
      
      case 'locations':
        return (
          <div className="space-y-4">
            <SavedLocationsManager />
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-2">Add New Location</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Enter city name, e.g. London, UK"
                  className="flex-1 py-2 px-4 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  onClick={handleAddLocation}
                  disabled={!newLocation.trim()}
                  className="py-2 px-4 rounded-lg bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'display':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Weather Display Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showHumidity"
                  checked={preferences.showHumidity}
                  onChange={(e) => updatePreference('showHumidity', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showHumidity" className="text-white">Show Humidity</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showWindSpeed"
                  checked={preferences.showWindSpeed}
                  onChange={(e) => updatePreference('showWindSpeed', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showWindSpeed" className="text-white">Show Wind Speed</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showFeelsLike"
                  checked={preferences.showFeelsLike}
                  onChange={(e) => updatePreference('showFeelsLike', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showFeelsLike" className="text-white">Show "Feels Like" Temperature</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showPrecipitation"
                  checked={preferences.showPrecipitation}
                  onChange={(e) => updatePreference('showPrecipitation', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showPrecipitation" className="text-white">Show Precipitation</label>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Enable Notifications</h3>
              <div className="relative inline-block w-10 align-middle select-none">
                <input
                  type="checkbox"
                  id="notificationsEnabled"
                  checked={notificationPreferences.enabled}
                  onChange={() => updateNotificationPreferences('enabled', !notificationPreferences.enabled)}
                  className="sr-only"
                />
                <div className={`block w-10 h-6 rounded-full ${notificationPreferences.enabled ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>

            {!hasPermission && (
              <div className="bg-yellow-500/20 p-3 rounded">
                <p className="text-sm mb-2">Browser notifications are not enabled. Enable them to receive alerts even when the app is in the background.</p>
                <button
                  onClick={handleRequestPermission}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm"
                >
                  Enable Browser Notifications
                </button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="font-medium mb-2">Notification Types</h4>
              
              <div className="flex items-center justify-between mt-2">
                <label htmlFor="alertNotifications" className="cursor-pointer text-sm">
                  Weather Alerts
                  <p className="text-xs text-white/60">Severe weather warnings</p>
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="alertNotifications"
                    checked={notificationPreferences.alertNotifications}
                    onChange={() => updateNotificationPreferences('alertNotifications', !notificationPreferences.alertNotifications)}
                    disabled={!notificationPreferences.enabled}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full ${!notificationPreferences.enabled ? 'bg-white/10' : notificationPreferences.alertNotifications ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.alertNotifications && notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <label htmlFor="forecastNotifications" className="cursor-pointer text-sm">
                  Forecast Updates
                  <p className="text-xs text-white/60">Notable changes in tomorrow's forecast</p>
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="forecastNotifications"
                    checked={notificationPreferences.forecastNotifications}
                    onChange={() => updateNotificationPreferences('forecastNotifications', !notificationPreferences.forecastNotifications)}
                    disabled={!notificationPreferences.enabled}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full ${!notificationPreferences.enabled ? 'bg-white/10' : notificationPreferences.forecastNotifications ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.forecastNotifications && notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <label htmlFor="aqiNotifications" className="cursor-pointer text-sm">
                  Air Quality
                  <p className="text-xs text-white/60">Poor air quality warnings</p>
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="aqiNotifications"
                    checked={notificationPreferences.aqiNotifications}
                    onChange={() => updateNotificationPreferences('aqiNotifications', !notificationPreferences.aqiNotifications)}
                    disabled={!notificationPreferences.enabled}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full ${!notificationPreferences.enabled ? 'bg-white/10' : notificationPreferences.aqiNotifications ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.aqiNotifications && notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <label htmlFor="precipitationNotifications" className="cursor-pointer text-sm">
                  Precipitation Alerts
                  <p className="text-xs text-white/60">Rain or snow starting/stopping soon</p>
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="precipitationNotifications"
                    checked={notificationPreferences.precipitationNotifications}
                    onChange={() => updateNotificationPreferences('precipitationNotifications', !notificationPreferences.precipitationNotifications)}
                    disabled={!notificationPreferences.enabled}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full ${!notificationPreferences.enabled ? 'bg-white/10' : notificationPreferences.precipitationNotifications ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.precipitationNotifications && notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <label htmlFor="temperatureNotifications" className="cursor-pointer text-sm">
                  Temperature Changes
                  <p className="text-xs text-white/60">Significant temperature shifts</p>
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="temperatureNotifications"
                    checked={notificationPreferences.temperatureNotifications}
                    onChange={() => updateNotificationPreferences('temperatureNotifications', !notificationPreferences.temperatureNotifications)}
                    disabled={!notificationPreferences.enabled}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full ${!notificationPreferences.enabled ? 'bg-white/10' : notificationPreferences.temperatureNotifications ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.temperatureNotifications && notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <label htmlFor="uvNotifications" className="cursor-pointer text-sm">
                  UV Index Warnings
                  <p className="text-xs text-white/60">High UV level alerts</p>
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="uvNotifications"
                    checked={notificationPreferences.uvNotifications}
                    onChange={() => updateNotificationPreferences('uvNotifications', !notificationPreferences.uvNotifications)}
                    disabled={!notificationPreferences.enabled}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full ${!notificationPreferences.enabled ? 'bg-white/10' : notificationPreferences.uvNotifications ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.uvNotifications && notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="font-medium mb-2">Delivery Options</h4>
              
              <div className="flex items-center justify-between mt-2">
                <label htmlFor="notifyInBrowser" className="cursor-pointer text-sm">
                  In-Browser Notifications
                  <p className="text-xs text-white/60">Show notifications in the browser</p>
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="notifyInBrowser"
                    checked={notificationPreferences.notifyInBrowser}
                    onChange={() => updateNotificationPreferences('notifyInBrowser', !notificationPreferences.notifyInBrowser)}
                    disabled={!notificationPreferences.enabled}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full ${!notificationPreferences.enabled ? 'bg-white/10' : notificationPreferences.notifyInBrowser ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.notifyInBrowser && notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="font-medium mb-2">Quiet Hours</h4>
              
              <div className="flex items-center justify-between">
                <label htmlFor="quietHoursEnabled" className="cursor-pointer text-sm">
                  Enable Quiet Hours
                  <p className="text-xs text-white/60">Mute notifications during specified times</p>
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="quietHoursEnabled"
                    checked={notificationPreferences.quietHoursEnabled}
                    onChange={() => updateNotificationPreferences('quietHoursEnabled', !notificationPreferences.quietHoursEnabled)}
                    disabled={!notificationPreferences.enabled}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full ${!notificationPreferences.enabled ? 'bg-white/10' : notificationPreferences.quietHoursEnabled ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationPreferences.quietHoursEnabled && notificationPreferences.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              {notificationPreferences.quietHoursEnabled && notificationPreferences.enabled && (
                <div className="flex gap-4 mt-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={notificationPreferences.quietHoursStart}
                      onChange={(e) => updateNotificationPreferences('quietHoursStart', e.target.value)}
                      className="bg-white/10 border border-white/20 rounded p-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">End Time</label>
                    <input
                      type="time"
                      value={notificationPreferences.quietHoursEnd}
                      onChange={(e) => updateNotificationPreferences('quietHoursEnd', e.target.value)}
                      className="bg-white/10 border border-white/20 rounded p-1 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'about':
        // ... existing code for about tab ...

      default:
        return <div>Unknown tab</div>;
    }
  };

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

          {/* Tabs */}
          <div className="flex border-b border-white/20 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`py-2 px-4 ${currentTab === tab.id ? 'border-b-2 border-blue-500 text-blue-500' : 'text-white/80'}`}
                onClick={() => setCurrentTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {renderTabContent()}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetPreferences}
              className="px-4 py-2 border border-white/20 text-white/80 rounded hover:bg-white/10"
            >
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 