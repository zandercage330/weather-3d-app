'use client';

import { useServiceWorker } from '@/app/providers/ServiceWorkerProvider';
import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const { isOfflineMode } = useServiceWorker();
  const [visible, setVisible] = useState(false);

  // Only show after a delay to avoid flashing during page transitions
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOfflineMode) {
      timer = setTimeout(() => setVisible(true), 500);
    } else {
      setVisible(false);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isOfflineMode]);

  if (!visible) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <WifiOff size={16} />
      <span>You are offline</span>
    </div>
  );
} 