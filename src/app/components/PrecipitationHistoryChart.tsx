'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { HistoricalDataPoint } from '@/app/lib/weatherHistoryService';

interface PrecipitationHistoryChartProps {
  data: HistoricalDataPoint[];
}

export function PrecipitationHistoryChart({ data }: PrecipitationHistoryChartProps) {
  // Process the data for the chart
  const chartData = data.map(point => ({
    date: format(new Date(point.date), 'MMM d'),
    precipitation: point.precipitation,
    condition: point.condition
  }));
  
  // Find max precipitation for chart domain
  const maxPrecip = Math.max(...data.map(point => point.precipitation));
  const yAxisMax = Math.ceil(maxPrecip + (maxPrecip * 0.1)); // Add 10% padding
  
  // Get color based on precipitation value
  const getBarColor = (value: number) => {
    if (value === 0) return '#cbd5e1'; // Very light for no precipitation
    if (value < 1) return '#93c5fd'; // Light blue for trace
    if (value < 5) return '#3b82f6'; // Medium blue for light
    if (value < 10) return '#2563eb'; // Darker blue for moderate
    if (value < 20) return '#1d4ed8'; // Very dark blue for heavy
    return '#1e3a8a'; // Almost navy for extreme
  };
  
  // Custom bar with colors based on precipitation value
  const CustomBar = (props: any) => {
    const { x, y, width, height, value } = props;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={getBarColor(value)}
          rx={2}
        />
      </g>
    );
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickMargin={8}
        />
        <YAxis 
          domain={[0, yAxisMax || 5]}
          tick={{ fontSize: 12 }}
          tickMargin={8}
          tickFormatter={(value) => `${value}mm`}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(1)}mm`, 'Precipitation']}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="precipitation" 
          name="Precipitation" 
          shape={<CustomBar />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 