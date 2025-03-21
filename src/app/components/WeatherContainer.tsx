'use client';

import React from 'react';
import WeatherScene from '../scenes/WeatherScene';

interface WeatherContainerProps {
  condition: string;
  temperature: number;
  timeOfDay: 'day' | 'night';
  precipitation: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
  fullScreen?: boolean;
}

const WeatherContainer: React.FC<WeatherContainerProps> = (props) => {
  return (
    <div className={`weather-container ${props.fullScreen ? 'w-full h-full' : 'w-full h-64'}`}>
      <WeatherScene {...props} />
    </div>
  );
};

export default WeatherContainer; 