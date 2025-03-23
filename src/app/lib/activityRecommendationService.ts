// activityRecommendationService.ts
// Service for providing weather-based activity recommendations

import { WeatherData, ForecastDay } from './weatherService';

// Types of activities 
export enum ActivityCategory {
  OUTDOOR_SPORTS = 'Outdoor Sports',
  OUTDOOR_LEISURE = 'Outdoor Leisure',
  INDOOR_ACTIVE = 'Indoor Active',
  INDOOR_RELAXED = 'Indoor Relaxed',
  WATER_ACTIVITIES = 'Water Activities',
  WINTER_ACTIVITIES = 'Winter Activities',
  FAMILY_FRIENDLY = 'Family Friendly',
}

export interface Activity {
  id: string;
  name: string; 
  category: ActivityCategory;
  description: string;
  idealConditions: {
    minTemp?: number;
    maxTemp?: number;
    conditions?: string[];
    avoidConditions?: string[];
    maxWindSpeed?: number;
    maxPrecipitation?: number;
    uvIndexMax?: number;
    timeOfDay?: 'day' | 'night' | 'both';
  };
  requiredGear?: string[];
  intensity: 'low' | 'moderate' | 'high';
  imageUrl?: string; // URL to activity image
}

export interface ActivityRecommendation {
  activity: Activity;
  score: number; // 0-100 score for how well the activity matches current conditions
  reason: string; // Explanation for why this activity was recommended
  timeRecommendation?: string; // Specific time recommendation if applicable
}

