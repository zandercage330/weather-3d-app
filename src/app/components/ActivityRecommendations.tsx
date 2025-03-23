'use client';

import { useState, useEffect } from 'react';
import { ForecastDay, WeatherData } from '../lib/weatherService';
import { ActivityCategory, ActivityRecommendation, getRecommendedActivities } from '../lib/activityRecommendationService';
import { ArrowRight, Zap, Calendar, Filter } from 'lucide-react';
import GlassCard from './GlassCard';

interface ActivityRecommendationsProps {
  weatherData: WeatherData;
  forecastData?: ForecastDay[];
  className?: string;
}

/**
 * ActivityRecommendations component suggests outdoor activities
 * based on current weather conditions and forecast
 */
const ActivityRecommendations: React.FC<ActivityRecommendationsProps> = ({ 
  weatherData, 
  forecastData = [], 
  className = '' 
}) => {
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ActivityCategory[]>(
    Object.values(ActivityCategory)
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'outdoor' | 'indoor'>('all');

  // Generate recommendations when weather data or filters change
  useEffect(() => {
    if (!weatherData) return;
    
    // Filter based on selected tab
    let categoriesToUse = selectedCategories;
    if (activeTab === 'outdoor') {
      categoriesToUse = selectedCategories.filter(cat => 
        [ActivityCategory.OUTDOOR_SPORTS, ActivityCategory.OUTDOOR_LEISURE, 
         ActivityCategory.WATER_ACTIVITIES, ActivityCategory.WINTER_ACTIVITIES].includes(cat)
      );
    } else if (activeTab === 'indoor') {
      categoriesToUse = selectedCategories.filter(cat => 
        [ActivityCategory.INDOOR_ACTIVE, ActivityCategory.INDOOR_RELAXED].includes(cat)
      );
    }
    
    const recommendedActivities = getRecommendedActivities(weatherData, {
      forecast: forecastData,
      preferredCategories: categoriesToUse,
      maxResults: isExpanded ? 10 : 5
    });
    
    setRecommendations(recommendedActivities);
  }, [weatherData, forecastData, selectedCategories, isExpanded, activeTab]);

  // Get the appropriate activity icon based on intensity
  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case 'high':
        return (
          <div className="p-1 bg-red-100 rounded-full">
            <Zap className="w-4 h-4 text-red-600" />
          </div>
        );
      case 'moderate':
        return (
          <div className="p-1 bg-yellow-100 rounded-full">
            <Zap className="w-4 h-4 text-yellow-600" />
          </div>
        );
      default:
        return (
          <div className="p-1 bg-green-100 rounded-full">
            <Zap className="w-4 h-4 text-green-600" />
          </div>
        );
    }
  };

  // Toggle a category selection
  const toggleCategory = (category: ActivityCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  if (!weatherData) {
    return null;
  }

  return (
    <GlassCard className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">Recommended Activities</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Based on current conditions: {weatherData.temperature}°F, {weatherData.condition.replace('-', ' ')}
      </p>

      {/* Tab selector */}
      <div className="flex border-b">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'all' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Activities
        </button>
        <button 
          onClick={() => setActiveTab('outdoor')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'outdoor' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Outdoor
        </button>
        <button 
          onClick={() => setActiveTab('indoor')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'indoor' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Indoor
        </button>
      </div>
      
      {/* Filter dropdown */}
      <div className="p-2 bg-gray-50 flex justify-end">
        <div className="relative inline-block text-left">
          <button
            type="button"
            className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
            onClick={() => document.getElementById('category-filter')?.classList.toggle('hidden')}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </button>
          <div 
            id="category-filter" 
            className="absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden"
          >
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-semibold text-gray-700">
                Activity Categories
              </div>
              {Object.values(ActivityCategory).map((category) => (
                <div key={category} className="flex items-center px-2 py-1">
                  <input
                    id={`filter-${category}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <label 
                    htmlFor={`filter-${category}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity recommendations */}
      {recommendations.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {recommendations.map((recommendation) => (
            <div 
              key={recommendation.activity.id} 
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {recommendation.activity.imageUrl ? (
                    <img 
                      src={recommendation.activity.imageUrl} 
                      alt={recommendation.activity.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {recommendation.activity.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0">
                    {getIntensityIcon(recommendation.activity.intensity)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{recommendation.activity.name}</h3>
                      <p className="text-xs text-gray-500">{recommendation.activity.category}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          recommendation.score >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : recommendation.score >= 60 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {recommendation.score}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-600">
                    {recommendation.reason}
                  </p>
                  
                  {recommendation.timeRecommendation && (
                    <div className="mt-2 flex items-center text-xs text-blue-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {recommendation.timeRecommendation}
                    </div>
                  )}
                  
                  {recommendation.activity.requiredGear && recommendation.activity.requiredGear.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-500">Required:</span>
                      <span className="text-xs text-gray-500 ml-1">
                        {recommendation.activity.requiredGear.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          No activities match your current filters.
        </div>
      )}
      
      {/* Show more/less button */}
      {recommendations.length > 0 && (
        <div className="p-4 bg-gray-50 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show fewer activities' : 'Show more activities'}
            <ArrowRight className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      )}
    </GlassCard>
  );
};

export default ActivityRecommendations; 