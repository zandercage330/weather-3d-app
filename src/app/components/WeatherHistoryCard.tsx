'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  HistoricalWeatherData, 
  HistoryPeriod, 
  getHistoricalWeatherForPeriod 
} from '@/app/lib/weatherHistoryService';
import { HistoricalTempChart } from './HistoricalTempChart';
import { PrecipitationHistoryChart } from './PrecipitationHistoryChart';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherHistoryCardProps {
  location: string;
}

export function WeatherHistoryCard({ location }: WeatherHistoryCardProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>('week');
  const [historyData, setHistoryData] = useState<HistoricalWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For custom date range
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [showCustomDates, setShowCustomDates] = useState(false);
  
  // Fetch history data when location or period changes
  useEffect(() => {
    if (!location) return;
    
    async function fetchHistoryData() {
      setIsLoading(true);
      setError(null);
      
      try {
        let data: HistoricalWeatherData;
        
        if (historyPeriod === 'custom') {
          if (!fromDate || !toDate) {
            setError('Please select both start and end dates');
            setIsLoading(false);
            return;
          }
          
          data = await getHistoricalWeatherForPeriod(
            location,
            historyPeriod,
            fromDate.toISOString(),
            toDate.toISOString()
          );
        } else {
          data = await getHistoricalWeatherForPeriod(location, historyPeriod);
        }
        
        setHistoryData(data);
      } catch (err) {
        console.error('Error fetching historical weather:', err);
        setError('Failed to load historical weather data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchHistoryData();
  }, [location, historyPeriod, fromDate, toDate]);
  
  // Handle period selection
  const handlePeriodChange = (value: string) => {
    setHistoryPeriod(value as HistoryPeriod);
    setShowCustomDates(value === 'custom');
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Weather History</span>
          <div className="flex items-center space-x-2">
            <Select value={historyPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
        {historyData && (
          <CardDescription>
            {formatDate(historyData.period.from)} to {formatDate(historyData.period.to)}
          </CardDescription>
        )}
      </CardHeader>
      
      {showCustomDates && (
        <div className="flex justify-between px-6 pb-2 pt-0 gap-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="from-date" className="text-sm font-medium">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, 'PP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="to-date" className="text-sm font-medium">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, 'PP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                  disabled={(date) => (fromDate ? date < fromDate : false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setHistoryPeriod('week')}
            >
              Try Again
            </Button>
          </div>
        ) : historyData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Temperature Summary</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg High</p>
                        <p className="text-2xl font-bold">{Math.round(historyData.stats.temperature.max)}°</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Low</p>
                        <p className="text-2xl font-bold">{Math.round(historyData.stats.temperature.min)}°</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Average</p>
                        <p className="text-2xl font-bold">{Math.round(historyData.stats.temperature.avg)}°</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Precipitation</h3>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{historyData.stats.totalPrecipitation.toFixed(1)}mm</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rainy Days</p>
                        <p className="text-2xl font-bold">
                          {historyData.dataPoints.filter(day => day.precipitation > 0).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-medium mb-2">Weather Conditions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(
                      historyData.dataPoints.reduce((acc, day) => {
                        acc[day.condition] = (acc[day.condition] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([condition, count]) => (
                        <div key={condition} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full bg-${getConditionColor(condition)}`} />
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {formatConditionName(condition)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {count} {count === 1 ? 'day' : 'days'}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="temperature" className="pt-4">
              <div className="space-y-4">
                <div className="h-[300px]">
                  <HistoricalTempChart data={historyData.dataPoints} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Temperature Records</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Highest</p>
                        <p className="text-xl font-bold">
                          {Math.max(...historyData.dataPoints.map(d => d.temperature.max))}°
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(
                            historyData.dataPoints.reduce((prev, curr) => 
                              prev.temperature.max > curr.temperature.max ? prev : curr
                            ).date
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lowest</p>
                        <p className="text-xl font-bold">
                          {Math.min(...historyData.dataPoints.map(d => d.temperature.min))}°
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(
                            historyData.dataPoints.reduce((prev, curr) => 
                              prev.temperature.min < curr.temperature.min ? prev : curr
                            ).date
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Temperature Variations</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Daily Range</p>
                        <p className="text-xl font-bold">
                          {Math.round(
                            historyData.dataPoints.reduce(
                              (sum, day) => sum + (day.temperature.max - day.temperature.min),
                              0
                            ) / historyData.dataPoints.length
                          )}°
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Day-to-Day Variation</p>
                        <p className="text-xl font-bold">
                          {calculateDayToDayVariation(historyData.dataPoints)}°
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="precipitation" className="pt-4">
              <div className="space-y-4">
                <div className="h-[250px]">
                  <PrecipitationHistoryChart data={historyData.dataPoints} />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Precipitation Stats</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold">{historyData.stats.totalPrecipitation.toFixed(1)}mm</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Max in a Day</p>
                        <p className="text-xl font-bold">
                          {Math.max(...historyData.dataPoints.map(d => d.precipitation)).toFixed(1)}mm
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(
                            historyData.dataPoints.reduce((prev, curr) => 
                              prev.precipitation > curr.precipitation ? prev : curr
                            ).date
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Rainy Days</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold">
                          {historyData.dataPoints.filter(day => day.precipitation > 0).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Percentage</p>
                        <p className="text-xl font-bold">
                          {Math.round(
                            (historyData.dataPoints.filter(day => day.precipitation > 0).length / 
                            historyData.dataPoints.length) * 100
                          )}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-medium mb-2">Dry/Wet Streaks</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Longest Dry</p>
                        <p className="text-xl font-bold">
                          {calculateLongestStreak(historyData.dataPoints, day => day.precipitation === 0)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Longest Wet</p>
                        <p className="text-xl font-bold">
                          {calculateLongestStreak(historyData.dataPoints, day => day.precipitation > 0)} days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>Select a location to view historical weather data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function formatConditionName(condition: string): string {
  return condition.replace(/-/g, ' ');
}

function getConditionColor(condition: string): string {
  const colorMap: Record<string, string> = {
    'clear': 'yellow-400',
    'partly-cloudy': 'blue-300',
    'cloudy': 'slate-400',
    'rain': 'blue-500',
    'storm': 'indigo-700',
    'snow': 'white',
    'fog': 'gray-300',
    'sleet': 'cyan-400'
  };
  
  return colorMap[condition] || 'gray-500';
}

function calculateDayToDayVariation(dataPoints: any[]): number {
  if (dataPoints.length <= 1) return 0;
  
  let totalVariation = 0;
  for (let i = 1; i < dataPoints.length; i++) {
    totalVariation += Math.abs(
      dataPoints[i].temperature.avg - dataPoints[i - 1].temperature.avg
    );
  }
  
  return Math.round(totalVariation / (dataPoints.length - 1));
}

function calculateLongestStreak(dataPoints: any[], condition: (day: any) => boolean): number {
  let currentStreak = 0;
  let maxStreak = 0;
  
  dataPoints.forEach(day => {
    if (condition(day)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
} 