// Database of activities
const activities: Activity[] = [
  {
    id: 'hiking',
    name: 'Hiking',
    category: ActivityCategory.OUTDOOR_SPORTS,
    description: 'Explore nature trails and enjoy scenic views with a refreshing hike.',
    idealConditions: {
      minTemp: 45,
      maxTemp: 85,
      conditions: ['clear', 'partly-cloudy', 'cloudy'],
      avoidConditions: ['heavy-rain', 'thunderstorm', 'snow', 'sleet', 'hail'],
      maxWindSpeed: 20,
      maxPrecipitation: 0.1,
      uvIndexMax: 8,
      timeOfDay: 'day'
    },
    requiredGear: ['Hiking boots', 'Water bottle', 'Sunscreen', 'Hat'],
    intensity: 'moderate',
    imageUrl: '/images/activities/hiking.jpg'
  },
  {
    id: 'beach-day',
    name: 'Beach Day',
    category: ActivityCategory.WATER_ACTIVITIES,
    description: 'Relax on the sand, swim in the water, and enjoy the sunshine.',
    idealConditions: {
      minTemp: 75,
      maxTemp: 95,
      conditions: ['clear', 'partly-cloudy'],
      avoidConditions: ['rain', 'thunderstorm', 'fog'],
      maxWindSpeed: 15,
      maxPrecipitation: 0,
      uvIndexMax: 10,
      timeOfDay: 'day'
    },
    requiredGear: ['Sunscreen', 'Beach towel', 'Umbrella', 'Swimwear'],
    intensity: 'low',
    imageUrl: '/images/activities/beach.jpg'
  },
  {
    id: 'cycling',
    name: 'Cycling',
    category: ActivityCategory.OUTDOOR_SPORTS,
    description: 'Enjoy a bike ride through scenic routes and get some exercise.',
    idealConditions: {
      minTemp: 50,
      maxTemp: 85,
      conditions: ['clear', 'partly-cloudy', 'cloudy'],
      avoidConditions: ['heavy-rain', 'thunderstorm', 'snow', 'sleet', 'fog'],
      maxWindSpeed: 15,
      maxPrecipitation: 0.05,
      uvIndexMax: 8,
      timeOfDay: 'day'
    },
    requiredGear: ['Bicycle', 'Helmet', 'Water bottle', 'Sunscreen'],
    intensity: 'high',
    imageUrl: '/images/activities/cycling.jpg'
  },
  {
    id: 'picnic',
    name: 'Picnic in the Park',
    category: ActivityCategory.OUTDOOR_LEISURE,
    description: 'Enjoy a relaxing meal outdoors with friends or family.',
    idealConditions: {
      minTemp: 65,
      maxTemp: 85,
      conditions: ['clear', 'partly-cloudy'],
      avoidConditions: ['rain', 'thunderstorm', 'heavy-wind'],
      maxWindSpeed: 10,
      maxPrecipitation: 0,
      uvIndexMax: 7,
      timeOfDay: 'day'
    },
    requiredGear: ['Picnic basket', 'Blanket', 'Sunscreen', 'Hat'],
    intensity: 'low',
    imageUrl: '/images/activities/picnic.jpg'
  },
  {
    id: 'museum-visit',
    name: 'Museum Visit',
    category: ActivityCategory.INDOOR_RELAXED,
    description: 'Explore art, history, or science at a local museum.',
    idealConditions: {
      conditions: ['heavy-rain', 'thunderstorm', 'snow', 'extreme-heat', 'extreme-cold'],
      timeOfDay: 'both'
    },
    intensity: 'low',
    imageUrl: '/images/activities/museum.jpg'
  },
  {
    id: 'indoor-rock-climbing',
    name: 'Indoor Rock Climbing',
    category: ActivityCategory.INDOOR_ACTIVE,
    description: 'Challenge yourself with indoor rock climbing walls.',
    idealConditions: {
      conditions: ['heavy-rain', 'thunderstorm', 'snow', 'extreme-heat', 'extreme-cold'],
      timeOfDay: 'both'
    },
    requiredGear: ['Climbing shoes', 'Comfortable clothes'],
    intensity: 'high',
    imageUrl: '/images/activities/rock-climbing.jpg'
  },
  {
    id: 'skiing',
    name: 'Skiing',
    category: ActivityCategory.WINTER_ACTIVITIES,
    description: 'Hit the slopes and enjoy some winter fun.',
    idealConditions: {
      minTemp: 10,
      maxTemp: 40,
      conditions: ['snow', 'light-snow', 'clear', 'partly-cloudy', 'cloudy'],
      avoidConditions: ['heavy-rain', 'thunderstorm', 'blizzard'],
      maxWindSpeed: 20,
      timeOfDay: 'day'
    },
    requiredGear: ['Skis', 'Ski boots', 'Warm clothes', 'Gloves', 'Goggles'],
    intensity: 'high',
    imageUrl: '/images/activities/skiing.jpg'
  },
  {
    id: 'board-games',
    name: 'Board Games Night',
    category: ActivityCategory.INDOOR_RELAXED,
    description: 'Gather friends and family for a fun board games night.',
    idealConditions: {
      conditions: ['heavy-rain', 'thunderstorm', 'snow', 'extreme-heat', 'extreme-cold', 'night'],
      timeOfDay: 'both'
    },
    intensity: 'low',
    imageUrl: '/images/activities/board-games.jpg'
  },
  {
    id: 'movie-marathon',
    name: 'Movie Marathon',
    category: ActivityCategory.INDOOR_RELAXED,
    description: 'Relax with a series of your favorite movies or a new series.',
    idealConditions: {
      conditions: ['heavy-rain', 'thunderstorm', 'snow', 'extreme-heat', 'extreme-cold'],
      timeOfDay: 'both'
    },
    intensity: 'low',
    imageUrl: '/images/activities/movie-marathon.jpg'
  },
  {
    id: 'stargazing',
    name: 'Stargazing',
    category: ActivityCategory.OUTDOOR_LEISURE,
    description: 'Observe stars, planets, and constellations in the night sky.',
    idealConditions: {
      minTemp: 40,
      maxTemp: 85,
      conditions: ['clear', 'partly-cloudy'],
      avoidConditions: ['cloudy', 'rain', 'thunderstorm', 'fog'],
      maxWindSpeed: 10,
      maxPrecipitation: 0,
      timeOfDay: 'night'
    },
    requiredGear: ['Telescope (optional)', 'Star map or app', 'Blanket', 'Hot drink'],
    intensity: 'low',
    imageUrl: '/images/activities/stargazing.jpg'
  },
  {
    id: 'farmers-market',
    name: 'Farmers\' Market Visit',
    category: ActivityCategory.OUTDOOR_LEISURE,
    description: 'Explore local produce and handmade goods at a farmers\' market.',
    idealConditions: {
      minTemp: 50,
      maxTemp: 85,
      conditions: ['clear', 'partly-cloudy', 'cloudy'],
      avoidConditions: ['heavy-rain', 'thunderstorm'],
      maxWindSpeed: 15,
      maxPrecipitation: 0.1,
      timeOfDay: 'day'
    },
    intensity: 'low',
    imageUrl: '/images/activities/farmers-market.jpg'
  },
  {
    id: 'yoga',
    name: 'Yoga',
    category: ActivityCategory.INDOOR_ACTIVE,
    description: 'Practice yoga for physical and mental wellbeing.',
    idealConditions: {
      timeOfDay: 'both'
    },
    requiredGear: ['Yoga mat', 'Comfortable clothes'],
    intensity: 'moderate',
    imageUrl: '/images/activities/yoga.jpg'
  }
];

