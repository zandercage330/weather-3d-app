'use client';

import React, { useState } from 'react';
import LocationSelector from './LocationSelector';
import RefreshButton from './RefreshButton';

interface LocationSelectorWrapperProps {
  onLocationChange: (location: string) => void;
}

const LocationSelectorWrapper: React.FC<LocationSelectorWrapperProps> = ({ 
  onLocationChange 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('New York, NY');

  const handleLocationChange = (newLocation: string) => {
    setSelectedLocation(newLocation);
    onLocationChange(newLocation);
  };

  const handleRefresh = async () => {
    // This would fetch new weather data in a real app
    setIsRefreshing(true);
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 800));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <LocationSelector 
        currentLocation={selectedLocation} 
        onLocationChange={handleLocationChange} 
      />
      <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />
    </div>
  );
};

export default LocationSelectorWrapper; 