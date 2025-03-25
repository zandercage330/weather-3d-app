'use client';

import { useEffect, useState } from 'react';
import { apiHealthCheck, APIHealthStatus } from '../lib/apiHealthCheck';

export function APIStatusIndicator() {
  const [status, setStatus] = useState<APIHealthStatus>(apiHealthCheck.getStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(apiHealthCheck.getStatus());
    }, 30000); // Update status every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="relative">
        {/* Status Indicator Dot */}
        <div 
          className={`w-3 h-3 rounded-full ${
            status.isHealthy ? 'bg-green-500' : 'bg-red-500'
          } cursor-pointer transition-all duration-200 hover:scale-110`}
          title={`API Status: ${status.isHealthy ? 'Healthy' : 'Issues Detected'}`}
        />

        {/* Detailed Status Popup */}
        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg min-w-[200px]">
            <div className="text-sm">
              <div className="font-semibold mb-2">API Status</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Current Weather:</span>
                  <span className={status.serviceStatus.current ? 'text-green-500' : 'text-red-500'}>
                    {status.serviceStatus.current ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Forecast:</span>
                  <span className={status.serviceStatus.forecast ? 'text-green-500' : 'text-red-500'}>
                    {status.serviceStatus.forecast ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>History:</span>
                  <span className={status.serviceStatus.history ? 'text-green-500' : 'text-red-500'}>
                    {status.serviceStatus.history ? '✓' : '✗'}
                  </span>
                </div>
                {status.responseTime && (
                  <div className="text-xs text-gray-500 mt-2">
                    Response time: {status.responseTime}ms
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Last checked: {status.lastChecked.toLocaleTimeString()}
                </div>
                {status.errorMessage && (
                  <div className="text-xs text-red-500 mt-1">
                    Error: {status.errorMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 