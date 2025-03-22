'use client';

import { useState } from 'react';
import { NotificationType } from '../lib/notificationService';
import { 
  ScheduledNotification, 
  NotificationRule, 
  addScheduledNotification,
  updateScheduledNotification,
  deleteScheduledNotification,
  toggleScheduledNotification,
  getScheduledNotifications
} from '../lib/notificationScheduleService';

interface ScheduleListProps {
  schedules: ScheduledNotification[];
  onToggle: (id: string) => void;
  onEdit: (schedule: ScheduledNotification) => void;
  onDelete: (id: string) => void;
}

function ScheduleList({ schedules, onToggle, onEdit, onDelete }: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new notification schedule.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {schedules.map((schedule) => (
        <li key={schedule.id} className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => onToggle(schedule.id)}
                className={`h-5 w-5 rounded border mr-3 flex items-center justify-center ${
                  schedule.enabled ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}
              >
                {schedule.enabled && (
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 7.586 3.707 5.293z" />
                  </svg>
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-white font-medium rounded-full px-2 py-0.5 bg-blue-500 mr-2">
                    {schedule.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {schedule.frequency === 'once' && 'One time'}
                    {schedule.frequency === 'daily' && 'Daily'}
                    {schedule.frequency === 'weekly' && 'Weekly'}
                    {schedule.frequency === 'custom' && 'Custom'}
                    {schedule.time && ` at ${schedule.time}`}
                    {schedule.days?.length && ` on ${schedule.days.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(schedule)}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(schedule.id)}
                className="text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

interface NotificationRuleEditorProps {
  rule: NotificationRule;
  onUpdate: (updatedRule: NotificationRule) => void;
  onDelete: () => void;
}

function NotificationRuleEditor({ rule, onUpdate, onDelete }: NotificationRuleEditorProps) {
  const handleChange = (field: keyof NotificationRule, value: any) => {
    onUpdate({ ...rule, [field]: value });
  };

  return (
    <div className="p-4 border border-gray-200 rounded-md mb-3">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium">Rule Condition</h4>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <select
            value={rule.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="temperature">Temperature</option>
            <option value="precipitation">Precipitation</option>
            <option value="uv">UV Index</option>
            <option value="aqi">Air Quality</option>
            <option value="wind">Wind Speed</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
          <select
            value={rule.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
            <option value="equals">Equals</option>
            <option value="range">Within Range</option>
            <option value="changes">Changes By</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {rule.condition === 'range' ? 'Min Value' : 'Value'}
          </label>
          <input
            type="number"
            value={rule.value1}
            onChange={(e) => handleChange('value1', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>

        {rule.condition === 'range' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max Value</label>
            <input
              type="number"
              value={rule.value2 || 0}
              onChange={(e) => handleChange('value2', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={rule.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Custom Message (Optional)</label>
          <input
            type="text"
            value={rule.message || ''}
            onChange={(e) => handleChange('message', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            placeholder="Custom notification message"
          />
        </div>
      </div>
    </div>
  );
}

interface ScheduleFormProps {
  schedule?: ScheduledNotification;
  onSave: (schedule: ScheduledNotification) => void;
  onCancel: () => void;
}

function ScheduleForm({ schedule, onSave, onCancel }: ScheduleFormProps) {
  const [title, setTitle] = useState(schedule?.title || '');
  const [type, setType] = useState<NotificationType>(schedule?.type || 'forecast');
  const [frequency, setFrequency] = useState(schedule?.frequency || 'daily');
  const [time, setTime] = useState(schedule?.time || '08:00');
  const [days, setDays] = useState<number[]>(schedule?.days || [0, 1, 2, 3, 4, 5, 6]);
  const [rules, setRules] = useState<NotificationRule[]>(schedule?.customRules || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSchedule: ScheduledNotification = {
      id: schedule?.id || `schedule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title,
      type,
      frequency: frequency as 'once' | 'daily' | 'weekly' | 'custom',
      time,
      days: frequency === 'weekly' ? days : undefined,
      enabled: schedule?.enabled !== undefined ? schedule.enabled : true,
      lastSent: schedule?.lastSent,
      customRules: rules.length > 0 ? rules : undefined
    };
    
    onSave(newSchedule);
  };

  const toggleDay = (dayIndex: number) => {
    setDays(prevDays => 
      prevDays.includes(dayIndex)
        ? prevDays.filter(d => d !== dayIndex)
        : [...prevDays, dayIndex]
    );
  };

  const addRule = () => {
    const newRule: NotificationRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'temperature',
      condition: 'above',
      value1: 90,
      priority: 'medium'
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (index: number, updatedRule: NotificationRule) => {
    const newRules = [...rules];
    newRules[index] = updatedRule;
    setRules(newRules);
  };

  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Daily Weather Update"
          required
        />
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as NotificationType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="forecast">Weather Forecast</option>
          <option value="alert">Weather Alert</option>
          <option value="temperature">Temperature</option>
          <option value="precipitation">Precipitation</option>
          <option value="uv">UV Index</option>
          <option value="aqi">Air Quality</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'once' | 'daily' | 'weekly' | 'custom')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="once">One Time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom Rules</option>
        </select>
      </div>
      
      {(frequency === 'once' || frequency === 'daily' || frequency === 'weekly') && (
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
      )}
      
      {frequency === 'weekly' && (
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">Days of the Week</span>
          <div className="flex flex-wrap gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(index)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  days.includes(index)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {frequency === 'custom' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Custom Rules</span>
            <button
              type="button"
              onClick={addRule}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Rule
            </button>
          </div>
          
          {rules.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">No rules yet. Add one to get started.</p>
            </div>
          ) : (
            <div>
              {rules.map((rule, index) => (
                <NotificationRuleEditor
                  key={rule.id}
                  rule={rule}
                  onUpdate={(updatedRule) => updateRule(index, updatedRule)}
                  onDelete={() => deleteRule(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Schedule
        </button>
      </div>
    </form>
  );
}

export default function NotificationScheduler() {
  const [schedules, setSchedules] = useState<ScheduledNotification[]>(getScheduledNotifications());
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduledNotification | undefined>(undefined);

  const handleSaveSchedule = (schedule: ScheduledNotification) => {
    if (schedule.id && schedules.some(s => s.id === schedule.id)) {
      // Update existing
      const updated = updateScheduledNotification(schedule.id, schedule);
      setSchedules(updated);
    } else {
      // Add new
      const updated = addScheduledNotification(schedule);
      setSchedules(updated);
    }
    setIsEditing(false);
    setCurrentSchedule(undefined);
  };

  const handleToggleSchedule = (id: string) => {
    const updated = toggleScheduledNotification(id);
    setSchedules(updated);
  };

  const handleEditSchedule = (schedule: ScheduledNotification) => {
    setCurrentSchedule(schedule);
    setIsEditing(true);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      const updated = deleteScheduledNotification(id);
      setSchedules(updated);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Notification Schedules</h2>
        {!isEditing && (
          <button
            onClick={() => {
              setCurrentSchedule(undefined);
              setIsEditing(true);
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Schedule
          </button>
        )}
      </div>

      {isEditing ? (
        <ScheduleForm
          schedule={currentSchedule}
          onSave={handleSaveSchedule}
          onCancel={() => {
            setIsEditing(false);
            setCurrentSchedule(undefined);
          }}
        />
      ) : (
        <ScheduleList
          schedules={schedules}
          onToggle={handleToggleSchedule}
          onEdit={handleEditSchedule}
          onDelete={handleDeleteSchedule}
        />
      )}
    </div>
  );
} 