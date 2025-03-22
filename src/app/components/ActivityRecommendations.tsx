'use client';

import React from 'react';
import { WeatherData, ForecastDay } from '../lib/weatherService';
import GlassCard from './GlassCard';

interface Activity {
  name: string;
  icon: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  duration: string;
  description: string;
  idealConditions: {
    minTemp?: number;
    maxTemp?: number;
    maxWindSpeed?: number;
    maxPrecipitation?: number;
    maxUV?: number;
    conditions?: string[];
  };
}

interface ActivityRecommendationsProps {
  weatherData: WeatherData;
  forecast: ForecastDay[];
  className?: string;
}

/**
 * ActivityRecommendations component suggests outdoor activities
 * based on current weather conditions and forecast
 */
const ActivityRecommendations: React.FC<ActivityRecommendationsProps> = ({ 
  weatherData, 
  forecast,
  className = '' 
}) => {
  // Define a set of activities with their ideal weather conditions
  const activities: Activity[] = [
    {
      name: 'Hiking',
      icon: '🥾',
      difficulty: 'moderate',
      duration: '2-4 hours',
      description: 'Explore nature trails and enjoy scenic views',
      idealConditions: {
        minTemp: 50,
        maxTemp: 85,
        maxWindSpeed: 15,
        maxPrecipitation: 20,
        maxUV: 7,
        conditions: ['clear', 'partly-cloudy']
      }
    },
    {
      name: 'Cycling',
      icon: '🚴',
      difficulty: 'moderate',
      duration: '1-3 hours',
      description: 'Perfect for exploring the area on two wheels',
      idealConditions: {
        minTemp: 55,
        maxTemp: 90,
        maxWindSpeed: 10,
        maxPrecipitation: 10,
        maxUV: 8,
        conditions: ['clear', 'partly-cloudy', 'cloudy']
      }
    },
    {
      name: 'Beach Day',
      icon: '🏖️',
      difficulty: 'easy',
      duration: '3-6 hours',
      description: 'Relax by the water, swim, and sunbathe',
      idealConditions: {
        minTemp: 75,
        maxTemp: 95,
        maxWindSpeed: 10,
        maxPrecipitation: 0,
        maxUV: 9,
        conditions: ['clear', 'partly-cloudy']
      }
    },
    {
      name: 'Picnic',
      icon: '🧺',
      difficulty: 'easy',
      duration: '1-3 hours',
      description: 'Enjoy a meal outdoors in a park or scenic spot',
      idealConditions: {
        minTemp: 60,
        maxTemp: 85,
        maxWindSpeed: 12,
        maxPrecipitation: 10,
        maxUV: 8,
        conditions: ['clear', 'partly-cloudy', 'cloudy']
      }
    },
    {
      name: 'Skiing/Snowboarding',
      icon: '🎿',
      difficulty: 'challenging',
      duration: '3-6 hours',
      description: 'Hit the slopes for winter sports',
      idealConditions: {
        minTemp: 20,
        maxTemp: 40,
        maxWindSpeed: 15,
        conditions: ['snow', 'cloudy', 'partly-cloudy', 'clear']
      }
    },
    {
      name: 'Running',
      icon: '🏃',
      difficulty: 'moderate',
      duration: '30-60 min',
      description: 'Great cardio workout outdoors',
      idealConditions: {
        minTemp: 45,
        maxTemp: 75,
        maxWindSpeed: 12,
        maxPrecipitation: 10,
        maxUV: 7,
        conditions: ['clear', 'partly-cloudy', 'cloudy']
      }
    },
    {
      name: 'Indoor Museum Visit',
      icon: '🏛️',
      difficulty: 'easy',
      duration: '2-4 hours',
      description: 'Explore local culture and history',
      idealConditions: {
        conditions: ['rain', 'storm', 'snow', 'sleet']
      }
    },
    {
      name: 'Stargazing',
      icon: '🔭',
      difficulty: 'easy',
      duration: '1-3 hours',
      description: 'Observe stars, planets, and celestial events',
      idealConditions: {
        maxWindSpeed: 10,
        maxPrecipitation: 0,
        conditions: ['clear', 'clear-night']
      }
    },
    {
      name: 'Photography',
      icon: '📷',
      difficulty: 'easy',
      duration: '1-3 hours',
      description: 'Capture beautiful landscapes and moments',
      idealConditions: {
        maxWindSpeed: 15,
        maxPrecipitation: 30,
        conditions: ['clear', 'partly-cloudy', 'cloudy', 'fog', 'snow']
      }
    },
    {
      name: 'Fishing',
      icon: '🎣',
      difficulty: 'easy',
      duration: '2-5 hours',
      description: 'Relax by the water and try to catch fish',
      idealConditions: {
        minTemp: 45,
        maxTemp: 85,
        maxWindSpeed: 12,
        maxPrecipitation: 20,
        conditions: ['clear', 'partly-cloudy', 'cloudy', 'fog']
      }
    },
    {
      name: 'Movie Marathon',
      icon: '🎬',
      difficulty: 'easy',
      duration: '3-6 hours',
      description: 'Stay cozy indoors with your favorite films',
      idealConditions: {
        conditions: ['rain', 'storm', 'snow', 'sleet']
      }
    }
  ];

  // Calculate activity suitability score based on current weather conditions
  const calculateSuitabilityScore = (activity: Activity): number => {
    let score = 100;
    const { temperature, precipitation = 0, windSpeed = 0, condition, uvIndex = 0 } = weatherData;
    const { idealConditions } = activity;
    
    // Check temperature
    if (idealConditions.minTemp !== undefined && temperature < idealConditions.minTemp) {
      const diff = idealConditions.minTemp - temperature;
      score -= diff * 2;
    }
    
    if (idealConditions.maxTemp !== undefined && temperature > idealConditions.maxTemp) {
      const diff = temperature - idealConditions.maxTemp;
      score -= diff * 2;
    }
    
    // Check wind speed
    if (idealConditions.maxWindSpeed !== undefined && windSpeed > idealConditions.maxWindSpeed) {
      const diff = windSpeed - idealConditions.maxWindSpeed;
      score -= diff * 3;
    }
    
    // Check precipitation
    if (idealConditions.maxPrecipitation !== undefined && precipitation > idealConditions.maxPrecipitation) {
      const diff = precipitation - idealConditions.maxPrecipitation;
      score -= diff * 3;
    }
    
    // Check UV index
    if (idealConditions.maxUV !== undefined && uvIndex > idealConditions.maxUV) {
      const diff = uvIndex - idealConditions.maxUV;
      score -= diff * 5;
    }
    
    // Check weather conditions
    if (idealConditions.conditions && !idealConditions.conditions.includes(condition)) {
      score -= 20;
    }
    
    return Math.max(0, score);
  };

  // Get recommended activities (with scores > 60)
  const recommendedActivities = activities
    .map(activity => ({
      ...activity,
      suitabilityScore: calculateSuitabilityScore(activity)
    }))
    .filter(activity => activity.suitabilityScore > 60)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 4);

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: Activity['difficulty']): string => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'challenging':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (recommendedActivities.length === 0) {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-3">Activity Recommendations</h3>
        <p className="text-gray-500 dark:text-gray-400">
          No outdoor activities recommended at this time. Consider indoor activities like visiting a museum, going to a movie, or enjoying a good book at home.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">Recommended Activities</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Based on current conditions: {weatherData.temperature}°F, {weatherData.condition.replace('-', ' ')}
      </p>

      <div className="space-y-4">
        {recommendedActivities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/20 dark:bg-black/20 rounded-lg">
            <div className="text-3xl">{activity.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-medium">{activity.name}</h4>
                <span 
                  className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(activity.difficulty)}`}
                >
                  {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{activity.description}</p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Duration: {activity.duration}</span>
                <span>Suitability: {activity.suitabilityScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold mb-2">Forecast for Upcoming Activities</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {forecast.slice(1, 4).map((day, index) => (
            <div key={index} className="text-center">
              <div className="font-medium">{day.day}</div>
              <div>{day.highTemp}° / {day.lowTemp}°</div>
              <div className="text-gray-500 dark:text-gray-400 capitalize">
                {day.condition.replace('-', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default ActivityRecommendations; 