/**
 * Map weather conditions to our activity condition categories
 * @param weatherCondition The condition from weather API
 * @returns Normalized condition string
 */
function mapWeatherCondition(weatherCondition: string): string {
  const condition = weatherCondition.toLowerCase();
  
  if (condition.includes('thunder') || condition.includes('storm')) {
    return 'thunderstorm';
  } else if (condition.includes('rain') && (condition.includes('heavy') || condition.includes('downpour'))) {
    return 'heavy-rain';
  } else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    return 'rain';
  } else if (condition.includes('snow') && (condition.includes('heavy') || condition.includes('blizzard'))) {
    return 'heavy-snow';
  } else if (condition.includes('snow') || condition.includes('flurries')) {
    return 'snow';
  } else if (condition.includes('sleet') || condition.includes('ice')) {
    return 'sleet';
  } else if (condition.includes('fog') || condition.includes('mist')) {
    return 'fog';
  } else if (condition.includes('clear') || condition.includes('sunny')) {
    return 'clear';
  } else if (condition.includes('cloud') && (condition.includes('partly') || condition.includes('scattered'))) {
    return 'partly-cloudy';
  } else if (condition.includes('cloud') || condition.includes('overcast')) {
    return 'cloudy';
  } else if (condition.includes('hail')) {
    return 'hail';
  } else if (condition.includes('wind') && (condition.includes('strong') || condition.includes('high'))) {
    return 'heavy-wind';
  }
  
  return 'unknown';
}

/**
 * Calculate a score for how suitable an activity is given the current weather conditions
 * @param activity The activity to score
 * @param weather Current weather conditions
 * @param isDaytime Whether it's currently daytime
 * @returns Score from 0-100
 */
