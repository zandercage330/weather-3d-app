import { Suspense } from 'react';
import WeatherCard from './components/WeatherCard';
import WeatherContainer from './components/WeatherContainer';
import { getWeatherData, isDayTime, WeatherData } from './lib/weatherService';

// Define our extended weather data that will have all required properties
interface EnhancedWeatherData extends WeatherData {
  timeOfDay: 'day' | 'night';
  precipitation: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
}

export default async function Home({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Fetch weather data
  const weatherData = await getWeatherData();
  
  // Determine if it's day or night
  const timeOfDay = isDayTime() ? 'day' : 'night';
  
  // Enable different weather scenarios for demonstration
  const scenarios = [
    { name: 'clear', condition: 'clear', precipitation: 0, humidity: 30, cloudCover: 0.1, windSpeed: 5 },
    { name: 'partly-cloudy', condition: 'partly-cloudy', precipitation: 0, humidity: 45, cloudCover: 0.4, windSpeed: 8 },
    { name: 'cloudy', condition: 'cloudy', precipitation: 0, humidity: 60, cloudCover: 0.7, windSpeed: 10 },
    { name: 'rain', condition: 'rain', precipitation: 60, humidity: 80, cloudCover: 0.8, windSpeed: 15 },
    { name: 'storm', condition: 'storm', precipitation: 90, humidity: 85, cloudCover: 0.9, windSpeed: 25 },
    { name: 'snow', condition: 'snow', precipitation: 70, humidity: 75, cloudCover: 0.7, windSpeed: 12 },
    { name: 'fog', condition: 'fog', precipitation: 0, humidity: 95, cloudCover: 0.5, windSpeed: 5 }
  ];
  
  // Get condition from URL parameters or choose based on time
  const conditionParam = typeof searchParams.condition === 'string' ? searchParams.condition : undefined;
  
  let currentScenario;
  if (conditionParam) {
    // Use the condition from URL parameters
    currentScenario = scenarios.find(s => s.condition === conditionParam) || scenarios[0];
  } else {
    // Default: choose based on current time
    const hour = new Date().getHours();
    const scenarioIndex = Math.floor((hour % 24) / 3.5) % scenarios.length;
    currentScenario = scenarios[scenarioIndex];
  }

  // Apply the scenario to the weather data
  const enhancedWeatherData: EnhancedWeatherData = {
    ...weatherData,
    timeOfDay,
    condition: currentScenario.condition,
    precipitation: currentScenario.precipitation,
    humidity: currentScenario.humidity,
    cloudCover: currentScenario.cloudCover,
    windSpeed: currentScenario.windSpeed
  };

  return (
    <main className="min-h-screen overflow-hidden relative">
      {/* Full-screen 3D Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <WeatherContainer 
          condition={enhancedWeatherData.condition}
          temperature={enhancedWeatherData.temperature}
          timeOfDay={enhancedWeatherData.timeOfDay}
          precipitation={enhancedWeatherData.precipitation}
          humidity={enhancedWeatherData.humidity}
          cloudCover={enhancedWeatherData.cloudCover}
          windSpeed={enhancedWeatherData.windSpeed}
          fullScreen={true}
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 min-h-screen p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-8 text-white drop-shadow-lg">
          Weather App
        </h1>
        
        <div className="flex-grow flex items-center justify-center w-full max-w-md">
          {/* Weather Card */}
          <WeatherCard data={enhancedWeatherData} />
        </div>
        
        <footer className="mt-12 text-center text-white drop-shadow-md">
          <p>
            Weather information is currently mocked for development purposes.
            Currently showing: <span className="font-semibold capitalize">{currentScenario.name}</span> conditions.
          </p>
          <p className="mt-2 text-sm">
            Weather conditions will automatically change based on the time of day.
          </p>
        </footer>
      </div>
    </main>
  );
} 