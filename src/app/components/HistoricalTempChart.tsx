'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { HistoricalDataPoint } from '@/app/lib/weatherHistoryService';

interface HistoricalTempChartProps {
  data: HistoricalDataPoint[];
}

export function HistoricalTempChart({ data }: HistoricalTempChartProps) {
  // Process the data for the chart
  const chartData = data.map(point => ({
    date: format(new Date(point.date), 'MMM d'),
    max: Math.round(point.temperature.max),
    avg: Math.round(point.temperature.avg),
    min: Math.round(point.temperature.min)
  }));
  
  // Find min and max for chart domain
  const allTemps = data.flatMap(point => [
    point.temperature.max,
    point.temperature.min
  ]);
  
  const minTemp = Math.floor(Math.min(...allTemps)) - 5;
  const maxTemp = Math.ceil(Math.max(...allTemps)) + 5;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
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
          domain={[minTemp, maxTemp]} 
          tick={{ fontSize: 12 }}
          tickMargin={8}
          tickFormatter={(value) => `${value}°`}
        />
        <Tooltip 
          formatter={(value: number) => [`${value}°`, '']}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="max"
          name="High"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="avg"
          name="Average"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="min"
          name="Low"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 