function calculateActivityScore(activity: Activity, weather: WeatherData, isDaytime: boolean): number {
  let score = 100; // Start with perfect score
  const reasons: string[] = [];
  
  // Temperature check
  if (activity.idealConditions.minTemp !== undefined && weather.temperature < activity.idealConditions.minTemp) {
    const penalty = Math.min(50, 5 * (activity.idealConditions.minTemp - weather.temperature));
    score -= penalty;
    reasons.push(`Too cold (${weather.temperature}°F)`);
  }
  
  if (activity.idealConditions.maxTemp !== undefined && weather.temperature > activity.idealConditions.maxTemp) {
    const penalty = Math.min(50, 5 * (weather.temperature - activity.idealConditions.maxTemp));
    score -= penalty;
    reasons.push(`Too hot (${weather.temperature}°F)`);
  }
  
  // Weather condition check
  const currentCondition = mapWeatherCondition(weather.condition);
  
  // Avoid conditions completely rule out an activity
  if (activity.idealConditions.avoidConditions && 
      activity.idealConditions.avoidConditions.includes(currentCondition)) {
    score -= 80;
    reasons.push(`Unsuitable weather condition: ${weather.condition}`);
  }
  
  // If specific conditions are preferred but current condition isn't one of them
  if (activity.idealConditions.conditions && 
      !activity.idealConditions.conditions.includes(currentCondition) && 
      currentCondition !== 'unknown') {
    score -= 30;
    reasons.push(`Weather condition not ideal: ${weather.condition}`);
  }
  
  // Check wind speed
  if (activity.idealConditions.maxWindSpeed !== undefined && 
      weather.windSpeed !== undefined && 
      weather.windSpeed > activity.idealConditions.maxWindSpeed) {
    const penalty = Math.min(40, 2 * (weather.windSpeed - activity.idealConditions.maxWindSpeed));
    score -= penalty;
    reasons.push(`Too windy (${weather.windSpeed} mph)`);
  }
  
  // Check precipitation
  if (activity.idealConditions.maxPrecipitation !== undefined && 
      weather.precipitation !== undefined && 
      weather.precipitation > activity.idealConditions.maxPrecipitation) {
    const penalty = Math.min(50, 100 * (weather.precipitation - activity.idealConditions.maxPrecipitation));
    score -= penalty;
    reasons.push(`Too much precipitation (${weather.precipitation} in)`);
  }
  
  // Check UV index
  if (activity.idealConditions.uvIndexMax !== undefined && 
      weather.uvIndex > activity.idealConditions.uvIndexMax) {
    const penalty = Math.min(30, 5 * (weather.uvIndex - activity.idealConditions.uvIndexMax));
    score -= penalty;
    reasons.push(`UV index too high (${weather.uvIndex})`);
  }
  
  // Time of day check
  const timeOfDay = isDaytime ? 'day' : 'night';
  if (activity.idealConditions.timeOfDay && 
      activity.idealConditions.timeOfDay !== 'both' && 
      activity.idealConditions.timeOfDay !== timeOfDay) {
    score -= 50;
    reasons.push(`Wrong time of day (activity best during ${activity.idealConditions.timeOfDay})`);
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get a reason phrase for why an activity is recommended
 */
function getRecommendationReason(activity: Activity, weather: WeatherData, score: number): string {
  if (score >= 90) {
    return `Perfect conditions for ${activity.name.toLowerCase()}!`;
  } else if (score >= 75) {
    return `Good weather for ${activity.name.toLowerCase()}.`;
  } else if (score >= 60) {
    return `Decent conditions for ${activity.name.toLowerCase()}, but not perfect.`;
  } else if (score >= 40) {
    return `You could try ${activity.name.toLowerCase()}, but conditions aren't ideal.`;
  } else {
    return `Not the best day for ${activity.name.toLowerCase()}, but it's an option if you're determined.`;
  }
}

/**
 * Get recommended activities based on current weather conditions
 * @param weather Current weather data
 * @param forecast Optional forecast data for better recommendations
 * @param preferences Optional user preferences for filtering
 * @returns List of recommended activities sorted by suitability
 */
export function getRecommendedActivities(
  weather: WeatherData,
  options: {
    forecast?: ForecastDay[];
    preferredCategories?: ActivityCategory[];
    excludedActivities?: string[];
    maxResults?: number;
  } = {}
): ActivityRecommendation[] {
  const {
    forecast = [],
    preferredCategories = Object.values(ActivityCategory),
    excludedActivities = [],
    maxResults = 5
  } = options;

  // Determine if it's currently daytime
  const isDaytime = weather.timeOfDay === 'day';
  
  // Filter and score activities
  const scoredActivities: ActivityRecommendation[] = activities
    .filter(activity => !excludedActivities.includes(activity.id)) // Remove excluded activities
    .filter(activity => preferredCategories.includes(activity.category)) // Filter by preferred categories
    .map(activity => {
      const score = calculateActivityScore(activity, weather, isDaytime);
      return {
        activity,
        score,
        reason: getRecommendationReason(activity, weather, score)
      };
    })
    .sort((a, b) => b.score - a.score); // Sort by score descending
  
  // Add time recommendations for activities using forecast data
  if (forecast.length > 0) {
    scoredActivities.forEach(recommendation => {
      // Only add time recommendations for outdoor activities that aren't optimal now
      if (
        recommendation.score < 80 && 
        (recommendation.activity.category === ActivityCategory.OUTDOOR_SPORTS || 
         recommendation.activity.category === ActivityCategory.OUTDOOR_LEISURE ||
         recommendation.activity.category === ActivityCategory.WATER_ACTIVITIES)
      ) {
        // Find a better time in the forecast
        const betterTimes = forecast
          .slice(0, 3) // Only look at the next 3 days
          .filter(day => {
            // Simple check - if it's a clear or partly cloudy day and temperature is appropriate
            const dayCondition = mapWeatherCondition(day.condition);
            const idealConditions = recommendation.activity.idealConditions.conditions || [];
            
            return idealConditions.includes(dayCondition) && 
                  (!recommendation.activity.idealConditions.minTemp || 
                   day.highTemp >= recommendation.activity.idealConditions.minTemp) &&
                  (!recommendation.activity.idealConditions.maxTemp || 
                   day.lowTemp <= recommendation.activity.idealConditions.maxTemp);
          });
        
        if (betterTimes.length > 0) {
          recommendation.timeRecommendation = `Try on ${betterTimes[0].day} for better conditions.`;
        }
      }
    });
  }
  
  return scoredActivities.slice(0, maxResults);
}

/**
 * Get activities by category
 * @param category Activity category
 * @returns List of activities in that category
 */
export function getActivitiesByCategory(category: ActivityCategory): Activity[] {
  return activities.filter(activity => activity.category === category);
}

/**
 * Get a specific activity by ID
 * @param id Activity ID
 * @returns Activity or undefined if not found
 */
export function getActivityById(id: string): Activity | undefined {
  return activities.find(activity => activity.id === id);
}

/**
 * Get all available activities
 * @returns All activities
 */
export function getAllActivities(): Activity[] {
  return [...activities];
}

/**
 * Get all activity categories
 * @returns List of all categories
 */
export function getAllCategories(): ActivityCategory[] {
  return Object.values(ActivityCategory);
} 