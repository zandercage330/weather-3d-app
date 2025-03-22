'use client';

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationPreferences } from '../lib/notificationService';

interface NotificationSettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function NotificationSettingsSection({ title, description, children }: NotificationSettingsSectionProps) {
  return (
    <div className="border-b border-gray-200 py-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

function ToggleSetting({ label, enabled, onChange, description }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        ></span>
      </button>
    </div>
  );
}

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function TimePicker({ label, value, onChange, description }: TimePickerProps) {
  return (
    <div className="py-2">
      <label htmlFor={`time-${label.toLowerCase().replace(/\s+/g, '-')}`} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-1">{description}</p>
      )}
      <input
        type="time"
        id={`time-${label.toLowerCase().replace(/\s+/g, '-')}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
      />
    </div>
  );
}

interface SliderSettingProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description?: string;
  valueFormatter?: (value: number) => string;
}

function SliderSetting({ 
  label, 
  value, 
  min,
  max,
  step,
  onChange, 
  description,
  valueFormatter = (val) => val.toString()
}: SliderSettingProps) {
  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-900">{label}</label>
        <span className="text-sm text-gray-500">{valueFormatter(value)}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}

interface NotificationSettingsProps {
  onClose?: () => void;
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { 
    notificationPreferences, 
    hasPermission, 
    requestPermission, 
    updateNotificationPreferences,
    scheduledNotifications,
    clearAllScheduledNotifications,
  } = useNotifications();
  
  const [isGranting, setIsGranting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleRequestPermission = async () => {
    setIsGranting(true);
    try {
      await requestPermission();
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto p-6 overflow-y-auto max-h-[90vh]">
      <div className="pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="py-4">
        {hasPermission === false && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Browser notifications are blocked. Enable them to receive alerts outside the app.
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    disabled={isGranting}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    {isGranting ? 'Requesting...' : 'Enable Notifications'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <NotificationSettingsSection
          title="General Settings"
          description="Configure how and when you'd like to receive notifications"
        >
          <ToggleSetting
            label="Enable Notifications"
            enabled={notificationPreferences.enabled}
            onChange={(value) => updateNotificationPreferences('enabled', value)}
            description="Master switch for all weather notifications"
          />
          
          <ToggleSetting
            label="Browser Notifications"
            enabled={notificationPreferences.notifyInBrowser}
            onChange={(value) => updateNotificationPreferences('notifyInBrowser', value)}
            description="Show notifications in your browser even when the app is closed"
          />
          
          <ToggleSetting
            label="Quiet Hours"
            enabled={notificationPreferences.quietHoursEnabled}
            onChange={(value) => updateNotificationPreferences('quietHoursEnabled', value)}
            description={`Don't send notifications between ${notificationPreferences.quietHoursStart} and ${notificationPreferences.quietHoursEnd}`}
          />

          {notificationPreferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 mt-2 pl-4">
              <TimePicker
                label="Start Time"
                value={notificationPreferences.quietHoursStart}
                onChange={(value) => updateNotificationPreferences('quietHoursStart', value)}
                description="When quiet hours begin"
              />
              <TimePicker
                label="End Time"
                value={notificationPreferences.quietHoursEnd}
                onChange={(value) => updateNotificationPreferences('quietHoursEnd', value)}
                description="When quiet hours end"
              />
            </div>
          )}
        </NotificationSettingsSection>

        <NotificationSettingsSection
          title="Weather Alerts"
          description="Choose which types of weather notifications you want to receive"
        >
          <ToggleSetting
            label="Severe Weather Alerts"
            enabled={notificationPreferences.alertNotifications}
            onChange={(value) => updateNotificationPreferences('alertNotifications', value)}
            description="Warnings about severe weather conditions in your area"
          />
          
          <ToggleSetting
            label="Daily Forecast Notifications"
            enabled={notificationPreferences.forecastNotifications}
            onChange={(value) => updateNotificationPreferences('forecastNotifications', value)}
            description="Get a summary of tomorrow's weather conditions"
          />
          
          <ToggleSetting
            label="Precipitation Alerts"
            enabled={notificationPreferences.precipitationNotifications}
            onChange={(value) => updateNotificationPreferences('precipitationNotifications', value)}
            description="Be notified when rain or snow is about to start or stop"
          />
          
