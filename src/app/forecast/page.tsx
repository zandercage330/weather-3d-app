'use client';

import { useEffect } from 'react';
import WeatherForecast from '@/app/components/WeatherForecast';
import ForecastSection from '@/app/components/ForecastSection';
import { useCachedWeather } from '@/app/hooks/useCachedWeather';
import { useUserPreferences } from '@/app/hooks/useUserPreferences';
import { ForecastSkeleton } from '@/app/components/ui/loading';

export default function ForecastPage() {
  const { preferences } = useUserPreferences();
  const { forecasts, loading } = useCachedWeather(preferences?.defaultLocation || '', {
    includeForecasts: true,
    includeForecastDays: 7
  });

  if (loading || !forecasts) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Weather Forecast</h1>
        <div className="space-y-8">
          <ForecastSkeleton />
          <ForecastSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Weather Forecast</h1>
      <div className="space-y-8">
        <ForecastSection forecastData={forecasts} isLoading={loading} userPreferences={preferences} />
        <WeatherForecast forecastData={forecasts} isLoading={loading} userPreferences={preferences} />
      </div>
    </main>
  );
} 