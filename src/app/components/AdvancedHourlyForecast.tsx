'use client';

import { useState, useRef, useEffect } from 'react';
import { HourlyForecast, toCelsius } from '../lib/weatherService';
import GlassCard from './GlassCard';
import { UserPreferences } from '../hooks/useUserPreferences';

interface AdvancedHourlyForecastProps {
  hourlyData: HourlyForecast[];
  date: string;
  userPreferences?: UserPreferences;
}

export default function AdvancedHourlyForecast({
  hourlyData,
  date,
  userPreferences
}: AdvancedHourlyForecastProps) {
  const [expandedHour, setExpandedHour] = useState<number | null>(null);
  const [showTemperatureChart, setShowTemperatureChart] = useState(true);
  const [showPrecipitationChart, setShowPrecipitationChart] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Default preferences if not provided
  const preferences = userPreferences || {
    temperatureUnit: 'F' as const,
    showHumidity: true,
    showWindSpeed: true,
    showFeelsLike: true,
    showPrecipitation: true,
    defaultLocation: '',
    theme: 'auto' as const,
    savedLocations: []
  };

  // Format temperature based on user preference
  const formatTemperature = (temp: number): string => {
    const temperature = preferences.temperatureUnit === 'C' ? toCelsius(temp) : Math.round(temp);
    return `${temperature}°${preferences.temperatureUnit}`;
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-10 w-10'
    };
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${sizeClass[size]} text-yellow-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="5" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        );
      case 'partly-cloudy':
      case 'partly cloudy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${sizeClass[size]} text-gray-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${sizeClass[size]} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'rain':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${sizeClass[size]} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14.5a4 4 0 00-4-4h-1a7 7 0 00-7-6c-3.866 0-7 3.134-7 7 0 1.552.5 2.986 1.362 4.147M19 14.5a4 4 0 01-4 4H8a7 7 0 01-7-7c0-1.552.5-2.986 1.362-4.147" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 19v2M12 19v2M16 19v2" />
          </svg>
        );
      case 'storm':
      case 'thunderstorm':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${sizeClass[size]} text-yellow-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10l-2 5h3l-1 4" />
          </svg>
        );
      case 'snow':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${sizeClass[size]} text-blue-100`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 17l.5.5m.5.5l.5.5m-.5-.5l.5-.5m-.5.5l-.5-.5m-.5-.5l-.5-.5m.5.5l-.5.5m.5-.5l.5.5" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${sizeClass[size]} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
    }
  };

  // Create SVG path for temperature trend chart
  useEffect(() => {
    if (chartContainerRef.current && hourlyData.length > 0) {
      const drawTemperatureChart = () => {
        const container = chartContainerRef.current;
        if (!container) return;
        
        // Clear any existing chart
        container.innerHTML = '';
        
        const width = container.clientWidth;
        const height = 100;
        const padding = 10;
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width.toString());
        svg.setAttribute('height', height.toString());
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Find min and max temperatures
        const temperatures = hourlyData.map(h => h.temperature);
        const minTemp = Math.min(...temperatures);
        const maxTemp = Math.max(...temperatures);
        const range = maxTemp - minTemp || 10; // Avoid division by zero
        
        // Create path for temperature line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Create gradient
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'temperature-gradient');
        gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
        gradient.setAttribute('x1', '0');
        gradient.setAttribute('y1', '0');
        gradient.setAttribute('x2', '0');
        gradient.setAttribute('y2', height.toString());
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#ec4899');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#3b82f6');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        // Generate path data
        let pathData = '';
        hourlyData.forEach((hour, index) => {
          const x = (width - padding * 2) * (index / (hourlyData.length - 1)) + padding;
          const y = height - padding - ((hour.temperature - minTemp) / range) * (height - padding * 2);
          
          if (index === 0) {
            pathData += `M ${x} ${y}`;
          } else {
            pathData += ` L ${x} ${y}`;
          }
          
          // Add temperature dots
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', x.toString());
          circle.setAttribute('cy', y.toString());
          circle.setAttribute('r', '3');
          circle.setAttribute('fill', 'white');
          svg.appendChild(circle);
          
          // Add temperature labels
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', x.toString());
          text.setAttribute('y', (y - 10).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', 'white');
          text.setAttribute('font-size', '10');
          text.textContent = formatTemperature(hour.temperature).replace('°', '');
          svg.appendChild(text);
        });
        
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'url(#temperature-gradient)');
        path.setAttribute('stroke-width', '2');
        
        svg.appendChild(path);
        container.appendChild(svg);
      };
      
      drawTemperatureChart();
      
      // Redraw on resize
      const handleResize = () => {
        drawTemperatureChart();
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [hourlyData, formatTemperature]);

  return (
    <GlassCard className="p-4" intensity="medium" variant="default">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">48-Hour Forecast</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              setShowTemperatureChart(true);
              setShowPrecipitationChart(false);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              showTemperatureChart ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'
            }`}
          >
            Temperature
          </button>
          <button 
            onClick={() => {
              setShowTemperatureChart(false);
              setShowPrecipitationChart(true);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              showPrecipitationChart ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'
            }`}
          >
            Precipitation
          </button>
        </div>
      </div>
      
      {/* Temperature trend chart */}
      <div 
        ref={chartContainerRef} 
        className={`w-full h-[100px] mb-4 ${showTemperatureChart ? 'block' : 'hidden'}`}
      ></div>
      
      {/* Precipitation chart (simplified placeholder) */}
      <div className={`w-full h-[100px] mb-4 ${showPrecipitationChart ? 'block' : 'hidden'}`}>
        <div className="flex h-full items-end">
          {hourlyData.map((hour, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="text-[10px] text-white/70">{hour.precipitation}%</div>
              <div 
                className="w-full bg-blue-500/50 mx-0.5"
                style={{ height: `${hour.precipitation}%` }}
              ></div>
              <div className="text-[10px] text-white/70 mt-1">{hour.time.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scrollable hourly forecast */}
      <div className="overflow-x-auto">
        <div className="flex space-x-3 pb-2 min-w-max">
          {hourlyData.map((hour, index) => (
            <div 
              key={index} 
              className={`bg-black/20 p-3 rounded-lg flex flex-col items-center min-w-[80px] cursor-pointer transition-all ${
                expandedHour === index ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setExpandedHour(expandedHour === index ? null : index)}
            >
              <div className="text-white text-sm font-medium">{hour.time}</div>
              <div className="my-2">{getWeatherIcon(hour.condition)}</div>
              <div className="text-white font-bold">{formatTemperature(hour.temperature)}</div>
              
              {preferences.showFeelsLike && hour.feelsLike && (
                <div className="text-white/70 text-xs">
                  Feels: {formatTemperature(hour.feelsLike)}
                </div>
              )}
              
              {preferences.showPrecipitation && (
                <div className="flex items-center mt-1">
                  <svg className="h-3 w-3 text-blue-400 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-blue-300 text-xs">{hour.precipitation}%</span>
                </div>
              )}
              
              {preferences.showWindSpeed && hour.windSpeed && (
                <div className="flex items-center mt-1">
                  <svg className="h-3 w-3 text-gray-400 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-gray-300 text-xs">{hour.windSpeed} mph</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Expanded hour details */}
      {expandedHour !== null && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <h4 className="text-md font-medium text-white mb-3">
            Detailed Forecast for {hourlyData[expandedHour].time}
          </h4>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {/* Temperature and condition */}
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Temperature</div>
              <div className="flex items-center">
                <div className="text-white text-xl font-bold mr-2">
                  {formatTemperature(hourlyData[expandedHour].temperature)}
                </div>
                {getWeatherIcon(hourlyData[expandedHour].condition, 'sm')}
              </div>
              {hourlyData[expandedHour].feelsLike && (
                <div className="text-white/70 text-xs mt-1">
                  Feels like {formatTemperature(hourlyData[expandedHour].feelsLike)}
                </div>
              )}
            </div>
            
            {/* Precipitation */}
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Precipitation</div>
              <div className="text-white text-xl font-bold">
                {hourlyData[expandedHour].precipitation}%
              </div>
              {hourlyData[expandedHour].precipitationAmount && (
                <div className="text-white/70 text-xs mt-1">
                  {hourlyData[expandedHour].precipitationAmount} mm
                </div>
              )}
              {hourlyData[expandedHour].precipitationType && hourlyData[expandedHour].precipitationType !== 'none' && (
                <div className="text-white/70 text-xs mt-1 capitalize">
                  {hourlyData[expandedHour].precipitationType}
                </div>
              )}
            </div>
            
            {/* Wind */}
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Wind</div>
              <div className="text-white text-xl font-bold">
                {hourlyData[expandedHour].windSpeed || 0} mph
              </div>
              {hourlyData[expandedHour].windDirection && (
                <div className="text-white/70 text-xs mt-1">
                  Direction: {hourlyData[expandedHour].windDirection}
                </div>
              )}
            </div>
            
            {/* Humidity and Dew Point */}
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">Humidity</div>
              <div className="text-white text-xl font-bold">
                {hourlyData[expandedHour].humidity || 0}%
              </div>
              {hourlyData[expandedHour].dewPoint && (
                <div className="text-white/70 text-xs mt-1">
                  Dew point: {formatTemperature(hourlyData[expandedHour].dewPoint)}
                </div>
              )}
            </div>
            
            {/* UV Index */}
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-white/70 text-xs mb-1">UV Index</div>
              <div className="text-white text-xl font-bold">
                {hourlyData[expandedHour].uvIndex}
              </div>
              <div className="text-white/70 text-xs mt-1">
                {hourlyData[expandedHour].uvIndex <= 2 ? 'Low' : 
                 hourlyData[expandedHour].uvIndex <= 5 ? 'Moderate' : 
                 hourlyData[expandedHour].uvIndex <= 7 ? 'High' : 
                 hourlyData[expandedHour].uvIndex <= 10 ? 'Very High' : 'Extreme'}
              </div>
            </div>
            
            {/* Pressure */}
            {hourlyData[expandedHour].pressureMb && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">Pressure</div>
                <div className="text-white text-xl font-bold">
                  {hourlyData[expandedHour].pressureMb} mb
                </div>
              </div>
            )}
            
            {/* Visibility */}
            {hourlyData[expandedHour].visibility && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">Visibility</div>
                <div className="text-white text-xl font-bold">
                  {hourlyData[expandedHour].visibility} mi
                </div>
              </div>
            )}
            
            {/* Cloud Cover */}
            {hourlyData[expandedHour].cloudCover !== undefined && (
              <div className="bg-black/20 p-3 rounded-lg">
                <div className="text-white/70 text-xs mb-1">Cloud Cover</div>
                <div className="text-white text-xl font-bold">
                  {hourlyData[expandedHour].cloudCover}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
} 