          <ToggleSetting
            label="Temperature Change Alerts"
            enabled={notificationPreferences.temperatureNotifications}
            onChange={(value) => updateNotificationPreferences('temperatureNotifications', value)}
            description="Get notified about significant temperature changes"
          />
          
          <ToggleSetting
            label="Air Quality Alerts"
            enabled={notificationPreferences.aqiNotifications}
            onChange={(value) => updateNotificationPreferences('aqiNotifications', value)}
            description="Receive notifications when air quality becomes unhealthy"
          />
          
          <ToggleSetting
            label="UV Index Warnings"
            enabled={notificationPreferences.uvNotifications}
            onChange={(value) => updateNotificationPreferences('uvNotifications', value)}
            description="Get alerts when UV index reaches high or extreme levels"
          />
        </NotificationSettingsSection>

        <NotificationSettingsSection
          title="Scheduled Notifications"
          description="Manage your scheduled notifications"
        >
          <div className="mt-2">
            {scheduledNotifications.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  You have {scheduledNotifications.length} scheduled notifications.
                </p>
                <button
                  onClick={clearAllScheduledNotifications}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Clear All Scheduled Notifications
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  To manage individual scheduled notifications, go to the Schedule tab in the notification panel.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                You don't have any scheduled notifications. You can create them from the Schedule tab in the notification panel.
              </p>
            )}
          </div>
        </NotificationSettingsSection>

        <div className="py-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">Advanced Settings</span>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'}
          </button>
        </div>

        {showAdvanced && (
          <>
            <NotificationSettingsSection
              title="Threshold Settings"
              description="Configure thresholds for different weather conditions"
            >
              <div className="py-2">
                <label htmlFor="notification-frequency" className="block text-sm font-medium text-gray-900">
                  Notification Frequency
                </label>
                <p className="text-xs text-gray-500 mb-2">How often you want to receive notifications</p>
                <select
                  id="notification-frequency"
                  value={notificationPreferences.notificationFrequency}
                  onChange={(e) => updateNotificationPreferences('notificationFrequency', e.target.value as 'high' | 'medium' | 'low')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="low">Low (Important notifications only)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (All notifications)</option>
                </select>
              </div>
              
              <SliderSetting
                label="Temperature Change Threshold"
                value={notificationPreferences.temperatureChangeThreshold}
                min={3}
                max={15}
                step={1}
                onChange={(value) => updateNotificationPreferences('temperatureChangeThreshold', value)}
                description="Minimum temperature change to trigger a notification"
                valueFormatter={(value) => `${value}°`}
              />
              
              <SliderSetting
                label="Precipitation Probability Threshold"
                value={notificationPreferences.precipitationThreshold}
                min={20}
                max={90}
                step={5}
                onChange={(value) => updateNotificationPreferences('precipitationThreshold', value)}
                description="Minimum probability of precipitation to trigger a notification"
                valueFormatter={(value) => `${value}%`}
              />
              
              <SliderSetting
                label="AQI Warning Threshold"
                value={notificationPreferences.aqiThreshold}
                min={50}
                max={150}
                step={10}
                onChange={(value) => updateNotificationPreferences('aqiThreshold', value)}
                description="AQI level at which to trigger air quality notifications"
              />
              
              <SliderSetting
                label="UV Index Warning Threshold"
                value={notificationPreferences.uvThreshold}
                min={5}
                max={11}
                step={1}
                onChange={(value) => updateNotificationPreferences('uvThreshold', value)}
                description="UV index level at which to trigger UV warnings"
              />
            </NotificationSettingsSection>
            
            <NotificationSettingsSection
              title="Time Settings"
              description="Configure when certain notifications are sent"
            >
              <TimePicker
                label="Daily Forecast Time"
                value={notificationPreferences.dailyForecastTime}
                onChange={(value) => updateNotificationPreferences('dailyForecastTime', value)}
                description="When to send the daily forecast notification"
              />
              
              <ToggleSetting
                label="Weekend Notifications"
                enabled={notificationPreferences.weekendNotifications}
                onChange={(value) => updateNotificationPreferences('weekendNotifications', value)}
                description="Whether to send non-critical notifications on weekends"
              />
            </NotificationSettingsSection>
          </>
        )}
      </div>
    </div>
  );
} 