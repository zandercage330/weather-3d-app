'use client';

import { useState } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useNotifications } from '../hooks/useNotifications';
import GlassCard from './GlassCard';

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
            <button
              className={`py-2 px-4 ${currentTab === 'general' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-white/80'}`}
              onClick={() => setCurrentTab('general')}
            >
              General
            </button>
            <button
              className={`py-2 px-4 ${currentTab === 'display' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-white/80'}`}
              onClick={() => setCurrentTab('display')}
            >
              Display
            </button>
            <button
              className={`py-2 px-4 ${currentTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-white/80'}`}
              onClick={() => setCurrentTab('notifications')}
            >
              Notifications
            </button>
          </div>

          {/* General Tab */}
          {currentTab === 'general' && (
            <>
              {/* Temperature unit */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Temperature Unit</h3>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="hidden"
                      checked={preferences.temperatureUnit === 'C'}
                      onChange={() => updatePreference('temperatureUnit', 'C')}
                    />
                    <div className={`w-5 h-5 rounded-full border ${preferences.temperatureUnit === 'C' ? 'bg-blue-500 border-blue-500' : 'bg-white/20 border-white/40'} flex items-center justify-center mr-2`}>
                      {preferences.temperatureUnit === 'C' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span>Celsius (°C)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      className="hidden"
                      checked={preferences.temperatureUnit === 'F'}
                      onChange={() => updatePreference('temperatureUnit', 'F')}
                    />
                    <div className={`w-5 h-5 rounded-full border ${preferences.temperatureUnit === 'F' ? 'bg-blue-500 border-blue-500' : 'bg-white/20 border-white/40'} flex items-center justify-center mr-2`}>
                      {preferences.temperatureUnit === 'F' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span>Fahrenheit (°F)</span>
                  </label>
                </div>
              </div>

              {/* Default location */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Default Location</h3>
                <select
                  value={preferences.defaultLocation}
                  onChange={(e) => updatePreference('defaultLocation', e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  {preferences.savedLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Saved locations */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Saved Locations</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {preferences.savedLocations.map(location => (
                    <div key={location} className="flex items-center bg-white/10 rounded-full px-3 py-1">
                      <span className="mr-2">{location}</span>
                      <button
                        onClick={() => removeSavedLocation(location)}
                        className="text-white/60 hover:text-white"
                        disabled={location === preferences.defaultLocation}
                        title={location === preferences.defaultLocation ? "Can't remove default location" : "Remove location"}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add a new location..."
                    className="flex-1 p-2 bg-white/10 border border-white/20 rounded-l text-white"
                  />
                  <button
                    onClick={handleAddLocation}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Theme</h3>
                <select
                  value={preferences.theme}
                  onChange={(e) => updatePreference('theme', e.target.value as 'light' | 'dark' | 'auto')}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
            </>
          )}

          {/* Display Tab */}
          {currentTab === 'display' && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Display Options</h3>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="showHumidity" className="cursor-pointer">Show Humidity</label>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      id="showHumidity"
                      checked={preferences.showHumidity}
                      onChange={() => updatePreference('showHumidity', !preferences.showHumidity)}
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full ${preferences.showHumidity ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.showHumidity ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="showWindSpeed" className="cursor-pointer">Show Wind Speed</label>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      id="showWindSpeed"
                      checked={preferences.showWindSpeed}
                      onChange={() => updatePreference('showWindSpeed', !preferences.showWindSpeed)}
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full ${preferences.showWindSpeed ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.showWindSpeed ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="showFeelsLike" className="cursor-pointer">Show "Feels Like" Temperature</label>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      id="showFeelsLike"
                      checked={preferences.showFeelsLike}
                      onChange={() => updatePreference('showFeelsLike', !preferences.showFeelsLike)}
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full ${preferences.showFeelsLike ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.showFeelsLike ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="showPrecipitation" className="cursor-pointer">Show Precipitation</label>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      id="showPrecipitation"
                      checked={preferences.showPrecipitation}
                      onChange={() => updatePreference('showPrecipitation', !preferences.showPrecipitation)}
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full ${preferences.showPrecipitation ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.showPrecipitation ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {currentTab === 'notifications' && (
            <>
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
            </>
          )}

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