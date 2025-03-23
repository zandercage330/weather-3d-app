'use client';

import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OfflineDataIndicatorProps {
  lastUpdated: Date | null;
  isStale: boolean;
  isOffline: boolean;
}

export function OfflineDataIndicator({ 
  lastUpdated, 
  isStale, 
  isOffline 
}: OfflineDataIndicatorProps) {
  if (!isOffline) return null;
  
  return (
    <div className={`flex items-center gap-2 rounded-md px-3 py-2 mb-4 text-sm ${
      isStale ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
    }`}>
      {isStale ? (
        <AlertCircle size={16} className="flex-shrink-0" />
      ) : (
        <WifiOff size={16} className="flex-shrink-0" />
      )}
      
      <div className="flex-1">
        <p>
          {isStale 
            ? 'You\'re viewing stale data while offline' 
            : 'You\'re viewing cached data while offline'}
        </p>
        {lastUpdated && (
          <p className="text-xs opacity-80">
            Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </p>
        )}
      </div>
      
      <button 
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
        onClick={() => window.location.reload()}
      >
        <RefreshCw size={12} />
        <span>Retry</span>
      </button>
    </div>
  );
} 