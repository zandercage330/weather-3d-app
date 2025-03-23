'use client';

import { useState, useEffect } from 'react';
import { cacheAnalytics } from '../lib/cacheAnalytics';
import { weatherCache } from '../lib/weatherCache';

interface CacheAnalyticsPanelProps {
  showFullDetails?: boolean;
}

export default function CacheAnalyticsPanel({ showFullDetails = false }: CacheAnalyticsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Refresh analytics data periodically
  useEffect(() => {
    // Initial load
    updateStats();
    
    // Set up interval to update stats
    const intervalId = setInterval(() => {
      updateStats();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Update stats when refreshCounter changes
  useEffect(() => {
    updateStats();
  }, [refreshCounter]);
  
  const updateStats = () => {
    setAnalytics(cacheAnalytics.getAnalytics());
    setCacheStats(weatherCache.getStats());
  };
  
  const manualRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  // If analytics isn't loaded yet, show loading
  if (!analytics || !cacheStats) {
    return (
      <div className="bg-gray-100 p-3 rounded-md text-sm">
        <p>Loading cache analytics...</p>
      </div>
    );
  }
  
  // Format numbers for display
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatDateTime = (timestamp: number | null) => 
    timestamp ? new Date(timestamp).toLocaleString() : 'Never';
  
  // Always show the minimized version unless expanded or full details requested
  if (!isExpanded && !showFullDetails) {
    return (
      <div className="bg-gray-100 p-3 rounded-md text-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Cache Performance</h3>
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-blue-500 text-xs"
          >
            Show Details
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-500">Hit Rate</div>
            <div className="font-semibold">{formatPercent(analytics.cacheRatio)}</div>
          </div>
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-500">Cache Size</div>
            <div className="font-semibold">{cacheStats.size} items</div>
          </div>
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-500">Rate Limits</div>
            <div className="font-semibold">{analytics.rateLimitEvents}</div>
          </div>
        </div>
      </div>
    );
  }
  
  // Full detailed version
  return (
    <div className="bg-gray-100 p-4 rounded-md text-sm max-w-2xl">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-base">Cache Analytics Dashboard</h3>
        {!showFullDetails && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-blue-500 text-xs"
          >
            Minimize
          </button>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded shadow-sm">
          <h4 className="font-medium mb-2">Cache Performance</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500">Cache Hits</div>
              <div>{analytics.cacheHits}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Cache Misses</div>
              <div>{analytics.cacheMisses}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Hit Ratio</div>
              <div className={analytics.cacheRatio > 0.7 ? 'text-green-600' : 'text-yellow-600'}>
                {formatPercent(analytics.cacheRatio)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Cache Size</div>
              <div>{cacheStats.size} items</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded shadow-sm">
          <h4 className="font-medium mb-2">API Usage</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500">Avg Call Duration</div>
              <div>{analytics.avgApiCallDuration.toFixed(0)} ms</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">API Calls</div>
              <div>{analytics.apiCalls.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Rate Limit Events</div>
              <div className={analytics.rateLimitEvents > 0 ? 'text-red-600' : 'text-green-600'}>
                {analytics.rateLimitEvents}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Last Rate Limit</div>
              <div className="text-xs">{analytics.lastRateLimitTime ? formatDateTime(analytics.lastRateLimitTime).split(',')[0] : 'Never'}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="mt-4 bg-white p-3 rounded shadow-sm">
        <h4 className="font-medium mb-2">Recommendations</h4>
        <ul className="list-disc list-inside text-xs space-y-1">
          {cacheAnalytics.getRecommendations().map((rec, i) => (
            <li key={i} className="text-gray-700">{rec}</li>
          ))}
          {cacheAnalytics.getRecommendations().length === 0 && (
            <li className="text-green-600">Cache is performing optimally!</li>
          )}
        </ul>
      </div>
      
      {/* Cache Contents */}
      {showFullDetails && (
        <div className="mt-4 bg-white p-3 rounded shadow-sm">
          <h4 className="font-medium mb-2">Cache Contents</h4>
          <div className="max-h-40 overflow-y-auto text-xs">
            <ul className="list-disc list-inside space-y-1">
              {cacheStats.keys.map((key: string) => (
                <li key={key} className="text-gray-700">{key}</li>
              ))}
              {cacheStats.keys.length === 0 && (
                <li className="text-gray-500">Cache is empty</li>
              )}
            </ul>
          </div>
        </div>
      )}
      
      {/* Recent API Calls */}
      {showFullDetails && (
        <div className="mt-4 bg-white p-3 rounded shadow-sm">
          <h4 className="font-medium mb-2">Recent API Calls</h4>
          <div className="max-h-40 overflow-y-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-1">Endpoint</th>
                  <th className="pb-1">Time</th>
                  <th className="pb-1">Duration</th>
                  <th className="pb-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.apiCalls.slice(-10).reverse().map((call: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1 pr-2">{call.endpoint.split('_')[0]}</td>
                    <td className="py-1 pr-2">{formatDateTime(call.timestamp).split(', ')[1]}</td>
                    <td className="py-1 pr-2">{call.duration}ms</td>
                    <td className={`py-1 ${call.success ? 'text-green-600' : 'text-red-600'}`}>
                      {call.cached ? '📦 Cached' : (call.success ? '✅ Success' : '❌ Failed')}
                    </td>
                  </tr>
                ))}
                {analytics.apiCalls.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 text-gray-500">No API calls recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="mt-4 flex justify-end space-x-3">
        <button 
          onClick={manualRefresh}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
        >
          Refresh Data
        </button>
        <button 
          onClick={() => {
            weatherCache.clear();
            cacheAnalytics.reset();
            setRefreshCounter(prev => prev + 1);
          }}
          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
        >
          Clear Cache
        </button>
      </div>
    </div>
  );
} 